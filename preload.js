const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  greet: (name) => ipcRenderer.invoke("greet", name),
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  calculate: (a, b, op) => ipcRenderer.invoke("calculate", a, b, op),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  sendNotification: (title, body) => ipcRenderer.invoke("send-notification", title, body),
});
