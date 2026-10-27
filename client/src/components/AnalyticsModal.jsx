import React, { useEffect, useState } from 'react';
import { SkeletonMetrics, SkeletonRow } from './SkeletonLoader';

export default function AnalyticsModal({ code, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    fetch(`/api/links/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data analitik link.');
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, onClose]);

  if (!code) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>[TERMINAL ANALITIK: /{code}]</span>
          <button
            onClick={onClose}
            className="wireframe-btn sm"
            style={{ padding: '2px 8px' }}
          >
            [TUTUP / ESC]
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                border: '1px solid #000',
                background: '#ffebeb',
                padding: '12px',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              [KESALAHAN]: {error}
            </div>
          )}

          {loading ? (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  MEMUAT DATA ANALITIK DARI SQLITE...
                </span>
              </div>
              <SkeletonMetrics />
              <div style={{ border: '2px solid #000', marginTop: '16px' }}>
                <table className="wireframe-table">
                  <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
              </div>
            </div>
          ) : data ? (
            <>
              {/* Top Link Summary */}
              <div
                style={{
                  border: '2px solid #000',
                  background: '#fafaf8',
                  padding: '12px 14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  TARGET URL TUJUAN:
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    wordBreak: 'break-all',
                    color: '#000',
                  }}
                >
                  {data.link.original_url}
                </div>
                {data.link.title && (
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    Label: <strong>{data.link.title}</strong>
                  </div>
                )}
              </div>

              {/* 3-column Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {/* OS Breakdown */}
                <div style={{ border: '1px solid #000', padding: '10px', background: '#fff' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      borderBottom: '1px solid #000',
                      paddingBottom: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    SISTEM OPERASI (OS)
                  </div>
                  {data.metrics.breakdown_os.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#666' }}>Belum ada data</div>
                  ) : (
                    data.metrics.breakdown_os.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          padding: '3px 0',
                          borderBottom: '1px dashed #ddd',
                        }}
                      >
                        <span>{item.name}</span>
                        <strong>{item.count} klik</strong>
                      </div>
                    ))
                  )}
                </div>

                {/* Browser Breakdown */}
                <div style={{ border: '1px solid #000', padding: '10px', background: '#fff' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      borderBottom: '1px solid #000',
                      paddingBottom: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    PERAMBAN (BROWSER)
                  </div>
                  {data.metrics.breakdown_browser.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#666' }}>Belum ada data</div>
                  ) : (
                    data.metrics.breakdown_browser.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          padding: '3px 0',
                          borderBottom: '1px dashed #ddd',
                        }}
                      >
                        <span>{item.name}</span>
                        <strong>{item.count} klik</strong>
                      </div>
                    ))
                  )}
                </div>

                {/* Device Type Breakdown */}
                <div style={{ border: '1px solid #000', padding: '10px', background: '#fff' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      borderBottom: '1px solid #000',
                      paddingBottom: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    TIPE PERANGKAT
                  </div>
                  {data.metrics.breakdown_device.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#666' }}>Belum ada data</div>
                  ) : (
                    data.metrics.breakdown_device.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          padding: '3px 0',
                          borderBottom: '1px dashed #ddd',
                        }}
                      >
                        <span>{item.name}</span>
                        <strong>{item.count} klik</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detailed Click Log */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: '800' }}>
                    [LOG AUDIT KLIK INDIVIDUAL — {data.recent_clicks.length} ENTRI TERAKHIR]
                  </span>
                  <span style={{ fontSize: '11px', color: '#555' }}>SUMBER: SQLITE DATABASE</span>
                </div>

                {data.recent_clicks.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed #000',
                      padding: '24px',
                      textAlign: 'center',
                      fontSize: '12px',
                    }}
                  >
                    Tautan ini belum memiliki catatan klik. Buka tautan di tab baru untuk memicu pencatatan pertama.
                  </div>
                ) : (
                  <div className="wireframe-table-wrapper" style={{ maxHeight: '300px' }}>
                    <table className="wireframe-table">
                      <thead>
                        <tr>
                          <th>WAKTU KLIK</th>
                          <th>HASH IP</th>
                          <th>PERANGKAT</th>
                          <th>OS & BROWSER</th>
                          <th>REFERRER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent_clicks.map((click) => (
                          <tr key={click.id}>
                            <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                              {new Date(click.clicked_at).toLocaleString('id-ID')}
                            </td>
                            <td style={{ fontSize: '11px' }}>
                              <code>{click.ip_hash}</code>
                            </td>
                            <td style={{ fontSize: '11px' }}>
                              <span
                                style={{
                                  border: '1px solid #000',
                                  padding: '1px 5px',
                                  background: '#eee',
                                  fontSize: '10px',
                                }}
                              >
                                {click.device_type}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px' }}>
                              <strong>{click.os}</strong> / {click.browser}{' '}
                              {click.browser_version ? `v${click.browser_version}` : ''}
                            </td>
                            <td style={{ fontSize: '10px', color: '#555', wordBreak: 'break-all' }}>
                              {click.referrer || '[DIRECT / EMPTY]'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
