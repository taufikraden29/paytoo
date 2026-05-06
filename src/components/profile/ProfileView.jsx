import React from 'react';
import { motion } from 'framer-motion';
import { User, Cloud, CloudUpload, CloudDownload, Settings, Trash2, Download } from 'lucide-react';

const ProfileView = ({ 
  user, 
  transactionsCount, 
  sheetUrl, 
  setSheetUrl, 
  isAutoSync, 
  setIsAutoSync, 
  onSyncToCloud, 
  onSyncFromCloud, 
  onResetData,
  onExportCSV,
  syncPending,
  fetchPending
}) => {
  return (
    <motion.div 
      className="profile-view"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="profile-header glass-card">
        <div className="profile-avatar">
          <User size={40} />
        </div>
        <h3>{user.name}</h3>
        <p>Member Premium</p>
      </div>
      
      <div className="profile-stats">
        <div className="p-stat glass-card">
          <p>Transaksi</p>
          <h4>{transactionsCount}</h4>
        </div>
        <div className="p-stat glass-card">
          <p>Point</p>
          <h4>1,250</h4>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Tools & Export</h3>
          <Download size={18} />
        </div>
        <div className="glass-card p-4">
          <button className="menu-item w-full flex items-center gap-3" onClick={onExportCSV}>
            <Download size={18} />
            <span>Point 4: Ekspor Riwayat ke CSV</span>
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Cloud Sync (Google Sheets)</h3>
          <Cloud size={18} className={syncPending || fetchPending ? 'animate-pulse' : ''} />
        </div>
        <div className="glass-card cloud-settings">
          <div className="input-group">
            <label>Google Web App URL</label>
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/..." 
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="sheet-url-input"
            />
          </div>

          <div className="toggle-group glass-card" style={{ padding: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CloudUpload size={18} style={{ color: isAutoSync ? 'var(--accent-primary)' : 'var(--text-dim)' }} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Auto-Sync</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Input otomatis ke sheet</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={isAutoSync} onChange={(e) => setIsAutoSync(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="cloud-actions">
            <button className="cloud-btn upload" onClick={onSyncToCloud} disabled={syncPending}>
              <CloudUpload size={18} />
              <span>{syncPending ? 'Mengirim...' : 'Ekspor ke Sheet'}</span>
            </button>
            <button className="cloud-btn download" onClick={onSyncFromCloud} disabled={fetchPending}>
              <CloudDownload size={18} />
              <span>{fetchPending ? 'Mengambil...' : 'Impor dari Sheet'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="profile-menu">
        <button className="menu-item glass-card"><Settings size={18} /> Pengaturan Akun</button>
        <button className="menu-item glass-card" style={{ color: '#ef4444' }} onClick={onResetData}>
          <Trash2 size={18} /> Reset Semua Data
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileView;
