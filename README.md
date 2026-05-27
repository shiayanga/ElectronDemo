# ElectronDemo

一个简单的 Electron 桌面应用示例，展示 Electron 的核心功能。

## 功能特性

- **Greet** - 通过 IPC 调用主进程，返回问候语
- **系统信息** - 获取系统平台、架构、CPU、内存等信息
- **计算器** - 通过主进程执行加减乘除运算
- **文件对话框** - 使用 Electron Dialog API 选择文件
- **系统通知** - 发送原生桌面通知

## 技术栈

- Electron 35.4.1
- electron-builder 26.8.1

## 安全模式

项目使用 Context Isolation 和 Preload 脚本，确保渲染进程与主进程安全隔离。

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发模式

```bash
npm start
```

### 构建应用

```bash
npm run build
```

构建完成后，应用位于 `dist/` 目录下。

## 项目结构

```
├── main.js        # 主进程入口
├── preload.js     # 预加载脚本（安全桥接）
├── renderer.js    # 渲染进程脚本
├── index.html     # 页面入口
└── styles.css     # 样式文件
```
