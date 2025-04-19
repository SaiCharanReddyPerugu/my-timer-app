import React, { useEffect, useState } from "react";
import Timer from "./Components/Timer";
import EndSessionModal from "./Components/EndSessionModal";
import Analytics from "./components/Analytics";
import "./index.css";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [analyticsMode, setAnalyticsMode] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [isFloating, setIsFloating] = useState(false);
  const [currentMode, setCurrentMode] = useState("idle");

  const handleSaved = (confirmed) => {
    setShowModal(false);
    if (confirmed) {
      setResetKey((prev) => prev + 1);
    }
  };

  const handleExport = () => {
    const headers = [
      "Date",
      "Time (IST)",
      "Focus Time (s)",
      "Break Time (s)",
      "Break Count",
    ];
    const rows = sortedFilteredSessions.map((s) => {
      const { date, time } = formatIST(s.startTime);
      return [
        date,
        time,
        s.focusTime,
        s.breakTime,
        getBreakCount(s.history),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `pomodoro_sessions_${Date.now()}.csv`);
  };

  useEffect(() => {
    window.electronAPI.onFloatingModeChanged((state) => {
      setIsFloating(state);
    });
  }, []);

  return (
    <div
      className={`zt-main-container ${analyticsMode ? "zt-no-bg" : "zt-bg"}`}
    >
      <div className="zt-main-holder zt-mb">
        {!analyticsMode && (
          <div className="zt-center ">
            <img
              className="zt-mb-24"
              src="/Assets/Images/Main_Logo.svg"
              alt="ZENTYM Logo"
            />
            <p className="zt-title-l">
              {currentMode === "focus" && "Focus Session"}
              {currentMode === "break" && "Break Time"}
              {currentMode === "idle" && "Ready to Start"}
            </p>
          </div>
        )}

        <div style={{ display: analyticsMode ? "none" : "block" }}>
          <Timer
            key={resetKey}
            onSessionComplete={(data) => {
              setSessionData(data);
              setResetKey((prev) => prev + 1);
            }}
            onModeChange={setCurrentMode}
          />

          {showModal && (
            <EndSessionModal
              sessionData={sessionData}
              onClose={() => setShowModal(false)}
              onConfirm={handleSaved}
            />
          )}
        </div>

        {analyticsMode && <Analytics onBack={() => setAnalyticsMode(false)} />}

        <div
          className={`zt-items-spread ${
            analyticsMode ? "dark-mode" : "light-mode"
          }`}
        >
          {!isFloating && (
            <button
              className="zt-bt-sc-l"
              onClick={() => window.electronAPI.toggleFullscreen()}
            >
              FullScreen
            </button>
          )}

          {!analyticsMode && (
            <button
              className="zt-bt-sc-l"
              onClick={() => window.electronAPI.toggleAlwaysOnTop()}
            >
              Float
            </button>
          )}

          {!isFloating && !analyticsMode && (
            <button
              onClick={() => {
                window.electronAPI.maximizeWindow();
                setAnalyticsMode(true);
              }}
              className="zt-bt-sc-l"
            >
              Analytics
            </button>
          )}

          {analyticsMode && (
            <button onClick={handleExport} className="zt-bt-sc-l">
              Export to CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
