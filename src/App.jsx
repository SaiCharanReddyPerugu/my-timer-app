import { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h1>{new Date(time * 1000).toISOString().substr(11, 8)}</h1>
      <div>
        <button onClick={() => setRunning(r => !r)}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => setTime(0)}>Reset</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => window.electronAPI.toggleFullscreen()}>
          Toggle Fullscreen
        </button>
        <button onClick={() => window.electronAPI.toggleAlwaysOnTop()}>
          Toggle Floating
        </button>
      </div>
    </div>
  );
}

export default App;
