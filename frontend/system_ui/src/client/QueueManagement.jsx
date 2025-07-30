import React, { useState, useEffect, useRef } from 'react';
import './QueueManagement.css';
import SysIcon from '/src/assets/sys_logo.png'; // Used for form header and ticket logo
import personicon from '/src/assets/person.svg';
import careicon from '/src/assets/care.svg';
import axios from 'axios'; // Import Axios

// Import icons for ticket details (used in the QueueTicketDisplay modal)
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CategoryIcon from '@mui/icons-material/Category';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business'; // For branch icon

// Translations object
const translations = {
  English: {
    queueManagementTitle: "Queue Management",
    queueManagementSubtitle: "Get your queue number instantly",
    nameLabel: "Name",
    namePlaceholder: "Enter your name",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "Enter your nickname",
    selectBranchTitle: "SELECT BRANCH",
    selectBranchSubtitle: "Choose the branch for your transaction.",
    selectBranchPlaceholder: "Select a Branch",
    categoryTitle: "CATEGORY",
    categorySubtitle: "Please select one category to continue",
    standardCategory: "Standard",
    seniorPwdCategory: "Senior / PWD",
    transactionTypeTitle: "TRANSACTION TYPE",
    transactionTypeSubtitle: "Please select a transaction type.",
    selectTransactionPlaceholder: "Select Transaction",
    noWindowsAvailable: "No windows available for this branch",
    selectBranchFirst: "Select a Branch First",
    proceedButton: "Proceed",
    processingButton: "Processing...",
    popupErrorFillAllFields: "Please fill in all required fields.",
    popupErrorFailedToLoadBranches: "Failed to load branches.",
    popupErrorFailedToLoadWindows: "Failed to load service windows for the selected branch.",
    popupErrorFailedToGetQueue: "Failed to get queue number. Please try again later.",
    popupSuccessQueueIssued: (ticketNumber) => `Your queue number ${ticketNumber} has been issued!`,
    popupErrorGeneratePDF: "Failed to generate PDF. Please try again.",

    // Ticket Display
    standardQueueTitle: "STANDARD QUEUE",
    priorityQueueTitle: "PRIORITY QUEUE",
    categoryDetail: "Category:",
    nicknameDetail: "Nickname:",
    branchDetail: "Branch:",
    serviceCounterDetail: "Service Counter:",
    dateTimeIssuedDetail: "Date & Time Issued:",
    qrMessage: "Please scan the QR code to check your place in line and get real-time updates.",
    ticketFooter: "SIT BACK AS WE DO THE WORK",
    getPrintButton: "Get Print",
    gotItButton: "Got it! ✓",
  },
  Cebuano: {
    queueManagementTitle: "Pagdumala sa Linya",
    queueManagementSubtitle: "Kuhaa dayon ang imong numero sa linya",
    nameLabel: "Ngalan",
    namePlaceholder: "Isulod ang imong ngalan",
    nicknameLabel: "Palayaw",
    nicknamePlaceholder: "Isulod ang imong palayaw",
    selectBranchTitle: "PILI OG SANGAY",
    selectBranchSubtitle: "Pili-a ang sangay para sa imong transaksyon.",
    selectBranchPlaceholder: "Pili og Sangay",
    categoryTitle: "KATEGORYA",
    categorySubtitle: "Palihug pagpili og usa ka kategorya aron makapadayon",
    standardCategory: "Standard",
    seniorPwdCategory: "Senior / PWD",
    transactionTypeTitle: "MATANG SA TRANSAKSYON",
    transactionTypeSubtitle: "Palihug pagpili og matang sa transaksyon.",
    selectTransactionPlaceholder: "Pili og Transaksyon",
    noWindowsAvailable: "Walay bintana nga magamit para niini nga sangay",
    selectBranchFirst: "Pili og Sangay Una",
    proceedButton: "Padayon",
    processingButton: "Nagproseso...",
    popupErrorFillAllFields: "Palihug sulati ang tanang gikinahanglan nga field.",
    popupErrorFailedToLoadBranches: "Napakyas sa pag-load sa mga sangay.",
    popupErrorFailedToLoadWindows: "Napakyas sa pag-load sa mga bintana sa serbisyo para sa napili nga sangay.",
    popupErrorFailedToGetQueue: "Napakyas sa pagkuha sa numero sa linya. Palihug sulayi pag-usab sa ulahi.",
    popupSuccessQueueIssued: (ticketNumber) => `Ang imong numero sa linya ${ticketNumber} na-isyu na!`,
    popupErrorGeneratePDF: "Napakyas sa paghimo sa PDF. Palihug sulayi pag-usab.",

    // Ticket Display
    standardQueueTitle: "STANDARD NGA LINYA",
    priorityQueueTitle: "PRIORITY NGA LINYA",
    categoryDetail: "Kategorya:",
    nicknameDetail: "Palayaw:",
    branchDetail: "Sangay:",
    serviceCounterDetail: "Counter sa Serbisyo:",
    dateTimeIssuedDetail: "Petsa ug Oras Gi-isyu:",
    qrMessage: "Palihug i-scan ang QR code aron masusi ang imong dapit sa linya ug makakuha og real-time nga mga update.",
    ticketFooter: "LINGKOD UG PABAYAA KAMI SA TRABAHO",
    getPrintButton: "Pagkuha og Print",
    gotItButton: "Nasabtan! ✓",
  },
  Tagalog: {
    queueManagementTitle: "Pamamahala ng Pila",
    queueManagementSubtitle: "Kumuha ng numero ng pila kaagad",
    nameLabel: "Pangalan",
    namePlaceholder: "Ilagay ang iyong pangalan",
    nicknameLabel: "Palayaw",
    nicknamePlaceholder: "Ilagay ang iyong palayaw",
    selectBranchTitle: "PUMILI NG SANGAY",
    selectBranchSubtitle: "Piliin ang sangay para sa iyong transaksyon.",
    selectBranchPlaceholder: "Pumili ng Sangay",
    categoryTitle: "KATEGORYA",
    categorySubtitle: "Mangyaring pumili ng isang kategorya upang magpatuloy",
    standardCategory: "Standard",
    seniorPwdCategory: "Senior / PWD",
    transactionTypeTitle: "URI NG TRANSAKSYON",
    transactionTypeSubtitle: "Mangyaring pumili ng uri ng transaksyon.",
    selectTransactionPlaceholder: "Pumili ng Transaksyon",
    noWindowsAvailable: "Walang available na bintana para sa sangay na ito",
    selectBranchFirst: "Pumili Muna ng Sangay",
    proceedButton: "Magpatuloy",
    processingButton: "Nagpoproseso...",
    popupErrorFillAllFields: "Mangyaring punan ang lahat ng kinakailangang field.",
    popupErrorFailedToLoadBranches: "Nabigo ang pag-load ng mga sangay.",
    popupErrorFailedToLoadWindows: "Nabigo ang pag-load ng mga bintana ng serbisyo para sa napiling sangay.",
    popupErrorFailedToGetQueue: "Nabigo ang pagkuha ng numero ng pila. Pakisubukang muli sa ibang pagkakataon.",
    popupSuccessQueueIssued: (ticketNumber) => `Ang iyong numero ng pila ${ticketNumber} ay naisyu na!`,
    popupErrorGeneratePDF: "Nabigo ang pagbuo ng PDF. Pakisubukang muli.",

    // Ticket Display
    standardQueueTitle: "STANDARD NA PILA",
    priorityQueueTitle: "PRIORITY NA PILA",
    categoryDetail: "Kategorya:",
    nicknameDetail: "Palayaw:",
    branchDetail: "Sangay:",
    serviceCounterDetail: "Counter ng Serbisyo:",
    dateTimeIssuedDetail: "Petsa at Oras Inisyu:",
    qrMessage: "Mangyaring i-scan ang QR code upang suriin ang iyong lugar sa pila at makakuha ng real-time na mga update.",
    ticketFooter: "UMUPO AT HAYAAN KAMING MAGTRABAHO",
    getPrintButton: "Kumuha ng Print",
    gotItButton: "Nakuha! ✓",
  },
};


// Ensure QRious and PDF libraries are loaded globally
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

const loadPdfLibraries = () => {
  return new Promise((resolve, reject) => {
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

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script')
      .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script'))
      .then(() => resolve())
      .catch((error) => {
        console.error("Failed to load PDF libraries:", error);
        reject(error);
      });
  });
};

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

// Utility function to show popup messages
const showPopupMessage = (setPopup, type, message) => {
  setPopup({ type, message });
};


// Component to display the generated queue ticket modal
const QueueTicketDisplay = ({ ticketData, onClose, selectedLanguage }) => {
  const qrCanvasRef = useRef(null);
  const ticketRef = useRef(null); // Ref for the ticket content to be captured

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        await loadQriousScript(); // Ensure QRious is loaded

        if (qrCanvasRef.current && window.QRious) {
          // Data to encode in the QR code
          const qrContent = JSON.stringify({
            queueNumber: ticketData.queueNumber,
            category: ticketData.category,
            transaction: ticketData.transaction, // This will now be the windowName
            branchName: ticketData.branchName,
            counter: ticketData.counter, // Still using dummy counter for now
            name: ticketData.name,
            nickname: ticketData.nickname,
            timestamp: ticketData.dateTimeIssued,
          });

          // Generate QR code
          new window.QRious({
            element: qrCanvasRef.current,
            value: qrContent,
            size: 220,
            padding: 10,
            foreground: '#000',
            background: '#fff',
          });
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQrCode();
  }, [ticketData]);

  const handleGetPrint = async () => {
    try {
      await loadPdfLibraries(); // Ensure PDF libraries are loaded

      if (!ticketRef.current) {
        console.error("Ticket content reference is null. Cannot generate PDF.");
        return;
      }
      if (!window.html2canvas || !window.jspdf) {
        console.error("PDF libraries (html2canvas or jspdf) are not loaded.");
        return;
      }

      const canvas = await window.html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: ticketRef.current.offsetWidth,
        height: ticketRef.current.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);

      const imgAspectRatio = imgProps.width / imgProps.height;
      let finalImgWidth = pdfWidth;
      let finalImgHeight = pdfWidth / imgAspectRatio;

      if (finalImgHeight > pdfHeight) {
        finalImgHeight = pdfHeight;
        finalImgWidth = pdfHeight * imgAspectRatio;
      }

      const xOffset = (pdfWidth - finalImgWidth) / 2;
      const yOffset = (pdfHeight - finalImgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
      pdf.save(`QueueTicket_${ticketData.queueNumber}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      showPopupMessage("error", translations[selectedLanguage].popupErrorGeneratePDF); // Use translated popup for error
    }
  };


  const { queueNumber, category, nickname, transaction, counter, dateTimeIssued, branchName } = ticketData;

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
            <img src={SysIcon} alt="System Logo" className="ticket-header-logo" />
            <h2 className="ticket-title">
              {category === 'Standard' ? translations[selectedLanguage].standardQueueTitle : translations[selectedLanguage].priorityQueueTitle}
            </h2>
            <div className="ticket-number">{queueNumber}</div>
          </div>

          <div className="ticket-details">
            <div className="detail-row">
              <span className="detail-label">
                <CategoryIcon className="detail-icon" />
                {translations[selectedLanguage].categoryDetail}
              </span>
              <span className="detail-value">{category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <AccountCircleIcon className="detail-icon" />
                {translations[selectedLanguage].nicknameDetail}
              </span>
              <span className="detail-value">{nickname}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <BusinessIcon className="detail-icon" />
                {translations[selectedLanguage].branchDetail}
              </span>
              <span className="detail-value">{branchName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <MeetingRoomIcon className="detail-icon" />
                {translations[selectedLanguage].serviceCounterDetail}
              </span>
              <span className="detail-value">{transaction} (Counter {counter})</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <AccessTimeIcon className="detail-icon" />
                {translations[selectedLanguage].dateTimeIssuedDetail}
              </span>
              <span className="detail-value">{formattedDate} / {formattedTime}</span>
            </div>
          </div>

          <div className="qr-code-section">
            <canvas ref={qrCanvasRef} className="qr-code-canvas"></canvas>
            <p className="qr-message">{translations[selectedLanguage].qrMessage}</p>
          </div>

          <div className="ticket-footer">
            <span className="footer-icon">💡</span>
            <span className="footer-text">{translations[selectedLanguage].ticketFooter}</span>
          </div>
        </div>

        {/* Buttons for closing and downloading */}
        <div className="ticket-actions">
          <button className="download-pdf-btn" onClick={handleGetPrint}>
            {translations[selectedLanguage].getPrintButton}
          </button>
          <button className="notification-close" onClick={onClose}>
            {translations[selectedLanguage].gotItButton}
          </button>
        </div>
      </div>
    </div>
  );
};


const QueueManagement = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // 'Standard' or 'Senior / PWD'
  const [selectedTransactionWindowId, setSelectedTransactionWindowId] = useState(''); // Stores windowId
  const [showQueueTicket, setShowQueueTicket] = useState(false);
  const [queueTicketData, setQueueTicketData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // Default language
  const [branches, setBranches] = useState([]); // State to store fetched branches
  const [selectedBranchId, setSelectedBranchId] = useState(''); // State for selected branch ID
  const [serviceWindowsForBranch, setServiceWindowsForBranch] = useState([]); // Stores windows for the selected branch
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [popup, setPopup] = useState(null); // State for popup messages

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/branches`);
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        showPopupMessage(setPopup, "error", translations[selectedLanguage].popupErrorFailedToLoadBranches);
      }
    };
    fetchBranches();
  }, [selectedLanguage]);

  // Fetch service windows when selectedBranchId changes
  useEffect(() => {
    const fetchServiceWindows = async () => {
      if (selectedBranchId) {
        try {
          // Fetch windows for the selected branch
          const response = await axios.get(`${API_BASE_URL}/service-windows?branchId=${selectedBranchId}`);
          // Filter out windows that are not 'ON_LIVE' or not 'isActive' if necessary
          const activeLiveWindows = response.data.filter(window => window.isActive && window.visibilityStatus === 'ON_LIVE');
          setServiceWindowsForBranch(activeLiveWindows);
          setSelectedTransactionWindowId(''); // Reset transaction when branch changes
        } catch (error) {
          console.error(`Error fetching service windows for branch ${selectedBranchId}:`, error);
          showPopupMessage(setPopup, "error", translations[selectedLanguage].popupErrorFailedToLoadWindows);
          setServiceWindowsForBranch([]); // Clear windows on error
        }
      } else {
        setServiceWindowsForBranch([]); // Clear windows if no branch is selected
        setSelectedTransactionWindowId(''); // Reset transaction
      }
    };
    fetchServiceWindows();
  }, [selectedBranchId, selectedLanguage]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleTransactionSelect = (e) => {
    setSelectedTransactionWindowId(e.target.value);
  };

  const handleBranchSelect = (e) => {
    setSelectedBranchId(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleProceed = async () => {
    // Basic validation
    if (!name || !nickname || !selectedCategory || !selectedTransactionWindowId || !selectedBranchId) {
      showPopupMessage(setPopup, "error", translations[selectedLanguage].popupErrorFillAllFields);
      return;
    }

    setLoading(true); // Start loading

    // Map selected category to category_id from database schema
    let categoryId; // Changed variable name to match backend DTO expectation
    if (selectedCategory === 'Standard') {
      categoryId = 1;
    } else if (selectedCategory === 'Senior / PWD') {
      categoryId = 2;
    } else {
      categoryId = null; // Should not happen with current logic
    }

    // Find the selected branch name for the ticket display
    const selectedBranch = branches.find(b => b.branchId === parseInt(selectedBranchId));
    const branchNameForTicket = selectedBranch ? selectedBranch.branchName : 'N/A';

    // Find the selected service window details for the ticket display
    const selectedWindow = serviceWindowsForBranch.find(window => window.windowId === parseInt(selectedTransactionWindowId, 10));
    const transactionNameForTicket = selectedWindow ? selectedWindow.windowName || `Window ${selectedWindow.windowNumber}` : 'N/A';
    const counterForTicket = selectedWindow ? selectedWindow.windowNumber : 'N/A'; // Assuming windowNumber can act as counter for display

    try {
      const payload = {
        customerName: name,
        // customerNickname: nickname, // REMOVED: Backend does not expect this
        categoryId: categoryId, // CHANGED: From customerCategoryId to categoryId
        assignedToWindowId: parseInt(selectedTransactionWindowId, 10),
        branchId: parseInt(selectedBranchId, 10),
        currentStatusId: 1, // Assuming 1 is the ID for 'QUEUED' or initial status
      };

      // Backend endpoint for creating queue tickets
      const response = await axios.post(`${API_BASE_URL}/queue-tickets`, payload);
      const newTicket = response.data; // Assuming backend returns the created ticket object

      const newQueueNumber = newTicket.ticketNumber || 'N/A'; // Use backend generated ticket number
      
      const ticketDataForDisplay = {
        queueNumber: newQueueNumber,
        category: selectedCategory,
        nickname: nickname, // Keep nickname for frontend display in ticket
        transaction: transactionNameForTicket,
        counter: counterForTicket,
        dateTimeIssued: newTicket.queuedAt || new Date().toISOString(), // Use backend timestamp if available
        branchName: branchNameForTicket,
      };

      setQueueTicketData(ticketDataForDisplay);
      setShowQueueTicket(true);
      showPopupMessage(setPopup, "success", translations[selectedLanguage].popupSuccessQueueIssued(newTicket.ticketNumber));

      // Clear form fields
      setName('');
      setNickname('');
      setSelectedCategory('');
      setSelectedTransactionWindowId('');
      // setSelectedBranchId(''); // Uncomment if you want to clear branch too
    } catch (error) {
      console.error("Error issuing queue ticket:", error.response?.data || error.message);
      let errorMessage = translations[selectedLanguage].popupErrorFailedToGetQueue;
      if (error.response && error.response.data && error.response.data.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage += " " + error.response.data.message.join(', ');
        } else {
          errorMessage += " " + error.response.data.message;
        }
      }
      showPopupMessage(setPopup, "error", errorMessage);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleCloseQueueTicket = () => {
    setShowQueueTicket(false);
    setQueueTicketData(null);
  };

  const languages = ['English', 'Cebuano', 'Tagalog'];

  return (
    <div className="queue-page">
      <div className="queue-form">
        {/* Language Selector - Repositioned to top-left */}
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

        {/* Form Header */}
        <div className="form-header">
          <div className="form-header-icon">
            <img src={SysIcon} alt="System Icon" />
          </div>
          <h2 className="form-title">{translations[selectedLanguage].queueManagementTitle}</h2>
          <p className="form-subtitle">{translations[selectedLanguage].queueManagementSubtitle}</p>
        </div>

        {/* Name Input */}
        <div className="input-section">
          <label className="input-label">{translations[selectedLanguage].nameLabel}</label>
          <input
            type="text"
            placeholder={translations[selectedLanguage].namePlaceholder}
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Nickname Input */}
        <div className="input-section">
          <label className="input-label">{translations[selectedLanguage].nicknameLabel}</label>
          <input
            type="text"
            placeholder={translations[selectedLanguage].nicknamePlaceholder}
            className="text-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* Branch Selection */}
        <div className="branch-filter-section">
          <div className="section-header">
            <h3 className="section-title">{translations[selectedLanguage].selectBranchTitle}</h3>
            <p className="section-subtitle">{translations[selectedLanguage].selectBranchSubtitle}</p>
          </div>
          <select
            className="branch-dropdown"
            value={selectedBranchId}
            onChange={handleBranchSelect}
          >
            <option value="">{translations[selectedLanguage].selectBranchPlaceholder}</option>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div className="category-section">
          <div className="section-header">
            <h3 className="section-title">{translations[selectedLanguage].categoryTitle}</h3>
            <p className="section-subtitle">{translations[selectedLanguage].categorySubtitle}</p>
          </div>

          <div className="category-buttons">
            <button
              className={`category-btn ${selectedCategory === 'Standard' ? 'selected' : ''}`}
              onClick={() => handleCategorySelect('Standard')}
            >
              <img src={personicon} alt="Standard Icon" className="category-icon" />
              <span>{translations[selectedLanguage].standardCategory}</span>
            </button>
            <button
              className={`category-btn ${selectedCategory === 'Senior / PWD' ? 'selected' : ''}`}
              onClick={() => handleCategorySelect('Senior / PWD')}
            >
              <img src={careicon} alt="Senior / PWD Icon" className="category-icon" />
              <span>{translations[selectedLanguage].seniorPwdCategory}</span>
            </button>
          </div>
        </div>

        {/* Transaction Type (now dynamic based on selected branch's windows) */}
        <div className="transaction-section">
          <div className="section-header">
            <h3 className="section-title">{translations[selectedLanguage].transactionTypeTitle}</h3>
            <p className="section-subtitle">{translations[selectedLanguage].transactionTypeSubtitle}</p>
          </div>

          <select
            className="transaction-dropdown"
            value={selectedTransactionWindowId}
            onChange={handleTransactionSelect}
            disabled={!selectedBranchId || serviceWindowsForBranch.length === 0} // Disable if no branch selected or no windows
          >
            <option value="">
              {selectedBranchId ?
                (serviceWindowsForBranch.length > 0 ? translations[selectedLanguage].selectTransactionPlaceholder : translations[selectedLanguage].noWindowsAvailable)
                : translations[selectedLanguage].selectBranchFirst}
            </option>
            {serviceWindowsForBranch.map((window) => (
              <option key={window.windowId} value={window.windowId}>
                {window.windowName || `Window ${window.windowNumber}`} {/* Display window name or number */}
              </option>
            ))}
          </select>
        </div>

        {/* Proceed Button */}
        <button
          className="proceed-btn"
          onClick={handleProceed}
          disabled={loading || !name || !nickname || !selectedCategory || !selectedTransactionWindowId || !selectedBranchId}
        >
          {loading ? translations[selectedLanguage].processingButton : translations[selectedLanguage].proceedButton}
        </button>
      </div>

      {/* Queue Ticket Display Modal */}
      {showQueueTicket && queueTicketData && (
        <QueueTicketDisplay ticketData={queueTicketData} onClose={handleCloseQueueTicket} selectedLanguage={selectedLanguage} />
      )}

      {/* General Popup Message */}
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

export default QueueManagement;
