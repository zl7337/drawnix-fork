# Drawnix 技术文档总结

## 📋 项目概述

Drawnix 是一个开源白板工具，基于 Nx 单体仓库架构，支持思维导图、流程图、自由绘画等功能。

### 🏗️ 核心技术栈
- **前端框架**: React 18.3.1 + TypeScript
- **构建工具**: Vite 6.2.2 + Nx 19.3.0
- **部署平台**: Vercel + 自定义域名 (drawnix-zl7337.top)
- **PWA支持**: 支持 Windows/移动端应用安装

## 🚀 部署方案

### Vercel 部署（当前使用）
```bash
Build Command: npx nx build web
Output Directory: dist/apps/web
Install Command: npm install
```

### Cloudflare Pages 备选
```bash
Build command: npm run build:web  
Build output directory: dist/apps/web
Environment variables: NODE_VERSION = 20
```

## 🛠️ 开发环境

### 本地开发
```bash
npm install      # 安装依赖
npm start        # 启动开发服务器 (localhost:7200)
npm run build:web # 构建生产版本
```

### 项目结构
```
drawnix/
├── apps/web/           # 主应用
├── packages/
│   ├── drawnix/       # 核心绘图库
│   ├── react-board/   # 画板组件
│   └── react-text/    # 文本组件
└── dist/apps/web/     # 构建输出
```

## 🔧 已解决的问题

### 1. React 依赖冲突
- ✅ 配置 peerDependencies
- ✅ Vite 别名解析
- ✅ 单例 React 实例

### 2. PWA 安装问题
- ✅ 简化 manifest.json 配置
- ✅ 删除错误图标文件
- ✅ Windows 系统支持

### 3. 部署失败修复
- ✅ 相对路径配置
- ✅ vercel.json 优化
- ✅ 静态资源处理

### 4. 网络访问优化
- ✅ 自定义域名解决中国访问问题
- ✅ SSL 证书自动配置

## 📊 性能优化

### PDF 导出优化
- **快速导出**: 1.5x 分辨率，最小文件
- **推荐质量**: 2.5x 分辨率，平衡性能
- **高质量**: 4x 分辨率，专业打印

### 构建优化
- 代码分割和懒加载
- Tree Shaking 去除无用代码
- Gzip/Brotli 压缩

## 📁 保留的文档

1. **README.md** - 项目介绍
2. **README_en.md** - 英文版说明
3. **TECH_DOCS.md** - 技术文档总结
4. **PROJECT_STRUCTURE.md** - 项目结构说明
5. **PDF_OPTIMIZATION.md** - PDF 优化指南
6. **CFPAGE-DEPLOY.md** - Cloudflare 部署指南
7. **CHANGELOG.md** - 版本更新日志

## 🗑️ 已清理的文档

删除了以下重复或过时的文档：
- PWA_DEPLOYMENT_GUIDE.md
- PWA_UPGRADE_GUIDE.md
- DEPLOYMENT_FILE_TRANSFER.md
- GITHUB_DEPLOYMENT_GUIDE.md
- 等其他重复文档

---

**维护者**: zl7337  
**最后更新**: 2025年7月21日  
**仓库**: https://github.com/zl7337/drawnix-fork  
**在线访问**: https://drawnix-zl7337.top
