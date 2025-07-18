import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { checkForUpdates, forceRefresh } from './utils/version-checker';

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
