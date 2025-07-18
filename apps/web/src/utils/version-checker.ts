// 🔄 版本检测工具 - 自动解决缓存问题

export const APP_VERSION = '1.1.0'; // 🚀 当前版本 - 双向转换功能

/**
 * 检查是否有新版本可用
 */
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // 获取当前时间戳，强制检查最新版本
    const timestamp = Date.now();
    const response = await fetch(`/manifest.json?t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      const manifest = await response.json();
      const remoteVersion = manifest.version || '1.0.0';
      
      // 比较版本号
      const isNewerVersion = compareVersions(remoteVersion, APP_VERSION) > 0;
      
      if (isNewerVersion) {
        console.log(`🔄 New version available: ${remoteVersion} (current: ${APP_VERSION})`);
      }
      
      return isNewerVersion;
    }
  } catch (error) {
    console.warn('🔄 Version check failed:', error);
  }
  
  return false;
};

/**
 * 比较版本号
 * @param a 版本A
 * @param b 版本B  
 * @returns 1: a > b, -1: a < b, 0: a = b
 */
const compareVersions = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  const maxLength = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
};

/**
 * 强制清除所有缓存并重新加载
 */
export const forceRefresh = async (): Promise<void> => {
  try {
    // 清除所有缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('🧹 All caches cleared');
    }
    
    // 清除 localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // 重新加载页面
    window.location.reload();
  } catch (error) {
    console.error('❌ Force refresh failed:', error);
    // 回退到普通刷新
    window.location.reload();
  }
};

/**
 * 优雅的更新提示
 */
export const showUpdateNotification = (): void => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2196F3;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>🔄</span>
      <span>新版本可用，点击更新</span>
    </div>
  `;
  
  notification.onclick = () => {
    forceRefresh();
  };
  
  document.body.appendChild(notification);
  
  // 动画显示
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // 10秒后自动隐藏
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 10000);
};
