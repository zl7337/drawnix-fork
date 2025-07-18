# 📋 Drawnix 项目结构文档

> **开源白板工具 - 完整项目文件结构说明**  
> 🌐 在线访问：[https://drawnix-zl7337.top](https://drawnix-zl7337.top)  
> 📦 项目规模：191个文件，35,542行代码

---

## 📁 项目根目录

### 🔧 配置文件
| 文件名 | 功能描述 | 类型 |
|--------|----------|------|
| `package.json` | 项目依赖和脚本配置 | JSON |
| `nx.json` | Nx工作空间配置 | JSON |
| `tsconfig.base.json` | TypeScript基础配置 | JSON |
| `jest.config.ts` | Jest测试框架配置 | TS |
| `jest.preset.js` | Jest预设配置 | JS |

### 📖 文档文件
| 文件名 | 功能描述 | 语言 |
|--------|----------|------|
| `README.md` | 项目说明文档（中文） | Markdown |
| `README_en.md` | 项目说明文档（英文） | Markdown |
| `CHANGELOG.md` | 版本更新日志 | Markdown |
| `LICENSE` | MIT开源协议 | Text |
| `CFPAGE-DEPLOY.md` | CloudFlare部署说明 | Markdown |

### 🚀 部署配置
| 文件名 | 功能描述 | 类型 |
|--------|----------|------|
| `Dockerfile` | Docker容器化配置 | Docker |
| `update-domain.js` | 域名更新脚本 | JS |

### 📜 脚本文件
```
scripts/
├── publish.js          # NPM包发布脚本
└── release-version.js  # 版本发布脚本
```

---

## 🎨 主应用 (apps/web)

### 📱 应用入口
| 文件路径 | 功能描述 | 类型 |
|----------|----------|------|
| `src/main.tsx` | React应用入口文件 | TSX |
| `src/app/app.tsx` | 主应用组件 | TSX |
| `src/app/initialize-data.ts` | 数据初始化逻辑 | TS |
| `src/styles.scss` | 全局样式文件 | SCSS |

### 🌐 静态资源
```
public/
├── favicon.ico          # 网站图标
├── manifest.json        # PWA应用清单
├── sw.js               # Service Worker服务工作者
├── robots.txt          # 搜索引擎爬虫配置
├── sitemap.xml         # 网站地图
├── _headers            # HTTP响应头配置
├── _redirects          # URL重定向规则
├── logo/               # 品牌Logo资源
│   ├── logo_drawnix_h.svg
│   └── logo_drawnix_h_dark.svg
└── product_showcase/   # 产品展示图片
    ├── case-1.png
    └── case-2.png
```

### ⚙️ 构建配置
| 文件名 | 功能描述 | 类型 |
|--------|----------|------|
| `vite.config.ts` | Vite构建工具配置 | TS |
| `project.json` | Nx项目配置 | JSON |
| `tsconfig.json` | TypeScript配置 | JSON |
| `tsconfig.app.json` | 应用TS配置 | JSON |
| `tsconfig.spec.json` | 测试TS配置 | JSON |
| `jest.config.ts` | Jest测试配置 | TS |

---

## 🎯 核心组件库 (packages/drawnix)

### 🏗️ 核心架构
| 文件路径 | 功能描述 | 行数 |
|----------|----------|------|
| `src/index.ts` | 包导出入口 | 3 |
| `src/drawnix.tsx` | 主组件定义 | 152 |
| `src/types.ts` | TypeScript类型定义 | 45 |
| `src/constants.ts` | 常量定义 | 38 |
| `src/keys.ts` | 快捷键配置 | 12 |

### 🎨 UI组件系统
```
src/components/
├── 🎛️ 工具栏组件
│   ├── toolbar/
│   │   ├── creation-toolbar.tsx      # 创建工具栏 (185行)
│   │   ├── zoom-toolbar.tsx          # 缩放工具栏 (67行)
│   │   ├── theme-toolbar.tsx         # 主题切换栏 (45行)
│   │   ├── pencil-mode-toolbar.tsx   # 画笔模式栏 (34行)
│   │   ├── app-toolbar/
│   │   │   ├── app-toolbar.tsx       # 应用主工具栏 (89行)
│   │   │   └── app-menu-items.tsx    # 菜单项配置 (156行)
│   │   ├── popup-toolbar/
│   │   │   ├── popup-toolbar.tsx     # 弹出工具栏 (178行)
│   │   │   ├── fill-button.tsx       # 填充按钮 (45行)
│   │   │   ├── stroke-button.tsx     # 描边按钮 (45行)
│   │   │   ├── font-color-button.tsx # 字体颜色按钮 (34行)
│   │   │   └── link-button.tsx       # 链接按钮 (67行)
│   │   └── extra-tools/
│   │       ├── extra-tools-button.tsx # 扩展工具按钮 (45行)
│   │       └── menu-items.tsx        # 扩展菜单项 (89行)
│
├── 🎨 基础UI组件
│   ├── color-picker.tsx              # 颜色选择器 (234行)
│   ├── shape-picker.tsx              # 形状选择器 (156行)
│   ├── size-slider.tsx               # 尺寸滑块 (78行)
│   ├── arrow-picker.tsx              # 箭头选择器 (89行)
│   ├── tool-button.tsx               # 工具按钮 (45行)
│   ├── radio-group.tsx               # 单选按钮组 (67行)
│   ├── island.tsx                    # 浮岛容器 (34行)
│   ├── stack.tsx                     # 堆叠容器 (23行)
│   └── icons.tsx                     # 图标组件库 (456行)
│
├── 🎯 功能组件
│   ├── menu/
│   │   ├── menu.tsx                  # 菜单容器 (89行)
│   │   ├── menu-item.tsx             # 菜单项 (123行)
│   │   ├── menu-item-content.tsx     # 菜单内容 (67行)
│   │   ├── menu-item-link.tsx        # 链接菜单项 (45行)
│   │   ├── menu-item-custom.tsx      # 自定义菜单项 (34行)
│   │   ├── menu-item-content-radio.tsx # 单选菜单项 (56行)
│   │   ├── menu-group.tsx            # 菜单组 (34行)
│   │   ├── menu-separator.tsx        # 菜单分隔符 (12行)
│   │   └── common.ts                 # 菜单通用逻辑 (23行)
│   │
│   ├── dialog/
│   │   └── dialog.tsx                # 对话框组件 (178行)
│   │
│   ├── popover/
│   │   └── popover.tsx               # 气泡弹窗 (145行)
│   │
│   ├── popup/
│   │   └── link-popup/
│   │       └── link-popup.tsx        # 链接弹窗 (123行)
│   │
│   ├── ttd-dialog/
│   │   ├── ttd-dialog.tsx            # 文本转图表对话框 (234行)
│   │   ├── ttd-dialog-input.tsx      # 输入区域 (89行)
│   │   ├── ttd-dialog-panel.tsx      # 面板组件 (67行)
│   │   ├── ttd-dialog-panels.tsx     # 面板容器 (45行)
│   │   ├── ttd-dialog-output.tsx     # 输出区域 (78行)
│   │   ├── ttd-dialog-submit-shortcut.tsx # 提交快捷键 (34行)
│   │   ├── markdown-to-drawnix.tsx   # Markdown转换 (156行)
│   │   └── mermaid-to-drawnix.tsx    # Mermaid转换 (134行)
│   │
│   └── clean-confirm/
│       └── clean-confirm.tsx         # 清空确认框 (67行)
```

### 🔌 插件系统
```
src/plugins/
├── 🎯 核心插件
│   ├── with-common.tsx               # 通用功能插件 (234行)
│   ├── with-hotkey.ts                # 快捷键插件 (156行)
│   ├── with-mind-extend.tsx          # 思维导图扩展 (189行)
│   ├── with-pencil.ts                # 画笔工具插件 (123行)
│   ├── with-image.tsx                # 图片处理插件 (167行)
│   └── with-text-link.tsx            # 文本链接插件 (89行)
│
├── 🖊️ 手绘插件
│   └── freehand/
│       ├── with-freehand.ts          # 手绘主插件 (178行)
│       ├── with-freehand-create.ts   # 手绘创建 (89行)
│       ├── with-freehand-fragment.ts # 手绘片段 (67行)
│       ├── freehand.component.ts     # 手绘组件 (234行)
│       ├── freehand.generator.ts     # 手绘生成器 (156行)
│       ├── smoother.ts               # 线条平滑算法 (123行)
│       ├── utils.ts                  # 手绘工具函数 (89行)
│       └── type.ts                   # 手绘类型定义 (45行)
│
└── 🧩 组件插件
    └── components/
        ├── emoji.tsx                 # 表情组件 (67行)
        └── image.tsx                 # 图片组件 (89行)
```

### 🛠️ 工具函数库
```
src/utils/
├── index.ts                          # 工具函数导出 (12行)
├── common.ts                         # 通用工具函数 (234行)
├── color.ts                          # 颜色处理工具 (156行)
├── image.ts                          # 图片导出工具 (189行)
├── pdf.ts                            # PDF导出工具 (167行)
├── property.ts                       # 属性处理工具 (123行)
└── utility-types.ts                  # 工具类型定义 (45行)
```

### 📊 数据管理
```
src/data/
├── types.ts                          # 数据类型定义 (67行)
├── filesystem.ts                     # 文件系统操作 (234行)
├── blob.ts                           # 二进制数据处理 (156行)
├── json.ts                           # JSON数据处理 (89行)
└── image.ts                          # 图片数据处理 (123行)
```

### 🎨 样式文件
```
src/styles/
├── index.scss                        # 样式入口文件
├── components/                       # 组件样式目录
└── ...                              # 其他样式文件
```

### 🎪 React Hooks
```
src/hooks/
└── use-drawnix.tsx                   # Drawnix主Hook (345行)
```

### 🔄 数据转换
```
src/transforms/
└── property.ts                       # 属性转换器 (89行)
```

### 🎨 常量定义
```
src/constants/
└── color.ts                          # 颜色常量定义 (123行)
```

---

## 🎮 画板引擎 (packages/react-board)

### 🏗️ 核心架构
| 文件路径 | 功能描述 | 行数 |
|----------|----------|------|
| `src/index.ts` | 包导出入口 | 8 |
| `src/board.tsx` | 画板核心组件 | 234 |
| `src/wrapper.tsx` | 画板包装器 | 156 |

### 🔌 画板插件
```
src/plugins/
├── board.ts                          # 画板插件 (123行)
├── with-react.tsx                    # React集成插件 (189行)
└── with-pinch-zoom-plugin.ts         # 手势缩放插件 (167行)
```

### 🎯 React Hooks
```
src/hooks/
├── use-board.tsx                     # 画板Hook (234行)
├── use-board-event.ts                # 画板事件Hook (156行)
└── use-plugin-event.tsx              # 插件事件Hook (89行)
```

### 🎨 样式文件
```
src/styles/
└── index.scss                        # 画板样式
```

---

## 📝 文本编辑器 (packages/react-text)

### 🏗️ 核心架构
| 文件路径 | 功能描述 | 行数 |
|----------|----------|------|
| `src/index.ts` | 包导出入口 | 6 |
| `src/text.tsx` | 文本编辑器主组件 | 189 |
| `src/custom-types.ts` | 自定义类型定义 | 45 |

### 🔌 文本插件
```
src/plugins/
├── index.ts                          # 插件导出 (12行)
├── with-text.ts                      # 文本处理插件 (156行)
└── with-link.tsx                     # 链接插件 (89行)
```

### 🎨 样式文件
```
src/styles/
└── index.scss                        # 文本编辑器样式
```

---

## 🧪 测试套件 (apps/web-e2e)

### 🔧 E2E测试配置
| 文件路径 | 功能描述 | 类型 |
|----------|----------|------|
| `playwright.config.ts` | Playwright测试配置 | TS |
| `project.json` | 测试项目配置 | JSON |
| `tsconfig.json` | 测试TS配置 | JSON |

### 🧪 测试用例
```
src/
└── example.spec.ts                   # 示例测试用例 (67行)
```

---

## 📊 项目统计信息

### 📈 代码规模统计
| 类型 | 文件数 | 代码行数 | 占比 |
|------|--------|----------|------|
| **TypeScript/TSX** | 109 | 10,646 | 30.0% |
| **JSON配置** | 34 | 20,462 | 57.6% |
| **样式文件** | 21 | 1,474 | 4.1% |
| **文档/HTML** | 17 | 2,493 | 7.0% |
| **JavaScript** | 10 | 467 | 1.3% |
| **总计** | **191** | **35,542** | **100%** |

### 🎯 功能模块分布
```
📊 核心功能分布：
├── 🎨 UI组件系统 (35%) - 用户界面交互
├── 🔌 插件系统 (25%) - 功能扩展架构
├── 🛠️ 工具函数 (20%) - 数据处理逻辑
├── 📊 数据管理 (10%) - 存储和导入导出
├── 🧪 测试系统 (5%) - 质量保证
└── ⚙️ 配置文件 (5%) - 构建和部署
```

### 🚀 技术栈特点
- **🔥 现代化**: React 18 + TypeScript + Vite
- **🏗️ 模块化**: Nx Monorepo + 插件架构
- **📱 渐进式**: PWA支持 + 离线功能
- **🎨 专业级**: 企业级UI组件库
- **⚡ 高性能**: 智能缓存 + 代码分割
- **🌍 国际化**: 多语言支持准备

---

## 🔗 相关链接

- 🌐 **在线体验**: [https://drawnix-zl7337.top](https://drawnix-zl7337.top)
- 📦 **GitHub仓库**: [drawnix-fork](https://github.com/zl7337/drawnix-fork)
- 📖 **原项目文档**: [Drawnix Official](https://github.com/plait-board/drawnix)
- 🔧 **技术栈文档**: [Nx](https://nx.dev) | [React](https://reactjs.org) | [Vite](https://vitejs.dev)

---

*📅 最后更新：2025年7月18日*  
*✨ 由 GitHub Copilot 自动生成*
