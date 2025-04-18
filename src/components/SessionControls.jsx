import React from "react";

const SessionControls = ({
  mode,
  isPaused,
  onStart,
  onBreak,
  onResume,
  onEndSession,
}) => {
  return (
    <div className="zt-items-spread">
      {mode === "idle" && <button className="zt-bt-pr-l" onClick={onStart}>Start</button>}

      {mode === "focus" && !isPaused && (
        <>
          <button className="zt-bt-pr-l" onClick={onBreak}>Take Break</button>
          <button className="zt-bt-pr-l" onClick={onEndSession}>End Session</button>
        </>
      )}

      {mode === "break" && !isPaused && (
        <>
          <button className="zt-bt-pr-l" onClick={onStart}>Lets Focus</button>
          <button className="zt-bt-pr-l" onClick={onEndSession}>End Session</button>
        </>
      )}

      {isPaused && (
        <>
          <button onClick={onResume}>Resume</button>
          <button onClick={onEndSession}>End Session</button>
        </>
      )}
    </div>
  );
};

export default SessionControls;
