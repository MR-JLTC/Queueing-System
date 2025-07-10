// components/QueueMonitoring.jsx
import React from "react";

const QueueMonitoring = () => (
  <div className="queue-monitoring">
    <h3>QUEUE MONITORING</h3>
    <div className="history-controls">
      <input type="date" />
      <input type="date" />
    </div>
    <div className="time-filters">
      <button className="active">Day</button>
      <button>Week</button>
      <button>Month</button>
      <button>Year</button>
    </div>
    <div className="queue-stats">
      <div>Total Queued<br /><strong>300</strong></div>
      <div>PWD<br /><strong>150</strong></div>
      <div>Senior Citizens<br /><strong>100</strong></div>
      <div>Other Customers<br /><strong>80</strong></div>
      <div>Cancelled<br /><strong>20</strong></div>
    </div>
    <div className="pie-chart">
      <p>[Pie Chart Placeholder]</p>
    </div>
  </div>
);

export default QueueMonitoring;
