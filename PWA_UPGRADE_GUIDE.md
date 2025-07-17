# Drawnix PWA 升级指南

## 使 Drawnix 成为 PWA 的步骤

### 1. 添加 Service Worker
创建 `public/sw.js` 文件实现离线缓存

### 2. 添加 Web App Manifest
创建 `public/manifest.json` 文件定义应用信息

### 3. 支持安装到主屏幕
用户可以从浏览器"添加到主屏幕"，获得类似原生App的体验

## PWA 优势
- ✅ 可安装到桌面/主屏幕
- ✅ 离线工作能力 
- ✅ 类似原生App的启动体验
- ✅ 支持推送通知
- ✅ 无需应用商店分发

## 实现文件

### Service Worker (public/sw.js)
```javascript
const CACHE_NAME = 'drawnix-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // 其他静态资源
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### Manifest (public/manifest.json)
```json
{
  "name": "Drawnix - 开源白板工具",
  "short_name": "Drawnix",
  "description": "强大的开源白板工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "icons": [
    {
      "src": "/logo/logo_drawnix_h.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ],
  "categories": ["productivity", "business"]
}
```

### 在 HTML 中引用
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2196f3">
```
