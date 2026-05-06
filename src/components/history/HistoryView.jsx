import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { formatCurrency, getAmountClass } from '../../utils/formatters';

const HistoryView = ({ transactions, onDelete }) => {
  return (
    <motion.div 
      className="history-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="section">
        <h3>Riwayat Transaksi</h3>
        <div className="transaction-list">
          {transactions.map((t, i) => (
            <motion.div 
              key={t.id} 
              className="transaction-item glass-card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="t-icon-box">
                <span className="t-emoji">{t.icon || (t.type === 'income' ? '💰' : '💸')}</span>
              </div>
              <div className="t-info">
                <p className="t-title">{t.title}</p>
                <p className="t-category">{t.category} • {t.date}</p>
              </div>
              <div className="t-actions">
                <p className={`t-amount ${getAmountClass(t)}`}>
                  {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                </p>
                <button className="delete-btn" onClick={() => onDelete(t.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default HistoryView;
