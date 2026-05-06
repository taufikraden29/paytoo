import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ show, config, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            className="confirm-modal glass-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`confirm-icon-header ${config.type}`}>
              {config.type === 'danger' ? <Trash2 size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3>{config.title}</h3>
            <p>{config.message}</p>
            
            <div className="confirm-actions">
              {config.showSecondary && (
                <button className="secondary-btn" onClick={config.onSecondary}>
                  {config.secondaryText}
                </button>
              )}
              <button className={`primary-btn ${config.type}`} onClick={config.onConfirm}>
                {config.confirmText}
              </button>
              <button className="cancel-btn" onClick={onClose}>
                {config.cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
