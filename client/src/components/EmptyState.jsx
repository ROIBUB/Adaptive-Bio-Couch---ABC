import React from 'react';
import './EmptyState.css';

export default function EmptyState({ icon, title, description, cta }) {
  return (
    <div className="empty-state-block">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {cta && (
        <button className="empty-state-cta" onClick={cta.onClick}>
          {cta.label}
        </button>
      )}
    </div>
  );
}
