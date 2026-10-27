import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import CreateLinkForm from './components/CreateLinkForm';
import LinkTable from './components/LinkTable';
import AnalyticsModal from './components/AnalyticsModal';
import SystemAlert from './components/SystemAlert';
import { SkeletonCard } from './components/SkeletonLoader';

export default function App() {
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeAnalyticsCode, setActiveAnalyticsCode] = useState(null);
  const [alert, setAlert] = useState(null);

  const inputRef = useRef(null);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const [linksRes, statsRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/stats'),
      ]);

      if (!linksRes.ok || !statsRes.ok) {
        throw new Error('Gagal mengambil data dari server API.');
      }

      const linksData = await linksRes.json();
      const statsData = await statsRes.json();

      setLinks(linksData.data || []);
      setStats(statsData);
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Koneksi ke backend gagal: ' + err.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLinkCreated = (newLink, message) => {
    setLinks((prev) => [newLink, ...prev]);
    setAlert({ type: 'success', message });
    fetchData(true);
  };

  const handleDeleteLink = async (code) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus tautan /${code}? Semua data riwayat klik tautan ini di SQLite akan dihapus secara permanen.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus tautan.');
      }

      setLinks((prev) => prev.filter((l) => l.code !== code));
      setAlert({
        type: 'success',
        message: `Tautan /${code} berhasil dihapus dari database.`,
      });
      fetchData(true);
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Gagal menghapus tautan: ' + err.message,
      });
    }
  };

  const handleFocusCreate = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="wireframe-container">
      {/* 1. Header Terminal */}
      <Header
        onRefresh={() => fetchData(true)}
        isRefreshing={refreshing}
      />

      {/* 2. System Alerts / Notifications */}
      {alert && (
        <SystemAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* 3. Global Stats Grid */}
      <div className="stat-grid">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="TOTAL TAUTAN"
              value={stats ? stats.total_links : links.length}
              subtext="Tersimpan dalam SQLite"
              tag="LINKS"
            />
            <StatCard
              title="TOTAL KLIK"
              value={stats ? stats.total_clicks : 0}
              subtext="Akumulasi dari seluruh tautan"
              tag="AUDIT"
            />
            <StatCard
              title="SISTEM OPERASI UTAMA"
              value={
                stats && stats.top_os && stats.top_os[0]
                  ? `${stats.top_os[0].name}`
                  : '-'
              }
              subtext={
                stats && stats.top_os && stats.top_os[0]
                  ? `${stats.top_os[0].count} klik tercatat`
                  : 'Belum ada data'
              }
              tag="OS"
            />
            <StatCard
              title="PERAMBAN DOMINAN"
              value={
                stats && stats.top_browser && stats.top_browser[0]
                  ? `${stats.top_browser[0].name}`
                  : '-'
              }
              subtext={
                stats && stats.top_browser && stats.top_browser[0]
                  ? `${stats.top_browser[0].count} klik tercatat`
                  : 'Belum ada data'
              }
              tag="BROWSER"
            />
          </>
        )}
      </div>

      {/* 4. Form Pembuat Tautan */}
      <CreateLinkForm
        onLinkCreated={handleLinkCreated}
        inputRef={inputRef}
      />

      {/* 5. Tabel Register Tautan */}
      <LinkTable
        links={links}
        isLoading={loading}
        onViewAnalytics={(code) => setActiveAnalyticsCode(code)}
        onDeleteLink={handleDeleteLink}
        onFocusInput={handleFocusCreate}
      />

      {/* 6. Footer Wireframe */}
      <footer
        style={{
          borderTop: '2px solid #000',
          padding: '16px 0',
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <strong>RAWLINK TRACKER</strong> // ARSITEKTUR ANALITIK TAUTAN MINIMALIS
        </div>
        <div>
          PENGEMBANG: <strong>DEVIS RUMI</strong> • GITHUB: <code>DevisRoomi</code>
        </div>
      </footer>

      {/* 7. Modal Drawer Analitik */}
      {activeAnalyticsCode && (
        <AnalyticsModal
          code={activeAnalyticsCode}
          onClose={() => setActiveAnalyticsCode(null)}
        />
      )}
    </div>
  );
}
