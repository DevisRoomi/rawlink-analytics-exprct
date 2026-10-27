import React from 'react';

export default function EmptyState({ onFocusInput }) {
  return (
    <div
      style={{
        border: '2px dashed #000',
        padding: '36px 20px',
        textAlign: 'center',
        background: '#fafaf6',
        margin: '12px 0',
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        [STATUS: BASIS DATA TAUTAN KOSONG]
      </div>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          maxWidth: '520px',
          margin: '0 auto 16px auto',
        }}
      >
        Belum ada link yang dipendekkan. Masukkan URL tujuan pada formulir di atas untuk membuat tautan singkat pertama dan mulai memantau analitik klik.
      </p>

      {onFocusInput && (
        <button
          className="wireframe-btn sm"
          onClick={onFocusInput}
        >
          [+] BUAT TAUTAN PERTAMA
        </button>
      )}
    </div>
  );
}
