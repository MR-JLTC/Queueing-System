import React, { useState, useEffect } from "react";
import "./Dashboard.css";

// const branches = ["Main Branch", "Branch A", "Branch B"];

const Sidebar = ({ activeTab, setActiveTab, onLogoutClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [selectedBranch, setSelectedBranch] = useState("Main Branch");
  // const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // const toggleDropdown = () => setShowDropdown(!showDropdown);
  // const selectBranch = (branch) => {
  //   setSelectedBranch(branch);
  //   setShowDropdown(false);
  // };

  return (
    <aside className="sidebar">
      {/* Top part: header and nav */}
      <div className="sidebar-top">
        <div className="sidebar-header">
          <img src="/src/assets/me.jpg" alt="Admin" className="admin-avatar" />
          <div className="admin-name">
            <h4>Flint Marko</h4>
            <h6>Administrator</h6>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === "Dashboard" ? "active" : ""}
            onClick={() => setActiveTab("Dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "Queue Monitoring" ? "active" : ""}
            onClick={() => setActiveTab("Queue Monitoring")}
          >
            Queue Monitoring
          </button>
          <button
            className={activeTab === "Window Assigned" ? "active" : ""}
            onClick={() => setActiveTab("Window Assigned")}
          >
            Window Assigned
          </button>
          <button onClick={onLogoutClick}>Logout</button>
        </nav>
      </div>

      {/* Bottom part: logo, datetime, and branch */}
      <div className="sidebar-bottom">
        <div className="sidebar-logo">
          <img src="/src/assets/sys_logo.png" alt="Bahandi Logo" />
        </div>

        <div className="datetime">
          <h2>
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </h2>
          <p>
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="branch-box">Main Branch</div>
      </div>
    </aside>
  );
};

export default Sidebar;
