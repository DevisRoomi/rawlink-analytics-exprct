import React from 'react';

export function SkeletonCard() {
  return (
    <div className="stat-card" style={{ opacity: 0.8 }}>
      <div className="skeleton-box" style={{ height: '14px', width: '60%', marginBottom: '12px' }} />
      <div className="skeleton-box" style={{ height: '36px', width: '45%', marginBottom: '8px' }} />
      <div className="skeleton-box" style={{ height: '12px', width: '80%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td>
        <div className="skeleton-box" style={{ height: '16px', width: '90px' }} />
      </td>
      <td>
        <div className="skeleton-box" style={{ height: '16px', width: '180px', marginBottom: '4px' }} />
        <div className="skeleton-box" style={{ height: '12px', width: '260px' }} />
      </td>
      <td style={{ textAlign: 'center' }}>
        <div className="skeleton-box" style={{ height: '18px', width: '40px', margin: '0 auto' }} />
      </td>
      <td>
        <div className="skeleton-box" style={{ height: '14px', width: '130px' }} />
      </td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <div className="skeleton-box" style={{ height: '24px', width: '50px' }} />
          <div className="skeleton-box" style={{ height: '24px', width: '60px' }} />
          <div className="skeleton-box" style={{ height: '24px', width: '45px' }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonMetrics() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' }}>
      <div className="skeleton-box" style={{ height: '100px' }} />
      <div className="skeleton-box" style={{ height: '100px' }} />
      <div className="skeleton-box" style={{ height: '100px' }} />
    </div>
  );
}

export default {
  SkeletonCard,
  SkeletonRow,
  SkeletonMetrics,
};
