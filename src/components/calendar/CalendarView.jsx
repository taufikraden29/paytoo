import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CalendarView = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month days
    const firstDay = date.getDay();
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null });
    }

    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      const dayTrans = transactions.filter(t => {
        if (t.isoDate) {
          const d = new Date(t.isoDate);
          return d.getDate() === i && d.getMonth() === month && d.getFullYear() === year;
        }
        return t.date === dateStr;
      });

      const income = dayTrans.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
      const expense = dayTrans.filter(t => t.type === 'expense').reduce((a, b) => a + Math.abs(Number(b.amount)), 0);

      days.push({ day: i, income, expense, count: dayTrans.length });
    }

    return days;
  }, [currentDate, transactions]);

  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <motion.div 
      className="calendar-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="calendar-header glass-card">
        <button onClick={prevMonth}><ChevronLeft size={20} /></button>
        <h3>{monthName}</h3>
        <button onClick={nextMonth}><ChevronRight size={20} /></button>
      </div>

      <div className="calendar-grid-header">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
          <div key={d} className="grid-day-label">{d}</div>
        ))}
      </div>

      <div className="calendar-grid glass-card">
        {daysInMonth.map((d, i) => (
          <div key={i} className={`calendar-day ${d.day === null ? 'empty' : ''} ${d.count > 0 ? 'has-data' : ''}`}>
            {d.day && (
              <>
                <span className="day-number">{d.day}</span>
                <div className="day-amounts">
                  {d.income > 0 && <span className="day-income">+{formatCurrency(d.income).replace('Rp', '')}</span>}
                  {d.expense > 0 && <span className="day-expense">-{formatCurrency(d.expense).replace('Rp', '')}</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend-box glass-card mt-4">
        <div className="legend-item"><div className="dot income"></div> Pemasukan</div>
        <div className="legend-item"><div className="dot expense"></div> Pengeluaran</div>
      </div>
    </motion.div>
  );
};

export default CalendarView;
