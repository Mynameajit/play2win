import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
    : "w-full h-full min-h-[200px] flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="mb-4 text-purple-500"
      >
        <Loader2 size={48} className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        className="text-slate-300 font-medium tracking-wide"
      >
        {message}
      </motion.p>
    </div>
  );
};
