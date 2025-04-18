export async function saveSessionToFile(session) {
  return await window.electronAPI.saveSession(session);
}

export async function loadSessionsFromFile() {
  return await window.electronAPI.getSessions();
}

export async function saveTimerState(state) {
  return await window.electronAPI.saveTimerState(state);
}

export async function loadTimerState() {
  return await window.electronAPI.loadTimerState();
}

