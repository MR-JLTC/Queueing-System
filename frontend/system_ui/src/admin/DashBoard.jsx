import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import SummaryCards from "./SummaryCards";
import QueueStatusTable from "./QueueStatusTable";
import QueueMonitoring from "./QueueMonitoring"; // <-- Include it
import "./dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="dashboard-content">
        <DashboardHeader activeTab={activeTab} />


        {activeTab === "Dashboard" && (
          <>
            <SummaryCards />
            <QueueStatusTable />
          </>
        )}

        {activeTab === "Queue Monitoring" && <QueueMonitoring />}
        
        {/* You can add more conditions for other tabs if needed */}
      </main>
    </div>
  );
};

export default Dashboard;
