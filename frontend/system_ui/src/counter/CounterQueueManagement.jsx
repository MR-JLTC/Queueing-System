import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './CounterQueueSystem.css';

// API Base URL (adjust if your backend is on a different port/host)
const API_BASE_URL = 'http://localhost:3000';

// Simple Popup Message Component (reused for consistent user feedback)
const PopupMessage = ({ type, message, onClose }) => {
  const icon = type === 'success' ? '✔' : '✖';
  const iconColorClass = type === 'success' ? 'success' : 'error';

  return (
    <div className="popup-message-overlay">
      <div className={`popup-message-box ${type}`}>
        <div className={`popup-message-icon ${iconColorClass}`}>
          {icon}
        </div>
        <p className="popup-message-text">{message}</p>
        <button className="popup-message-close-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

const CounterQueueManagement = () => {
  const [staffName, setStaffName] = useState('');
  const [staffInfo, setStaffInfo] = useState(null); // { staffId, fullName, branchId, branchName, windowId, windowNumber, windowName }
  const [onGoingQueue, setOnGoingQueue] = useState(null); // The queue currently being served
  const [pendingQueue, setPendingQueue] = useState(null); // The next queue to be called
  const [onQueueList, setOnQueueList] = useState([]); // List of waiting queues
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // State for real-time date and time
  const [isServing, setIsServing] = useState(false);

  const showPopupMessage = useCallback((type, message) => {
    setPopup({ type, message });
  }, []);

  // Text-to-speech function
  const speakTicketInfo = useCallback((ticketNumber, windowNumber) => {
    if ('speechSynthesis' in window) {
      const message = `${ticketNumber}, please proceed to Window ${windowNumber}`;
      const utterance = new SpeechSynthesisUtterance(message);
      const voices = window.speechSynthesis.getVoices();
      // You can choose a specific voice here if needed, for example:
      utterance.voice = voices.find(voice => voice.name === 'Google US English');
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis not supported by this browser.');
    }
  }, []);

  // Fetch staff details and their assigned window
  const fetchStaffInfo = useCallback(async () => {
    if (!staffName) {
      showPopupMessage('error', 'Please enter your full name to log in.');
      return;
    }
    setLoading(true);
    const nameToEncode = String(staffName);
    const requestUrl = `${API_BASE_URL}/staff/assignment-by-name?fullName=${encodeURIComponent(nameToEncode)}`;
    try {
      const response = await axios.get(requestUrl);
      if (response.data) {
        setStaffInfo(response.data);
        showPopupMessage('success', `Welcome, ${response.data.fullName}! You are assigned to ${response.data.windowName} at ${response.data.branchName}.`);
      } else {
        setStaffInfo(null);
        showPopupMessage('error', 'Staff not found or not currently assigned to a window.');
      }
    } catch (error) {
      console.error('Error fetching staff info:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to fetch staff info. Please try again.';
      showPopupMessage('error', errorMessage);
      setStaffInfo(null);
    } finally {
      setLoading(false);
    }
  }, [staffName, showPopupMessage]);

  // Fetch queues for the assigned window
  const fetchQueues = useCallback(async () => {
    if (!staffInfo?.windowId || !staffInfo?.branchId) {
      return;
    }
    const requestUrl = `${API_BASE_URL}/queue-tickets/live-status/${staffInfo.branchId}/${staffInfo.windowId}`;
    try {
      const response = await axios.get(requestUrl);
      const { called, queued } = response.data;
      setOnGoingQueue(called || null);
      if (queued && queued.length > 0) {
        setPendingQueue(queued[0]);
        setOnQueueList(queued.slice(1));
      } else {
        setPendingQueue(null);
        setOnQueueList([]);
      }
    } catch (error) {
      console.error('Error fetching queues:', error.response?.data || error.message);
      // Removed popup here to avoid constant popups on a connection error
    }
  }, [staffInfo]);

  // Update ticket status
  const updateTicketStatus = useCallback(async (ticketId, newStatusId, assignedToStaffId, assignedToWindowId) => {
    try {
      setLoading(true);
      const payload = {
        currentStatusId: newStatusId,
        assignedToStaffId: assignedToStaffId,
        assignedToWindowId: assignedToWindowId,
      };
      await axios.patch(`${API_BASE_URL}/queue-tickets/${ticketId}`, payload);
      showPopupMessage('success', `Queue ${onGoingQueue?.ticketNumber || ''} status updated.`);
      await fetchQueues(); // Re-fetch the queue after a successful update
    } catch (error) {
      console.error('Error updating ticket status:', error.response?.data || error.message);
      showPopupMessage('error', 'Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  }, [onGoingQueue, showPopupMessage, fetchQueues]);

  // Handle the 'Next' button click
  const handleNextQueue = async () => {
    if (onGoingQueue) {
      showPopupMessage('error', 'Please serve or requeue the current customer first.');
      return;
    }
    if (!pendingQueue) {
      showPopupMessage('info', 'No customers in the queue to call.');
      return;
    }

    if (pendingQueue && staffInfo) {
      const { ticketId, ticketNumber } = pendingQueue;
      const { staffId, windowId, windowNumber } = staffInfo;
      const newStatusId = 2; // Assuming statusId 2 is 'CALLED'

      // Update the ticket to 'CALLED' status
      await updateTicketStatus(ticketId, newStatusId, staffId, windowId);
      setIsServing(true);

      // Trigger text-to-speech
      speakTicketInfo(ticketNumber, windowNumber);
    } else {
      showPopupMessage('info', 'Please log in and ensure there is a pending queue to call.');
    }
  };

  // Handle 'Serve' button click
  const handleServe = async () => {
    if (!onGoingQueue) {
      showPopupMessage('error', 'No customer is currently being served.');
      return;
    }
    if (onGoingQueue && staffInfo) {
      const { ticketId } = onGoingQueue;
      const newStatusId = 3; // Assuming statusId 3 is 'SERVED'
      // const { staffId } = staffInfo;
      // Pass null for assignedToWindowId and assignedToStaffId
      await updateTicketStatus(ticketId, newStatusId, null, null);
      setIsServing(false);
      setOnGoingQueue(null); // Clear the ongoing queue after serving
    }
  };

  // Handle 'Requeue' button click
  const handleRequeue = async () => {
    if (!onGoingQueue) {
      showPopupMessage('error', 'No customer is currently being served.');
      return;
    }
    if (onGoingQueue && staffInfo) {
      const { ticketId } = onGoingQueue;
      const newStatusId = 5; // This is now handled on the backend to be a new status or a cancellation
      // const { staffId } = staffInfo;
      // Pass null for assignedToWindowId and assignedToStaffId
      await updateTicketStatus(ticketId, newStatusId, staffInfo.staffId, staffInfo.windowId);
      setIsServing(false);
      setOnGoingQueue(null); // Clear the ongoing queue after requeueing
    }
  };

  // Fetches queues every second after staff login
  useEffect(() => {
    let intervalId;
    if (staffInfo) {
      // Fetch immediately on login
      fetchQueues();
      // Then set up an interval to fetch every second
      intervalId = setInterval(() => {
        fetchQueues();
      }, 1000); // Fetch every 1 second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [staffInfo, fetchQueues]);

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="staff-window-page">
      {popup && <PopupMessage type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

      {!staffInfo ? (
        <div className="staff-login-form">
          <h2 className="login-title">Staff Login</h2>
          <div className="login-input-group">
            <input
              type="text"
              placeholder="Enter your full name"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="login-input"
            />
            <button className="login-button" onClick={fetchStaffInfo} disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </div>
      ) : (
        <div className="window-dashboard-container">
          <div className="window-header">
            <h1>Window #{staffInfo.windowNumber}</h1>
            <p className="branch-info">{staffInfo.branchName}</p>
            <p>Welcome, {staffInfo.fullName}!</p>
            <div className="current-datetime">
              <span>{formatDate(currentDateTime)}</span> | <span>{formatTime(currentDateTime)}</span>
            </div>
          </div>
          <div className="queue-sections">
            <div className="main-queue-displays">
                <div className="on-going-section">
                    <h2>Now Serving:</h2>
                    <div className="queue-display on-going">
                        {onGoingQueue ? (
                        <>
                            <p className="ticket-number-display">{onGoingQueue.ticketNumber}</p>
                            {/* <p className="ticket-info-display">{onGoingQueue.customerName || 'N/A'}</p> */}
                            <p className="ticket-info-display">{onGoingQueue.category?.categoryName || 'N/A'}</p>
                        </>
                        ) : (
                        <p className="no-queue-message">No customer is currently being served.</p>
                        )}
                    </div>
                </div>
                <div className="pending-section">
                    <h2>Next in Queue:</h2>
                    <div className="queue-display pending">
                        {pendingQueue ? (
                        <>
                            <p className="ticket-number-display">{pendingQueue.ticketNumber}</p>
                            {/* <p className="ticket-info-display">{pendingQueue.customerName || 'N/A'}</p> */}
                            <p className="ticket-info-display">{pendingQueue.category?.categoryName || 'N/A'}</p>
                        </>
                        ) : (
                        <p className="no-queue-message">No pending tickets.</p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="action-and-list-container">
              <div className="action-buttons">
                <button
                    className="next-button"
                    onClick={handleNextQueue}
                    disabled={loading || isServing}
                >
                    Call Next
                </button>
                {/* {onGoingQueue && isServing && (
                    <button
                        className="call-again-button"
                        onClick={() => speakTicketInfo(onGoingQueue.ticketNumber, staffInfo.windowNumber)}
                        disabled={loading}
                    >
                        Call Again
                    </button>
                )} */}
                <button
                     className="call-again-button"
                     onClick={() => speakTicketInfo(onGoingQueue.ticketNumber, staffInfo.windowNumber)}
                     disabled={loading}
                    >
                        Call Again
                </button>
                <div className="next-button-group">
                  <button
                    className="serve-button"
                    onClick={handleServe}
                    disabled={loading || !onGoingQueue}
                  >
                    Serve
                  </button>
                  <button
                    className="requeue-button"
                    onClick={handleRequeue}
                    disabled={loading || !onGoingQueue}
                  >
                    Requeue
                  </button>
                </div>
              </div>

              <div className="on-queue-list-section">
                <h2>Waiting Queue:</h2>
                {onQueueList.length > 0 ? (
                  <ul className="on-queue-list">
                    {onQueueList.map((queue) => (
                      <li key={queue.ticketId} className="queue-list-item">
                        <span className="queue-list-item-number">{queue.ticketNumber}</span>
                        <span className="queue-list-item-category">{queue.category?.categoryName || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-queue-message">The queue is currently empty.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterQueueManagement;