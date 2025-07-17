import React from "react";

const data = [
  { label: <>Total<br />Queued</>, value: 120, icon: "/src/assets/hourglass.svg" },
  { label: "Served", value: 85, icon: "/src/assets/check.svg" },
  { label: "Requeues", value: 10, icon: "/src/assets/standard.svg" },
  { label: "Cancelled", value: 15, icon: "/src/assets/cancel.svg" }
];

const SummaryCards = () => (
  <div className="summary-cards">
    {data.map((card, idx) => (
      <div className="summary-card" key={idx}>
        <div className="icon-label-row">
          <div className="icon-box">
            <img src={card.icon} alt="icon" className="card-icon" />
          </div>
          <p className="card-label">{card.label}</p>
        </div>
        <h3>{card.value}</h3>
      </div>
    ))}
  </div>
);

export default SummaryCards;
