import React from "react";
import { Color } from "cesium";

const MoonUI = ({ moonData, onViewChange, currentView }) => {
  if (!moonData) return <div className="moon-ui">Loading moon data...</div>;

  const getMoonPhaseIcon = (phase) => {
    if (phase.includes("New")) return "🌑";
    if (phase.includes("First")) return "🌓";
    if (phase.includes("Full")) return "🌕";
    if (phase.includes("Last")) return "🌗";
    if (phase.includes("Waxing")) return "🌔";
    if (phase.includes("Waning")) return "🌖";
    return "🌘";
  };

  return (
    <div className="moon-ui">
      <h3>
        {getMoonPhaseIcon(moonData.phase)} Moon Status
        <span className="view-toggle">
          <button 
            onClick={() => onViewChange('earth')}
            className={currentView === 'earth' ? 'active' : ''}
          >
            Earth View
          </button>
          <button 
            onClick={() => onViewChange('moon')}
            className={currentView === 'moon' ? 'active' : ''}
          >
            Moon View
          </button>
        </span>
      </h3>
      
      <div className="moon-stats">
        <div className="stat-item">
          <span className="stat-label">Distance:</span>
          <span className="stat-value">{(moonData.distance/1000).toFixed(0)} km</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Phase:</span>
          <span className="stat-value">{moonData.phase}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Illumination:</span>
          <span className="stat-value">{(moonData.illumination * 100).toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Age:</span>
          <span className="stat-value">{moonData.age} days</span>
        </div>
      </div>
    </div>
  );
};

export default MoonUI;