import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './QueueStatus.css';

// API Base URL (adjust this to your backend's backend)
const API_BASE_URL = 'http://localhost:3000';

const QueueStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queueData, setQueueData] = useState({ called: null, queued: [] }); // Changed to store both called and queued tickets
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTicketNumber, setUserTicketNumber] = useState('N/A');
  const [assignedWindowName, setAssignedWindowName] = useState('N/A');
  const [assignedWindowId, setAssignedWindowId] = useState(null);
  // const [customerName, setCustomerName] = useState('N/A');
  // const [branchName, setBranchName] = useState('N/A');
  const [branchId, setBranchId] = useState(null);

  // Ref to keep track of the last spoken ticket to prevent repeated announcements
  const lastSpokenTicketRef = useRef(null);

  // Function to speak the text
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('SpeechSynthesis API not supported in this browser.');
    }
  };

  // A helper function to fetch the queue for a specific window/counter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchQueueForWindow = async (branchId, windowId) => {
    try {
      // Using the new route for live status
      const response = await fetch(`${API_BASE_URL}/queue-tickets/live-status/${branchId}/${windowId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch queue list.");
      }
      const data = await response.json();
      setQueueData({ called: data.called, queued: data.queued || [] }); // Store both called and queued

      // Check if the user's ticket is now being served
      const servingTicket = data.called;
      if (servingTicket && userTicketNumber !== 'N/A' && servingTicket.ticketNumber === userTicketNumber) {
        if (lastSpokenTicketRef.current !== userTicketNumber) {
          // const windowName = servingTicket.assignedToWindow?.windowName || `Window ${servingTicket.assignedToWindow?.windowNumber}`;
          speakText(`Your number ${userTicketNumber} is called, please proceed to counter ${windowId}.`);
          lastSpokenTicketRef.current = userTicketNumber; // Update the ref
        }
      }
    } catch (err) {
      console.error("Error fetching queue list:", err);
      setError("Could not retrieve the queue list. Please try again.");
    }
  };

  // The main effect hook to get initial data and set up polling
  useEffect(() => {
    // Retrieve data from localStorage
    const storedTicketNumber = localStorage.getItem('ticketNumber');
    const storedBranchName = localStorage.getItem('branchName');
    const storedCounter = localStorage.getItem('counter');
    const storedBranchId = localStorage.getItem('branchId');

    if (storedTicketNumber && storedBranchName && storedCounter && storedBranchId) {
      setUserTicketNumber(storedTicketNumber);
      setAssignedWindowName(storedCounter);
      setBranchId(parseInt(storedBranchId, 10));
      setAssignedWindowId(parseInt(storedCounter.replace('Window ', ''), 10)); // Assuming counter is "Window X"

      setLoading(false);

      const currentBranchId = parseInt(storedBranchId, 10);
      const currentWindowId = parseInt(storedCounter.replace('Window ', ''), 10); // Extract window ID

      // Initial fetch
      fetchQueueForWindow(currentBranchId, currentWindowId);

      // Set up polling every 1 second
      const intervalId = setInterval(() => {
        fetchQueueForWindow(currentBranchId, currentWindowId);
      }, 1000); // Poll every 1 second

      return () => clearInterval(intervalId); // Clean up interval on component unmount

    } else if (location.state && location.state.ticketData) {
      // Fallback for direct navigation (if localStorage is not set yet)
      const ticketData = location.state.ticketData;
      setUserTicketNumber(ticketData.ticketNumber);
      setAssignedWindowName(ticketData.assignToWindowName);
      setBranchId(ticketData.branchid);
      setAssignedWindowId(ticketData.assignToWindow);

      setLoading(false);

      const currentBranchId = ticketData.branchid;
      const currentWindowId = ticketData.assignToWindow;

      // Initial fetch
      fetchQueueForWindow(currentBranchId, currentWindowId);

      // Set up polling every 1 second
      const intervalId = setInterval(() => {
        fetchQueueForWindow(currentBranchId, currentWindowId);
      }, 1000); // Poll every 1 second

      return () => clearInterval(intervalId); // Clean up interval on component unmount
    }
    else {
      setError("No queue ticket found. Please scan a QR code.");
      setLoading(false);
    }
  }, [location.state, userTicketNumber, assignedWindowName, assignedWindowId, branchId, fetchQueueForWindow]); // Added dependencies for useEffect

  const onDone = () => {
    // Clear localStorage items related to the current ticket
    localStorage.removeItem('ticketNumber');
    localStorage.removeItem('branchName');
    localStorage.removeItem('counter');
    localStorage.removeItem('CustomerName');
    localStorage.removeItem('branchId');
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
          <button onClick={() => navigate('/queue-checker')} className="done-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Find the serving ticket from the queueData
  const servingTicket = queueData.called;
  const inQueueTickets = queueData.queued;

  // Calculate the user's position in the queue
  const userTicketIndex = inQueueTickets.findIndex(ticket => ticket.ticketNumber === userTicketNumber);
  const userPosition = userTicketIndex !== -1 ? userTicketIndex + 1 : null;
  const userStatus = userTicketNumber === servingTicket?.ticketNumber ? 'Serving' : (userPosition !== null ? 'In Queue' : 'N/A');

  return (
    <div className="queue-status-container">
      <div className="queue-checker-card">
        <div className="status-header">
          <img
            src="/src/assets/sys_logo.png" // Updated logo source
            alt="System Logo"
            className="header-logo"
          />
          <span className="header-title">My Queue Status</span>
        </div>

        {/* Serving Ticket Section */}
        <div className="queue-section serving-section">
          <h2 className="section-title">Now Serving</h2>
          <div className={`ticket-card serving ${servingTicket?.ticketNumber === userTicketNumber ? 'my-ticket-serving' : ''}`}>
            <div className="ticket-info">
              <span className="ticket-number">{servingTicket?.ticketNumber || 'N/A'}</span>
              {/* {servingTicket?.customerName && (
                <p className="ticket-customer-name">Customer: <span className="highlight-text">{servingTicket.customerName}</span></p>
              )} */}
              {/* <p className="ticket-status">Counter: <span className="highlight-text">{servingTicket?.assignedToWindow?.windowName || assignedWindowName || 'N/A'}</span></p> */}
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
                  <span className="ticket-position">#{index + 1}</span>
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
            {/* <p>Name: <span className="highlight-text">{customerName}</span></p>
            <p>Branch: <span className="highlight-text">{branchName}</span></p> */}
          </div>
          {userStatus === 'Serving' && (
            <p className="my-code-status">
              Status: <span className="highlight-text serving-status-text">You are being served</span>
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
