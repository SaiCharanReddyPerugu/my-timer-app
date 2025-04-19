import React from "react";
import { saveSessionToFile } from "../utils/fileStorage";

const EndSessionModal = ({ sessionData, onConfirm, onClose }) => {
  const handleConfirm = () => {
    saveSessionToFile(sessionData);
    onConfirm();
  };

  return (
    <div className="zt-modal-overlay">
      <div className="zt-modal-content">
        <h2 className="zt-modal-title-l">End Current Session?</h2>
        <p className="zt-title-s">Think Before ending the session.</p>
        <div className="zt-items-spread">
          <button onClick={handleConfirm} className="zt-bt-sc-l">
            End Session
          </button>
          <button onClick={onClose} className="zt-bt-sc-l">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionModal;
