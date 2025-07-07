import React from "react";
import Modal from "../Modal";
import styles from "./FinalAssessmentModal.module.css";

const WarningModal = ({ isOpen, onClose, progress, reason }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className={styles.famodalRoot} style={{ textAlign: "center" }}>
      <h2 className={styles.famodalResultFail} style={{ marginBottom: 12 }}>Cannot Attempt Final Assessment</h2>
      <div style={{ fontSize: "1.1rem", marginBottom: 10 }}>
        <b>Your Lecture Progress:</b>
        <div style={{ fontSize: "1.3rem", color: "#8a4baf", fontWeight: 700, margin: "6px 0" }}>{progress}%</div>
      </div>
      <div style={{ color: "#ff4d4f", fontWeight: 500, marginBottom: 18 }}>{reason}</div>
      <button
        className={styles.famodalBtn}
        onClick={onClose}
        style={{ minWidth: 90 }}
      >
        OK
      </button>
    </div>
  </Modal>
);

export default WarningModal; 