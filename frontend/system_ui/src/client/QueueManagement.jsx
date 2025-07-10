import React, { useState } from 'react';
import './QueueManagement.css';

const QueueManagement = () => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [currentQueueNumber, setCurrentQueueNumber] = useState(131);
  const [queueItems, setQueueItems] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      queueNumber: 130 - i,
      transaction: ['New Application', 'Renewal', 'Correction', 'Duplicate Copy', 'Verification'][Math.floor(Math.random() * 5)],
      counter: Math.floor(Math.random() * 5) + 1,
    }))
  );

  // Transaction-to-counter mapping
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
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleTransactionSelect = (e) => {
    setSelectedTransaction(e.target.value);
  };

  const handleProceed = () => {
    if (name && selectedCategory && selectedTransaction) {
      const newQueueNumber = Math.floor(Math.random() * 200) + 100;
      const newCounter = transactionToCounter[selectedTransaction] || 1;
      setCurrentQueueNumber(newQueueNumber);
      setQueueItems([
        { queueNumber: newQueueNumber, transaction: selectedTransaction, counter: newCounter },
        ...queueItems.slice(0, 19),
      ]);
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const transactionTypes = [
    'New Application', 'Renewal', 'Correction', 'Duplicate Copy',
    'Verification', 'Certification', 'Amendment', 'Transfer',
    'Cancellation', 'Inquiry'
  ];

  return (
    <div className="queue-page">
      {/* Floating Background Elements */}
      <div className="floating-element-1"></div>
      <div className="floating-element-2"></div>
      
      <div className="queue-container">
        {/* LEFT - FORM */}
        <div className="queue-form">
          <div className="form-header">
            <div className="form-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="form-title">Queue Management</h2>
            <p className="form-subtitle">Get your queue number instantly</p>
          </div>

          <div className="form-content">
            {/* Name Input */}
            <div className="name-section">
              <label className="name-label">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="category-section">
              <div className="category-header">
                <h3 className="category-title">CATEGORY</h3>
                <p className="category-subtitle">Please select one category to continue</p>
              </div>

              <div className="category-buttons">
                {['Standard', 'Senior'].map((type) => (
                  <button
                    key={type}
                    className={`category-btn ${selectedCategory === type ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(type)}
                  >
                    <span>{type === 'Standard' ? '👤' : '👥'}</span>
                    <span>{type}</span>
                  </button>
                ))}
              </div>

              <button
                className={`category-btn pwd-btn ${selectedCategory === 'PWD' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('PWD')}
              >
                <span>♿</span>
                <span>PWD</span>
              </button>
            </div>

            {/* Transaction Type */}
            <div className="transaction-section">
              <div className="transaction-header">
                <h3 className="transaction-title">TRANSACTION TYPE</h3>
                <p className="transaction-subtitle">Please select a transaction type</p>
              </div>

              <select
                className="transaction-dropdown"
                value={selectedTransaction}
                onChange={handleTransactionSelect}
              >
                <option value="">Select transaction type</option>
                {transactionTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Proceed Button */}
            <button
              className="proceed-btn"
              onClick={handleProceed}
              disabled={!name || !selectedCategory || !selectedTransaction}
            >
              Get Queue Number
            </button>
          </div>
        </div>

        {/* RIGHT - DISPLAY */}
        <div className="queue-display">
          <div className="display-header">
            <div className="display-header-icon">
              🎯
            </div>
          </div>

          {/* Current Queue Number */}
          <div className="current-queue">
            <h3 className="queue-header">YOUR QUEUE NUMBER</h3>
            <div className="current-number">{currentQueueNumber}</div>
            <div className="counter-info">
              Counter {transactionToCounter[selectedTransaction] || 1}
            </div>
          </div>

          {/* Recorded Queue */}
          <div className="recorded-queue">
            <h4 className="recorded-header">RECORDED QUEUE</h4>
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
                Please proceed to Counter {transactionToCounter[selectedTransaction] || 1}
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