const { app, screen, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
const fs = require("fs");

let mainWindow;
let lastSessionTime = null;
let previousBounds = null;
const userDataPath = app.getPath("userData");
const stateFile = path.join(userDataPath, "timerState.json");
const sessionsFile = path.join(userDataPath, "sessions.json");

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../public/Zentym_Icon_Grey.ico'),
    alwaysOnTop: false,
    autoHideMenuBar: true,
    frame: true,
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

// ipcMain.handle("save-session", async (event, sessionData) => {
//   try {
//     if (sessionData.startTime === lastSessionTime) return;
//     lastSessionTime = sessionData.startTime;

//     let data = [];
//     if (await fs.access(sessionsFile).then(() => true).catch(() => false)) {
//       const raw = await fs.readFile(sessionsFile, "utf-8");
//       data = JSON.parse(raw);
//     }

//     data.push(sessionData);
//     await fs.writeFile(sessionsFile, JSON.stringify(data, null, 2));
//   } catch (err) {
//     console.error("Failed to save session:", err);
//   }
// });

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

ipcMain.on("toggle-fullscreen", () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on("toggle-always-on-top", () => {
  if (mainWindow) {
    const isFloating = !mainWindow.isAlwaysOnTop();

    // Exit fullscreen or maximized mode before floating
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    }

    mainWindow.setAlwaysOnTop(isFloating);

    if (isFloating) {
      const { width } = screen.getPrimaryDisplay().workAreaSize;
      const floatSize = 300;
      const margin = 20;

      // Resize and move to top-right
      mainWindow.setSize(floatSize, floatSize);
      mainWindow.setBounds({
        x: width - floatSize - margin,
        y: margin,
        width: floatSize,
        height: floatSize,
      });
    } else {
      // Restore to original size and center it
      mainWindow.maximize();
    }

    // Notify renderer
    mainWindow.webContents.send("floating-mode-changed", isFloating);
  }
});

ipcMain.on("maximize-window", () => {
  if (mainWindow && !mainWindow.isMaximized()) {
    mainWindow.maximize();
  }
});

// ipcMain.once("session-saved", () => {
//   console.log("✅ Renderer confirmed session saved.");
//   mainWindow.forceClose = true;
//   mainWindow.close();
// });


const count = ipcMain.listenerCount("save-timer-before-quit");
console.log("Main listener count for save-timer-before-quit:", count);