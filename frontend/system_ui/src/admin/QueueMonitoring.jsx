import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import "./QueueMonitoring.css"; // <- optional custom styling

const QueueMonitoring = () => {
  const [activeTab, setActiveTab] = useState("Day");

  const data = [
    { name: "Total Queued", value: 120, color: "#ff0050" },
    { name: "PWD", value: 15, color: "#a8ff00" },
    { name: "Senior Citizen", value: 30, color: "#00d2ff" },
    { name: "Other Customers", value: 75, color: "#3f3f46" },
    { name: "Cancelled", value: 15, color: "#ffeb3b" },
  ];

  return (
    <div className="queue-monitoring-container">
      <div className="queue-monitoring-header">
        <div>
         <h2 style={{ borderBottom: "2px solid white" }}>Queue Monitoring</h2>
          <p>1:19 PM — Monday, June 23, 2025</p>
        </div>
        <div className="date-range">
          <label>
            Date From:
            <input type="date" />
          </label>
          <label>
            Date To:
            <input type="date" />
          </label>
        </div>
      </div>

      <div className="tab-buttons">
        {["Day", "Week", "Month", "Year"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active-tab" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="queue-stats">
        {data.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="icon">{item.value}</div>
            <p>{item.name}</p>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <h3>Queue Breakdown</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default QueueMonitoring;
