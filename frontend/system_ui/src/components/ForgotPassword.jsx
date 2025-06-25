import React, { useState } from 'react';
import './ForgotPassword.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      console.log('Verification code:', fullCode);
      // Add your verification logic here
    } else {
      alert('Please enter all 6 digits');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <h2>Forgot Password</h2>
      </div>
      
      <div className="forgot-password-content">
        <div className="logo-section">
          <div className="logo">
            <img src="/src/assets/logo.png" alt="Bahandi Logo" />
          </div>
        </div>

        <div className="verification-form">
          <h3>Please Enter a 6 digit code.</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  data-index={index}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength="1"
                  className="code-input"
                />
              ))}
            </div>

            <div className="verification-message">
              <span className="checkmark">✓</span>
              <p>we've sent a 6 digit authentication code to your registered email address.</p>
            </div>

            <button type="submit" className="confirm-button">
              Confirm
            </button>
          </form>

          <button 
            type="button" 
            className="back-button"
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;