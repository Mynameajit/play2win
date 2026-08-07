import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  icon: Icon = Inbox 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-xl bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="p-4 mb-4 rounded-full bg-slate-800/50 text-cyan-400 ring-1 ring-cyan-500/30 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
        <Icon size={32} />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-slate-100">{title}</h3>
      <p className="max-w-md text-slate-400">{message}</p>
    </motion.div>
  );
};
