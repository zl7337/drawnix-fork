// Vercel Edge Function - 强制缓存清理
export default function handler(request) {
  const url = new URL(request.url);
  
  // 添加缓存清理头
  const headers = new Headers();
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('X-Timestamp', Date.now().toString());
  headers.set('X-Version', 'v1.1.1');
  
  // 如果是 Service Worker 请求，添加特殊处理
  if (url.pathname.endsWith('/sw.js')) {
    headers.set('Service-Worker-Allowed', '/');
    headers.set('X-Force-Update', 'true');
  }
  
  // 如果是 HTML 请求，强制刷新
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    headers.set('X-Force-Refresh', 'true');
    headers.set('Last-Modified', new Date().toUTCString());
  }
  
  return new Response(null, {
    status: 200,
    headers
  });
}
