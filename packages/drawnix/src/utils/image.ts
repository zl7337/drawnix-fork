import { getSelectedElements, PlaitBoard } from '@plait/core';
import { base64ToBlob, boardToImage, download } from './common';

export const saveAsImage = async (board: PlaitBoard, isTransparent: boolean) => {
  try {
    console.log('开始导出图片...');
    const selectedElements = getSelectedElements(board);
    const isFullBoard = selectedElements.length === 0;
    
    // 显示导出进度提示
    const loadingElement = showExportLoading();
    
    // 智能选择导出参数
    const exportOptions = getOptimalExportOptions(board, selectedElements, isTransparent);
    
    const image = await boardToImage(board, exportOptions);
    
    hideExportLoading(loadingElement);
    
    if (image) {
      console.log('图片生成成功，开始下载...');
      const ext = isTransparent ? 'png' : 'jpg';
      const pngImage = base64ToBlob(image);
      const imageName = `drawnix-${new Date().getTime()}.${ext}`;
      download(pngImage, imageName);
      showExportSuccess();
    } else {
      console.error('图片生成失败：返回空图片');
      showExportError('图片生成失败，请尝试选择部分内容后导出');
    }
  } catch (error) {
    console.error('导出图片时发生错误:', error);
    hideExportLoading();
    
    // 根据错误类型给出不同的提示
    if (error instanceof Error) {
      if (error.message.includes('canvas') || error.message.includes('memory')) {
        showExportError('内容过大，请尝试选择部分内容后导出，或清空部分元素后重试');
      } else {
        showExportError(`导出失败: ${error.message}`);
      }
    } else {
      showExportError('导出失败，请重试');
    }
  }
};

// 获取最优的导出选项
const getOptimalExportOptions = (board: PlaitBoard, selectedElements: any[], isTransparent: boolean) => {
  const isFullBoard = selectedElements.length === 0;
  const elementCount = isFullBoard ? board.children.length : selectedElements.length;
  
  // 根据元素数量和类型智能选择导出参数
  let ratio = 4;
  let padding = 20;
  
  if (isFullBoard) {
    // 全画布导出时，根据元素数量调整分辨率
    if (elementCount > 100) {
      ratio = 1.5; // 大量元素时使用更低分辨率
      padding = 10;
    } else if (elementCount > 50) {
      ratio = 2;
      padding = 15;
    } else {
      ratio = 3;
    }
  } else {
    // 选中元素导出时，可以使用更高分辨率
    if (selectedElements.length > 20) {
      ratio = 3;
    } else {
      ratio = 4;
    }
  }
  
  console.log(`导出参数: ratio=${ratio}, padding=${padding}, 元素数量=${elementCount}, 全画布=${isFullBoard}`);
  
  return {
    elements: isFullBoard ? undefined : selectedElements,
    fillStyle: isTransparent ? 'transparent' : 'white',
    ratio,
    padding,
  };
};

// 显示导出加载状态
const showExportLoading = () => {
  const loading = document.createElement('div');
  loading.id = 'export-loading';
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
  `;
  loading.textContent = '正在导出图片，请稍候...';
  document.body.appendChild(loading);
  return loading;
};

// 隐藏导出加载状态
const hideExportLoading = (element?: Element | null) => {
  if (element) {
    element.remove();
  } else {
    const loading = document.getElementById('export-loading');
    if (loading) loading.remove();
  }
};

// 显示导出成功提示
const showExportSuccess = () => {
  const toast = createToast('图片导出成功！', 'success');
  setTimeout(() => toast.remove(), 3000);
};

// 显示导出错误提示
const showExportError = (message: string) => {
  const toast = createToast(message, 'error');
  setTimeout(() => toast.remove(), 5000);
};

// 创建提示框
const createToast = (message: string, type: 'success' | 'error') => {
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
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  return toast;
};
