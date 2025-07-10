// components/Sidebar.jsx
import React, { useState } from "react";
import "./Dashboard.css";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/src/assets/me.jpg" alt="Admin" className="admin-avatar" />
        <div>
          <h4 className="admin-name">Decidido Mohabal</h4>
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
        <button
          className={activeTab === "Logout" ? "active" : ""}
          onClick={() => setActiveTab("Logout")}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
