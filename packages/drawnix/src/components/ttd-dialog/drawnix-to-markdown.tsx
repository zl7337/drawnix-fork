import { useState, useEffect } from 'react';
import './ttd-dialog.scss';
import { TTDDialogPanels } from './ttd-dialog-panels';
import { TTDDialogPanel } from './ttd-dialog-panel';
import { useDrawnix } from '../../hooks/use-drawnix';
import { useBoard } from '@plait-board/react-board';
import { PlaitElement } from '@plait/core';
import { MindElement } from '@plait/mind';

const DrawnixToMarkdown = () => {
  const { appState, setAppState } = useDrawnix();
  const board = useBoard();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 检查是否为思维导图元素
  const isMindElement = (element: PlaitElement): element is MindElement => {
    return MindElement.isMindElement(board, element);
  };

  // 提取思维导图节点的文本内容
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

  // 将 Mind 元素转换为 Markdown（与导入格式保持一致）
  const convertMindToMarkdown = (element: MindElement, level: number = 1): string => {
    // 正确提取标题文本
    const title = extractTitleText(element);
    
    if (level === 1) {
      // 根节点使用 # 标题
      let result = `# ${title}\n\n`;
      
      if (element.children && element.children.length > 0) {
        element.children.forEach((child: any) => {
          if (isMindElement(child)) {
            result += convertMindToMarkdownList(child, 0);
          }
        });
      }
      
      return result;
    } else {
      return convertMindToMarkdownList(element, level - 2);
    }
  };

  // 将子节点转换为列表格式（匹配导入时的格式）
  const convertMindToMarkdownList = (element: MindElement, depth: number): string => {
    const title = extractTitleText(element);
    const indent = '  '.repeat(depth);
    let result = `${indent}- ${title}\n`;

    if (element.children && element.children.length > 0) {
      element.children.forEach((child: any) => {
        if (isMindElement(child)) {
          result += convertMindToMarkdownList(child, depth + 1);
        }
      });
    }

    return result;
  };

  // 将 Draw 元素转换为 Markdown（简化版）
  const convertDrawToMarkdown = (elements: PlaitElement[]): string => {
    let result = '# 绘图内容\n\n';
    let shapeCount = 0;
    let textCount = 0;

    elements.forEach((element: any) => {
      if (element.type === 'geometry') {
        shapeCount++;
        result += `- 形状 ${shapeCount}: ${element.shape || '未知形状'}\n`;
      } else if (element.type === 'text') {
        textCount++;
        const text = element.children?.[0]?.children?.[0]?.text || '文本内容';
        result += `- 文本 ${textCount}: ${text}\n`;
      } else if (element.type === 'line') {
        result += `- 连接线\n`;
      }
    });

    if (shapeCount === 0 && textCount === 0) {
      result += '暂无可转换的内容\n';
    }

    return result + '\n';
  };

  // 生成 Markdown 内容
  const generateMarkdown = () => {
    setIsGenerating(true);
    
    try {
      let markdown = '';
      const elements = board.children;

      // 分离思维导图和绘图元素
      const mindElements = elements.filter(isMindElement);
      const drawElements = elements.filter(el => !isMindElement(el));

      if (mindElements.length > 0) {
        // 对于思维导图，直接转换为Markdown（不需要额外的标题）
        mindElements.forEach((element) => {
          markdown += convertMindToMarkdown(element);
          markdown += '\n'; // 添加空行分隔
        });
      }

      if (drawElements.length > 0) {
        // 如果有思维导图内容，添加分隔
        if (mindElements.length > 0) {
          markdown += '\n---\n\n';
        }
        markdown += convertDrawToMarkdown(drawElements);
      }

      // 如果没有任何内容，提供默认示例
      if (markdown.trim() === '') {
        markdown = `# 我开始了

- 让我看看是谁搞出了这个 bug 🕵️ ♂️ 🔍
  - 😯 💣
    - 原来是我 👈 🎯 💘

- 竟然不可以运行，为什么呢 🚫 ⚙️ ❓
  - 竟然可以运行了，为什么呢？🎢 ✨
    - 🤯 ⚡ ➡️ 🎉

- 能运行起来的 🐞 🚀
  - 就不要去动它 🛑 ✋
    - 👾 💥 🏹 🎯`;
      }

      setMarkdownContent(markdown);
    } catch (error) {
      console.error('转换为 Markdown 时出错:', error);
      setMarkdownContent('# 转换失败\n\n转换过程中发生错误，请检查画布内容或稍后重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制 Markdown 内容到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      // 这里可以添加一个成功提示
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
    }
  };

  // 下载 Markdown 文件
  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawnix-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 组件加载时自动生成
  useEffect(() => {
    generateMarkdown();
  }, []);

  return (
    <div className="ttd-dialog-content">
      <div className="ttd-dialog-header">
        <h2>导出为 Markdown</h2>
        <p>将画布内容转换为 Markdown 格式</p>
      </div>

      <TTDDialogPanels>
        <TTDDialogPanel label="操作选项">
          <div className="ttd-actions">
            <button 
              className="ttd-button ttd-button-primary"
              onClick={generateMarkdown}
              disabled={isGenerating}
            >
              {isGenerating ? '转换中...' : '重新生成'}
            </button>
            <button 
              className="ttd-button ttd-button-secondary"
              onClick={copyToClipboard}
              disabled={!markdownContent || isGenerating}
            >
              复制到剪贴板
            </button>
            <button 
              className="ttd-button ttd-button-secondary"
              onClick={downloadMarkdown}
              disabled={!markdownContent || isGenerating}
            >
              下载 .md 文件
            </button>
          </div>
        </TTDDialogPanel>

        <TTDDialogPanel label="Markdown 预览">
          <div className="ttd-dialog-output">
            <textarea
              className="ttd-textarea"
              value={markdownContent}
              readOnly
              placeholder="转换后的 Markdown 内容将显示在这里..."
              style={{ minHeight: '300px', fontFamily: 'monospace' }}
            />
          </div>
        </TTDDialogPanel>
      </TTDDialogPanels>
    </div>
  );
};

export default DrawnixToMarkdown;
