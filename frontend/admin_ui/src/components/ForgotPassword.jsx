import React, { useState } from "react";
import "./ForgotPassword.css";
import ChangePassword from "./ChangePassword"; // Import the new component
import PopupMessage from "./popup_menu/PopupMessage";
import { showPopupMessage } from "./utils/popupUtils";

const ForgotPassword = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // Step 1 = verify, Step 2 = reset password
  // type can be 'success', 'error', etc.
  const [popup, setPopup] = useState(null); // { type, message }
  
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
     // Check for any blank input
    if (code.includes("")) {
      showPopupMessage(setPopup, "warning", "Please fill in all 6 digits.");
      return;
    }
    
    if (enteredCode === "123456") {
      // Go to next step after short delay
      setTimeout(() => setStep(2), 700);
      showPopupMessage(setPopup, "success", "Code verified!");
    }
    else showPopupMessage(setPopup, "error", "Incorrect Passcode. Please try again.");
  };

  return step === 1 ? (
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
      {/* ✅ PIN-CODE BOX */}
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
      </div>
    </div>
  ) : (
    <ChangePassword onCancel={() => setStep(1)} />
  );
};

export default ForgotPassword;
