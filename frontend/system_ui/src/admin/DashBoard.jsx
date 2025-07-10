
import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import SummaryCards from "./SummaryCards";
import QueueStatusTable from "./QueueStatusTable";
// import QueueMonitoring from "./QueueMonitoring";
import "./dashboard.css";

const Dashboard = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="dashboard-content">
      <DashboardHeader />
      <SummaryCards />
      <QueueStatusTable />
      {/* <QueueMonitoring /> */}
      {/* <Sidebar/> */}
    </main>
  </div>
);

export default Dashboard;
