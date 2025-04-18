import React, { useEffect, useRef, useState } from "react";

const ReasonModal = ({
  title,
  value,
  onChange,
  onConfirm,
  onCancel,
  reasons = [],
  onAddReason, // <- Optional handler for adding custom reason
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

        {/* Predefined + custom reasons */}
        <div className="zt-item-grid" style={{ marginBottom: "8px" }}>
          {reasons.map((reason) => (
            <button
            className="zt-tag"
              key={reason}
              onClick={() => onConfirm(reason)}
            >
              {reason}
            </button>
          ))}
          {/* Add new reason */}
        {onAddReason && (
          <div className="zt-items-spread">
            <input
            className="zt-dd-pr-s"
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Add new reason"
              onKeyDown={(e) => e.key === "Enter" && handleAddReason()}
            />
            <button className="zt-bt-sc-s" onClick={handleAddReason}>Add</button>
          </div>
        )}
        </div>

        

        

        {/* Confirm / Cancel */}
        <div className="zt-items-spread">
          <button className="zt-bt-sc-l" onClick={() => onConfirm()}>Confirm</button>
          <button className="zt-bt-sc-l" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
