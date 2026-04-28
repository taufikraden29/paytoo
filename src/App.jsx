import React, { useState, useEffect, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  PieChart as PieChartIcon, 
  Home, 
  User,
  Search,
  Bell,
  Trash2,
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Settings,
  HandCoins,
  CheckCircle2,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock Data
const MOCK_TRANSACTIONS = [
  { id: 1, title: 'Gaji Bulanan', amount: 5000000, type: 'income', category: 'Work', date: '2024-03-20' },
  { id: 2, title: 'Makan Siang', amount: -50000, type: 'expense', category: 'Food', date: '2024-03-21' },
  { id: 3, title: 'Langganan Netflix', amount: -150000, type: 'expense', category: 'Sub', date: '2024-03-21' },
  { id: 4, title: 'Bonus Project', amount: 1200000, type: 'income', category: 'Work', date: '2024-03-22' },
  { id: 5, title: 'Bensin Motor', amount: -30000, type: 'expense', category: 'Transport', date: '2024-03-23' },
];

const PIE_DATA_DEFAULT = [
  { name: 'Makanan', value: 0, color: '#6366f1' },
  { name: 'Transport', value: 0, color: '#a855f7' },
  { name: 'Hiburan', value: 0, color: '#f43f5e' },
  { name: 'Lainnya', value: 0, color: '#10b981' },
];

const WeeklyChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <Tooltip 
        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
        itemStyle={{ color: '#fff' }}
      />
      <Area 
        type="monotone" 
        dataKey="amount" 
        stroke="#6366f1" 
        fillOpacity={1} 
        fill="url(#colorAmount)" 
        strokeWidth={3}
      />
    </AreaChart>
  </ResponsiveContainer>
));

import './App.css';

const CATEGORIES = {
  income: [
    { id: 'work', name: 'Gaji', icon: '💼', color: '#10b981' },
    { id: 'bonus', name: 'Bonus', icon: '🎁', color: '#6366f1' },
    { id: 'gift', name: 'Hadiah', icon: '🍰', color: '#f43f5e' },
  ],
  expense: [
    { id: 'food', name: 'Makan', icon: '🍔', color: '#f59e0b' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Belanja', icon: '🛍️', color: '#a855f7' },
    { id: 'bills', name: 'Tagihan', icon: '📄', color: '#ef4444' },
    { id: 'other', name: 'Lainnya', icon: '✨', color: '#64748b' },
  ],
  debt: [
    { id: 'piutang', name: 'Beri Pinjaman', icon: '🤝', color: '#8b5cf6' },
    { id: 'hutang', name: 'Pinjam Uang', icon: '💳', color: '#f59e0b' },
  ]
};

const TITLE_TEMPLATES = {
  food: ['Makan Siang', 'Camilan', 'Kopi', 'Makan Malam', 'Sembako'],
  transport: ['Bensin', 'Gojek/Grab', 'Parkir', 'Tol', 'Servis Motor'],
  shopping: ['Belanja Bulanan', 'Skincare', 'Pakaian', 'Kebutuhan Rumah'],
  bills: ['Listrik', 'Air', 'Internet/Pulsa', 'Kost', 'Asuransi'],
  work: ['Gaji Bulanan', 'Bonus Project', 'Insentif'],
  bonus: ['Hadiah', 'Rezeki Nomplok'],
  piutang: ['Hutang teman', 'Pinjaman keluarga'],
  hutang: ['Pinjam modal', 'Kebutuhan mendesak'],
  other: ['Lain-lain', 'Sedekah', 'Tabungan']
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('kantongku_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('kantongku_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({ 
    title: '', 
    amount: '', 
    type: 'expense', 
    category: 'food',
    installments: '1',
    dueDate: new Date().getDate().toString()
  });

  const [sheetUrl, setSheetUrl] = useState(() => {
    return import.meta.env.VITE_GOOGLE_SHEET_URL || localStorage.getItem('kantongku_sheet_url') || '';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(() => {
    return localStorage.getItem('kantongku_auto_sync') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('kantongku_auto_sync', isAutoSync);
  }, [isAutoSync]);

  useEffect(() => {
    localStorage.setItem('kantongku_sheet_url', sheetUrl);
  }, [sheetUrl]);

  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (variables) => {
      if (!sheetUrl) throw new Error('Sheet URL is missing');
      const { singleTransaction, manualDebts, manualTrans } = variables;
      
      const payload = singleTransaction 
        ? { action: 'add', transaction: singleTransaction }
        : { action: 'sync', transactions: manualTrans || transactions, debts: manualDebts || debts };

      const response = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Using text/plain to avoid CORS preflight issues with GAS
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');
      return response;
    },
    onSuccess: (_, variables) => {
      if (!variables.singleTransaction && !variables.manualDebts) {
        alert('Semua data berhasil dikirim!');
      }
    },
    onError: (error) => {
      console.error(error);
      alert('Gagal mengirim data ke Cloud: ' + error.message);
    }
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
    enabled: false, // Only trigger manually via refetch
  });

  const syncFromCloud = async () => {
    if (!sheetUrl) return alert('Masukkan URL Web App Google Script terlebih dahulu');
    try {
      const { data: result } = await fetchQuery.refetch();
      if (!result) return;

      if (result.transactions && result.debts) {
        if (confirm(`Ditemukan ${result.transactions.length} transaksi dan ${result.debts.length} catatan hutang. Timpa data lokal?`)) {
          setTransactions(result.transactions);
          setDebts(result.debts);
          alert('Data berhasil diimpor!');
        }
      } else if (Array.isArray(result)) {
        if (confirm(`Ditemukan ${result.length} transaksi. Timpa data lokal?`)) {
          setTransactions(result);
          alert('Data transaksi berhasil diimpor!');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data dari Cloud.');
    }
  };

  useEffect(() => {
    localStorage.setItem('kantongku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kantongku_debts', JSON.stringify(debts));
  }, [debts]);

  // Debounced Auto-Sync to Cloud
  useEffect(() => {
    if (!isAutoSync || !sheetUrl) return;
    
    const timer = setTimeout(() => {
      syncToCloud(null, debts, transactions);
    }, 3000); // Sync after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [transactions, debts, isAutoSync, sheetUrl]);

  const { totalBalance, readyCash, totalIncome, totalExpense, totalPiutang, totalHutang, piutangCount, hutangCount } = useMemo(() => {
    // 1. Saldo Utama (Main Balance)
    const mainBalance = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    // 2. Debt Calculations with explicit Numbers
    const piutangVal = debts
      .filter(d => !d.isSettled && d.type === 'piutang')
      .reduce((acc, curr) => acc + (Number(curr.remainingAmount) || 0), 0);
      
    const hutangVal = debts
      .filter(d => !d.isSettled && d.type === 'hutang')
      .reduce((acc, curr) => acc + (Number(curr.remainingAmount) || 0), 0);
    
    // 3. Perkiraan Uangmu (Cuts on piutang)
    const perkiraan = mainBalance - piutangVal;

    // 4. Statistics (Pure analysis)
    const income = transactions
      .filter(t => t.type === 'income' && !['Pinjam Uang', 'Pelunasan'].includes(t.category))
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    const expense = Math.abs(transactions
      .filter(t => t.type === 'expense' && !['Beri Pinjaman', 'Pelunasan'].includes(t.category))
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));

    return {
      totalBalance: mainBalance,
      readyCash: perkiraan,
      totalIncome: income,
      totalExpense: expense,
      totalPiutang: piutangVal,
      totalHutang: hutangVal,
      piutangCount: debts.filter(d => !d.isSettled && d.type === 'piutang').length,
      hutangCount: debts.filter(d => !d.isSettled && d.type === 'hutang').length
    };
  }, [transactions, debts]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const selectedCat = CATEGORIES[formData.type].find(c => c.id === formData.category) || CATEGORIES[formData.type][0];

    const newTransaction = {
      id: Date.now(),
      title: formData.title,
      amount: formData.type === 'income' ? Number(formData.amount) : -Number(formData.amount),
      type: formData.type === 'debt' ? (formData.category === 'piutang' ? 'expense' : 'income') : formData.type,
      category: selectedCat.name,
      icon: selectedCat.icon,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };

    if (formData.type === 'debt') {
      const count = Number(formData.installments) || 1;
      const totalAmount = Number(formData.amount);
      const amountPerInstallment = totalAmount / count;

      const newDebt = {
        id: Date.now(),
        title: formData.title,
        amount: totalAmount,
        amountPerInstallment: amountPerInstallment,
        type: formData.category, // 'piutang' or 'hutang'
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        dueDateDay: Number(formData.dueDate) || 1,
        isSettled: false,
        totalInstallments: count,
        installmentsPaid: 0,
        remainingAmount: totalAmount,
        transactionId: newTransaction.id
      };
      setDebts([newDebt, ...debts]);
      
      // Based on user: Piutang/Hutang creation is JUST A RECORD/REMINDER.
      // It DOES NOT affect the Main Balance (transactions) until settled.
      // So we DO NOT call setTransactions here for debt type.
    } else {
      setTransactions([newTransaction, ...transactions]);
    }
    setFormData({ 
      title: '', 
      amount: '', 
      type: 'expense', 
      category: 'food', 
      installments: '1',
      dueDate: new Date().getDate().toString()
    });
    setShowAddModal(false);
  };

  const handleSettleDebt = (debt) => {
    const isInstallment = debt.totalInstallments > 1;
    const amountToPay = isInstallment ? debt.amountPerInstallment : debt.amount;
    
    triggerConfirm({
      title: 'Pelunasan Catatan',
      message: debt.type === 'piutang' 
        ? `Selesaikan piutang senilai ${formatCurrency(amountToPay)}? Pilih 'Ya' untuk memasukkan ke Saldo Utama.`
        : `Selesaikan hutang senilai ${formatCurrency(amountToPay)}? Pilih 'Ya' untuk memotong dari Saldo Utama.`,
      confirmText: 'Ya, Update Saldo',
      secondaryText: 'Hanya Catatan',
      onConfirm: () => finalizeSettleDebt(debt, true, amountToPay),
      onSecondary: () => finalizeSettleDebt(debt, false, amountToPay),
      type: 'info',
      showSecondary: true
    });
  };

  const finalizeSettleDebt = (debt, updateBalance, amountToPay) => {
    const isInstallment = debt.totalInstallments > 1;
    let settleTransaction = null;
    
    if (updateBalance) {
      settleTransaction = {
        id: Date.now(),
        title: isInstallment ? `Angsuran ${debt.installmentsPaid + 1}: ${debt.title}` : `Pelunasan: ${debt.title}`,
        amount: debt.type === 'piutang' ? amountToPay : -amountToPay,
        type: debt.type === 'piutang' ? 'income' : 'expense',
        category: 'Pelunasan',
        icon: isInstallment ? '📅' : '✅',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        debtId: debt.id
      };
      setTransactions([settleTransaction, ...transactions]);
    }

    const updatedDebts = debts.map(d => {
      if (d.id === debt.id) {
        const newPaidCount = d.installmentsPaid + 1;
        const isNowSettled = isInstallment ? newPaidCount >= d.totalInstallments : true;
        return { 
          ...d, 
          installmentsPaid: newPaidCount,
          remainingAmount: Math.max(0, d.remainingAmount - amountToPay),
          isSettled: isNowSettled
        };
      }
      return d;
    });
    setDebts(updatedDebts);
  };

  const handleDeleteDebt = (id) => {
    triggerConfirm({
      title: 'Hapus Catatan',
      message: 'Hapus catatan ini dan semua riwayat transaksi terkait?',
      type: 'danger',
      confirmText: 'Hapus Semua',
      onConfirm: () => {
        const debtToDelete = debts.find(d => d.id === id);
        const newTransactions = transactions.filter(t => 
          t.debtId !== id && 
          (!debtToDelete || t.id !== debtToDelete.transactionId)
        );
        const newDebts = debts.filter(d => d.id !== id);
        setTransactions(newTransactions);
        setDebts(newDebts);
      }
    });
  };

  const handleResetData = () => {
    triggerConfirm({
      title: 'Reset Seluruh Data',
      message: 'Semua data transaksi, hutang, dan pengaturan akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      confirmText: 'Reset Sekarang',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  const handleDeleteTransaction = (id) => {
    triggerConfirm({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus transaksi ini?',
      type: 'danger',
      confirmText: 'Hapus',
      onConfirm: () => {
        const deleted = transactions.find(t => t.id === id);
        const newTransactions = transactions.filter(t => t.id !== id);
        setTransactions(newTransactions);
      }
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, text: 'Pengeluaran Anda naik 10% minggu ini', time: '2j yang lalu' },
    { id: 2, text: 'Gaji Bulanan telah masuk!', time: '1h yang lalu' },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const dynamicChartData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: days[d.getDay()],
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        amount: 0
      };
    });

    transactions.forEach(t => {
      const dayData = last7Days.find(d => d.dateStr === t.date);
      if (dayData && t.type === 'expense') {
        dayData.amount += Math.abs(t.amount);
      }
    });

    return last7Days;
  }, [transactions]);

  const dynamicPieData = useMemo(() => {
    const categories = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      });

    const colors = ['#6366f1', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];
    const data = Object.keys(categories).map((name, i) => ({
      name,
      value: categories[name],
      color: colors[i % colors.length]
    }));

    return data.length > 0 ? data : PIE_DATA_DEFAULT;
  }, [transactions]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onSecondary: null,
    confirmText: 'Ya',
    secondaryText: 'Tidak',
    cancelText: 'Batal',
    type: 'info', // 'danger', 'info', 'success'
    showSecondary: false
  });

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const triggerConfirm = (config) => {
    setConfirmModal({
      isOpen: true,
      title: config.title || 'Konfirmasi',
      message: config.message || '',
      onConfirm: () => { config.onConfirm?.(); closeConfirm(); },
      onSecondary: config.onSecondary ? () => { config.onSecondary?.(); closeConfirm(); } : null,
      confirmText: config.confirmText || 'Ya',
      secondaryText: config.secondaryText || 'Tidak',
      cancelText: config.cancelText || 'Batal',
      type: config.type || 'info',
      showSecondary: !!config.onSecondary
    });
  };

  const financialHealth = useMemo(() => {
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const avgDaily = totalExpense / new Date().getDate();
    
    let advice = {
      title: 'Keuangan Aman!',
      text: 'Pertahankan pola pengeluaran Anda. Tabungan Anda bulan ini cukup baik.',
      icon: <Zap size={24} color="#10b981" />,
      color: 'green'
    };

    if (savingsRate < 10) {
      advice = {
        title: 'Waspada Pengeluaran!',
        text: 'Tabungan Anda di bawah 10%. Coba kurangi pengeluaran yang kurang perlu.',
        icon: <TrendingDown size={24} color="#ef4444" />,
        color: 'red'
      };
    } else if (savingsRate > 50) {
      advice = {
        title: 'Luar Biasa!',
        text: 'Anda sangat hemat bulan ini! Pertimbangkan untuk berinvestasi.',
        icon: <TrendingUp size={24} color="#6366f1" />,
        color: 'purple'
      };
    }

    const unSettledDebts = debts.filter(d => !d.isSettled && d.type === 'piutang').length;
    if (unSettledDebts > 0) {
      advice.extra = `Ada ${unSettledDebts} piutang yang belum tertagih.`;
    }

    return { savingsRate, avgDaily, advice };
  }, [totalIncome, totalExpense, debts]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatInputRupiah = (value) => {
    if (!value) return '';
    const numberString = value.toString().replace(/[^0-9]/g, '');
    if (!numberString) return '';
    return new Intl.NumberFormat('id-ID').format(numberString);
  };

  const parseRupiah = (value) => {
    if (!value) return '';
    return value.toString().replace(/[^0-9]/g, '');
  };

  const getAmountClass = (t) => {
    if (t.category === 'Beri Pinjaman') return 'debt-out';
    if (t.category === 'Pinjam Uang') return 'debt-in';
    if (t.category === 'Pelunasan') return 'debt-settle';
    return t.type;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header animate-slide-up">
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div>
            <p className="welcome-text">Halo, Selamat Pagi</p>
            <h2 className="user-name">Raden</h2>
          </div>
        </div>
        <div className="header-actions">
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
              {NOTIFICATIONS.map(n => (
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

      <main className="main-content">
        {activeTab === 'home' ? (
          <>
            {/* Balance Card */}
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
            
            {/* Debt Stats Card */}
            <section className="section">
              <div className="section-header">
                <h3>Status Piutang & Hutang</h3>
                <button className="text-btn" onClick={() => setActiveTab('debts')}>Lihat Detail</button>
              </div>
              <motion.div 
                className="debt-summary-row"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="debt-stat-card glass-card piutang" onClick={() => setActiveTab('debts')}>
                  <div className="d-stat-icon">
                    <HandCoins size={16} />
                  </div>
                  <div className="d-stat-info">
                    <p>Total Piutang</p>
                    <h4>{formatCurrency(totalPiutang)}</h4>
                    <span className="d-count">{piutangCount} Catatan Aktif</span>
                  </div>
                </div>
                <div className="debt-stat-card glass-card hutang" onClick={() => setActiveTab('debts')}>
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

            {/* Advice Card */}
            <motion.div 
              className={`advice-card glass-card ${financialHealth.advice.color}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="advice-icon">
                {financialHealth.advice.icon}
              </div>
              <div className="advice-content">
                <h4>{financialHealth.advice.title}</h4>
                <p>{financialHealth.advice.text}</p>
                {financialHealth.advice.extra && <span>{financialHealth.advice.extra}</span>}
              </div>
            </motion.div>

            {/* Weekly Chart */}
            <section className="section">
              <div className="section-header">
                <h3>Analisis Mingguan</h3>
                <button className="text-btn" onClick={() => setActiveTab('stats')}>Lihat Detail</button>
              </div>
              <div className="chart-container glass-card">
                <WeeklyChart data={dynamicChartData} />
              </div>
            </section>

            {/* Transactions */}
            <section className="section">
              <div className="section-header">
                <h3>Transaksi Terakhir</h3>
                <button className="text-btn" onClick={() => setActiveTab('history')}>Lihat Semua</button>
              </div>
              <div className="transaction-list">
                {(searchQuery ? filteredTransactions : transactions).slice(0, 5).map((t, i) => (
                  <motion.div 
                    key={t.id} 
                    className="transaction-item glass-card"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="t-icon-box">
                      <span className="t-emoji">{t.icon || (t.type === 'income' ? '💰' : '💸')}</span>
                    </div>
                    <div className="t-info">
                      <p className="t-title">{t.title}</p>
                      <p className="t-category">{t.category}</p>
                    </div>
                    <div className="t-actions">
                      <p className={`t-amount ${getAmountClass(t)}`}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </p>
                      <button className="delete-btn" onClick={() => handleDeleteTransaction(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        ) : activeTab === 'stats' ? (
          <motion.div 
            className="stats-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stats-header-grid">
              <div className="stat-metric glass-card">
                <p>Savings Rate</p>
                <h3>{financialHealth.savingsRate.toFixed(1)}%</h3>
                <div className="mini-progress">
                  <div className="mini-fill" style={{ width: `${Math.min(financialHealth.savingsRate, 100)}%` }}></div>
                </div>
              </div>
              <div className="stat-metric glass-card">
                <p>Avg. Harian</p>
                <h3>{formatCurrency(financialHealth.avgDaily)}</h3>
                <span>per hari</span>
              </div>
            </div>

            <section className="section">
              <h3>Distribusi Pengeluaran</h3>
              <div className="chart-container glass-card" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="category-legend">
                {dynamicPieData.map((item) => (
                  <div key={item.name} className="legend-item glass-card">
                    <div className="legend-color" style={{ backgroundColor: item.color }} />
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h3>Ringkasan Piutang & Hutang</h3>
              <div className="stats-header-grid">
                <div className="stat-metric glass-card">
                  <p>Rasio Piutang</p>
                  <h3>{((totalPiutang / (totalBalance || 1)) * 100).toFixed(1)}%</h3>
                  <span>dari saldo utama</span>
                </div>
                <div className="stat-metric glass-card">
                  <p>Total Komitmen</p>
                  <h3>{piutangCount + hutangCount}</h3>
                  <span>catatan aktif</span>
                </div>
              </div>
            </section>
          </motion.div>
        ) : activeTab === 'debts' ? (
          <motion.div 
            className="debts-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <section className="section">
              <div className="section-header">
                <h3>Catatan Hutang Piutang</h3>
                <div className="debt-stats">
                  <span className="total-piutang">Piutang: {formatCurrency(debts.filter(d => !d.isSettled && d.type === 'piutang').reduce((a, b) => a + b.amount, 0))}</span>
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
                        {d.totalInstallments > 1 && ` • Angsuran ${d.installmentsPaid}/${d.totalInstallments}`}
                      </p>
                      {d.totalInstallments > 1 && !d.isSettled && (
                        <div className="installment-progress">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(d.installmentsPaid / d.totalInstallments) * 100}%` }}></div>
                          </div>
                          <div className="installment-info-row">
                            <span>{formatCurrency(d.amountPerInstallment)} / bln</span>
                            <span className="due-date-badge">Jatuh Tempo: Tgl {d.dueDateDay}</span>
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
                          <button className="settle-btn" onClick={() => handleSettleDebt(d)}>
                            {d.totalInstallments > 1 ? 'Bayar Cicilan' : 'Pelunasan'}
                          </button>
                        )}
                        <button className="delete-btn" onClick={() => handleDeleteDebt(d.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : activeTab === 'history' ? (
          <motion.div 
            className="history-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <section className="section">
              <h3>Riwayat Transaksi</h3>
              <div className="transaction-list">
                {filteredTransactions.map((t, i) => (
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
                      <button className="delete-btn" onClick={() => handleDeleteTransaction(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div 
            className="profile-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="profile-header glass-card">
              <div className="profile-avatar">
                <User size={40} />
              </div>
              <h3>Raden PC</h3>
              <p>Member Premium</p>
            </div>
            <div className="profile-stats">
              <div className="p-stat glass-card">
                <p>Transaksi</p>
                <h4>{transactions.length}</h4>
              </div>
              <div className="p-stat glass-card">
                <p>Point</p>
                <h4>1,250</h4>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Cloud Sync (Google Sheets)</h3>
                <Cloud size={18} className={syncMutation.isPending || fetchQuery.isFetching ? 'animate-pulse' : ''} />
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
                    <input 
                      type="checkbox" 
                      checked={isAutoSync} 
                      onChange={(e) => setIsAutoSync(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="cloud-actions">
                  <button 
                    className="cloud-btn upload" 
                    onClick={() => syncToCloud()}
                    disabled={syncMutation.isPending}
                  >
                    <CloudUpload size={18} />
                    <span>{syncMutation.isPending ? 'Mengirim...' : 'Ekspor ke Sheet'}</span>
                  </button>
                  <button 
                    className="cloud-btn download" 
                    onClick={syncFromCloud}
                    disabled={fetchQuery.isFetching}
                  >
                    <CloudDownload size={18} />
                    <span>{fetchQuery.isFetching ? 'Mengambil...' : 'Impor dari Sheet'}</span>
                  </button>
                </div>
                <p className="cloud-tip">
                  Gunakan Web App URL dari Google Apps Script untuk sinkronisasi data secara otomatis.
                </p>
              </div>
            </div>

            <div className="profile-menu">
              <button className="menu-item glass-card">
                <Settings size={18} />
                Pengaturan Akun
              </button>
              <button 
                className="menu-item glass-card" 
                style={{ color: '#ef4444' }}
                onClick={handleResetData}
              >
                <Trash2 size={18} />
                Reset Semua Data
              </button>
              <button className="menu-item glass-card" style={{ color: '#f43f5e' }}>Keluar</button>
            </div>
          </motion.div>
        )}
      </main>

      {/* FAB */}
      <button 
        className="fab-btn"
        onClick={() => setShowAddModal(true)}
      >
        <Plus size={28} />
      </button>

      {/* Bottom Nav */}
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
          <PieChartIcon size={22} />
          <span>Stats</span>
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              className="modal-content glass-card"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Tambah Transaksi</h3>
                <button className="close-modal" onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </div>
              <form className="add-form" onSubmit={handleAddTransaction}>
                <div className="type-toggle">
                  <button 
                    type="button" 
                    className={`type-btn income ${formData.type === 'income' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type: 'income', category: 'work'})}
                  >
                    Pemasukan
                  </button>
                  <button 
                    type="button" 
                    className={`type-btn expense ${formData.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type: 'expense', category: 'food'})}
                  >
                    Pengeluaran
                  </button>
                  <button 
                    type="button" 
                    className={`type-btn debt ${formData.type === 'debt' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type: 'debt', category: 'piutang'})}
                  >
                    Piutang/Hutang
                  </button>
                </div>

                <div className="input-group">
                  <label>Nominal</label>
                  <div className="nominal-input-wrapper">
                    <span className="currency-prefix">Rp</span>
                    <input 
                      type="text" 
                      placeholder="0" 
                      value={formatInputRupiah(formData.amount)}
                      onChange={(e) => setFormData({...formData, amount: parseRupiah(e.target.value)})}
                      className="amount-input"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Judul</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Makan Siang" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                  <div className="template-chips">
                    {(TITLE_TEMPLATES[formData.category] || TITLE_TEMPLATES['other']).map(t => (
                      <button 
                        key={t}
                        type="button"
                        className="chip"
                        onClick={() => setFormData({...formData, title: t})}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>Kategori</label>
                  <div className="category-grid">
                    {CATEGORIES[formData.type].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`cat-item ${formData.category === cat.id ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, category: cat.id})}
                      >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-name">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.type === 'debt' && (
                  <>
                    <div className="input-group animate-slide-up">
                      <label>Jumlah Angsuran (Bulan)</label>
                      <div className="installment-input-wrapper">
                        <input 
                          type="number" 
                          min="1"
                          max="60"
                          value={formData.installments}
                          onChange={(e) => setFormData({...formData, installments: e.target.value})}
                          placeholder="1"
                        />
                        {Number(formData.installments) > 1 && formData.amount && (
                          <div className="installment-preview glass-card">
                            <p>Angsuran: <strong>{formatCurrency(Number(formData.amount) / Number(formData.installments))}</strong> / bulan</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {Number(formData.installments) > 1 && (
                      <div className="input-group animate-slide-up">
                        <label>Tanggal Jatuh Tempo (Tiap Bulan)</label>
                        <select 
                          className="due-date-select"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        >
                          {[...Array(31)].map((_, i) => (
                            <option key={i+1} value={i+1}>Tanggal {i+1}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <button type="submit" className="btn-primary w-full py-4 mt-2">Simpan Transaksi</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="modal-overlay" onClick={closeConfirm}>
            <motion.div 
              className="confirm-modal glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={`confirm-icon-header ${confirmModal.type}`}>
                {confirmModal.type === 'danger' ? <Trash2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>
              
              <div className="confirm-actions">
                {confirmModal.showSecondary && (
                  <button className="secondary-btn" onClick={confirmModal.onSecondary}>
                    {confirmModal.secondaryText}
                  </button>
                )}
                <button className={`primary-btn ${confirmModal.type}`} onClick={confirmModal.onConfirm}>
                  {confirmModal.confirmText}
                </button>
                <button className="cancel-btn" onClick={closeConfirm}>
                  {confirmModal.cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
