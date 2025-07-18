const CACHE_NAME = 'drawnix-v1.1.1-' + Date.now(); // 🔄 强制缓存破解
const STATIC_CACHE_NAME = 'drawnix-static-v1.1.1-' + Date.now();
const DYNAMIC_CACHE_NAME = 'drawnix-dynamic-v1.1.1-' + Date.now();

// 🚀 自动清理旧缓存的版本列表
const OLD_CACHE_VERSIONS = [
  'drawnix-v1.0.0',
  'drawnix-static-v1.0.0', 
  'drawnix-dynamic-v1.0.0'
];

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo/logo_drawnix_h.svg',
  '/logo/logo_drawnix_h_dark.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json'
];

// 需要缓存的动态资源模式
const CACHE_PATTERNS = [
  /^\/assets\/.*\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf)$/,
  /^\/src\/.*\.(js|ts|tsx|jsx|css|scss)$/,
  /^\/node_modules\/.*\.(js|css)$/,
  /jspdf/i,
  /plait/i,
  /react/i,
  /vite/i,
  /html2canvas/
];

// 预缓存网络字体
const FONT_CACHE = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // 缓存字体资源
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Caching fonts');
          return Promise.allSettled(
            FONT_CACHE.map(url => 
              cache.add(url).catch(err => console.log('Font cache failed for:', url, err))
            )
          );
        })
    ]).catch((error) => {
      console.error('Service Worker: Failed to cache resources', error);
    })
  );
  
  // 强制激活新的 service worker
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 🧹 清理所有旧版本缓存
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          // 🚀 特别处理旧版本
          if (OLD_CACHE_VERSIONS.includes(cacheName)) {
            console.log('Service Worker: Force deleting old version cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎉 Service Worker: Cache cleanup completed');
      // 🔄 通知所有客户端刷新
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_UPDATED', version: CACHE_NAME });
        });
      });
    })
  );
  
  // 立即控制所有客户端
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 处理外部字体和 CDN 资源
  if (url.hostname === 'fonts.googleapis.com' || 
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'cdn.jsdelivr.net' ||
      url.hostname === 'unpkg.com') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              console.log('Network failed for external resource:', request.url);
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 静态资源策略：缓存优先
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/logo/') ||
      url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf') ||
      CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // 检查响应是否有效
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // 克隆响应用于缓存
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
        .catch(() => {
          // 离线时的后备策略
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }
  
  // API 和动态内容策略：网络优先
  if (url.pathname.startsWith('/api/') || 
      request.method !== 'GET') {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 只缓存 GET 请求的成功响应
          if (request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时尝试从缓存获取
          return caches.match(request);
        })
    );
    return;
  }
  
  // 默认策略：网络优先，缓存后备，增加重试机制
  event.respondWith(
    fetchWithRetry(request)
      .then((response) => {
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果是导航请求且没有缓存，返回主页
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 带重试机制的fetch函数
async function fetchWithRetry(request, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(request, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      if (i === retries) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`Fetch attempt ${i + 1} failed:`, error.message);
      
      if (i === retries) {
        throw error;
      }
      
      // 指数退避重试
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// 监听消息事件，用于更新缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 推送通知支持（可选）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Drawnix 通知',
      icon: '/logo/logo_drawnix_h.svg',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: '查看详情',
          icon: '/logo/logo_drawnix_h.svg'
        },
        {
          action: 'close',
          title: '关闭',
          icon: '/favicon.ico'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Drawnix', options)
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
