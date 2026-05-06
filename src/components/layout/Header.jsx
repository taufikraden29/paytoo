import React from 'react';
import { User, Calculator, Search, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ 
  user, 
  setShowCalculator, 
  showSearch, 
  setShowSearch, 
  showNotifications, 
  setShowNotifications, 
  searchQuery, 
  setSearchQuery, 
  notifications 
}) => {
  return (
    <header className="header animate-slide-up">
      <div className="user-profile">
        <div className="avatar">
          <User size={20} />
        </div>
        <div>
          <p className="welcome-text">Halo, Selamat Pagi</p>
          <h2 className="user-name">{user.name}</h2>
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-btn" onClick={() => setShowCalculator(true)} title="Kalkulator">
          <Calculator size={20} />
        </button>
        <button className="icon-btn" onClick={() => setShowSearch(!showSearch)}><Search size={20} /></button>
        <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={20} />
          <div className="dot" />
        </button>
      </div>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            className="notif-dropdown glass-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {notifications.map(n => (
              <div key={n.id} className="notif-item">
                <p>{n.text}</p>
                <span>{n.time}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            className="search-overlay glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}><X size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
