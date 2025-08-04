import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './QueueChecker.css';

// API Base URL (adjust this to your backend's address)
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

// SVG icons for the app's logo and code detected message
const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 7h.01" />
    <path d="M7 17h.01" />
    <path d="M17 7h.01" />
    <path d="M17 17h.01" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.63" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const QueueChecker = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [isCodeDetected, setIsCodeDetected] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("Please allow camera access to scan.");
  const [popup, setPopup] = useState(null);
  const scannerRef = useRef(null);
  // const navigate = useNavigate(); // Initialize the useNavigate hook
  const qrCodeScannerRef = useRef(null);
  
  // Function to handle the QR code scan success
  // Function to handle the successful scan of a QR code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onScanSuccess = (decodedText) => {
    console.log(`Scan successful: ${decodedText}`);
    setIsCodeDetected(true);
    setScannerMessage("Code Detected! Processing ticket...");

    // Stop the scanner immediately to prevent multiple scans
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.stop().then(() => {
        console.log('Scanner stopped.');
      });
    }

    setTimeout(async () => {
      try {
        // Parse the decodedText to extract the required data.
        // Assuming decodedText is a JSON string with the following structure:
        // { "queueNumber": "B-001", "branchName": "Main Branch", "counter": "Window 1" }
        const ticketData = JSON.parse(decodedText);
        const { queueNumber, branchName, counter } = ticketData;

        // Validate the extracted data
        if (!queueNumber || !branchName || !counter) {
          throw new Error('QR code data is incomplete or in an unexpected format.');
        }

        console.log('Parsed ticket data:', ticketData);

        // Make an API call to process the ticket
        const response = await axios.post(`${API_BASE_URL}/queue-tickets/check`, {
          ticketNumber: queueNumber,
          branchName: branchName,
          counter: counter
        });

        // Handle successful API response
        setPopup({ type: 'success', message: response.data.message });
  
        if (ticketData &&
            queueNumber !== undefined && queueNumber !== null &&
            branchName !== undefined && branchName !== null &&
            counter !== undefined && counter !== null
          ) {
            setPopup({ type: 'success', message: 'Ticket validated successfully!' });  
            // navigate('/queuestatus', { state: { ticketData: response.data.ticket } });
          } else setPopup({ type: 'error', message: 'Invalid or expired QR code.' });

      } catch (error) {
        console.error("API error or JSON parse error:", error);
        // Handle both API errors and JSON parsing errors
        const errorMessage = error.response?.data?.message || error.message || 'Failed to process ticket. Please try again.';
        setPopup({ type: 'error', message: errorMessage });
      } finally {
        // Always reset the scanner and UI state after the process
        setShowScanner(false);
        setIsCodeDetected(false);
        setScannerMessage("Please allow camera access to scan.");
      }
    }, 1500); // Wait a bit for visual feedback before processing
  };

  // Function to handle the QR code scan error
  const onScanError = (errorMessage) => {
    console.log(`Scan error: ${errorMessage}`);
    // We don't show the error to the user to avoid constant flickering
  };

  useEffect(() => {
    let html5QrcodeScanner;

    const startScanner = () => {
      // If the scanner is not yet initialized and the DOM element exists
      if (!html5QrcodeScanner && scannerRef.current) {
        html5QrcodeScanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: false, // Prevents mirror effect
            rememberLastUsedCamera: true
          },
          false // verbose
        );
        html5QrcodeScanner.render(onScanSuccess, onScanError);
        console.log("Scanner initialized and started.");
      }
    };

    if (showScanner) {
      // Start the scanner when showScanner is true
      startScanner();
    }

    // Cleanup function to stop the scanner when the component unmounts or showScanner becomes false
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        console.log("Scanner cleaned up.");
      }
    };
  }, [onScanSuccess, showScanner]); // Dependency array: Re-run effect when showScanner changes

  const handleStartScanning = () => {
    setShowScanner(true);
    setIsCodeDetected(false); // Reset detection status
  };

  const handleStopScanning = () => {
    setShowScanner(false);
    setIsCodeDetected(false);
  };

  return (
    <div className="queue-checker-app">
      <div className="queue-checker-card">
        {/* Main Interface or Scanner View */}
        {!showScanner ? (
          <div className="start-scan-view">
            <div className="icon-container">
              <QrCodeIcon />
            </div>
            <h1 className="main-title">Queue Check-in</h1>
            <p className="subtitle">
              Scan your queue ticket's QR code to verify and proceed.
            </p>
            <button
              onClick={handleStartScanning}
              className="action-btn scan-qr-btn"
            >
              Scan QR
            </button>
          </div>
        ) : (
          <div className="qr-scanner-view">
            <h1 className="qr-scanner-title">Scan to Proceed</h1>
            <div
              id="reader"
              ref={scannerRef}
              className="relative w-full aspect-square"
            >
              {/* This div is where the Html5QrcodeScanner will inject its content */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-center px-4">{scannerMessage}</span>
              </div>
            </div>
            
            {isCodeDetected && (
              <div className="code-detected-message">
                <CheckCircleIcon />
                <span className="font-semibold text-lg">Code Detected!</span>
              </div>
            )}
            
            <button
              onClick={handleStopScanning}
              className="stop-scanning-btn"
            >
              Stop Scanning
            </button>
            <p className="legal-text">
              We don't share your data. Scans are used for verification.
            </p>
          </div>
        )}
      </div>
      
      {/* Popup Message Component */}
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

export default QueueChecker;
