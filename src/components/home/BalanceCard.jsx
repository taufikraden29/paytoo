import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const BalanceCard = ({ totalBalance, readyCash, totalIncome, totalExpense }) => {
  return (
    <motion.div 
      className="balance-card glass-card"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-top">
        <p>Saldo Utama</p>
        <h1 className="total-balance">{formatCurrency(totalBalance)}</h1>
        <div className="real-cash-info">
          <Wallet size={14} />
          <span>Perkiraan Uangmu: {formatCurrency(readyCash)}</span>
        </div>
      </div>
      <div className="card-stats">
        <div className="stat">
          <div className="stat-icon income">
            <ArrowUpRight size={16} />
          </div>
          <div>
            <p>Pemasukan</p>
            <p className="stat-amount">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon expense">
            <ArrowDownLeft size={16} />
          </div>
          <div>
            <p>Pengeluaran</p>
            <p className="stat-amount">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
