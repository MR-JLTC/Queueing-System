import React, { useState, useEffect } from "react";

const branches = ["Main Branch", "Branch A", "Branch B"];

const DashboardHeader = () => {
  const [selectedBranch, setSelectedBranch] = useState("Main Branch");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const selectBranch = (branch) => {
    setSelectedBranch(branch);
    setShowDropdown(false);
  };

  return (
   <div className="dashboard-header">
  <div className="datetime">
    <h2>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</h2>
    <p>{currentTime.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</p>
  </div>

  <div className="dashboard-title">
    <h1>ADMIN DASHBOARD</h1>
  </div>


      <div className="branch-dropdown">
        <button className="branch-button" onClick={toggleDropdown}>
          {selectedBranch} ▼
        </button>
        {showDropdown && (
          <ul className="branch-menu">
            {branches.map((branch, index) => (
              <li key={index} onClick={() => selectBranch(branch)}>
                {branch}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
