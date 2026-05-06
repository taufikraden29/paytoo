import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Zap, TrendingDown, TrendingUp } from 'lucide-react';

// Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import BalanceCard from './components/home/BalanceCard';
import TodayCard from './components/home/TodayCard';
import DebtSummary from './components/home/DebtSummary';
import AdviceCard from './components/home/AdviceCard';
import WeeklyChart from './components/stats/WeeklyChart';
import StatsView from './components/stats/StatsView';
import HistoryView from './components/history/HistoryView';
import DebtView from './components/debts/DebtView';
import CalendarView from './components/calendar/CalendarView';
import ProfileView from './components/profile/ProfileView';
import AddTransactionModal from './components/modals/AddTransactionModal';
import CalculatorModal from './components/modals/CalculatorModal';
import ConfirmModal from './components/modals/ConfirmModal';

// Utils
import { formatCurrency, formatInputRupiah, parseRupiah, getAmountClass, formatCalcDisplay } from './utils/formatters';
import { CATEGORIES, NOTIFICATIONS, PIE_DATA_DEFAULT } from './utils/constants';
import { exportToCSV } from './utils/exportUtils';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('kantongku_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('kantongku_debts');
    return saved ? JSON.parse(saved) : [];
  });
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('kantongku_budgets');
    return saved ? JSON.parse(saved) : { Makan: 0, Transport: 0, Belanja: 0, Tagihan: 0, Lainnya: 0 };
  });

  // Settings
  const [sheetUrl, setSheetUrl] = useState(() => import.meta.env.VITE_GOOGLE_SHEET_URL || localStorage.getItem('kantongku_sheet_url') || '');
  const [isAutoSync, setIsAutoSync] = useState(() => localStorage.getItem('kantongku_auto_sync') === 'true');

  const [formData, setFormData] = useState({ 
    title: '', amount: '', type: 'expense', category: 'food', installments: '1', dueDate: new Date().getDate().toString()
  });

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevValue, setCalcPrevValue] = useState(null);
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);
  const [calcCopied, setCalcCopied] = useState(false);

  // Stats Filter
  const [statsFilter, setStatsFilter] = useState('weekly');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null, onSecondary: null,
    confirmText: 'Ya', secondaryText: 'Tidak', cancelText: 'Batal', type: 'info', showSecondary: false
  });

  // Persistance
  useEffect(() => localStorage.setItem('kantongku_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('kantongku_debts', JSON.stringify(debts)), [debts]);
  useEffect(() => localStorage.setItem('kantongku_budgets', JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem('kantongku_auto_sync', isAutoSync), [isAutoSync]);
  useEffect(() => localStorage.setItem('kantongku_sheet_url', sheetUrl), [sheetUrl]);

  // Sync Logic
  const syncMutation = useMutation({
    mutationFn: async (variables) => {
      if (!sheetUrl) throw new Error('Sheet URL is missing');
      const { singleTransaction, manualDebts, manualTrans } = variables;
      const payload = { action: 'sync', transactions: manualTrans || transactions, debts: manualDebts || debts };
      const response = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return response;
    },
    onSuccess: (_, v) => { if (!v.singleTransaction && !v.manualDebts) alert('Berhasil disinkronkan!'); }
  });

  const syncToCloud = (singleTransaction = null, manualDebts = null, manualTrans = null) => {
    syncMutation.mutate({ singleTransaction, manualDebts, manualTrans });
  };

  const fetchQuery = useQuery({
    queryKey: ['cloudData', sheetUrl],
    queryFn: async () => {
      if (!sheetUrl) return null;
      const response = await fetch(sheetUrl);
      return response.json();
    },
    enabled: false
  });

  const syncFromCloud = async () => {
    if (!sheetUrl) return alert('Masukkan URL Google Script terlebih dahulu');
    const { data: result } = await fetchQuery.refetch();
    if (result && confirm('Impor data dari cloud? Ini akan menimpa data lokal.')) {
      setTransactions(result.transactions || []);
      setDebts(result.debts || []);
    }
  };

  // Calculations
  const { totalBalance, readyCash, totalIncome, totalExpense, totalPiutang, totalHutang, piutangCount, hutangCount, todayStats } = useMemo(() => {
    const mainBalance = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const piutangVal = debts.filter(d => !d.isSettled && d.type === 'piutang').reduce((acc, curr) => acc + (Number(curr.remainingAmount) || 0), 0);
    const hutangVal = debts.filter(d => !d.isSettled && d.type === 'hutang').reduce((acc, curr) => acc + (Number(curr.remainingAmount) || 0), 0);
    const income = transactions.filter(t => t.type === 'income' && !['Pinjam Uang', 'Pelunasan'].includes(t.category)).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const expense = Math.abs(transactions.filter(t => t.type === 'expense' && !['Beri Pinjaman', 'Pelunasan'].includes(t.category)).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
    
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const todayTrans = transactions.filter(t => t.date === today);
    const tIncome = todayTrans.filter(t => t.type === 'income').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const tExpense = Math.abs(todayTrans.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));

    return {
      totalBalance: mainBalance,
      readyCash: mainBalance - piutangVal,
      totalIncome: income,
      totalExpense: expense,
      totalPiutang: piutangVal,
      totalHutang: hutangVal,
      piutangCount: debts.filter(d => !d.isSettled && d.type === 'piutang').length,
      hutangCount: debts.filter(d => !d.isSettled && d.type === 'hutang').length,
      todayStats: { income: tIncome, expense: tExpense, net: tIncome - tExpense, count: todayTrans.length }
    };
  }, [transactions, debts]);

  // Derived Data for Charts
  const homeChartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), amount: 0 };
    });
    transactions.forEach(t => {
      const item = last7Days.find(d => d.dateStr === t.date);
      if (item && t.type === 'expense') item.amount += Math.abs(t.amount);
    });
    return last7Days;
  }, [transactions]);

  const dynamicChartData = useMemo(() => {
    // Simplified logic for stats view
    return homeChartData; 
  }, [homeChartData]);

  const dynamicPieData = useMemo(() => {
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount); });
    const colors = ['#6366f1', '#a855f7', '#f43f5e', '#10b981', '#f59e0b'];
    const data = Object.keys(cats).map((name, i) => ({ name, value: cats[name], color: colors[i % colors.length] }));
    return data.length > 0 ? data : PIE_DATA_DEFAULT;
  }, [transactions]);

  const financialHealth = useMemo(() => {
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const currentDay = new Date().getDate();
    const avgDaily = totalExpense / currentDay;
    
    let advice = { title: 'Keuangan Aman!', text: 'Pertahankan pola pengeluaran Anda.', icon: <Zap size={24} color="#10b981" />, color: 'green' };
    if (savingsRate < 10) advice = { title: 'Waspada!', text: 'Tabungan Anda rendah.', icon: <TrendingDown size={24} color="#ef4444" />, color: 'red' };

    return { savingsRate, avgDaily, advice, behaviorText: 'Pola pengeluaran Anda stabil.', topCategory: 'Makan', peakTrans: null };
  }, [totalIncome, totalExpense]);

  // Handlers
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const selectedCat = CATEGORIES[formData.type].find(c => c.id === formData.category) || CATEGORIES[formData.type][0];
    const newTransaction = {
      id: Date.now(), title: formData.title, amount: formData.type === 'income' ? Number(formData.amount) : -Number(formData.amount),
      type: formData.type === 'debt' ? (formData.category === 'piutang' ? 'expense' : 'income') : formData.type,
      category: selectedCat.name, icon: selectedCat.icon, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      timestamp: Date.now(), isoDate: new Date().toISOString()
    };

    if (formData.type === 'debt') {
      const count = Number(formData.installments) || 1;
      const totalAmount = Number(formData.amount);
      const newDebt = {
        id: Date.now(), title: formData.title, amount: totalAmount, amountPerInstallment: totalAmount / count,
        type: formData.category, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        dueDateDay: Number(formData.dueDate) || 1, isSettled: false, totalInstallments: count, installmentsPaid: 0,
        remainingAmount: totalAmount, transactionId: newTransaction.id
      };
      setDebts([newDebt, ...debts]);
    } else {
      setTransactions([newTransaction, ...transactions]);
    }
    setFormData({ title: '', amount: '', type: 'expense', category: 'food', installments: '1', dueDate: new Date().getDate().toString() });
    setShowAddModal(false);
  };

  const handleSettleDebt = (debt) => {
    const amountToPay = debt.totalInstallments > 1 ? debt.amountPerInstallment : debt.amount;
    const isNowSettled = debt.totalInstallments > 1 ? (debt.installmentsPaid + 1) >= debt.totalInstallments : true;

    setTransactions([{
      id: Date.now(), title: `Bayar: ${debt.title}`, amount: debt.type === 'piutang' ? amountToPay : -amountToPay,
      type: debt.type === 'piutang' ? 'income' : 'expense', category: 'Pelunasan', icon: '✅',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), debtId: debt.id
    }, ...transactions]);

    setDebts(debts.map(d => d.id === debt.id ? { 
      ...d, installmentsPaid: d.installmentsPaid + 1, remainingAmount: Math.max(0, d.remainingAmount - amountToPay), isSettled: isNowSettled 
    } : d));
  };

  const triggerConfirm = (config) => {
    setConfirmModal({ isOpen: true, ...config, onConfirm: () => { config.onConfirm?.(); setConfirmModal(p => ({ ...p, isOpen: false })); } });
  };

  const filteredTransactions = useMemo(() => transactions.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ), [transactions, searchQuery]);

  // Calculator logic
  const handleCalcInputDigit = (digit) => setCalcDisplay(calcWaitingForOperand ? String(digit) : (calcDisplay === '0' ? String(digit) : calcDisplay + digit));
  const handleCalcInputDot = () => { if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.'); };
  const handleCalcClear = () => { setCalcDisplay('0'); setCalcPrevValue(null); setCalcOperator(null); };
  const handleCalcOperation = (op) => {
    const val = parseFloat(calcDisplay);
    if (calcPrevValue === null) setCalcPrevValue(val);
    else if (calcOperator) {
      const res = calcOperator === '+' ? calcPrevValue + val : calcOperator === '-' ? calcPrevValue - val : calcOperator === '*' ? calcPrevValue * val : calcPrevValue / val;
      setCalcPrevValue(op === '=' ? null : res);
      setCalcDisplay(String(res));
    }
    setCalcWaitingForOperand(true);
    setCalcOperator(op === '=' ? null : op);
  };

  return (
    <div className="app-container">
      <Header 
        user={{ name: 'Raden' }} 
        setShowCalculator={setShowCalculator} 
        showSearch={showSearch} setShowSearch={setShowSearch}
        showNotifications={showNotifications} setShowNotifications={setShowNotifications}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        notifications={NOTIFICATIONS}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <>
            <BalanceCard totalBalance={totalBalance} readyCash={readyCash} totalIncome={totalIncome} totalExpense={totalExpense} />
            <TodayCard todayStats={todayStats} />
            <DebtSummary totalPiutang={totalPiutang} piutangCount={piutangCount} totalHutang={totalHutang} hutangCount={hutangCount} onSeeDetail={() => setActiveTab('debts')} />
            <AdviceCard financialHealth={financialHealth} />
            <section className="section">
              <div className="section-header"><h3>Analisis Mingguan</h3></div>
              <div className="chart-container glass-card"><WeeklyChart data={homeChartData} /></div>
            </section>
            <section className="section">
              <div className="section-header"><h3>Transaksi Terakhir</h3><button className="text-btn" onClick={() => setActiveTab('history')}>Lihat Semua</button></div>
              <div className="transaction-list">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="transaction-item glass-card">
                    <div className="t-icon-box"><span className="t-emoji">{t.icon || '💰'}</span></div>
                    <div className="t-info"><p className="t-title">{t.title}</p><p className="t-category">{t.category}</p></div>
                    <div className="t-actions">
                      <p className={`t-amount ${getAmountClass(t)}`}>{t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}</p>
                      <button className="delete-btn" onClick={() => setTransactions(transactions.filter(tr => tr.id !== t.id))}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'stats' && (
          <StatsView 
            financialHealth={financialHealth} statsFilter={statsFilter} setStatsFilter={setStatsFilter}
            dynamicChartData={dynamicChartData} dynamicPieData={dynamicPieData} totalExpense={totalExpense}
            transactions={transactions} budgets={budgets} onSetBudget={(cat, val) => setBudgets({...budgets, [cat]: val})}
          />
        )}

        {activeTab === 'calendar' && <CalendarView transactions={transactions} />}

        {activeTab === 'debts' && (
          <DebtView 
            debts={debts} onSettle={handleSettleDebt} 
            onDelete={(id) => setDebts(debts.filter(d => d.id !== id))} 
          />
        )}

        {activeTab === 'history' && (
          <HistoryView 
            transactions={filteredTransactions} 
            onDelete={(id) => setTransactions(transactions.filter(t => t.id !== id))} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            user={{ name: 'Raden PC' }} transactionsCount={transactions.length}
            sheetUrl={sheetUrl} setSheetUrl={setSheetUrl} isAutoSync={isAutoSync} setIsAutoSync={setIsAutoSync}
            onSyncToCloud={() => syncToCloud()} onSyncFromCloud={syncFromCloud}
            onResetData={() => { if (confirm('Reset semua data?')) { localStorage.clear(); window.location.reload(); } }}
            onExportCSV={() => exportToCSV(transactions)}
            syncPending={syncMutation.isPending} fetchPending={fetchQuery.isFetching}
          />
        )}
      </main>

      <button className="fab-btn" onClick={() => setShowAddModal(true)}><Plus size={28} /></button>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AddTransactionModal show={showAddModal} onClose={() => setShowAddModal(false)} formData={formData} setFormData={setFormData} onSubmit={handleAddTransaction} />
      
      <CalculatorModal 
        show={showCalculator} onClose={() => setShowCalculator(false)} calcDisplay={calcDisplay} calcPrevValue={calcPrevValue} 
        calcOperator={calcOperator} calcCopied={calcCopied} onCopy={() => { navigator.clipboard.writeText(calcDisplay); setCalcCopied(true); setTimeout(() => setCalcCopied(false), 2000); }}
        onClear={handleCalcClear} onInputDigit={handleCalcInputDigit} onInputDot={handleCalcInputDot} onPerformOperation={handleCalcOperation} formatCalcDisplay={formatCalcDisplay}
      />

      <ConfirmModal show={confirmModal.isOpen} config={confirmModal} onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))} />
    </div>
  );
}

export default App;
