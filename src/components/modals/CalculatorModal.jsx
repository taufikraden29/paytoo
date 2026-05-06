import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

const CalculatorModal = ({ 
  show, 
  onClose, 
  calcDisplay, 
  calcPrevValue, 
  calcOperator, 
  calcCopied, 
  onCopy, 
  onClear, 
  onInputDigit, 
  onInputDot, 
  onPerformOperation,
  formatCalcDisplay
}) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            className="calculator-modal glass-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="calc-header">
              <h3>Kalkulator</h3>
              <button className="close-btn" onClick={onClose}><X size={20} /></button>
            </div>

            <div className="calc-display-container glass-card">
              <div className="calc-prev-value">
                {calcPrevValue !== null && `${formatCalcDisplay(calcPrevValue)} ${calcOperator || ''}`}
              </div>
              <div className="calc-main-display">
                {formatCalcDisplay(calcDisplay)}
              </div>
              <button className="calc-copy-btn" onClick={onCopy}>
                {calcCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </button>
            </div>

            <div className="calc-grid">
              <button className="calc-btn utility" onClick={onClear}>AC</button>
              <button className="calc-btn utility" onClick={() => onPerformOperation('±')}>±</button>
              <button className="calc-btn utility" onClick={() => onPerformOperation('%')}>%</button>
              <button className="calc-btn operator" onClick={() => onPerformOperation('/')}>÷</button>

              {[7, 8, 9].map(n => <button key={n} className="calc-btn" onClick={() => onInputDigit(n)}>{n}</button>)}
              <button className="calc-btn operator" onClick={() => onPerformOperation('*')}>×</button>

              {[4, 5, 6].map(n => <button key={n} className="calc-btn" onClick={() => onInputDigit(n)}>{n}</button>)}
              <button className="calc-btn operator" onClick={() => onPerformOperation('-')}>−</button>

              {[1, 2, 3].map(n => <button key={n} className="calc-btn" onClick={() => onInputDigit(n)}>{n}</button>)}
              <button className="calc-btn operator" onClick={() => onPerformOperation('+')}>+</button>

              <button className="calc-btn double" onClick={() => onInputDigit(0)}>0</button>
              <button className="calc-btn" onClick={onInputDot}>.</button>
              <button className="calc-btn operator equals" onClick={() => onPerformOperation('=')}>=</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CalculatorModal;
