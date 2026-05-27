const { app, BrowserWindow, ipcMain, dialog, Notification } = require("electron");
const path = require("path");
const os = require("os");

let mainWindow;

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

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("greet", (_event, name) => {
  return `Hello, ${name || "World"}! You've been greeted from Node.js!`;
});

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

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "选择一个文件",
    properties: ["openFile"],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("send-notification", (_event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
    return true;
  }
  return false;
});
