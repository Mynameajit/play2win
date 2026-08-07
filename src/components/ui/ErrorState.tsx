import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Something went wrong. Please try again later.", 
  onRetry 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-red-500/20 bg-slate-900/80"
    >
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-4 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]"
      >
        <AlertTriangle size={48} />
      </motion.div>
      <h3 className="mb-2 text-xl font-bold text-slate-100">Error Encountered</h3>
      <p className="mb-6 max-w-md text-slate-400">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </motion.div>
  );
};
