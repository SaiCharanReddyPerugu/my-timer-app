import React, { useEffect, useRef, useState } from "react";

const ReasonModal = ({
  title,
  value,
  onChange,
  onConfirm,
  onCancel,
  reasons = [],
  onAddReason,
  customReasons = [],
  onDeleteReason = null,
}) => {
  const inputRef = useRef(null);
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    inputRef.current?.focus(); // Autofocus on the input when modal opens
  }, []);

  const handleAddReason = () => {
    const trimmed = newReason.trim();
    if (trimmed && !reasons.includes(trimmed)) {
      onAddReason?.(trimmed); // Add to parent's custom list
      setNewReason("");
    }
  };

  return (
    <div className="zt-modal-overlay">
      <div className="zt-modal-content">
        <h3 className="zt-title-m">{title}</h3>

        {/* Reason input */}
        <input
          className="zt-dd-pr-s"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter reason..."
        />

        <div className="zt-item-grid">
          {reasons.map((reason) => {
            const isCustom = customReasons?.includes(reason);
            return (
              <div key={reason} className="zt-reason-wrapper">
                <button className="zt-tag" onClick={() => onConfirm(reason)}>
                  {reason}
                </button>
                {isCustom && onDeleteReason && (
                  <button
                    className="zt-bt-sc-s"
                    onClick={() => onDeleteReason(reason)}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.93469C0 2.55044 0.453317 3.09393 1.07889 3.17364L1.91205 10.8863C1.97843 11.5008 2.49193 12 3.14286 12H8.85714C9.50807 12 10.0216 11.5008 10.088 10.8863L10.9211 3.17364C11.5467 3.09393 12 2.55044 12 1.93469C12 1.26782 11.4683 0.685714 10.7619 0.685714H9.02531L8.91879 0.532319C8.69073 0.20392 8.31494 0 7.90476 0H4.09524C3.68506 0 3.30927 0.203921 3.08121 0.532318L2.97469 0.685714H1.2381C0.531713 0.685714 0 1.26782 0 1.93469ZM3.48383 10.3592L2.6161 2.32653H9.3839L8.51617 10.3592H3.48383Z"
                        fill="currentColor"
                      />
                      <path
                        d="M3.95454 3.99404C3.95454 3.55241 4.30567 3.17364 4.76406 3.17364C5.22245 3.17364 5.57359 3.55241 5.57359 3.99404V8.69608C5.57359 9.13772 5.22245 9.51649 4.76406 9.51649C4.30567 9.51649 3.95454 9.13772 3.95454 8.69608V3.99404ZM6.43073 3.99404C6.43073 3.55241 6.78187 3.17364 7.24026 3.17364C7.69864 3.17364 8.04978 3.55241 8.04978 3.99404V8.69608C8.04978 9.13772 7.69864 9.51649 7.24026 9.51649C6.78187 9.51649 6.43073 9.13772 6.43073 8.69608V3.99404Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {onAddReason && (
            <div className="zt-add-reason-row">
              <input
                className="zt-dd-pr-s"
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Add new reason"
                onKeyDown={(e) => e.key === "Enter" && handleAddReason()}
              />
              <button className="zt-bt-sc-s" onClick={handleAddReason}>
                Add
              </button>
            </div>
          )}
        </div>

        {/* Confirm / Cancel */}
        <div className="zt-items-spread">
          <button className="zt-bt-sc-l" onClick={() => onConfirm()}>
            Confirm
          </button>
          <button className="zt-bt-sc-l" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
