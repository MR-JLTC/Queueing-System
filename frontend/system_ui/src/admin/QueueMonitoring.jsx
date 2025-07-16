  import React, { useState } from "react";
  import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
  import "./QueueMonitoring.css"; // Make sure the CSS below is in here

  const pieData = [
    { name: "PWD", value: 30 },
    { name: "Senior Citizens", value: 25 },
    { name: "Standard", value: 60 },
    { name: "Cancelled", value: 10 }
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const QueueMonitoring = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("Day");

    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };

    const summaryData = [
      { label: <>Total<br />Queued</>, value: 120, icon: "/src/assets/time.svg" },
      { label: "PWD", value: 30, icon: "/src/assets/pwd.svg" },
      { label: "Senior Citizens", value: 25, icon: "/src/assets/senior.svg" },
      { label: "Standard", value: 60, icon: "/src/assets/standard.svg" },
      { label: "Cancelled", value: 10, icon: "/src/assets/cancel.svg" }
    ];

    return (
      <div className="queue-monitoring">
        {/* Date range controls */}
        <h3 className="queue-history-title">Queue History</h3>
        <div className="date-range-filters">
          <div className="date-field">
            <label htmlFor="dateFrom">Date From:</label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="date-field">
            <label htmlFor="dateTo">Date To:</label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Monitoring tabs */}
        <div className="queue-monitoring-content">
          <div className="monitoring-tabs">
            {["Day", "Week", "Month", "Year"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="queue-monitoring-cards">
            {summaryData.map((mcard, idx) => (
              <div className="monitoring-card" key={idx}>
                <div className="queue-monitoring-card-content">
    <div className="monitoring-icon-box">
      <img src={mcard.icon} alt="icon" className="card-icon" />
    </div>
    <h3 className="mcard-value">{mcard.value}</h3>
    <p className="mcard-label">{mcard.label}</p>
  </div>

              
              </div>
            ))}
          </div>


     <div style={{ width: "100%", height: 300, marginTop: "40px" }}>
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div> 


        </div>
      </div> 
    );
};

  export default QueueMonitoring;
