import React from 'react';
import './Card.css';

// A generic summary card — reused for workout plans, meal plans, and check-ins.
// Props:
//   title       (string)  — main heading
//   subtitle    (string)  — secondary line of text
//   badge       (string)  — small label, e.g. "Active"
//   stats       (array)   — [{ label: string, value: string|number }]
//   accentColor (string)  — CSS color for the left border stripe
function Card({ title, subtitle, badge, stats = [], accentColor }) {
  const borderStyle = accentColor ? { borderLeftColor: accentColor } : {};

  return (
    <div className="card" style={borderStyle}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {badge && <span className="card-badge">{badge}</span>}
      </div>

      {subtitle && <p className="card-subtitle">{subtitle}</p>}

      {stats.length > 0 && (
        <div className="card-stats">
          {stats.map((stat, index) => (
            <div key={index} className="card-stat">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Card;
