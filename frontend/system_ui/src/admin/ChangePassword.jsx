import React, { useState } from "react";
import "./ForgotPassword.css";
import PopupMessage from "./popup_menu/PopupMessage";
import { showPopupMessage } from "./utils/popupUtils";
// import { useNavigate } from "react-router-dom";

const ChangePassword = ({ onCancel }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // type can be 'success', 'error', etc.
  const [popup, setPopup] = useState(null); // { type, message }
  // const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showPopupMessage(setPopup, "error", "Passwords do not match.");
      return;
    }

    // // Here you would send the password to the server
    showPopupMessage(setPopup, "success", "Password changed successfully!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  return (
    <div className="fullscreen-bg">
      {/* ✅ POPUP */}
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      {/* ✅ HEADER */}
      <div className="header-section">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">
            <span style={{ color: 'white' }}>Welcome to </span><span style={{ color: 'yellow' }}>QLine</span>
          </h1>
        </div>
      </div>
      {/* ✅ CHANGE PASSWORD FORM */}
      <div className="form-box">
        <h2 className="form-title">Change your password.</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="password"
                placeholder="New password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={9}
            />
            <input
                type="password"
                placeholder="Re-type new password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                maxLength={9}
            />

            {/* 👇 BUTTONS WRAPPED HERE */}
            <div className="form-buttons">
                <button type="submit" className="form-button confirm">
                Confirm
                </button>
                <button
                type="button"
                className="form-button cancel"
                onClick={onCancel}
                >
                Cancel
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
