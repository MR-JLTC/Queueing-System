import React from "react";
import "./PopupMessage.css"; // We'll define styles next

const PopupMessage = ({ type, message, onClose }) => {
  return (
    <div className={`popup-message ${type}`}>
      <span className="popup-text">{message}</span>
      <button className="popup-close" onClick={onClose}>✖</button>
    </div>
  );
};

export default PopupMessage;
