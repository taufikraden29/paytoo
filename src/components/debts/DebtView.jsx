import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DebtView = ({ debts, onSettle, onDelete }) => {
  return (
    <motion.div 
      className="debts-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="section">
        <div className="section-header">
          <h3>Catatan Hutang Piutang</h3>
          <div className="debt-stats">
            <span className="total-piutang">
              Piutang Aktif: {formatCurrency(debts.filter(d => !d.isSettled && d.type === 'piutang').reduce((a, b) => a + b.remainingAmount, 0))}
            </span>
          </div>
        </div>
        
        <div className="debt-list">
          {debts.length === 0 ? (
            <div className="placeholder-view glass-card">Belum ada catatan</div>
          ) : debts.map((d, i) => (
            <motion.div 
              key={d.id} 
              className={`debt-item glass-card ${d.isSettled ? 'settled' : ''}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="d-icon-box">
                {d.isSettled ? <CheckCircle2 size={20} color="#10b981" /> : <Clock size={20} color="#8b5cf6" />}
              </div>
              <div className="t-info">
                <p className="t-title">{d.title}</p>
                <p className="t-category">
                  {d.type === 'piutang' ? 'Piutang' : 'Hutang'} • {d.date}
                  {d.totalInstallments > 1 && ` • Cicilan ${d.installmentsPaid}/${d.totalInstallments}`}
                </p>
                {d.totalInstallments > 1 && !d.isSettled && (
                  <div className="installment-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(d.installmentsPaid / d.totalInstallments) * 100}%` }}></div>
                    </div>
                    <div className="installment-info-row">
                      <span>{formatCurrency(d.amountPerInstallment)} / bln</span>
                      <span className="due-date-badge">Tgl {d.dueDateDay}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="t-actions">
                <p className={`t-amount ${d.type === 'piutang' ? 'expense' : 'income'}`}>
                  {formatCurrency(d.isSettled ? d.amount : d.remainingAmount)}
                </p>
                <div className="d-buttons">
                  {!d.isSettled && (
                    <button className="settle-btn" onClick={() => onSettle(d)}>
                      {d.totalInstallments > 1 ? 'Bayar Cicilan' : 'Pelunasan'}
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => onDelete(d.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default DebtView;
