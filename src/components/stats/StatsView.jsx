import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingDown, Zap, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const StatsView = ({ 
  financialHealth, 
  statsFilter, 
  setStatsFilter, 
  dynamicChartData, 
  dynamicPieData, 
  totalExpense,
  transactions,
  budgets,
  onSetBudget
}) => {
  const budgetList = useMemo(() => {
    // Get unique categories from expenses
    const categories = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Lainnya'];
    return categories.map(cat => {
      const budget = budgets[cat] || 0;
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((a, b) => a + Math.abs(b.amount), 0);
      return { name: cat, budget, spent };
    });
  }, [budgets, transactions]);

  return (
    <motion.div 
      className="stats-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Point 1: Budgeting Progress */}
      <section className="section">
        <div className="section-header">
          <h3>Anggaran Kategori</h3>
          <span className="text-xs text-dim">Point 1: Budgeting</span>
        </div>
        <div className="budget-grid">
          {budgetList.map(b => {
            const percent = b.budget > 0 ? (b.spent / b.budget) * 100 : 0;
            const isOver = percent >= 100;
            return (
              <div key={b.name} className="budget-item glass-card">
                <div className="budget-info">
                  <span className="budget-name">{b.name}</span>
                  <span className="budget-values">
                    {formatCurrency(b.spent)} / {b.budget > 0 ? formatCurrency(b.budget) : 'N/A'}
                  </span>
                </div>
                <div className="budget-progress-container">
                  <div 
                    className={`budget-progress-fill ${isOver ? 'over' : ''}`} 
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <button 
                  className="set-budget-btn" 
                  onClick={() => {
                    const val = prompt(`Atur budget untuk ${b.name}:`, b.budget);
                    if (val !== null) onSetBudget(b.name, Number(val));
                  }}
                >
                  Set Budget
                </button>
              </div>
            );
          })}
        </div>
      </section>

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

      <motion.div 
        className="insight-summary-bar glass-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Lightbulb size={18} color="var(--accent-primary)" />
        <p>{financialHealth.behaviorText}</p>
      </motion.div>

      <section className="section">
        <div className="section-header">
          <h3>Analisis Pengeluaran</h3>
          <div className="stats-filter-tabs">
            {['daily', 'weekly', 'monthly'].map(f => (
              <button 
                key={f}
                className={`filter-tab ${statsFilter === f ? 'active' : ''}`}
                onClick={() => setStatsFilter(f)}
              >
                {f === 'daily' ? 'Harian' : f === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container glass-card" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicChartData}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-dim)' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => formatCurrency(val)}
              />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Rest of Stats View Logic... */}
      <section className="section">
        <div className="section-header">
          <h3>Distribusi Kategori</h3>
        </div>
        <div className="chart-container glass-card" style={{ height: '280px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dynamicPieData}
                cx="50%" cy="50%"
                innerRadius={65} outerRadius={85}
                paddingAngle={8} dataKey="value"
              >
                {dynamicPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val) => formatCurrency(val)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center-label">
            <p>Total</p>
            <span>{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default StatsView;
