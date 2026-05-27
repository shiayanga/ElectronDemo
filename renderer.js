/**
 * renderer.js - Electron 渲染进程前端逻辑
 * 
 * 渲染进程负责构建用户界面和处理用户交互。
 * 这里通过 window.electronAPI（由 preload.js 暴露）与主进程通信。
 * 
 * 注意：由于启用了 contextIsolation 和禁用了 nodeIntegration，
 * 渲染进程无法直接访问 Node.js API，所有主进程功能必须通过
 * window.electronAPI 的 IPC 方法调用来实现。
 */

// 获取从主进程暴露的 API 对象
const api = window.electronAPI;

/**
 * 显示 Toast 通知消息
 * 
 * 功能：在页面的 toast-container 中创建一个临时通知元素，
 * 4秒后自动移除。常用于向用户展示操作结果或提示信息。
 * 
 * @param {string} title - Toast 通知的标题
 * @param {string} body - Toast 通知的正文内容
 */
function showToast(title, body) {
  const container = document.querySelector("#toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-body">${body}</div>`;
  container.appendChild(toast);
  // 4秒后自动移除 toast 元素
  setTimeout(() => toast.remove(), 4000);
}

// ============================================================
// 问候表单提交处理
// ============================================================
// 功能：获取用户输入的名称，调用主进程的 greet 方法获取问候语并显示

document.querySelector("#greet-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // 阻止表单默认提交行为（页面刷新）
  const name = document.querySelector("#greet-input").value;
  const msg = document.querySelector("#greet-msg");
  msg.textContent = await api.greet(name);
});

// ============================================================
// 系统信息按钮点击处理
// ============================================================
// 功能：获取系统信息并在页面上以网格形式展示

document.querySelector("#sysinfo-btn").addEventListener("click", async () => {
  const info = await api.getSystemInfo();
  document.querySelector("#sysinfo-result").innerHTML = `
    <div class="info-grid">
      <span>平台:</span><span>${info.platform}</span>
      <span>架构:</span><span>${info.arch}</span>
      <span>CPU 核心数:</span><span>${info.cpuCount}</span>
      <span>主机名:</span><span>${info.hostname}</span>
      <span>总内存:</span><span>${info.totalMem}</span>
      <span>可用内存:</span><span>${info.freeMem}</span>
    </div>
  `;
});

// ============================================================
// 计算器按钮点击处理
// ============================================================
// 功能：获取两个操作数和运算符，调用主进程执行计算并显示结果
// 支持加(+)、减(-)、乘(*)、除(/)运算

document.querySelector("#calc-btn").addEventListener("click", async () => {
  const a = parseFloat(document.querySelector("#calc-a").value);
  const b = parseFloat(document.querySelector("#calc-b").value);
  const op = document.querySelector("#calc-op").value;
  const result = document.querySelector("#calc-result");

  // 验证输入是否为有效数字
  if (isNaN(a) || isNaN(b)) {
    result.textContent = "请输入有效数字";
    return;
  }

  try {
    const res = await api.calculate(a, b, op);
    result.textContent = `${a} ${op} ${b} = ${res}`;
  } catch (e) {
    // 处理计算错误（如除以零）
    result.textContent = `错误: ${e.message || e}`;
  }
});

// ============================================================
// 文件选择对话框按钮点击处理
// ============================================================
// 功能：打开系统原生文件选择对话框，显示用户选择的文件路径

document.querySelector("#dialog-btn").addEventListener("click", async () => {
  const result = document.querySelector("#dialog-result");
  try {
    const selected = await api.openFileDialog();
    result.textContent = selected ? `已选择: ${selected}` : "未选择文件";
  } catch (e) {
    result.textContent = `错误: ${e.message || e}`;
  }
});

// ============================================================
// 发送通知按钮点击处理
// ============================================================
// 功能：发送一条系统通知，并根据是否发送成功显示不同的 Toast 提示

document.querySelector("#notify-btn").addEventListener("click", async () => {
  const sent = await api.sendNotification("Electron Demo", "这是一条来自 Electron 的通知!");
  showToast("Electron Demo", sent ? "系统通知已发送，请查看右上角" : "此环境不支持系统通知");
});
