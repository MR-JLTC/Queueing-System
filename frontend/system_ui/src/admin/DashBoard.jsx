import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import SummaryCards from "./SummaryCards";
import QueueStatusTable from "./QueueStatusTable";
import QueueMonitoring from "./QueueMonitoring"; 
import "./dashboard.css";
import { useEffect } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate(); // ✅ Hook for navigation
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login");
    }else console.log("Value: " + isLoggedIn);
  }, []);
  

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    navigate("/login");
    // window.location.reload();     // ✅ Redirect to login
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogoutClick={() => setShowLogoutConfirm(true)} 
      />

      <main className={`dashboard-content ${showLogoutConfirm ? "blurred" : ""}`}>
        <DashboardHeader activeTab={activeTab} />

        {activeTab === "Dashboard" && (
          <>
            <SummaryCards />
            <QueueStatusTable />
          </>
        )}

        {activeTab === "Queue Monitoring" && <QueueMonitoring />}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="modal-content">
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="confirm" onClick={handleLogout}>Yes</button>
              <button className="cancel" onClick={() => setShowLogoutConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
