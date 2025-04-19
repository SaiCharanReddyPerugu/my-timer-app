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
      id="zt-bg-float"
      className={`zt-main-container ${analyticsMode ? "zt-no-bg" : "zt-bg"}`}
    >
      {!isFloating && (
        <div className="window-controls">
          <button
            className={`zt-bt-ctrl ${analyticsMode ? "analytics" : "default"}`}
            onClick={() => window.electronAPI.windowAction("minimize")}
          >
            <svg
              width="12"
              height="3"
              viewBox="0 0 12 3"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.845 2.592C11.1685 2.53899 11.8446 2.36512 11.9788 1.77766C12.0574 1.4338 11.9102 1.11314 11.6513 0.889428C11.3339 0.615114 10.8068 0.564618 10.3669 0.528548C9.83647 0.485052 9.3035 0.494585 8.77321 0.459291C8.06632 0.411573 7.35733 0.358957 6.64406 0.306022C5.05085 0.187276 3.45681 0.069477 1.85856 0.00184367C1.17608 -0.0270791 0.629164 0.288437 0.326708 0.656862C0.0191843 1.03146 -0.110557 1.54073 0.110992 2.03684C0.377502 2.6336 1.08845 3.01552 1.81685 2.99952C3.52978 2.96166 5.25024 2.86922 6.95076 2.77785C7.82835 2.73065 8.70473 2.68331 9.5835 2.6435C10.0062 2.62428 10.4225 2.66122 10.845 2.592Z" />
            </svg>
          </button>
          <button
            className={`zt-bt-ctrl ${analyticsMode ? "analytics" : "default"}`}
            onClick={() => window.electronAPI.windowAction("maximize")}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 3V9C11 10.1046 10.1046 11 9 11H3C1.89543 11 1 10.1046 1 9V3C1 1.89543 1.89543 1 3 1H9C10.1046 1 11 1.89543 11 3Z"
                stroke="currentcolor"
                stroke-width="2"
              />
            </svg>
          </button>
          <button
            className={`zt-bt-ctrl ${analyticsMode ? "analytics" : "default"}`}
            onClick={() => window.electronAPI.windowAction("close")}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.17083 0.350033C1.86876 0.0198003 1.42517 -0.048263 1.0606 0.0287803C0.690043 0.10709 0.320441 0.347764 0.125146 0.747007C-0.110916 1.22959 -0.000845696 1.79147 0.353006 2.11983C1.25278 2.95479 2.19198 3.75867 3.12215 4.55481L3.12572 4.55786C3.67832 5.03084 4.25243 5.48712 4.76868 6C4.25243 6.51288 3.67832 6.96916 3.12572 7.44214L3.12219 7.44516C2.19201 8.24131 1.25279 9.0452 0.353006 9.88017C-0.000845063 10.2085 -0.110916 10.7704 0.125146 11.253C0.320441 11.6522 0.690043 11.8929 1.0606 11.9712C1.42517 12.0483 1.86876 11.9802 2.17083 11.65C2.93719 10.8122 3.67428 9.93809 4.40333 9.07355L4.40642 9.06989C4.92786 8.45153 5.46296 7.85395 6 7.2513C6.53704 7.85396 7.07215 8.45154 7.59359 9.06989L7.59662 9.07348C8.32567 9.93804 9.06279 10.8122 9.82917 11.65C10.1312 11.9802 10.5748 12.0483 10.9394 11.9712C11.31 11.8929 11.6796 11.6522 11.8749 11.253C12.1109 10.7704 12.0008 10.2085 11.647 9.88017C10.7472 9.04519 9.80798 8.2413 8.8778 7.44514L8.87428 7.44214C8.32139 6.96891 7.74797 6.51326 7.23132 6C7.74795 5.48675 8.32136 5.03112 8.87423 4.5579L8.87781 4.55484C9.80794 3.75873 10.7473 2.95476 11.647 2.11983C12.0008 1.79147 12.1109 1.22959 11.8749 0.747007C11.6796 0.347764 11.31 0.10709 10.9394 0.0287803C10.5748 -0.048263 10.1312 0.0198003 9.82917 0.350033C9.06278 1.18786 8.32566 2.06198 7.59659 2.92655L7.59358 2.93011C7.07214 3.54847 6.53704 4.14604 6 4.7487C5.46296 4.14605 4.92786 3.54847 4.40642 2.93012L4.40342 2.92656C3.67435 2.06198 2.93722 1.18786 2.17083 0.350033Z" />
            </svg>
          </button>
        </div>
      )}

      <div className="zt-main-holder zt-mb">
        {!analyticsMode && (
          <div className="zt-center ">
            <img
              id="main-page-logo"
              className="zt-mb-24"
              src="/Assets/Images/Main_Logo.svg"
              alt="ZENTYM Logo"
            />
            <p id="zt-main-title-l" className="zt-title-l">
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
              {isFloating ? "Full Screen" : "Float"}
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
