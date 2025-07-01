import React from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, children, disableOverlayClick = false }) => {
  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (disableOverlayClick) return;
    onClose && onClose(e);
  };
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 