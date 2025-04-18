import React, { useState, useEffect, useRef, useCallback } from "react";
import SessionControls from "./SessionControls";
import EndSessionModal from "./EndSessionModal";
import ReasonModal from "./ReasonModal";
import { saveTimerState, loadTimerState } from "../utils/fileStorage";

const Timer = ({ onSessionComplete, onEndSession, onModeChange }) => {
  const [focusTime, setFocusTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [mode, setMode] = useState("idle");
  const [startTime, setStartTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [runningBeforePause, setRunningBeforePause] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [startReason, setStartReason] = useState("");
  const [breakReason, setBreakReason] = useState("");
  const [showStartReasonModal, setShowStartReasonModal] = useState(false);
  const [showBreakReasonModal, setShowBreakReasonModal] = useState(false);
  const [customFocusReasons, setCustomFocusReasons] = useState([]);
  const [customBreakReasons, setCustomBreakReasons] = useState([]);

  const intervalRef = useRef(null);

  const predefinedFocusReasons = [
    "Deep Work",
    "Writing Code",
    "Studying",
    "Planning",
    "Meeting",
  ];
  const predefinedBreakReasons = [
    "Tea Break",
    "Washroom",
    "Stretching",
    "Phone Call",
    "Snack Time",
  ];

  const allFocusReasons = [...predefinedFocusReasons, ...customFocusReasons];
  const allBreakReasons = [...predefinedBreakReasons, ...customBreakReasons];

  useEffect(() => {
    window.electronAPI.getReasons().then(({ focus, break: breakReasons }) => {
      setCustomFocusReasons(focus || []);
      setCustomBreakReasons(breakReasons || []);
    });
  }, []);

  const handleAddCustomFocusReason = (newReason) => {
    const updated = [...customFocusReasons, newReason];
    setCustomFocusReasons(updated);
    window.electronAPI.saveReasons({
      focus: updated,
      break: customBreakReasons,
    });
  };

  const handleAddCustomBreakReason = (newReason) => {
    const updated = [...customBreakReasons, newReason];
    setCustomBreakReasons(updated);
    window.electronAPI.saveReasons({
      focus: customFocusReasons,
      break: updated,
    });
  };

  const startFocusSession = (reason) => {
    const now = new Date().toISOString();
    setStartTime(now);
    setHistory((prev) => [
      ...prev,
      { type: "focus_start", timestamp: now, reason },
    ]);
    setMode("focus");
    setIsPaused(false);
    setSessionSaved(false);
    onModeChange?.("focus");
  };

  const startBreakSession = (reason) => {
    const now = new Date().toISOString();
    setHistory((prev) => [
      ...prev,
      { type: "break_start", timestamp: now, reason },
    ]);
    setMode("break");
    setIsPaused(false);
    onModeChange?.("break");
  };

  useEffect(() => {
    const loadState = async () => {
      const savedState = localStorage.getItem("savedTimerState");
      if (savedState) {
        const state = JSON.parse(savedState);
        setFocusTime(state.focusTime || 0);
        setBreakTime(state.breakTime || 0);
        setMode(state.mode || "idle");
        setStartTime(state.startTime || null);
        setHistory(state.history || []);
      } else {
        const fileState = await loadTimerState();
        if (fileState) {
          setFocusTime(fileState.focusTime || 0);
          setBreakTime(fileState.breakTime || 0);
          setMode(fileState.mode || "idle");
          setStartTime(fileState.startTime || null);
          setHistory(fileState.history || []);
        }
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const state = { focusTime, breakTime, mode, startTime, history };
      localStorage.setItem("savedTimerState", JSON.stringify(state));
      saveTimerState(state);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [focusTime, breakTime, mode, startTime, history]);

  useEffect(() => {
    if (isPaused || mode === "idle") {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (mode === "focus") setFocusTime((prev) => prev + 1);
      else if (mode === "break") setBreakTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [mode, isPaused]);

  const saveAndResetSession = () => {
    if (sessionSaved || mode === "idle" || !startTime) {
      console.log("Skipping save, already saved");
      return;
    }

    setSessionSaved(true);
    const session = { focusTime, breakTime, startTime, history };
    console.log("💾 Saving session:", session);

    window.electronAPI.saveSession(session);
    window.electronAPI.sendSessionSaved?.();
    onSessionComplete(session);

    // Reset state and clear storage
    setFocusTime(0);
    setBreakTime(0);
    setMode("idle");
    setStartTime(null);
    setHistory([]);
    localStorage.removeItem("savedTimerState");

    // Save empty state to Electron
    const emptyState = {
      focusTime: 0,
      breakTime: 0,
      mode: "idle",
      startTime: null,
      history: [],
    };
    saveTimerState(emptyState); // Updates Electron's storage
    setShowModal(false); // Close the modal
  };

  const handleStart = () => {
    if (mode === "idle") {
      setShowStartReasonModal(true);
    } else {
      startFocusSession("Resumed without reason");
    }
  };

  const handleBreak = () => setShowBreakReasonModal(true);

  const handleResume = () => {
    if (runningBeforePause) {
      setMode(runningBeforePause);
      setIsPaused(false);
      setRunningBeforePause(null);
    }
  };

  const handleEndSessionClick = () => {
    setRunningBeforePause(mode);
    setIsPaused(true);
    setShowModal(true);
  };

  const handleConfirmEndSession = () => {
    saveAndResetSession(); // 👈 first!
    setMode("idle");
    setStartTime(null);
  };

  const handleCancelEndSession = () => {
    setShowModal(false);
    setIsPaused(false);
    setMode(runningBeforePause);
    setRunningBeforePause(null);
  };

  const handleDeleteCustomReason = async (type, reason) => {
    await window.electronAPI.deleteReason({ type, reason });

    if (type === "focus") {
      const updated = customFocusReasons.filter((r) => r !== reason);
      setCustomFocusReasons(updated);
    } else if (type === "break") {
      const updated = customBreakReasons.filter((r) => r !== reason);
      setCustomBreakReasons(updated);
    }
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="zt-center">
      <div className="zt-center zt-mb">
        <p
          id="zt-timer"
          className={mode === "break" ? "zt-timer-small" : "zt-timer-large"}
        >
          {formatTime(focusTime)}
        </p>

        {breakTime > 0 && (
          <p
            id="zt-timer"
            className={mode === "break" ? "zt-timer-large" : "zt-timer-small"}
          >
            {formatTime(breakTime)}
          </p>
        )}
      </div>

      <SessionControls
        mode={mode}
        isPaused={isPaused}
        onStart={handleStart}
        onBreak={handleBreak}
        onResume={handleResume}
        onEndSession={handleEndSessionClick}
      />

      {showModal && (
        <EndSessionModal
          sessionData={{ focusTime, breakTime, startTime, history }}
          onConfirm={handleConfirmEndSession}
          onClose={handleCancelEndSession}
        />
      )}

      {showStartReasonModal && (
        <ReasonModal
          title="Why are you starting this session?"
          value={startReason}
          onChange={setStartReason}
          onConfirm={(overrideReason) => {
            const reasonToUse = overrideReason ?? startReason;
            setShowStartReasonModal(false);
            startFocusSession(reasonToUse || "No reason given");
            setStartReason("");
          }}
          onCancel={() => {
            setShowStartReasonModal(false);
            setStartReason("");
          }}
          reasons={allFocusReasons}
          onAddReason={handleAddCustomFocusReason}
          customReasons={customFocusReasons}
          onDeleteReason={(reason) => handleDeleteCustomReason("focus", reason)}
        />
      )}

      {showBreakReasonModal && (
        <ReasonModal
          title="Why are you taking a break?"
          value={breakReason}
          onChange={setBreakReason}
          onConfirm={(overrideReason) => {
            const reasonToUse = overrideReason ?? breakReason;
            setShowBreakReasonModal(false);
            startBreakSession(reasonToUse || "No reason given");
            setBreakReason("");
          }}
          onCancel={() => {
            setShowBreakReasonModal(false);
            setBreakReason("");
          }}
          reasons={allBreakReasons}
          onAddReason={handleAddCustomBreakReason}
          customReasons={customBreakReasons}
          onDeleteReason={(reason) => handleDeleteCustomReason("break", reason)}
        />
      )}
    </div>
  );
};

export default Timer;
