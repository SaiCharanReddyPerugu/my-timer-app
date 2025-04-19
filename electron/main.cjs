const { app, screen, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
const fs = require("fs");

let mainWindow;
let isFloating = false;
let lastSessionTime = null;
let previousBounds = null;
const userDataPath = app.getPath("userData");
const stateFile = path.join(userDataPath, "timerState.json");
const sessionsFile = path.join(userDataPath, "sessions.json");
const reasonsFile = path.join(userDataPath, "reasons.json");



const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../public/Zentym_Icon_Grey.ico'),
    alwaysOnTop: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: !isFloating,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();

  // Load URL or file
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Save timer before quitting
  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.webContents.send("save-timer-before-quit");
    setTimeout(() => {
      mainWindow.destroy();
      app.quit();
    }, 4000);
  });
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle("save-session", async (event, sessionData) => {
  if (sessionData.startTime === lastSessionTime) {
    return;
  }
  lastSessionTime = sessionData.startTime;

  let data = [];
  if (fs.existsSync(sessionsFile)) {
    data = JSON.parse(fs.readFileSync(sessionsFile));
  }
  data.push(sessionData);
  fs.writeFileSync(sessionsFile, JSON.stringify(data, null, 2));
});

ipcMain.handle("get-sessions", async () => {
  if (fs.existsSync(sessionsFile)) {
    return JSON.parse(fs.readFileSync(sessionsFile));
  }
  return [];
});

ipcMain.handle("save-timer-state", async (event, timerState) => {
  fs.writeFileSync(stateFile, JSON.stringify(timerState));
});

ipcMain.handle("load-timer-state", async () => {
  if (fs.existsSync(stateFile)) {
    return JSON.parse(fs.readFileSync(stateFile));
  }
  return null;
});

ipcMain.handle("delete-session", async (event, timestamp) => {
  if (fs.existsSync(sessionsFile)) {
    let data = JSON.parse(fs.readFileSync(sessionsFile));
    data = data.filter((s) => s.startTime !== timestamp);
    fs.writeFileSync(sessionsFile, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
});

ipcMain.handle("get-reasons", () => {
  if (fs.existsSync(reasonsFile)) {
    return JSON.parse(fs.readFileSync(reasonsFile));
  }
  return { focus: [], break: [] };
});

ipcMain.handle("save-reasons", (event, reasons) => {
  fs.writeFileSync(reasonsFile, JSON.stringify(reasons, null, 2));
});

ipcMain.handle("delete-reason", (event, { type, reason }) => {
  if (!fs.existsSync(reasonsFile)) return;

  const reasons = JSON.parse(fs.readFileSync(reasonsFile));

  if (!reasons[type]) return;

  reasons[type] = reasons[type].filter((r) => r !== reason);

  fs.writeFileSync(reasonsFile, JSON.stringify(reasons, null, 2));
});



ipcMain.on("toggle-fullscreen", () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on("toggle-always-on-top", () => {
  if (!mainWindow) return;

  isFloating = !isFloating;

  mainWindow.focus();

  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  }
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }

  mainWindow.setAlwaysOnTop(isFloating);
  mainWindow.setResizable(!isFloating);

  if (isFloating) {
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    const floatWidth = 350;
    const floatHeight = 300;
    const margin = 20;

    mainWindow.setSize(floatWidth, floatHeight);
    mainWindow.setBounds({
      x: width - floatWidth - margin,
      y: margin,
      width: floatWidth,
      height: floatHeight,
    });
  } else {
    mainWindow.maximize();
  }

  mainWindow.webContents.send("floating-mode-changed", isFloating);
});

ipcMain.on("window-action", (event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case "minimize":
      mainWindow.minimize();
      break;
    case "maximize":
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case "close":
      mainWindow.close();
      break;
  }
});

ipcMain.on("maximize-window", () => {
  if (mainWindow && !mainWindow.isMaximized()) {
    mainWindow.maximize();
  }
});