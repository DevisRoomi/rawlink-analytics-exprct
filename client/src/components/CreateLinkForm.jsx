import React, { useState } from 'react';

export default function CreateLinkForm({ onLinkCreated, inputRef }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanUrl = originalUrl.trim();
    if (!cleanUrl) {
      setFormError('Kolom Target URL tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_url: cleanUrl,
          custom_slug: customSlug.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan tautan ke server.');
      }

      // Reset form
      setOriginalUrl('');
      setCustomSlug('');
      setTitle('');

      if (onLinkCreated) {
        onLinkCreated(data.data, 'Tautan baru berhasil disimpan ke database.');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wireframe-panel">
      <div className="wireframe-panel-header">
        <span>[FORMULIR: PEMENDEK TAUTAN BARU]</span>
        <span>STATUS: FORM READY</span>
      </div>

      <div className="wireframe-panel-body">
        {formError && (
          <div
            style={{
              background: '#ffebeb',
              border: '1px solid #000',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '14px',
            }}
          >
            [PERINGATAN]: {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="wireframe-label">TARGET URL * (WAJIB)</label>
              <input
                ref={inputRef}
                type="text"
                className="wireframe-input"
                placeholder="https://example.com/artikel/analitik-data-2026"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label className="wireframe-label">CUSTOM SLUG (OPSIONAL, MIN 3 KARAKTER)</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    background: '#e0ded7',
                    border: '2px solid #000',
                    borderRight: 'none',
                    padding: '9px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  /r/
                </span>
                <input
                  type="text"
                  className="wireframe-input"
                  placeholder="link-saya"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="wireframe-label">LABEL / DESKRIPSI TAUTAN (OPSIONAL)</label>
              <input
                type="text"
                className="wireframe-input"
                placeholder="Dokumentasi Teknis API"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="submit"
              className="wireframe-btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '[MENYIMPAN KE SQLITE...]' : '[+] SIMPAN & BUAT RAWLINK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
