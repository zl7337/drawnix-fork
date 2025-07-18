import { useState, useEffect } from 'react';
import './ttd-dialog.scss';
import { TTDDialogPanels } from './ttd-dialog-panels';
import { TTDDialogPanel } from './ttd-dialog-panel';
import { useDrawnix } from '../../hooks/use-drawnix';
import { useBoard } from '@plait-board/react-board';
import { PlaitElement } from '@plait/core';
import { MindElement } from '@plait/mind';
import { Node } from 'slate';

const DrawnixToMermaid = () => {
  const { appState, setAppState } = useDrawnix();
  const board = useBoard();
  const [mermaidContent, setMermaidContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 检查是否为思维导图元素
  const isMindElement = (element: PlaitElement): element is MindElement => {
    return MindElement.isMindElement(board, element);
  };

  // 提取思维导图节点的文本内容（与 Markdown 导出保持一致）
  const extractTitleText = (element: MindElement): string => {
    if (!element.data) return '未命名节点';
    
    const topic = element.data.topic;
    
    // 如果 topic 是字符串，直接返回
    if (typeof topic === 'string') {
      return topic || '未命名节点';
    }
    
    // 如果 topic 是对象（ParagraphElement 结构），提取文本
    if (topic && typeof topic === 'object') {
      // 处理 Slate.js 的 ParagraphElement 结构
      if (Array.isArray(topic.children)) {
        return topic.children
          .map((child: any) => {
            if (typeof child === 'string') return child;
            if (child && typeof child === 'object' && child.text) {
              return child.text;
            }
            return '';
          })
          .join('');
      }
      
      // 如果是其他对象类型，尝试提取 text 属性
      if ((topic as any).text) {
        return (topic as any).text;
      }
    }
    
    return '未命名节点';
  };

  // 提取几何图形和文本元素的内容
  const extractElementText = (element: any): string => {
    console.log('=== Element Debug Info ===');
    console.log('Element type:', element.type);
    console.log('Element shape:', element.shape);
    console.log('Element data:', element.data);
    console.log('Element text:', element.text);
    console.log('Full element:', element);
    console.log('=========================');
    
    // 首先尝试使用 Slate.js 的 Node.string 方法提取文本
    try {
      if (element.text && Array.isArray(element.text)) {
        const textContent = Node.string({ children: element.text } as any);
        if (textContent && textContent.trim()) {
          console.log('Found text via Node.string:', textContent);
          return textContent.trim();
        }
      }
      
      // 如果 element.text 本身就是一个 Slate 节点
      if (element.text && typeof element.text === 'object' && element.text.children) {
        const textContent = Node.string(element.text);
        if (textContent && textContent.trim()) {
          console.log('Found text via direct Node.string:', textContent);
          return textContent.trim();
        }
      }
    } catch (error) {
      console.log('Error extracting text with Node.string:', error);
    }
    
    // 备用方法：检查常见的文本属性
    const possibleTexts = [
      element.data?.text,
      element.data?.label,
      element.text,
      element.label,
      element.content,
      element.textContent
    ];
    
    for (const text of possibleTexts) {
      if (text && typeof text === 'string' && text.trim()) {
        console.log('Found text via fallback:', text);
        return text.trim();
      }
    }
    
    // 如果还是没找到，使用元素ID作为最后备用
    const fallbackId = element.id || element.data?.id || '未命名节点';
    console.log('Using fallback ID:', fallbackId);
    return fallbackId;
  };

  // 将思维导图转换为 Mermaid 流程图（兼容导入格式）
  const convertMindToMermaid = (elements: MindElement[]): string => {
    let mermaid = 'flowchart TD\n';
    let nodeCounter = 0;
    const nodeMap = new Map<string, string>();

    const processNode = (element: MindElement, parentId?: string) => {
      const topic = extractTitleText(element);
      // 生成简洁的节点ID，兼容导入格式
      const nodeId = String.fromCharCode(65 + nodeCounter); // A, B, C, D...
      nodeCounter++;
      
      nodeMap.set(element.id || `${nodeCounter}`, nodeId);
      
      // 使用方括号格式，与示例保持一致
      const cleanTopic = String(topic).replace(/"/g, "'");
      mermaid += `    ${nodeId}[${cleanTopic}]\n`;
      
      // 如果有父节点，添加连接
      if (parentId) {
        mermaid += `    ${parentId} --> ${nodeId}\n`;
      }
      
      // 处理子节点
      if (element.children && element.children.length > 0) {
        element.children.forEach((child: any) => {
          if (isMindElement(child)) {
            processNode(child, nodeId);
          }
        });
      }
    };

    elements.forEach((element) => {
      processNode(element);
    });

    return mermaid;
  };

  // 将绘图元素转换为 Mermaid（保持原有连接关系）
  const convertDrawToMermaid = (elements: PlaitElement[]): string => {
    let mermaid = 'flowchart TD\n';
    let nodeCounter = 0;
    const nodeMap = new Map<string, { id: string; text: string; shape: string }>();
    const connections: Array<{ from: string; to: string; label?: string }> = [];

    // 第一遍：收集所有节点
    elements.forEach((element: any) => {
      console.log('Processing element:', element); // 调试日志
      
      if (element.type === 'geometry' || element.type === 'text') {
        const nodeId = String.fromCharCode(65 + nodeCounter++); // A, B, C...
        const text = extractElementText(element);
        
        nodeMap.set(element.id || `${nodeCounter}`, {
          id: nodeId,
          text: String(text).replace(/"/g, "'"),
          shape: element.shape || 'rectangle'
        });
      }
    });

    // 第二遍：查找连接关系（箭头元素）
    console.log('=== 开始查找连接关系 ===');
    console.log('总元素数量:', elements.length);
    
    elements.forEach((element: any) => {
      console.log('检查元素:', {
        type: element.type,
        shape: element.shape,
        id: element.id,
        hasSource: !!element.source,
        hasTarget: !!element.target,
        hasTexts: !!element.texts,
        fullElement: element
      });
      
      // 检查多种可能的连接元素类型
      if (element.type === 'line' || element.type === 'arrow' || element.type === 'arrow-line' || element.type === 'connection') {
        console.log('找到潜在连接元素:', element);
        
        // 提取箭头标签文本
        let label = undefined;
        if (element.texts && Array.isArray(element.texts) && element.texts.length > 0) {
          const textElement = element.texts[0];
          try {
            if (textElement.text && Array.isArray(textElement.text)) {
              label = Node.string({ children: textElement.text } as any);
            } else if (textElement.text && typeof textElement.text === 'object') {
              label = Node.string(textElement.text);
            } else if (typeof textElement.text === 'string') {
              label = textElement.text;
            }
            console.log('提取到标签:', label);
          } catch (error) {
            console.log('提取标签出错:', error);
          }
        }
        
        // 通过 boundId 属性找到连接的节点
        let sourceNodeId = undefined;
        let targetNodeId = undefined;
        
        console.log('检查 source:', element.source);
        console.log('检查 target:', element.target);
        console.log('当前 nodeMap:', Array.from(nodeMap.entries()));
        
        if (element.source && element.source.boundId) {
          const sourceElementId = element.source.boundId;
          console.log('查找 source boundId:', sourceElementId);
          for (const [elementId, node] of nodeMap) {
            console.log('比较:', elementId, '===', sourceElementId);
            if (elementId === sourceElementId) {
              sourceNodeId = node.id;
              console.log('找到 source 节点:', sourceNodeId);
              break;
            }
          }
        }
        
        if (element.target && element.target.boundId) {
          const targetElementId = element.target.boundId;
          console.log('查找 target boundId:', targetElementId);
          for (const [elementId, node] of nodeMap) {
            console.log('比较:', elementId, '===', targetElementId);
            if (elementId === targetElementId) {
              targetNodeId = node.id;
              console.log('找到 target 节点:', targetNodeId);
              break;
            }
          }
        }
        
        console.log('连接结果:', { sourceNodeId, targetNodeId, label });
        
        if (sourceNodeId && targetNodeId) {
          console.log('添加连接:', sourceNodeId, '->', targetNodeId, label ? `(${label})` : '');
          connections.push({
            from: sourceNodeId,
            to: targetNodeId,
            label: label && label.trim() ? label.trim() : undefined
          });
        } else {
          console.log('连接失败 - 缺少 source 或 target');
        }
      }
    });
    
    console.log('=== 连接查找结束 ===');
    console.log('找到的连接数量:', connections.length);
    console.log('所有连接:', connections);

    // 如果没有找到连接，尝试基于位置推断连接关系
    if (connections.length === 0 && nodeMap.size > 1) {
      console.log('没有找到任何连接，使用后备线性连接逻辑');
      const nodeArray = Array.from(nodeMap.values());
      // 简单的线性连接作为后备方案
      for (let i = 0; i < nodeArray.length - 1; i++) {
        console.log('添加后备连接:', nodeArray[i].id, '->', nodeArray[i + 1].id);
        connections.push({
          from: nodeArray[i].id,
          to: nodeArray[i + 1].id
        });
      }
      console.log('后备连接完成，总连接数:', connections.length);
    } else {
      console.log('使用找到的连接，不需要后备逻辑');
    }

    // 生成节点定义
    for (const [_, node] of nodeMap) {
      switch (node.shape) {
        case 'ellipse':
          mermaid += `    ${node.id}(${node.text})\n`;
          break;
        case 'diamond':
          mermaid += `    ${node.id}{${node.text}}\n`;
          break;
        case 'roundRectangle':
          mermaid += `    ${node.id}(${node.text})\n`;
          break;
        default: // rectangle, triangle等
          mermaid += `    ${node.id}[${node.text}]\n`;
      }
    }

    // 生成连接关系
    connections.forEach(conn => {
      if (conn.label) {
        mermaid += `    ${conn.from} -->|${conn.label}| ${conn.to}\n`;
      } else {
        mermaid += `    ${conn.from} --> ${conn.to}\n`;
      }
    });

    return mermaid;
  };

  // 辅助函数：判断两个元素是否重叠（简化版）
  const elementsOverlap = (element1: any, element2: any): boolean => {
    if (!element1.points || !element2.points) return false;
    // 简化的重叠检测逻辑
    return Math.abs(element1.points[0][0] - element2.points[0][0]) < 50 &&
           Math.abs(element1.points[0][1] - element2.points[0][1]) < 50;
  };

  // 生成 Mermaid 内容
  const generateMermaid = () => {
    setIsGenerating(true);
    
    try {
      let mermaid = '';
      const elements = board.children;

      // 分离思维导图和绘图元素
      const mindElements = elements.filter(isMindElement);
      const drawElements = elements.filter(el => !isMindElement(el));

      if (mindElements.length > 0) {
        // 优先转换思维导图
        mermaid = convertMindToMermaid(mindElements);
      } else if (drawElements.length > 0) {
        // 转换绘图元素
        mermaid = convertDrawToMermaid(drawElements);
      } else {
        // 空画布时提供兼容的默认示例
        mermaid = `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`;
      }

      setMermaidContent(mermaid);
    } catch (error) {
      console.error('转换为 Mermaid 时出错:', error);
      setMermaidContent(`flowchart TD
    Error["转换失败"]
    Info["请检查画布内容"]
    
    Error --> Info
    
    %% 转换过程中发生错误`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制 Mermaid 内容到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mermaidContent);
      // 这里可以添加一个成功提示
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
    }
  };

  // 下载 Mermaid 文件
  const downloadMermaid = () => {
    const blob = new Blob([mermaidContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawnix-export-${new Date().toISOString().slice(0, 10)}.mmd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 组件加载时自动生成
  useEffect(() => {
    generateMermaid();
  }, []);

  return (
    <div className="ttd-dialog-content">
      <div className="ttd-dialog-header">
        <h2>导出为 Mermaid</h2>
        <p>将画布内容转换为 Mermaid 流程图格式</p>
      </div>

      <TTDDialogPanels>
        <TTDDialogPanel label="操作选项">
          <div className="ttd-actions">
            <button 
              className="ttd-button ttd-button-primary"
              onClick={generateMermaid}
              disabled={isGenerating}
            >
              {isGenerating ? '转换中...' : '重新生成'}
            </button>
            <button 
              className="ttd-button ttd-button-secondary"
              onClick={copyToClipboard}
              disabled={!mermaidContent || isGenerating}
            >
              复制到剪贴板
            </button>
            <button 
              className="ttd-button ttd-button-secondary"
              onClick={downloadMermaid}
              disabled={!mermaidContent || isGenerating}
            >
              下载 .mmd 文件
            </button>
          </div>
        </TTDDialogPanel>

        <TTDDialogPanel label="Mermaid 代码">
          <div className="ttd-dialog-output">
            <textarea
              className="ttd-textarea"
              value={mermaidContent}
              readOnly
              placeholder="转换后的 Mermaid 代码将显示在这里..."
              style={{ minHeight: '300px', fontFamily: 'monospace' }}
            />
          </div>
        </TTDDialogPanel>

        <TTDDialogPanel label="使用说明">
          <div className="ttd-dialog-info">
            <h4>📋 如何使用生成的 Mermaid 代码：</h4>
            <ul>
              <li>复制代码到支持 Mermaid 的编辑器（如 Typora、Notion）</li>
              <li>在 GitHub/GitLab 的 Markdown 文件中使用</li>
              <li>在 <a href="https://mermaid.live" target="_blank" rel="noopener">mermaid.live</a> 中预览和编辑</li>
              <li>集成到文档系统中（如 VuePress、Docusaurus）</li>
            </ul>
            <h4>💡 支持的转换类型：</h4>
            <ul>
              <li><strong>思维导图</strong> → 流程图结构</li>
              <li><strong>几何形状</strong> → 流程图节点</li>
              <li><strong>文本框</strong> → 流程图节点</li>
              <li><strong>连接线</strong> → 流程图箭头</li>
            </ul>
          </div>
        </TTDDialogPanel>
      </TTDDialogPanels>
    </div>
  );
};

export default DrawnixToMermaid;
