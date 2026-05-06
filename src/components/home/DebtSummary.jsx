import React from 'react';
import { motion } from 'framer-motion';
import { HandCoins, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DebtSummary = ({ totalPiutang, piutangCount, totalHutang, hutangCount, onSeeDetail }) => {
  return (
    <section className="section">
      <div className="section-header">
        <h3>Status Piutang & Hutang</h3>
        <button className="text-btn" onClick={onSeeDetail}>Lihat Detail</button>
      </div>
      <motion.div 
        className="debt-summary-row"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="debt-stat-card glass-card piutang" onClick={onSeeDetail}>
          <div className="d-stat-icon">
            <HandCoins size={16} />
          </div>
          <div className="d-stat-info">
            <p>Total Piutang</p>
            <h4>{formatCurrency(totalPiutang)}</h4>
            <span className="d-count">{piutangCount} Catatan Aktif</span>
          </div>
        </div>
        <div className="debt-stat-card glass-card hutang" onClick={onSeeDetail}>
          <div className="d-stat-icon">
            <Wallet size={16} />
          </div>
          <div className="d-stat-info">
            <p>Total Hutang</p>
            <h4>{formatCurrency(totalHutang)}</h4>
            <span className="d-count">{hutangCount} Catatan Aktif</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DebtSummary;
