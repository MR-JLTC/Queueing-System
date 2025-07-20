import React, { useState } from 'react';
import './QueueManagement.css';
import engIcon from '/src/assets/eng_icon.svg'; // Used for language dropdown
import SysIcon from '/src/assets/sys_logo.png'; // Used for form header


const QueueManagement = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [currentQueueNumber, setCurrentQueueNumber] = useState(131);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [queueItems, setQueueItems] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      queueNumber: 130 - i,
      transaction: ['New Application', 'Renewal', 'Correction', 'Duplicate Copy', 'Verification'][Math.floor(Math.random() * 5)],
      counter: Math.floor(Math.random() * 6) + 1,
    }))
  );

  const transactionToCounter = {
    'New Application': 1,
    'Renewal': 2,
    'Correction': 3,
    'Duplicate Copy': 4,
    'Verification': 5,
    'Certification': 1,
    'Amendment': 2,
    'Transfer': 3,
    'Cancellation': 4,
    'Inquiry': 5,
    'Front Desk': 4
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleTransactionSelect = (e) => {
    setSelectedTransaction(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleProceed = () => {
    if (name && nickname && selectedCategory && selectedTransaction) {
      const newQueueNumber = currentQueueNumber + 1;
      const newCounter = transactionToCounter[selectedTransaction] || 1;
      setCurrentQueueNumber(newQueueNumber);
      setQueueItems([
        { queueNumber: newQueueNumber, transaction: selectedTransaction, counter: newCounter },
        ...queueItems.slice(0, 5),
      ]);
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const transactionTypes = [
    'Front Desk',
    'New Application', 'Renewal', 'Correction', 'Duplicate Copy',
    'Verification', 'Certification', 'Amendment', 'Transfer',
    'Cancellation', 'Inquiry'
  ];

  const languages = ['English', 'Filipino', 'Cebuano'];

  return (
    <div className="queue-page">
      <div className="queue-container">
        {/* LEFT - FORM */}
        <div className="queue-form">
          <div className="form-header">
            <div className="form-header-icon">
              <img src={SysIcon} alt="System Icon" />
            </div>
            <h2 className="form-title">Queue Management</h2>
            <p className="form-subtitle">Get your queue number instantly</p>
          </div>

          <div className="form-content">
            {/* Name Input */}
            <div className="name-section">
              <label className="name-label">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Nickname Input */}
            <div className="name-section">
              <label className="name-label">Nickname</label>
              <input
                type="text"
                placeholder="Enter your nickname"
                className="name-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="category-section">
              <div className="category-header">
                <h3 className="category-title">CATEGORY</h3>
                <p className="category-subtitle">Please select one category to continue</p>
              </div>

              <div className="category-buttons">
                <button
                  className={`category-btn ${selectedCategory === 'Standard' ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect('Standard')}
                >
                  <span style={{ fontSize: '1.2em' }}>&nbsp;👤</span>
                  <span>Standard</span>
                </button>
                <button
                  className={`category-btn ${selectedCategory === 'Senior / PWD' ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect('Senior / PWD')}
                >
                  <span style={{ fontSize: '1.2em' }}>&nbsp;♿</span>
                  <span>Senior / PWD</span>
                </button>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="transaction-section">
              <div className="transaction-header">
                <h3 className="transaction-title">TRANSACTION TYPE</h3>
                <p className="transaction-subtitle">Please select a transaction type.</p>
              </div>

              <select
                className="transaction-dropdown"
                value={selectedTransaction}
                onChange={handleTransactionSelect}
              >
                <option value="Front Desk">Front Desk</option> 
                {transactionTypes.slice(1).map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Proceed Button */}
            <button
              className="proceed-btn"
              onClick={handleProceed}
              disabled={!name || !nickname || !selectedCategory || !selectedTransaction}
            >
              Proceed
            </button>
          </div>
        </div>

        {/* RIGHT - DISPLAY */}
        <div className="queue-display">
          <div className="display-header">
            {/* Language Selection Dropdown with Icon */}
            <div className="language-selector-wrapper">
              <img src={engIcon} alt="Language Icon" className="language-icon" />
              <select
                className="language-dropdown"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                {languages.map((lang, index) => (
                  <option key={index} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            {/* Removed the close button as per request */}
            {/* <button className="display-header-close-btn">&times;</button> */}
          </div>

          {/* Current Queue Number */}
          <div className="current-queue">
            <h3 className="queue-header">YOUR QUEUE NUMBER</h3>
            <div className="current-number">{currentQueueNumber}</div>
            <div className="counter-info">
              Proceed to Counter {transactionToCounter[selectedTransaction] || 4}
            </div>
          </div>

          {/* Recorded Queue */}
          <div className="recorded-queue">
            <h4 className="recorded-header">RECORDED QUEUE</h4>
            <div className="queue-list-header">
              <span className="queue-list-header-item queue-no-header">Queue No.</span>
              <span className="queue-list-header-item transaction-header">Transaction</span>
              <span className="queue-list-header-item counter-header">Counter</span>
            </div>
            <div className="queue-list">
              {queueItems.map((item, i) => (
                <div key={i} className="queue-item">
                  <div className="queue-item-info">
                    <div className="queue-item-number">
                      {item.queueNumber}
                    </div>
                    <span className="queue-item-transaction">{item.transaction}</span>
                  </div>
                  <div className="queue-item-counter">
                    Counter {item.counter}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      {showNotification && (
        <div className="notification-overlay">
          <div className="notification-popup">
            <div className="notification-content">
              <div className="notification-number">
                {currentQueueNumber}
              </div>
              <div className="notification-text">Queue Number Assigned!</div>
              <div className="notification-counter">
                Please proceed to Counter {transactionToCounter[selectedTransaction] || 4}
              </div>
              <button
                className="notification-close"
                onClick={handleCloseNotification}
              >
                Got it! ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueManagement;