import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import "./QueueMonitoring.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const dataByTab = {
  Day: {
    cards: [
      { label: <>Total<br />Queued</>, value: 45, icon: "/src/assets/time.svg" },
      { label: "PWD", value: 10, icon: "/src/assets/pwd.svg" },
      { label: "Senior Citizens", value: 8, icon: "/src/assets/senior.svg" },
      { label: "Standard", value: 22, icon: "/src/assets/standard.svg" },
      { label: "Cancelled", value: 5, icon: "/src/assets/cancel.svg" }
    ],
    pie: [
      { name: "PWD", value: 10 },
      { name: "Senior Citizens", value: 8 },
      { name: "Standard", value: 22 },
      { name: "Cancelled", value: 5 }
    ]
  },
  Week: {
    cards: [
      { label: <>Total<br />Queued</>, value: 300, icon: "/src/assets/time.svg" },
      { label: "PWD", value: 60, icon: "/src/assets/pwd.svg" },
      { label: "Senior Citizens", value: 55, icon: "/src/assets/senior.svg" },
      { label: "Standard", value: 160, icon: "/src/assets/standard.svg" },
      { label: "Cancelled", value: 25, icon: "/src/assets/cancel.svg" }
    ],
    pie: [
      { name: "PWD", value: 60 },
      { name: "Senior Citizens", value: 55 },
      { name: "Standard", value: 160 },
      { name: "Cancelled", value: 25 }
    ]
  },
  Month: {
    cards: [
      { label: <>Total<br />Queued</>, value: 1020, icon: "/src/assets/time.svg" },
      { label: "PWD", value: 240, icon: "/src/assets/pwd.svg" },
      { label: "Senior Citizens", value: 180, icon: "/src/assets/senior.svg" },
      { label: "Standard", value: 520, icon: "/src/assets/standard.svg" },
      { label: "Cancelled", value: 80, icon: "/src/assets/cancel.svg" }
    ],
    pie: [
      { name: "PWD", value: 240 },
      { name: "Senior Citizens", value: 180 },
      { name: "Standard", value: 520 },
      { name: "Cancelled", value: 80 }
    ]
  },
  Year: {
    cards: [
      { label: <>Total<br />Queued</>, value: 12340, icon: "/src/assets/time.svg" },
      { label: "PWD", value: 3000, icon: "/src/assets/pwd.svg" },
      { label: "Senior Citizens", value: 2500, icon: "/src/assets/senior.svg" },
      { label: "Standard", value: 6000, icon: "/src/assets/standard.svg" },
      { label: "Cancelled", value: 840, icon: "/src/assets/cancel.svg" }
    ],
    pie: [
      { name: "PWD", value: 3000 },
      { name: "Senior Citizens", value: 2500 },
      { name: "Standard", value: 6000 },
      { name: "Cancelled", value: 840 }
    ]
  }
};

const QueueMonitoring = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("Day");

  const summaryData = dataByTab[activeTab].cards;
  const pieData = dataByTab[activeTab].pie;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="queue-monitoring">
      <h3 className="queue-history-title">Queue History</h3>

      {/* Date Range */}
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

      {/* Tabs */}
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

        {/* Summary Cards */}
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

        {/* Pie Chart + Legend */}
        <div
          style={{
            width: "100%",
            height: 300,
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                  >
                    {value}
                  </text>
                );
              }}
            >
              {COLORS.map((color, index) => (
                <Cell key={index} fill={color} />
              ))}
            </Pie>
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default QueueMonitoring;
