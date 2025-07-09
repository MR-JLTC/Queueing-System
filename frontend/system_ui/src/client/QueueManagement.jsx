import React, { useState } from 'react';
import './QueueManagement.css';

const QueueManagement = () => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showNotification, setShowNotification] = useState(true);
  const [currentQueueNumber, setCurrentQueueNumber] = useState(131);
  const [queueItems, setQueueItems] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      queueNumber: 130 - i,
      transaction: '',
      counter: Math.floor(Math.random() * 5) + 1, // Initial random counters
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
      const newCounter = transactionToCounter[selectedTransaction] || 1; // Use mapping
      setCurrentQueueNumber(newQueueNumber);
      setQueueItems([
        { queueNumber: newQueueNumber, transaction: selectedTransaction, counter: newCounter },
        ...queueItems.slice(0, 19), // Keep only 20 items
      ]);
      setShowNotification(true);
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
      <div className="queue-container">
        {/* LEFT - FORM */}
        <div className="queue-form">
          <div className="language-selector">
            <button className="language-btn">🌐 English</button>
          </div>

          <div className="form-content">
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

            <div className="category-section">
              <h3 className="category-title">CATEGORY</h3>
              <p className="category-subtitle">(Please select one category to continue.)</p>

              <div className="category-buttons">
                {['Standard', 'Senior'].map((type) => (
                  <button
                    key={type}
                    className={`category-btn ${selectedCategory === type ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(type)}
                  >
                    {type === 'Standard' ? '👤' : '👥'} {type}
                  </button>
                ))}
              </div>

              <button
                className={`category-btn pwd-btn ${selectedCategory === 'PWD' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('PWD')}
              >
                ♿ PWD
              </button>
            </div>

            <div className="transaction-section">
              <h3 className="transaction-title">TRANSACTION TYPE</h3>
              <p className="transaction-subtitle">(Please select a transaction type.)</p>

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

            <button
              className="proceed-btn"
              onClick={handleProceed}
              disabled={!name || !selectedCategory || !selectedTransaction}
            >
              Proceed
            </button>

            {showNotification && (
              <div className="notification-popup">
                <div className="notification-content">
                  <div className="notification-number">{currentQueueNumber}</div>
                  <div className="notification-text">Please Proceed</div>
                  <div className="notification-counter">to Counter {transactionToCounter[selectedTransaction] || 1}</div>
                </div>
                <button className="close-notification" onClick={handleCloseNotification}>
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - DISPLAY */}
        <div className="queue-display">
          <div className="current-queue">
            <h3 className="queue-header">YOUR QUEUE NUMBER</h3>
            <div className="current-number">{currentQueueNumber}</div>
          </div>

          <div className="recorded-queue">
            <h4 className="recorded-header">RECORDED QUEUE</h4>
            <div className="queue-list">
              {queueItems.map((item, i) => (
                <div key={i} className="queue-item">
                  <span>{item.queueNumber}</span>
                  <span className="queue-item-counter">Counter {item.counter}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;