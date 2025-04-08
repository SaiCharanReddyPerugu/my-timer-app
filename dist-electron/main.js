import require$$0 from "electron";
import require$$1 from "path";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$1 = {};
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main$1;
  hasRequiredMain = 1;
  const { app, BrowserWindow, ipcMain } = require$$0;
  const path = require$$1;
  const isDev = !app.isPackaged;
  let mainWindow;
  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "public", "Test-Icon.ico"),
      alwaysOnTop: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false
        // this is good for security
      }
    });
    if (isDev) {
      mainWindow.loadURL("http://localhost:5173");
    } else {
      mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
  };
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  app.whenReady().then(createWindow);
  ipcMain.on("toggle-fullscreen", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
  ipcMain.on("toggle-always-on-top", () => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
    }
  });
  return main$1;
}
var mainExports = requireMain();
const main = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
export {
  main as default
};
