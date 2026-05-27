const api = window.electronAPI;

function showToast(title, body) {
  const container = document.querySelector("#toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-body">${body}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.querySelector("#greet-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.querySelector("#greet-input").value;
  const msg = document.querySelector("#greet-msg");
  msg.textContent = await api.greet(name);
});

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

document.querySelector("#calc-btn").addEventListener("click", async () => {
  const a = parseFloat(document.querySelector("#calc-a").value);
  const b = parseFloat(document.querySelector("#calc-b").value);
  const op = document.querySelector("#calc-op").value;
  const result = document.querySelector("#calc-result");

  if (isNaN(a) || isNaN(b)) {
    result.textContent = "请输入有效数字";
    return;
  }

  try {
    const res = await api.calculate(a, b, op);
    result.textContent = `${a} ${op} ${b} = ${res}`;
  } catch (e) {
    result.textContent = `错误: ${e.message || e}`;
  }
});

document.querySelector("#dialog-btn").addEventListener("click", async () => {
  const result = document.querySelector("#dialog-result");
  try {
    const selected = await api.openFileDialog();
    result.textContent = selected ? `已选择: ${selected}` : "未选择文件";
  } catch (e) {
    result.textContent = `错误: ${e.message || e}`;
  }
});

document.querySelector("#notify-btn").addEventListener("click", async () => {
  const sent = await api.sendNotification("Electron Demo", "这是一条来自 Electron 的通知!");
  showToast("Electron Demo", sent ? "系统通知已发送，请查看右上角" : "此环境不支持系统通知");
});
