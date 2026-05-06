import React from 'react';
import { Home, PieChart, HandCoins, History, User, Calendar } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => setActiveTab('stats')}
      >
        <PieChart size={22} />
        <span>Stats</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveTab('calendar')}
      >
        <Calendar size={22} />
        <span>Kalender</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'debts' ? 'active' : ''}`}
        onClick={() => setActiveTab('debts')}
      >
        <HandCoins size={22} />
        <span>Piutang</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <History size={22} />
        <span>History</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
