/**
 * main.js - Electron 主进程入口文件
 * 
 * 主进程是 Electron 应用的核心，负责：
 * - 创建和管理应用窗口
 * - 处理系统级事件
 * - 与底层操作系统交互
 * - 通过 IPC 与渲染进程通信
 */

const { app, BrowserWindow, ipcMain, dialog, Notification } = require("electron");
const path = require("path");
const os = require("os");

// 主窗口引用，保存以便在整个应用生命周期中访问
let mainWindow;

/**
 * 创建应用主窗口
 * 
 * BrowserWindow 配置说明：
 * - width/height: 窗口尺寸（像素）
 * - webPreferences: 网页功能配置
 *   - preload: 预加载脚本路径，用于在渲染进程中安全地调用 Node/ Electron API
 *   - contextIsolation: 启用上下文隔离，防止渲染进程访问 Node.js 全局对象
 *   - nodeIntegration: 禁用 Node.js 集成，强制使用 preload 脚本暴露的 API
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 750,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 加载 HTML 文件到窗口中
  mainWindow.loadFile("index.html");
}

// 应用就绪后创建窗口
// app.whenReady() 返回一个 Promise，当 Electron 完成初始化后 resolve
app.whenReady().then(createWindow);

// 监听所有窗口关闭事件
// 在 macOS 上，应用程序通常在关闭所有窗口后仍然在菜单栏运行
app.on("window-all-closed", () => {
  // 在 macOS 以外的平台，当所有窗口关闭时退出应用
  // 由于我们没有实现 macOS 的特定行为，直接退出
  app.quit();
});

// 监听应用激活事件（macOS）
// 当点击 Dock 图标或应用图标时，如果没有窗口则创建一个
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/**
 * IPC 处理器：打招呼
 * 
 * 功能：接收一个名字参数，返回问候语
 * 
 * @param {string} name - 要打招呼的对象名称
 * @returns {string} 问候语字符串
 */
ipcMain.handle("greet", (_event, name) => {
  return `Hello, ${name || "World"}! You've been greeted from Node.js!`;
});

/**
 * IPC 处理器：获取系统信息
 * 
 * 功能：收集并返回当前系统的硬件和平台信息
 * 使用 os 模块获取：
 * - platform: 操作系统平台 (win32, darwin, linux 等)
 * - arch: CPU 架构 (x64, arm64 等)
 * - cpuCount: CPU 核心数量
 * - hostname: 计算机名称
 * - totalMem: 总内存大小 (转换为 GB)
 * - freeMem: 可用内存大小 (转换为 GB)
 * 
 * @returns {Object} 包含系统信息的对象
 */
ipcMain.handle("get-system-info", () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    hostname: os.hostname(),
    totalMem: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
    freeMem: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
  };
});

/**
 * IPC 处理器：计算器
 * 
 * 功能：执行基本的二元算术运算
 * 
 * @param {number} a - 第一个操作数
 * @param {number} b - 第二个操作数
 * @param {string} op - 运算符，支持: + (加), - (减), * (乘), / (除)
 * @returns {number} 计算结果
 * @throws {Error} 当除数为零或遇到未知运算符时抛出错误
 */
ipcMain.handle("calculate", (_event, a, b, op) => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    default: throw new Error(`Unknown operator: ${op}`);
  }
});

/**
 * IPC 处理器：打开文件选择对话框
 * 
 * 功能：显示系统原生的文件选择对话框
 * 使用 Electron 的 dialog 模块实现
 * 
 * @returns {string|null} 用户选择的文件路径，如果取消则返回 null
 */
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择一个文件",
    properties: ["openFile"],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

/**
 * IPC 处理器：发送系统通知
 * 
 * 功能：使用 Electron 的 Notification API 发送系统通知
 * 注意：并非所有环境都支持通知功能（如某些 Linux 发行版）
 * 
 * @param {string} title - 通知标题
 * @param {string} body - 通知正文内容
 * @returns {boolean} 通知是否成功发送
 */
ipcMain.handle("send-notification", (_event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
    return true;
  }
  return false;
});
