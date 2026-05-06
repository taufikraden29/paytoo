import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { formatInputRupiah, parseRupiah, formatCurrency } from '../../utils/formatters';
import { CATEGORIES, TITLE_TEMPLATES } from '../../utils/constants';

const AddTransactionModal = ({ 
  show, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              <button className="close-modal" onClick={onClose}><X size={20} /></button>
            </div>
            <form className="add-form" onSubmit={onSubmit}>
              <div className="type-toggle">
                {['income', 'expense', 'debt'].map(type => (
                  <button 
                    key={type}
                    type="button" 
                    className={`type-btn ${type} ${formData.type === type ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type, category: type === 'income' ? 'work' : type === 'expense' ? 'food' : 'piutang'})}
                  >
                    {type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Piutang/Hutang'}
                  </button>
                ))}
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
                    <input 
                      type="number" 
                      min="1" max="60"
                      value={formData.installments}
                      onChange={(e) => setFormData({...formData, installments: e.target.value})}
                    />
                    {Number(formData.installments) > 1 && formData.amount && (
                      <div className="installment-preview glass-card">
                        <p>Angsuran: <strong>{formatCurrency(Number(formData.amount) / Number(formData.installments))}</strong> / bln</p>
                      </div>
                    )}
                  </div>
                  {Number(formData.installments) > 1 && (
                    <div className="input-group animate-slide-up">
                      <label>Jatuh Tempo (Tgl)</label>
                      <select value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})}>
                        {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>Tanggal {i+1}</option>)}
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
  );
};

export default AddTransactionModal;
