import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const TodayCard = ({ todayStats }) => {
  return (
    <motion.div 
      className="today-card glass-card"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.05 }}
    >
      <div className="today-header">
        <div className="today-title">
          <div className="today-badge">Hari Ini</div>
          <h3>Total Transaksi</h3>
        </div>
        <div className="today-count">{todayStats.count} Transaksi</div>
      </div>
      <div className="today-grid">
        <div className="today-item income">
          <div className="today-icon"><TrendingUp size={14} /></div>
          <div className="today-info">
            <p>Pemasukan</p>
            <p className="today-amount">+{formatCurrency(todayStats.income)}</p>
          </div>
        </div>
        <div className="today-item expense">
          <div className="today-icon"><TrendingDown size={14} /></div>
          <div className="today-info">
            <p>Pengeluaran</p>
            <p className="today-amount">-{formatCurrency(todayStats.expense)}</p>
          </div>
        </div>
      </div>
      <div className="today-net-row">
        <div className={`today-net-badge ${todayStats.net >= 0 ? 'plus' : 'minus'}`}>
          {todayStats.net >= 0 ? 'Surplus' : 'Defisit'}: {formatCurrency(Math.abs(todayStats.net))}
        </div>
      </div>
    </motion.div>
  );
};

export default TodayCard;
