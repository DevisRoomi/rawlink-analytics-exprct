import React from 'react';

export default function SystemAlert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      style={{
        border: '2px solid #000',
        background: isError ? '#ffebeb' : isSuccess ? '#ebfaeb' : '#fff',
        boxShadow: '3px 3px 0px #000',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: '700',
      }}
    >
      <div>
        <span>{isError ? '[KESALAHAN SISTEM]: ' : isSuccess ? '[SUKSES]: ' : '[CATATAN]: '}</span>
        <span style={{ fontWeight: 'normal' }}>{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #000',
            cursor: 'pointer',
            padding: '2px 6px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          [TUTUP]
        </button>
      )}
    </div>
  );
}
