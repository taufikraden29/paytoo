import React from 'react';
import { motion } from 'framer-motion';

const AdviceCard = ({ financialHealth }) => {
  return (
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
  );
};

export default AdviceCard;
