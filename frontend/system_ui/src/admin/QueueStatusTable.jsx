import React from "react";

const dummyRows = [
  { name: "John C.", number: "A131", category: "Standard", status: "Ongoing" },
  { name: "Vhea M.", number: "A132", category: "Priority", status: "Ongoing" },
  { name: "Zandrah O.", number: "A133", category: "Standard", status: "Waiting" }
];

const QueueStatusTable = () => (
  <div>
    {/* Move search and select OUTSIDE of .queue-status */}
    <h2 className="queue-status-title">Queue Status</h2>
    <div className="queue-controls">
      <div className="queue-search">
        <input type="text" placeholder="Search..." />
        <button type="button" className="search-button">
          <img src="/src/assets/search.svg" alt="Search" />
        </button>
      </div>
      <select>
        <option>Select Counter</option>
      </select>
    </div>

    {/* Card-like container with table only */}
    <div className="queue-status">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dummyRows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.name}</td>
              <td>{row.number}</td>
              <td>{row.category}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default QueueStatusTable;
