import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { checkForUpdates, forceRefresh } from './utils/version-checker';

// 🔍 检测老用户缓存问题并提供解决方案 - v2.0
function checkAndHandleOldUserCache() {
  // 检测是否为老用户（之前访问过的用户）
  const hasVisitedBefore = localStorage.getItem('drawnix-visited') || sessionStorage.getItem('drawnix-visited');
  
  if (hasVisitedBefore) {
    // 检查是否有最新功能的标识
    const hasNewFeatures = document.querySelector('[data-feature="import-export"]') || 
                           document.querySelector('.ttd-dialog') ||
                           window.location.search.includes('cache-clear');
    
    if (!hasNewFeatures) {
      // 延迟显示缓存清理提示，避免干扰应用加载
      setTimeout(() => {
        showCacheUpdateNotification();
      }, 3000);
    }
  } else {
    // 标记为已访问
    localStorage.setItem('drawnix-visited', 'true');
  }
}

// 显示缓存更新通知
function showCacheUpdateNotification() {
  // 避免重复显示
  if (document.querySelector('.cache-update-notification')) return;
  
  const notification = document.createElement('div');
  notification.className = 'cache-update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10001;
      max-width: 450px;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideInDown 0.5s ease;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">🔄</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">发现新功能</div>
          <div style="font-size: 14px; opacity: 0.9;">
            Drawnix 已更新！新增了 Markdown/Mermaid 导入导出功能
          </div>
        </div>
        <button onclick="clearCacheAndReload()" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; 
                       padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px;
                       transition: all 0.3s ease;">
          立即更新
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 20px; 
                       cursor: pointer; opacity: 0.7; padding: 4px;">
          ×
        </button>
      </div>
    </div>
    <style>
      @keyframes slideInDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translateX(-50%); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(notification);
  
  // 添加全局函数供按钮调用
  (window as any).clearCacheAndReload = async () => {
    notification.remove();
    
    // 显示清理进度
    const progress = document.createElement('div');
    progress.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 12px;
        z-index: 10002;
        text-align: center;
      ">
        <div style="font-size: 18px; margin-bottom: 10px;">🧹 正在清理缓存...</div>
        <div style="font-size: 14px; opacity: 0.8;">请稍候，即将刷新页面</div>
      </div>
    `;
    document.body.appendChild(progress);
    
    try {
      // 清理 Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      // 清理缓存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // 清理本地存储（仅 Drawnix 相关）
      Object.keys(localStorage).forEach(key => {
        if (key.includes('drawnix') || key.includes('plait')) {
          localStorage.removeItem(key);
        }
      });
      
      // 强制刷新
      setTimeout(() => {
        window.location.href = window.location.href + '?cache-cleared=' + Date.now();
      }, 1000);
      
    } catch (error) {
      console.error('Cache clear failed:', error);
      // 即使清理失败也强制刷新
      window.location.reload();
    }
  };
  
  // 10秒后自动隐藏
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

// 🚀 自动更新检测 - 解决老用户缓存问题
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully');
        
        // 🔄 检测更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 🎉 新版本可用，提示用户更新
                if (confirm('🔄 检测到新版本，是否立即更新？(推荐)')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // 🚀 立即检查更新 - 强制缓存破解
        registration.update().catch(console.error);
        
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });

    // 🔄 监听来自Service Worker的消息
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'CACHE_UPDATED') {
        console.log('🎉 Cache updated to version:', event.data.version);
      }
    });

    // 🚀 强制检查应用更新 - 每30秒检查一次
    setInterval(async () => {
      try {
        const hasUpdate = await checkForUpdates();
        if (hasUpdate) {
          if (confirm('🔄 检测到新版本，是否立即更新？(推荐)')) {
            await forceRefresh();
          }
        }
      } catch (error) {
        console.log('Version check failed:', error);
      }
    }, 30000);
  });
}

// 🎯 启动老用户缓存检测
checkAndHandleOldUserCache();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
// Force cache invalidation 2025年 7月20日 星期日 22时41分28秒 CST
