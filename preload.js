/**
 * preload.js - Electron 预加载脚本
 * 
 * 预加载脚本在渲染进程加载之前执行，充当渲染进程和主进程之间的桥梁。
 * 
 * 重要安全概念：
 * - contextIsolation: 将 preload 脚本和网页隔离在各自的上下文环境中，
 *   防止恶意网页代码访问敏感的 Node/Electron API
 * - contextBridge: 安全地暴露特定的 API 到渲染进程的全局 window 对象
 * 
 * 这里使用 contextBridge.exposeInMainWorld 将主进程的 IPC 方法
 * 安全地暴露给渲染进程，而不需要直接暴露 Node.js 环境
 */

const { contextBridge, ipcRenderer } = require("electron");

/**
 * 通过 contextBridge 将 electronAPI 对象暴露到渲染进程的 window 对象上
 * 
 * 渲染进程中的 JavaScript 可以通过 window.electronAPI 访问以下方法：
 * - greet: 发送问候语
 * - getSystemInfo: 获取系统信息
 * - calculate: 执行数学计算
 * - openFileDialog: 打开文件选择对话框
 * - sendNotification: 发送系统通知
 */
contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * 调用主进程的 greet IPC 处理器
   * @param {string} name - 要问候的名称
   * @returns {Promise<string>} 问候语字符串
   */
  greet: (name) => ipcRenderer.invoke("greet", name),

  /**
   * 调用主进程的 get-system-info IPC 处理器
   * @returns {Promise<Object>} 系统信息对象
   */
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),

  /**
   * 调用主进程的 calculate IPC 处理器
   * @param {number} a - 第一个操作数
   * @param {number} b - 第二个操作数
   * @param {string} op - 运算符
   * @returns {Promise<number>} 计算结果
   */
  calculate: (a, b, op) => ipcRenderer.invoke("calculate", a, b, op),

  /**
   * 调用主进程的 open-file-dialog IPC 处理器
   * @returns {Promise<string|null>} 文件路径或 null
   */
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),

  /**
   * 调用主进程的 send-notification IPC 处理器
   * @param {string} title - 通知标题
   * @param {string} body - 通知正文
   * @returns {Promise<boolean>} 是否发送成功
   */
  sendNotification: (title, body) => ipcRenderer.invoke("send-notification", title, body),
});
