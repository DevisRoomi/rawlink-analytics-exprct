import React, { useState, useEffect } from 'react';

export default function Header({ onRefresh, isRefreshing }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="wireframe-panel" style={{ marginBottom: '20px' }}>
      <div className="wireframe-panel-header">
        <span>[TERMINAL: RAWLINK // URL SHORTENER & ANALYTICS]</span>
        <span>NODE: STABLE • SQLITE: NATIVE</span>
      </div>
      <div
        className="wireframe-panel-body"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: '1.2',
            }}
          >
            RAWLINK TRACKER
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
            Pencatatan analitik klik realtime: User-Agent, Waktu Klik, OS, Browser, dan Perangkat.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              border: '1px solid #000',
              padding: '6px 10px',
              background: '#fafaf8',
              fontSize: '11px',
              fontWeight: '700',
            }}
          >
            JAM SISTEM: {currentTime || 'MEMUAT...'}
          </div>

          <button
            className="wireframe-btn sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Segarkan data dari database"
          >
            {isRefreshing ? '[MEMPERBARUI...]' : '[REFRESH DATA]'}
          </button>
        </div>
      </div>
    </header>
  );
}
