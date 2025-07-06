import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

const Modal = ({ isOpen, onClose, children, disableOverlayClick = false }) => {
  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (disableOverlayClick) return;
    onClose && onClose(e);
  };
  // Use a portal to render the modal at the end of <body>
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal; 