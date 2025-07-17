import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SA_ForgotPassword.css";
import ChangePassword from "./SA_ChangePassword";
import PopupMessage from "../shared_comp/popup_menu/PopupMessage";
import { showPopupMessage } from "../shared_comp/utils/popupUtils";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [popup, setPopup] = useState(null);

  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleCodeSubmit = () => {
    const enteredCode = code.join("");
    if (code.includes("")) {
      showPopupMessage(setPopup, "warning", "Please fill in all 6 digits.");
      return;
    }
    if (enteredCode === "123456") {
      setTimeout(() => setStep(2), 700);
      showPopupMessage(setPopup, "success", "Code verified!");
    } else {
      showPopupMessage(setPopup, "error", "Incorrect Passcode. Please try again.");
    }
  };

  if (step === 2) return <ChangePassword onCancel={() => setStep(1)} />;

  return (
    <div className="sa_fullscreen-bg">
      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="header-section">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
          </div>
          <h1 className="inter-font">
            <span style={{ color: 'white' }}>Welcome to </span>
            <span style={{ color: 'yellow' }}>QLine</span>
          </h1>
        </div>
      </div>
      <div className="verification-box">
        <p className="verification-title">Please Enter a 6 digit code.</p>
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d?$/.test(val)) handleCodeChange(val, index);
              }}
              className="code-box"
            />
          ))}
        </div>
        <div className="info-message">
          <img src="/src/assets/checked.png" alt="Check" className="check-icon" />
          <span>We've sent a 6 digit authentication code to your registered email address.</span>
        </div>
        <button className="confirm-button" onClick={handleCodeSubmit}>
          Confirm
        </button>
        <button className="link-button" onClick={() => navigate("/SuperAdminlogin")}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
