import React from 'react';

export default function StatCard({ title, value, subtext, tag }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stat-card-title" style={{ border: 'none', padding: 0, margin: 0 }}>
          {title}
        </span>
        {tag && (
          <span
            style={{
              fontSize: '10px',
              border: '1px solid #000',
              padding: '2px 4px',
              background: '#f0eee6',
              fontWeight: '700',
            }}
          >
            {tag}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      <div className="stat-card-val">{value}</div>
      <div className="stat-card-sub">{subtext}</div>
    </div>
  );
}
