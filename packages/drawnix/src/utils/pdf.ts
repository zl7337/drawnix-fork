import { jsPDF } from 'jspdf';
import { getSelectedElements, PlaitBoard } from '@plait/core';
import { boardToImage } from './common';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter';
  quality?: 'low' | 'medium' | 'high';
  margin?: number;
}

export const saveAsPDF = async (
  board: PlaitBoard, 
  options: PdfExportOptions = {}
) => {
  try {
    // 检查网络状态
    if (!navigator.onLine) {
      const useOffline = confirm(
        '当前处于离线状态，PDF导出功能可能受限。\n' +
        '建议联网后使用以获得最佳效果。\n' +
        '是否仍要继续导出？'
      );
      if (!useOffline) {
        return;
      }
    }
    
    console.log('开始导出PDF...');
    const selectedElements = getSelectedElements(board);
    const isFullBoard = selectedElements.length === 0;
    
    // 显示导出进度提示
    const loadingElement = showPDFExportLoading();
    
    // 设置默认选项
    const {
      orientation = 'landscape',
      format = 'a4',
      quality = 'medium',
      margin = 20
    } = options;
    
    // 根据质量设置选择导出参数
    const getQualitySettings = (qualityLevel: string) => {
      switch (qualityLevel) {
        case 'low':
          return {
            ratio: 1.5,
            compression: 'SLOW' as const,
            jpegQuality: 0.6
          };
        case 'high':
          return {
            ratio: 4,
            compression: 'FAST' as const,
            jpegQuality: 0.9
          };
        default: // medium
          return {
            ratio: 2.5,
            compression: 'MEDIUM' as const,
            jpegQuality: 0.8
          };
      }
    };
    
    const qualitySettings = getQualitySettings(quality);
    
    // 获取画布图片
    const image = await boardToImage(board, {
      elements: isFullBoard ? undefined : selectedElements,
      fillStyle: 'white', // PDF通常使用白色背景
      ratio: qualitySettings.ratio,
      padding: 10,
    });
    
    if (!image) {
      throw new Error('无法生成画布图片');
    }
    
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });
    
    // 获取PDF页面尺寸
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    
    // 创建图片元素来获取尺寸
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          const imgWidth = img.width;
          const imgHeight = img.height;
          
          // 计算缩放比例以适应页面
          const scaleX = contentWidth / imgWidth;
          const scaleY = contentHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const finalWidth = imgWidth * scale;
          const finalHeight = imgHeight * scale;
          
          // 居中计算
          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;
          
          // 添加图片到PDF
          pdf.addImage(
            image,
            'JPEG', // 使用JPEG格式以获得更好的压缩
            x,
            y,
            finalWidth,
            finalHeight,
            undefined,
            qualitySettings.compression
          );
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      img.src = image;
    });
    
    // 添加页脚信息
    addPDFFooter(pdf, pageWidth, pageHeight);
    
    // 保存PDF
    const fileName = `drawnix-${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    
    hidePDFExportLoading(loadingElement);
    
    // 估算文件大小并显示相应提示
    const estimatedSize = estimatePDFSize(qualitySettings.ratio, isFullBoard);
    showPDFExportSuccess(estimatedSize);
    
    console.log('PDF导出成功:', fileName, `预估大小: ${estimatedSize}`);
    
  } catch (error) {
    console.error('PDF导出失败:', error);
    hidePDFExportLoading();
    
    if (error instanceof Error) {
      showPDFExportError(`PDF导出失败: ${error.message}`);
    } else {
      showPDFExportError('PDF导出失败，请重试');
    }
  }
};

// 估算PDF文件大小
const estimatePDFSize = (ratio: number, isFullBoard: boolean): string => {
  // 基于分辨率比例和内容范围估算文件大小
  let baseSize = 0.5; // MB
  
  if (isFullBoard) {
    baseSize *= 2; // 全画布通常更大
  }
  
  const sizeMultiplier = Math.pow(ratio / 2, 2); // 分辨率的平方关系
  const estimatedMB = baseSize * sizeMultiplier;
  
  if (estimatedMB < 1) {
    return `${Math.round(estimatedMB * 1000)}KB`;
  } else {
    return `${estimatedMB.toFixed(1)}MB`;
  }
};

// 添加PDF页脚
const addPDFFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number) => {
  const footerY = pageHeight - 10;
  const fontSize = 8;
  
  pdf.setFontSize(fontSize);
  pdf.setTextColor(128, 128, 128);
  
  // 左侧：创建时间
  const dateStr = new Date().toLocaleDateString('zh-CN');
  pdf.text(`创建时间: ${dateStr}`, 20, footerY);
  
  // 右侧：来源
  const sourceText = 'Created by Drawnix';
  const textWidth = pdf.getTextWidth(sourceText);
  pdf.text(sourceText, pageWidth - 20 - textWidth, footerY);
};

// 显示PDF导出加载状态
const showPDFExportLoading = () => {
  const loading = document.createElement('div');
  loading.id = 'pdf-export-loading';
  loading.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  // 添加加载动画
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff33;
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  // 添加CSS动画
  if (!document.getElementById('pdf-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'pdf-spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  loading.appendChild(spinner);
  
  const text = document.createElement('span');
  text.textContent = '正在生成PDF，请稍候...';
  loading.appendChild(text);
  
  document.body.appendChild(loading);
  return loading;
};

// 隐藏PDF导出加载状态
const hidePDFExportLoading = (element?: Element | null) => {
  if (element) {
    element.remove();
  } else {
    const loading = document.getElementById('pdf-export-loading');
    if (loading) loading.remove();
  }
};

// 显示PDF导出成功提示
const showPDFExportSuccess = (estimatedSize?: string) => {
  const message = estimatedSize 
    ? `PDF导出成功！文件大小约 ${estimatedSize}` 
    : 'PDF导出成功！';
  const toast = createPDFToast(message, 'success');
  setTimeout(() => toast.remove(), 4000);
};

// 显示PDF导出错误提示
const showPDFExportError = (message: string) => {
  const toast = createPDFToast(message, 'error');
  setTimeout(() => toast.remove(), 5000);
};

// 创建PDF提示框
const createPDFToast = (message: string, type: 'success' | 'error') => {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    z-index: 10001;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  // 添加图标
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✓' : '✗';
  icon.style.fontWeight = 'bold';
  toast.appendChild(icon);
  
  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);
  
  document.body.appendChild(toast);
  return toast;
};
