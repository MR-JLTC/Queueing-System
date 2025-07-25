import React, { useState, useEffect,  useRef } from 'react';
import './QueueManagement.css';
import SysIcon from '/src/assets/sys_logo.png'; // Used for form header
import personicon from '/src/assets/person.svg';
import careicon from '/src/assets/care.svg';

// Load QRious library for QR code generation
// This script will be loaded globally, so QRious will be available as a global object.
const loadQriousScript = () => {
  return new Promise((resolve, reject) => {
    if (window.QRious) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load jsPDF and html2canvas libraries for PDF generation
const loadPdfLibraries = () => {
  return new Promise((resolve, reject) => {
    // Check if jsPDF and html2canvas are already loaded
    if (window.jspdf && window.html2canvas) {
      resolve();
      return;
    }

    const loadScript = (src, id) => {
      return new Promise((scriptResolve, scriptReject) => {
        if (document.getElementById(id)) {
          scriptResolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.onload = scriptResolve;
        script.onerror = scriptReject;
        document.head.appendChild(script);
      });
    };

    // Use an IIFE to use async/await inside the executor
    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script');
        resolve();
      } catch (error) {
        console.error("Failed to load PDF libraries:", error);
        reject(error);
      }
    })();
  });
};


// Component to display the generated queue ticket
const QueueTicketDisplay = ({ ticketData, onClose }) => {
  const qrCanvasRef = useRef(null);
  const ticketRef = useRef(null); // Ref for the ticket content to be captured

  useEffect(() => {
    const generateQrCode = async () => {
      await loadQriousScript(); // Ensure QRious is loaded

      if (qrCanvasRef.current && window.QRious) {
        // Data to encode in the QR code
        const qrContent = JSON.stringify({
          queueNumber: ticketData.queueNumber,
          category: ticketData.category,
          transaction: ticketData.transaction,
          counter: ticketData.counter,
          name: ticketData.name,
          nickname: ticketData.nickname,
          timestamp: ticketData.dateTimeIssued,
        });

        // Generate QR code
        new window.QRious({
          element: qrCanvasRef.current,
          value: qrContent,
          size: 180, // Size of the QR code in pixels
          padding: 10,
          foreground: '#000', // QR code color (black)
          background: '#fff', // Background color (white)
        });
      }
    };

    generateQrCode();
  }, [ticketData]); // Regenerate QR code if ticketData changes

  const handleDownloadPdf = async () => {
    await loadPdfLibraries(); // Ensure PDF libraries are loaded

    if (ticketRef.current && window.html2canvas && window.jspdf) {
      // Capture the ticket content as an image
      const canvas = await window.html2canvas(ticketRef.current, {
        scale: 2, // Increase scale for better quality in PDF
        useCORS: true, // Enable CORS if you have external images (like SysIcon)
        backgroundColor: '#ffffff', // Ensure white background for PDF
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] // Set PDF size to canvas size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`QueueTicket_${ticketData.queueNumber}.pdf`);
    } else {
      console.error("PDF libraries not loaded or ticket content not found.");
    }
  };


  const { queueNumber, category, nickname, transaction, counter, dateTimeIssued } = ticketData;

  // Format date and time
  const date = new Date(dateTimeIssued);
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="notification-overlay">
      <div className="queue-ticket-popup">
        {/* The content to be captured as PDF */}
        <div ref={ticketRef} className="ticket-content-printable">
          <div className="ticket-header">
            <div className="ticket-icon">
              {/* Simple hourglass SVG icon */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6a4 4 0 0 1-4 4 4 4 0 0 1 4 4v6" />
                <path d="M12 22a4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4z" />
                <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z" />
              </svg>
            </div>
            <h2 className="ticket-title">
              {category === 'Standard' ? 'STANDARD QUEUE' : 'PRIORITY QUEUE'}
            </h2>
            <div className="ticket-number">{queueNumber}</div>
          </div>

          <div className="ticket-details">
            <div className="detail-row">
              <span className="detail-label">
                <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Category:
              </span>
              <span className="detail-value">{category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nickname:</span>
              <span className="detail-value">{nickname}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Service Counter:</span>
              <span className="detail-value">{transaction} (Counter {counter})</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date & Time Issued:</span>
              <span className="detail-value">{formattedDate} / {formattedTime}</span>
            </div>
          </div>

          <div className="qr-code-section">
            <canvas ref={qrCanvasRef} className="qr-code-canvas"></canvas>
            <p className="qr-message">Please scan the QR code to check your place in line and get real-time updates.</p>
          </div>

          <div className="ticket-footer">
            <span className="footer-icon">💡</span>
            <span className="footer-text">SIT BACK AS WE DO THE WORK</span>
          </div>
        </div>

        {/* Buttons for closing and downloading */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="download-pdf-btn" onClick={handleDownloadPdf}>
            Download PDF
          </button>
          <button className="notification-close" onClick={onClose}>
            Got it! ✓
          </button>
        </div>
      </div>
    </div>
  );
};


const QueueManagement = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [showQueueTicket, setShowQueueTicket] = useState(false); // New state for ticket display
  const [queueTicketData, setQueueTicketData] = useState(null); // State to hold ticket data
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
      const newCounter = transactionToCounter[selectedTransaction] || 1; // Default to 1 if not found
      const now = new Date();

      const ticketData = {
        queueNumber: newQueueNumber,
        category: selectedCategory,
        nickname: nickname,
        transaction: selectedTransaction,
        counter: newCounter,
        dateTimeIssued: now.toISOString(), // Store as ISO string for consistency
      };

      setCurrentQueueNumber(newQueueNumber);
      setQueueItems([
        { queueNumber: newQueueNumber, transaction: selectedTransaction, counter: newCounter },
        ...queueItems.slice(0, 5), // Keep only the latest 5 items + new one
      ]);
      setQueueTicketData(ticketData); // Set the data for the ticket
      setShowQueueTicket(true); // Show the ticket popup

      // Optionally, clear form fields after proceeding
      setName('');
      setNickname('');
      setSelectedCategory('');
      setSelectedTransaction('');
    }
  };

  const handleCloseQueueTicket = () => {
    setShowQueueTicket(false);
    setQueueTicketData(null); // Clear ticket data
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
                  <img src={personicon} alt="Standard Icon" className="category-icon" />
                  <span>Standard</span>
                </button>
                <button
                  className={`category-btn ${selectedCategory === 'Senior / PWD' ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect('Senior / PWD')}
                >
                  <img src={careicon} alt="Senior / PWD Icon" className="category-icon" />
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
                <option value="">Select Transaction</option> {/* Added default empty option */}
                {transactionTypes.map((type, idx) => (
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

      {/* Queue Ticket Popup */}
      {showQueueTicket && queueTicketData && (
        <QueueTicketDisplay ticketData={queueTicketData} onClose={handleCloseQueueTicket} />
      )}
    </div>
  );
};

export default QueueManagement;
