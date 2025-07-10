import React, { useState } from 'react';
import './CounterQueueSystem.css';

const QueueSystem = () => {
  const [currentQueue, setCurrentQueue] = useState({
    ongoing: 131,
    pending: 132,
    queue: [133, 134, 135, 136]
  });

  const [showCounter, setShowCounter] = useState(false);

  const handleConfirm = () => {
    // Move to next number in queue
    const nextNumber = currentQueue.queue[0];
    if (nextNumber) {
      setCurrentQueue(prev => ({
        ongoing: prev.pending,
        pending: nextNumber,
        queue: prev.queue.slice(1)
      }));
    }
  };

  const toggleCounter = () => {
    setShowCounter(!showCounter);
  };

  return (
    <div className="queue-container">
      <div className="queue-layout">
        {/* Left Panel - Current Service */}
        <div className="queue-panel left-panel">
          <div className="number-card ongoing">
            <div className="number">{currentQueue.ongoing}</div>
            <div className="status">ON GOING</div>
          </div>
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="counter-btn" onClick={toggleCounter}>
            <span>Counter</span>
            <span className="counter-icon">⊞</span>
          </button>
        </div>

        {/* Right Panel - Queue Status */}
        <div className="queue-panel right-panel">
          <div className="number-card pending">
            <div className="number">{currentQueue.pending}</div>
            <div className="status">PENDING</div>
          </div>
          
          <div className="queue-section">
            <h3 className="queue-title">ON QUEUE</h3>
            <div className="queue-numbers">
              {currentQueue.queue.map((number) => (
                <div key={number} className="queue-number">
                  {number}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Modal/Overlay */}
      {showCounter && (
        <div className="counter-overlay" onClick={toggleCounter}>
          <div className="counter-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Counter Display</h3>
            <div className="counter-display">
              <div className="counter-current">
                <span>Now Serving:</span>
                <div className="counter-number">{currentQueue.ongoing}</div>
              </div>
              <div className="counter-next">
                <span>Next:</span>
                <div className="counter-number">{currentQueue.pending}</div>
              </div>
            </div>
            <button className="close-btn" onClick={toggleCounter}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueSystem;