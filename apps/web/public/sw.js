const CACHE_NAME = 'drawnix-v1.0.0';
const STATIC_CACHE_NAME = 'drawnix-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'drawnix-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo/logo_drawnix_h.svg',
  '/logo/logo_drawnix_h_dark.svg',
  '/robots.txt',
  '/sitemap.xml'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
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
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有客户端
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
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
      url.pathname.endsWith('.ico')) {
    
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
  
  // 默认策略：网络优先，缓存后备
  event.respondWith(
    fetch(request)
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
