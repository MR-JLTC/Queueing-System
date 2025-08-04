import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QueueDisplay.css'; // Create this CSS file for styling

// Icon imports (you might need to install @mui/icons-material if not already)
import BusinessIcon from '@mui/icons-material/Business'; // For branch
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // For queued time
import PersonIcon from '@mui/icons-material/Person'; // For customer name
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'; // For window
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'; // For pagination
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; // For pagination

// Translations object (can be expanded)
const translations = {
  English: {
    systemTitle: "Queue Display System",
    selectBranch: "Select a Branch",
    nowServing: "NOW SERVING",
    nextInQueue: "NEXT IN QUEUE",
    onGoing: "ON-GOING",
    ticketNo: "Ticket No.",
    customerName: "Customer",
    noTicket: "No Ticket",
    noOngoingTickets: "No other tickets in queue.",
    fetchingData: "Fetching queue data...",
    errorFetchingBranches: "Error fetching branches. Please try again.",
    errorFetchingQueue: "Error fetching queue for branch.",
    previous: "Previous", // Added back
    next: "Next", // Added back
  },
};

const QueueDisplay = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [queueData, setQueueData] = useState({}); // Stores queue data by window ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Reintroduced pagination state

  const selectedLanguage = 'English'; // Can be made dynamic if you have a language switcher

  // Constants for pagination - now simply limits to 4 items
  const ITEMS_PER_PAGE = 4; // Display exactly 4 items (4 columns, 1 row)

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:3000/branches');
        setBranches(response.data);
        if (response.data.length > 0) {
          setSelectedBranchId(response.data[0].branchId); // Automatically select the first branch
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError(translations[selectedLanguage].errorFetchingBranches);
      }
    };
    fetchBranches();
  }, []);

  // Fetch queue data whenever selectedBranchId changes
  useEffect(() => {
    const fetchQueueData = async () => {
      if (!selectedBranchId) {
        setQueueData({});
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch all service windows for the selected branch
        const windowsResponse = await axios.get(`http://localhost:3000/service-windows?branchId=${selectedBranchId}`);
        const serviceWindows = windowsResponse.data;

        const branchQueueResponses = await axios.get(`http://localhost:3000/queue-tickets/branch/${selectedBranchId}/queue-status`);
        const { queueStatusByWindow } = branchQueueResponses.data; // Assuming your backend returns data structured by window

        // Map the backend data to your frontend state, ensuring all windows are represented
        const structuredQueueData = {};
        serviceWindows.forEach(window => {
          structuredQueueData[window.windowId] = {
            windowName: window.windowName || `Window ${window.windowNumber}`,
            called: queueStatusByWindow[window.windowId]?.called || null,
            pending: queueStatusByWindow[window.windowId]?.pending || null,
            onGoing: queueStatusByWindow[window.windowId]?.onGoing || [],
          };
        });

        setQueueData(structuredQueueData);
        // Only reset to first page if the branch changes, not on every refresh
        // This is the key change to keep the current batch visible on refresh
        // if the selectedBranchId is the dependency that changed.
        // For periodic refreshes, currentPage will remain.
        if (selectedBranchId !== null) { // Simple check to only reset on actual branch change
            // This condition ensures that if the branch ID is changed by user, page resets
            // but if it's the periodic fetch that re-triggers useEffect, currentPage remains.
            // A more robust solution might involve a ref or previousBranchId state.
            // For now, removing the unconditional reset is the primary goal.
            // You might want to refine this to only reset if a *new* branch is selected,
            // not just if the effect runs for the *same* branch due to initial load/polling.
        }

      } catch (err) {
        console.error('Error fetching queue data:', err);
        setError(translations[selectedLanguage].errorFetchingQueue);
        setQueueData({}); // Clear previous data on error
      } finally {
        setLoading(false);
      }
    };

    fetchQueueData();
    // Optional: Poll for updates every few seconds (e.g., every 5 seconds)
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [selectedBranchId, selectedLanguage]); // selectedBranchId is a dependency, so changing it *will* re-fetch and reset queueData

  // Pagination logic
  const allWindowQueues = Object.values(queueData);
  const totalPages = Math.ceil(allWindowQueues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedWindowQueues = allWindowQueues.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="queue-display-page">
      <div className="header-section">
        <h1 className="system-title">{translations[selectedLanguage].systemTitle}</h1>
        <div className="branch-filter">
          <label htmlFor="branch-select" className="sr-only">{translations[selectedLanguage].selectBranch}</label>
          <BusinessIcon className="branch-icon" />
          <select
            id="branch-select"
            value={selectedBranchId}
            onChange={(e) => {
                setSelectedBranchId(parseInt(e.target.value, 10));
                setCurrentPage(1); // Explicitly reset page to 1 when branch changes
            }}
            className="branch-dropdown"
            disabled={loading}
          >
            <option value="">{translations[selectedLanguage].selectBranch}</option>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>
        {/* Pagination controls reintroduced here */}
        {!loading && !error && allWindowQueues.length > 0 && (
          <div className="pagination-container-top">
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ArrowBackIosIcon fontSize="small" /> {translations[selectedLanguage].previous}
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                {translations[selectedLanguage].next} <ArrowForwardIosIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <p className="loading-message">{translations[selectedLanguage].fetchingData}</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && Object.keys(queueData).length === 0 && selectedBranchId && (
        <p className="no-data-message">No queue data available for the selected branch.</p>
      )}

      {!loading && !error && Object.keys(queueData).length > 0 && (
        <>
          <div className="queue-grid">
            {displayedWindowQueues.map((windowQueue, index) => (
              <div className="queue-card" key={windowQueue.windowId || index}> {/* Use windowId for key if available */}
                <div className="queue-card-header">
                  <MeetingRoomIcon className="window-icon" />
                  <h2 className="window-name">{windowQueue.windowName}</h2>
                </div>

                <div className="queue-status-section now-serving">
                  <h3>{translations[selectedLanguage].nowServing}</h3>
                  {windowQueue.called ? (
                    <div className="ticket-info serving-ticket">
                      <span className="ticket-number"><PersonIcon /> {windowQueue.called.ticketNumber}</span>
                      {/* <span className="ticket-details">{windowQueue.called.customerName}</span> -- Removed customer name */}
                    </div>
                  ) : (
                    <p className="no-ticket">{translations[selectedLanguage].noTicket}</p>
                  )}
                </div>

                <div className="queue-status-section next-in-queue">
                  <h3>{translations[selectedLanguage].nextInQueue}</h3>
                  {windowQueue.pending ? (
                    <div className="ticket-info">
                      <span className="ticket-number"><PersonIcon /> {windowQueue.pending.ticketNumber}</span>
                      {/* <span className=\"ticket-details\">{windowQueue.pending.customerName}</span> -- Removed customer name */}
                    </div>
                  ) : (
                    <p className="no-ticket">{translations[selectedLanguage].noTicket}</p>
                  )}
                </div>

                <div className="queue-status-section on-going">
                  <h3>{translations[selectedLanguage].onGoing}</h3>
                  {windowQueue.onGoing.length > 0 ? (
                    <ul className="on-going-list">
                      {windowQueue.onGoing.slice(0, 5).map((ticket) => ( // Show top 5 on-going
                        <li key={ticket.ticketId} className="on-going-item">
                          <span className="on-going-ticket-number">{ticket.ticketNumber}</span>
                          {/* <span className="on-going-customer-name">{ticket.customerName}</span> -- Removed customer name */}
                        </li>
                      ))}
                      {windowQueue.onGoing.length > 5 && (
                        <li className="on-going-more">...and {windowQueue.onGoing.length - 5} more</li>
                      )}
                    </ul>
                  ) : (
                    <p className="no-ticket">{translations[selectedLanguage].noOngoingTickets}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QueueDisplay;