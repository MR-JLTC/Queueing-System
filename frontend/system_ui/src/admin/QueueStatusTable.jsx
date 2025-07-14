import React from "react";

const dummyRows = [
  { name: "John C.", number: "A131", category: "Standard", status: "Ongoing" },
  { name: "Vhea M.", number: "A132", category: "Priority", status: "Ongoing" },
  { name: "Zandrah O.", number: "A133", category: "Standard", status: "Waiting" },
   { name: "Ilka O.", number: "A134", category: "Priority", status: "Ongoing" },
   { name: "Ivy G.", number: "A135", category: "Standard", status: "Waiting" },
   { name: "Desidido M.", number: "A136", category: "Standard", status: "Ongoing" },
   { name: "Brenda M.", number: "A137", category: "Priority", status: "Waiting" },
   { name: "Mike W.", number: "A138", category: "Priority", status: "Waiting" },
   { name: "Frac S.", number: "A139", category: "Standard", status: "Waiting" },
   { name: "Nemo R.", number: "A135", category: "Standard", status: "Waiting" },
    { name: "Nemo R.", number: "A135", category: "Standard", status: "Waiting" }
];

const QueueStatusTable = () => (
  <div>
    {/* Move search and select OUTSIDE of .queue-status */}
    <h2 className="queue-status-title">Queues</h2>
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
  <table className="queue-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Number</th>
        <th>Category</th>
        <th>Status</th>
      </tr>
    </thead>
  </table>

  {/* Scrollable rows container */}
  <div className="table-body-scroll">
    <table className="queue-table">
      <tbody>
        {dummyRows.map((row, idx) => (
          <tr key={idx}>
            <td>{row.name}</td>
            <td>{row.number}</td>
            <td className={row.category === "Priority" ? "category-priority" : ""}>
              {row.category}
            </td>
            <td className={row.status === "Ongoing" ? "status-ongoing" : "status-waiting"}>
              {row.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
</div>
);

export default QueueStatusTable;
