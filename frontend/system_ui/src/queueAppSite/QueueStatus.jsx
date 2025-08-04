// QueueStatus.jsx
import React, { useState, useEffect } from 'react';
import './QueueStatus.css';

// SVG icons for ticket details
const AccountCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BusinessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const MeetingRoomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M12 12v6" />
    <path d="M16 12v6" />
    <path d="M8 12v6" />
    <path d="M5 8h14" />
    <path d="M5 16h14" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 12c-2.4-.7-4.1-2.9-4.5-5.5-1.1.2-2.3.2-3.4 0-1.2 2.6-2.9 4.8-5.3 5.5-1.1.3-2.1.3-3.1 0-1.2-2.6-2.9-4.8-5.3-5.5" />
    <path d="M20.5 12c-2.4.7-4.1 2.9-4.5 5.5-1.1-.2-2.3-.2-3.4 0-1.2-2.6-2.9-4.8-5.3-5.5" />
  </svg>
);

const AccessTimeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.8" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const QueueStatus = ({ queueTicketData, onDone }) => {
  const {
    ticketNumber,
    customerName,
    branchName,
    windowNumber,
    windowName,
    categoryName,
    currentStatusName,
    queuedAt,
    estimatedWaitTime,
  } = queueTicketData;

  const [timer, setTimer] = useState(estimatedWaitTime || 300); // Default to 5 minutes

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formattedDate = new Date(queuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(queuedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="queue-status-container">
      <div className="queue-status-card">
        <div className="status-header">
          <div className="status-icon success-icon">
            <CheckCircleIcon />
          </div>
          <h2 className="status-title">Ticket Validated!</h2>
          <p className="status-subtitle">
            Your queue number is <span className="highlight-text">{ticketNumber}</span>
          </p>
        </div>

        <div className="status-details">
          <div className="detail-item">
            <BusinessIcon />
            <div className="detail-text">
              <span className="detail-label">Branch</span>
              <span className="detail-value">{branchName}</span>
            </div>
          </div>

          <div className="detail-item">
            <MeetingRoomIcon />
            <div className="detail-text">
              <span className="detail-label">Window</span>
              <span className="detail-value">{windowName || `Window ${windowNumber}`}</span>
            </div>
          </div>

          <div className="detail-item">
            <AccountCircleIcon />
            <div className="detail-text">
              <span className="detail-label">Customer Name</span>
              <span className="detail-value">{customerName}</span>
            </div>
          </div>

          <div className="detail-item">
            <CategoryIcon />
            <div className="detail-text">
              <span className="detail-label">Transaction Type</span>
              <span className="detail-value">{categoryName}</span>
            </div>
          </div>

          <div className="detail-item">
            <AccessTimeIcon />
            <div className="detail-text">
              <span className="detail-label">Queued At</span>
              <span className="detail-value">{`${formattedDate} at ${formattedTime}`}</span>
            </div>
          </div>
        </div>

        {/* This section with the timer is based on the screenshot */}
        <div className="status-footer">
          <p className="status-footer-text">Current Status</p>
          <span className="status-badge">{currentStatusName}</span>
          {/* A mock countdown to show the feature based on the image */}
          <div className="countdown-timer">
            <span className="timer-label">Estimated Time Left:</span>
            <span className="timer-value">{formatTime(timer)}</span>
          </div>
        </div>
      </div>
      <button onClick={onDone} className="done-btn">
        Done
      </button>
    </div>
  );
};

export default QueueStatus;
