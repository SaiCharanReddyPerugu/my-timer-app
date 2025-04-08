// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');

// let mainWindow;

// const createWindow = () => {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     alwaysOnTop: false,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       contextIsolation: true,
//     },
//   });

//   mainWindow.loadURL('http://localhost:5173');
// };

// app.whenReady().then(createWindow);

// ipcMain.on('toggle-fullscreen', () => {
//   mainWindow.setFullScreen(!mainWindow.isFullScreen());
// });

// ipcMain.on('toggle-always-on-top', () => {
//   mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
// });


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'Test-Icon.ico'),
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false, // this is good for security
    },
  });

  // Load Vite dev server
  // mainWindow.loadURL('http://localhost:5173');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Optional: open devtools automatically
  // mainWindow.webContents.openDevTools();
};

// 🔁 macOS safety: re-open if all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 🚀 Create the main window when app is ready
app.whenReady().then(createWindow);

// 🖥️ IPC listeners
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on('toggle-always-on-top', () => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
  }
});

