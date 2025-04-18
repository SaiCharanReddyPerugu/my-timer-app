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
        <h2 className="zt-modal-title">End Current Session?</h2>
        <p className="">
          Are you sure you want to end this session?
        </p>
        <div className="zt-items-spread">
          <button
            onClick={handleConfirm}
            className="zt-bt-sc-s"
          >
            End Session
          </button>
          <button
            onClick={onClose}
            className="zt-bt-sc-s"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionModal;
