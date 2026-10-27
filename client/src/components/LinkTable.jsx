import React, { useState } from 'react';
import { SkeletonRow } from './SkeletonLoader';
import EmptyState from './EmptyState';

export default function LinkTable({
  links = [],
  isLoading = false,
  onViewAnalytics,
  onDeleteLink,
  onFocusInput,
}) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    const fullUrl = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }) +
        ' ' +
        d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return isoString;
    }
  };

  return (
    <div className="wireframe-panel">
      <div className="wireframe-panel-header">
        <span>[TABEL REGISTER: TAUTAN AKTIF]</span>
        <span>JUMLAH TERDATA: {links.length} ITEM</span>
      </div>

      <div className="wireframe-panel-body" style={{ padding: '0' }}>
        <div className="wireframe-table-wrapper" style={{ border: 'none' }}>
          <table className="wireframe-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>KODE TAUTAN</th>
                <th>TARGET URL & DESKRIPSI</th>
                <th style={{ width: '100px', textAlign: 'center' }}>TOTAL KLIK</th>
                <th style={{ width: '170px' }}>WAKTU DIBUAT</th>
                <th style={{ width: '220px', textAlign: 'right' }}>OPERASI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px' }}>
                    <EmptyState onFocusInput={onFocusInput} />
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '13px' }}>/{link.code}</strong>
                        <button
                          className="wireframe-btn sm"
                          onClick={() => handleCopy(link.code)}
                          title="Salin tautan singkat ke clipboard"
                        >
                          {copiedCode === link.code ? '[TERSALIN]' : '[COPY]'}
                        </button>
                      </div>
                    </td>

                    <td>
                      {link.title && (
                        <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                          {link.title}
                        </div>
                      )}
                      <a
                        href={link.original_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#000',
                          textDecoration: 'underline',
                          fontSize: '11px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {link.original_url}
                      </a>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          border: '1px solid #000',
                          padding: '3px 8px',
                          background: link.click_count > 0 ? '#000' : '#f0eee6',
                          color: link.click_count > 0 ? '#fff' : '#000',
                          fontWeight: '800',
                          fontSize: '13px',
                        }}
                      >
                        {link.click_count}
                      </span>
                    </td>

                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatDate(link.created_at)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <a
                          href={`/r/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="wireframe-btn sm"
                          style={{ textDecoration: 'none' }}
                          title="Buka tautan (merekam klik baru)"
                        >
                          [BUKA &rarr;]
                        </a>

                        <button
                          className="wireframe-btn sm primary"
                          onClick={() => onViewAnalytics(link.code)}
                          title="Lihat rincian analitik perangkat & log klik"
                        >
                          [ANALITIK]
                        </button>

                        <button
                          className="wireframe-btn sm danger"
                          onClick={() => onDeleteLink(link.code)}
                          title="Hapus tautan ini"
                        >
                          [DEL]
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
