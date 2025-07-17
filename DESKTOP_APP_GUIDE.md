# Drawnix 桌面应用方案

## 1. Electron 方案 (推荐)
使用 Electron 将 Web 应用包装成桌面应用

### 优势
- ✅ 跨平台 (Windows, macOS, Linux)
- ✅ 可访问本地文件系统
- ✅ 系统集成 (任务栏、通知等)
- ✅ 离线工作
- ✅ 可通过应用商店分发

### 实现步骤
```bash
# 1. 安装 Electron
npm install --save-dev electron @electron-forge/cli

# 2. 初始化 Electron
npx electron-forge import

# 3. 创建主进程文件 (electron/main.js)
# 4. 配置构建脚本
# 5. 打包分发
```

### 项目结构调整
```
drawnix/
├── apps/
│   ├── web/              # 现有 Web 应用
│   └── desktop/          # 新增 Electron 应用
│       ├── main.js       # Electron 主进程
│       ├── preload.js    # 预加载脚本
│       └── package.json  # Electron 配置
```

## 2. Tauri 方案 (现代化选择)
使用 Rust + Web 技术的轻量级方案

### 优势
- ✅ 更小的应用体积
- ✅ 更好的性能
- ✅ 更强的安全性
- ✅ 原生系统集成

## 3. Capacitor 方案
Ionic 团队开发的跨平台方案

### 优势
- ✅ 同时支持桌面和移动端
- ✅ 原生插件生态
- ✅ 简单的配置

## 推荐实施顺序
1. **PWA 升级** (最简单，立即可用)
2. **Electron 桌面版** (完整桌面体验)
3. **移动端** (可选，使用 Capacitor)

## 示例 Electron 主进程代码
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'hidden', // 隐藏标题栏
    trafficLightPosition: { x: 20, y: 20 }
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:7200');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```
