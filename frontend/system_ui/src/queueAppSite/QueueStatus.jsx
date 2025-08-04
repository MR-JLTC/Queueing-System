import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './QueueStatus.css';

// API Base URL (adjust this to your backend's backend)
const API_BASE_URL = 'http://localhost:3000';

const QueueStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queueInfo, setQueueInfo] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // A helper function to fetch the queue for a specific window/counter
  const fetchQueueForWindow = async (windowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue-tickets/window-queues/${windowId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch queue list.");
      }
      const data = await response.json();
      setQueueList(data);
    } catch (err) {
      console.error("Error fetching queue list:", err);
      setError("Could not retrieve the queue list. Please try again.");
    }
  };

  // The main effect hook to get initial data and set up polling
  useEffect(() => {
    if (location.state && location.state.ticketData) {
      setQueueInfo(location.state.ticketData);
      setLoading(false);
      
      const windowId = location.state.ticketData.assignToWindow;
      fetchQueueForWindow(windowId);
      
      const intervalId = setInterval(() => {
        fetchQueueForWindow(windowId);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(intervalId);
      
    } else {
      setError("No queue ticket found. Please scan a QR code.");
      setLoading(false);
    }
  }, [location.state]);

  const onDone = () => {
    navigate('/queue-checker'); // Navigate back to the main scanner page
  };

  // Render loading and error states
  if (loading) {
    return (
      <div className="queue-status-container">
        <div className="queue-checker-card">
          <p>Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="queue-status-container">
        <div className="queue-checker-card">
          <p className="text-red-500">{error}</p>
          <button onClick={() => navigate('/')} className="stop-scanning-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const userTicketNumber = queueInfo?.ticketNumber || 'N/A';
  const assignedWindowName = queueInfo?.assignToWindowName || 'N/A';
  
  const servingTicket = Array.isArray(queueList) ? queueList.find(ticket => ticket.currentStatus?.statusName === 'CALLED') : null;
  const inQueueTickets = Array.isArray(queueList) ? queueList.filter(ticket => ticket.currentStatus?.statusName === 'QUEUED') : [];
  
  // Calculate the user's position in the queue
  const userTicketIndex = inQueueTickets.findIndex(ticket => ticket.ticketNumber === userTicketNumber);
  const userPosition = userTicketIndex !== -1 ? userTicketIndex + 1 : null;
  const userStatus = userTicketNumber === servingTicket?.ticketNumber ? 'Serving' : (userPosition !== null ? 'In Queue' : 'N/A');

  return (
    <div className="queue-status-container">
      <div className="queue-checker-card">
        <div className="status-header">
          <img 
            src="/src/assets/sys_logo.png"
            alt="System Logo" 
            className="header-logo" 
          />
          <span className="header-title">My Queue Status</span>
        </div>
        
        {/* Serving Ticket Section */}
        <div className="queue-section serving-section">
          <h2 className="section-title">Now Serving</h2>
          <div className="ticket-card serving">
            <div className="ticket-info">
              <span className="ticket-number">{servingTicket?.ticketNumber || 'N/A'}</span>
              <p className="ticket-status">Counter: <span className="highlight-text">{servingTicket?.assignedToWindow?.windowName || 'N/A'}</span></p>
            </div>
          </div>
        </div>
        
        {/* In Queue Tickets Section */}
        <div className="queue-section in-queue-section">
          <h2 className="section-title">In-Queue ({inQueueTickets.length})</h2>
          <div className="ticket-list-container">
            {inQueueTickets.length > 0 ? (
              inQueueTickets.map((ticket, index) => (
                <div 
                  key={ticket.ticketNumber} 
                  className={`ticket-card in-queue ${ticket.ticketNumber === userTicketNumber ? 'my-ticket' : ''}`}
                >
                  <span className="ticket-number">{ticket.ticketNumber}</span>
                  <span className="ticket-position">{index + 1}</span>
                </div>
              ))
            ) : (
              <p className="empty-queue-text">No other tickets in the queue.</p>
            )}
          </div>
        </div>

        {/* My Ticket Info Section */}
        <div className="my-code-display-section">
          <div className="my-code-info-header">
            <span className="my-code-label">YOUR QUEUE NUMBER</span>
            <span className="my-code-value">{userTicketNumber}</span>
          </div>
          <div className="my-code-details">
            <p className="counter-label">Counter: <span className="highlight-text">{assignedWindowName}</span></p>
            {userPosition && (
              <p>Position: <span className="highlight-text">#{userPosition}</span></p>
            )}
          </div>
          {userStatus === 'Serving' && (
            <p className="my-code-status">
              Status: <span className="highlight-text">You are being served</span>
            </p>
          )}
        </div>
        
      </div>
      <button onClick={onDone} className="done-btn">
        Done
      </button>
    </div>
  );
};

export default QueueStatus;
