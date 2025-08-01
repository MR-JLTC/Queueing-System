import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './CounterQueueSystem.css'; // Assuming this CSS file is used for styling

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

const CounterQueueManagement = () => { // Renamed from StaffWindowInterface as per user's error log
  const [staffName, setStaffName] = useState('');
  const [staffInfo, setStaffInfo] = useState(null); // { staffId, fullName, branchId, branchName, windowId, windowNumber, windowName }
  const [onGoingQueue, setOnGoingQueue] = useState(null); // The queue currently being served
  const [pendingQueue, setPendingQueue] = useState(null); // The next queue to be called
  const [onQueueList, setOnQueueList] = useState([]); // List of waiting queues
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [timer, setTimer] = useState(15); // 15-second timer for requeue
  const timerRef = useRef(null); // Ref for the interval timer
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // State for real-time date and time

  // Function to show popup messages
  const showPopupMessage = useCallback((type, message) => {
    setPopup({ type, message });
  }, []);

  // --- API Calls ---

  // Update ticket status (CALLED, SERVED, REQUEUED)
  // This is defined early because handleRequeue and other handlers depend on it.
  const updateTicketStatus = useCallback(async (ticketId, newStatusId, assignedToStaffId, assignedToWindowId) => {
    try {
      setLoading(true);
      const payload = {
        currentStatusId: newStatusId,
        assignedToStaffId: assignedToStaffId,
        assignedToWindowId: assignedToWindowId,
        // Assuming the staffId is the changedByUserId for status updates
        changedByUserId: assignedToStaffId, // Use staffId for changedByUserId
      };
      await axios.patch(`${API_BASE_URL}/queue-tickets/${ticketId}`, payload);
      showPopupMessage('success', `Queue ${onGoingQueue?.ticketNumber || ''} status updated.`);
      // No need to call fetchQueues here, it will be called by the useEffect listener or manually after actions.
    } catch (error) {
      console.error('Error updating ticket status:', error.response?.data || error.message);
      showPopupMessage('error', 'Failed to update ticket status.');
    } finally {
      setLoading(false);
    }
  }, [onGoingQueue, showPopupMessage]); // onGoingQueue is a dependency because its ticketNumber is used in the message

  // Handle automatic requeue
  const handleRequeue = useCallback(() => {
    if (onGoingQueue && staffInfo) {
      // Mark current on-going as 'REQUEUED' (statusId 5 - assuming a new status for requeued)
      updateTicketStatus(onGoingQueue.ticketId, 5, staffInfo.staffId, staffInfo.windowId);
      showPopupMessage('info', `Queue ${onGoingQueue.ticketNumber} automatically requeued due to no response.`);
    }
  }, [onGoingQueue, staffInfo, updateTicketStatus, showPopupMessage]); // Add updateTicketStatus and showPopupMessage as dependencies

  // Fetch staff details and their assigned window
  const fetchStaffInfo = useCallback(async () => {
    if (!staffName) {
      console.log("Staff name is empty, skipping fetch.");
      showPopupMessage('error', 'Please enter your full name to log in.'); // More specific error
      return;
    }
    setLoading(true);
    // FIX: Ensure staffName is explicitly a string before encoding and sending
    const nameToEncode = String(staffName);
    const requestUrl = `${API_BASE_URL}/staff/assignment-by-name?fullName=${encodeURIComponent(nameToEncode)}`;
    console.log(`Attempting to fetch staff info from: ${requestUrl}`); // Log the exact URL being called
    try {
      const response = await axios.get(requestUrl);
      console.log("Backend response status for staff info:", response.status); // Log response status
      console.log("Backend response data for staff info:", response.data); // Log successful response data

      if (response.data) {
        setStaffInfo(response.data);
        showPopupMessage('success', `Welcome, ${response.data.fullName}! You are assigned to ${response.data.windowName} at ${response.data.branchName}.`);
      } else {
        setStaffInfo(null);
        // This case might happen if backend returns 200 OK but with empty data for some reason
        showPopupMessage('error', 'Staff not found or not currently assigned to a window (empty response).');
      }
    } catch (error) {
      console.error('Error fetching staff info:', error.response?.data || error.message); // Log full error object or message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        if (error.response.status === 404) {
          showPopupMessage('error', 'Staff not found or not assigned to an active window. Please check the name and try again.');
        } else {
          // Display the specific backend validation message if available
          const errorMessage = error.response.data?.message || `Server error: ${error.response.status}. Please try again later.`;
          showPopupMessage('error', errorMessage);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        showPopupMessage('error', 'Network error: Could not reach the server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        showPopupMessage('error', 'An unexpected error occurred. Please try again.');
      }
      setStaffInfo(null); // Clear staff info on error
    } finally {
      setLoading(false);
    }
  }, [staffName, showPopupMessage]);

  // Fetch queues for the assigned window
  // This function is now primarily for initial fetch or manual re-fetch,
  // real-time updates will come from SSE.
  const fetchQueues = useCallback(async () => {
    if (!staffInfo?.windowId) {
      console.log("staffInfo.windowId is not available, skipping fetchQueues.");
      return;
    }

    // Ensure windowId is an integer before sending it in the URL
    const windowId = parseInt(staffInfo.windowId, 10);
    if (isNaN(windowId)) {
      console.error("Invalid windowId:", staffInfo.windowId);
      showPopupMessage('error', 'Internal error: Invalid window ID received for staff assignment.');
      return;
    }

    setLoading(true);
    const requestUrl = `${API_BASE_URL}/queue-tickets/window-queues/${windowId}`;
    console.log(`Attempting to fetch queues from: ${requestUrl}`);
    try {
      const response = await axios.get(requestUrl);
      console.log("Backend response status for queues:", response.status);
      console.log("Backend response data for queues:", response.data);

      const { onGoing, pending, onQueue } = response.data;

      // Update state
      setOnGoingQueue(onGoing);
      setPendingQueue(pending);
      setOnQueueList(onQueue);

      // Timer logic: Start/reset if a new on-going queue appears or changes
      if (onGoing && onGoing.ticketId !== onGoingQueue?.ticketId) {
        setTimer(15);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleRequeue(); // Automatically requeue after timer
              return 15; // Reset for next cycle
            }
            return prev - 1;
          });
        }, 1000);
      } else if (!onGoing && timerRef.current) {
        // Clear timer if no ongoing queue
        clearInterval(timerRef.current);
        setTimer(15);
      }

    } catch (error) {
      console.error('Error fetching queues:', error.response?.data || error.message);
      showPopupMessage('error', 'Failed to fetch queues for your window.');
      setOnGoingQueue(null);
      setPendingQueue(null);
      setOnQueueList([]);
    } finally {
      setLoading(false);
    }
  }, [staffInfo, onGoingQueue, showPopupMessage, handleRequeue]);

  // --- Event Handlers ---

  const handleStaffLogin = (e) => {
    e.preventDefault();
    fetchStaffInfo();
  };

  const handleConfirm = async () => {
    if (onGoingQueue && staffInfo) {
      // Assuming statusId for 'CALLED' is 2
      await updateTicketStatus(onGoingQueue.ticketId, 2, staffInfo.staffId, staffInfo.windowId);
      // Stop and reset timer immediately on manual confirm
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(15);
      // No explicit fetchQueues here, SSE will push updates
    } else {
      showPopupMessage('error', 'No queue is currently on-going to confirm.');
    }
  };

  const handleNext = async () => {
    if (onGoingQueue && staffInfo) {
      // Mark current on-going as 'SERVED' (statusId 3)
      await updateTicketStatus(onGoingQueue.ticketId, 3, staffInfo.staffId, staffInfo.windowId);
      // No explicit fetchQueues here, SSE will push updates
    } else if (pendingQueue && staffInfo) {
      // If no on-going but pending exists, move pending to on-going and mark as 'CALLED'
      await updateTicketStatus(pendingQueue.ticketId, 2, staffInfo.staffId, staffInfo.windowId);
      // No explicit fetchQueues here, SSE will push updates
    } else {
      showPopupMessage('error', 'No queues to move to next.');
    }
    // Stop and reset timer immediately on manual next
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(15);
  };

  // --- Effects ---

  // Effect for real-time date and time
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timerId);
  }, []);

  // Effect to establish SSE connection once staff is identified
  useEffect(() => {
    let eventSource;
    if (staffInfo?.windowId) {
      fetchQueues(); // Initial fetch on login
      const windowId = parseInt(staffInfo.windowId, 10);
      eventSource = new EventSource(`${API_BASE_URL}/queue-tickets/stream/${windowId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("SSE update received:", data);
        const { onGoing, pending, onQueue } = data;

        setOnGoingQueue(onGoing);
        setPendingQueue(pending);
        setOnQueueList(onQueue);

        // Re-apply timer logic based on SSE updates
        if (onGoing && onGoing.ticketId !== onGoingQueue?.ticketId) {
          setTimer(15);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setTimer(prev => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                handleRequeue();
                return 15;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (!onGoing && timerRef.current) {
          clearInterval(timerRef.current);
          setTimer(15);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        // showPopupMessage('error', 'Real-time updates disconnected. Please refresh the page.');
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("SSE connection closed.");
      }
      if (timerRef.current) clearInterval(timerRef.current); // Clear timer on unmount or staffInfo change
    };
  }, [staffInfo, onGoingQueue, handleRequeue, showPopupMessage, fetchQueues]); // Add onGoingQueue here to re-evaluate timer on SSE updates

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="staff-window-page">
      {!staffInfo ? (
        <div className="staff-login-form">
          <h2>Staff Login</h2>
          <form onSubmit={handleStaffLogin}>
            <input
              type="text"
              placeholder="Enter your full name"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="window-dashboard-container">
          <header className="window-header">
            <h1>{staffInfo.windowName || `Window ${staffInfo.windowNumber}`}</h1>
            <p>Branch: {staffInfo.branchName}</p>
            <p>Staff: {staffInfo.fullName}</p>
            <p className="current-datetime">{formatDateTime(currentDateTime)}</p> {/* Display real-time date and time */}
          </header>

          <div className="queue-sections">
            <div className="on-going-section">
              <div className="queue-display on-going">
                <span className="queue-number">
                  {onGoingQueue ? onGoingQueue.ticketNumber : '--'}
                </span>
                <span className="status-label">ON GOING</span>
                {onGoingQueue && <div className="timer">Time left: {timer}s</div>}
              </div>
              <div className="action-buttons">
                <button
                  className="action-btn confirm-btn"
                  onClick={handleConfirm}
                  disabled={loading || !onGoingQueue || onGoingQueue.status === 'CALLED'} // Disable if already called
                >
                  Confirm
                </button>
                <button
                  className="action-btn next-btn"
                  onClick={handleNext}
                  disabled={loading || (!onGoingQueue && !pendingQueue)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="pending-and-list-section">
              <div className="queue-display pending">
                <span className="queue-number">
                  {pendingQueue ? pendingQueue.ticketNumber : '--'}
                </span>
                <span className="status-label">PENDING</span>
              </div>

              <div className="on-queue-list-container">
                <h3 className="list-title">ON QUEUE</h3>
                <div className="on-queue-list">
                  {onQueueList && onQueueList.length > 0 ? (
                    onQueueList.map((queue) => (
                      <div key={queue.ticketId} className="queue-item">
                        {queue.ticketNumber}
                      </div>
                    ))
                  ) : (
                    <div className="no-queues">No queues available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <PopupMessage
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default CounterQueueManagement;