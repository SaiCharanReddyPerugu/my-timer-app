const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Session storage
  saveSession: (data) => ipcRenderer.invoke("save-session", data),
  getSessions: () => ipcRenderer.invoke("get-sessions"),
  deleteSession: (timestamp) => ipcRenderer.invoke("delete-session", timestamp),

  // Timer state storage
  saveTimerState: (state) => ipcRenderer.invoke("save-timer-state", state),
  loadTimerState: () => ipcRenderer.invoke("load-timer-state"),

  // Store Custom Reasons
  getReasons: () => ipcRenderer.invoke("get-reasons"),
  saveReasons: (reasons) => ipcRenderer.invoke("save-reasons", reasons),
  deleteReason: (payload) => ipcRenderer.invoke("delete-reason", payload),


  // UI interactions
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  toggleAlwaysOnTop: () => ipcRenderer.send("toggle-always-on-top"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),

  // Event listeners from main process
  onFloatingModeChanged: (callback) =>
    ipcRenderer.on("floating-mode-changed", (_event, state) => callback(state)),

  onSaveBeforeQuit: (callback) => {
    ipcRenderer.on("save-timer-before-quit", callback);
  },

  // Remove the event listener
  removeSaveBeforeQuit: (callback) => {
    ipcRenderer.removeListener("save-timer-before-quit", callback);
  },

  sendSessionSaved: () => ipcRenderer.send("session-saved"),
});
