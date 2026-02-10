import React from 'react';
import { motion } from 'framer-motion';
import { Copy, ShieldCheck, Globe, Wifi, RefreshCw, Lock, Unlock } from 'lucide-react';

interface IpCardProps {
  label: string;
  ip: string | null;
  type: 'local' | 'public';
  loading: boolean;
  onRefresh?: () => void;
  onReveal?: () => void;
}

export const IpCard: React.FC<IpCardProps> = ({ label, ip, type, loading, onRefresh, onReveal }) => {
  const handleCopy = () => {
    if (ip && !isHidden) {
      navigator.clipboard.writeText(ip);
    }
  };

  const isLocal = type === 'local';
  const Icon = isLocal ? Wifi : Globe;
  // Colors adapt to dark mode
  const colorClass = isLocal ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-500 dark:text-blue-400';
  const bgClass = isLocal ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-blue-500/10 dark:bg-blue-500/20';
  
  const isHidden = ip === 'Hidden by Browser' || ip === 'Permission Denied';
  const isError = ip === 'Unavailable' || ip === 'Not Found';

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group transition-colors duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
        {onRefresh && !isHidden && (
          <button 
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
        {label}
      </h3>
      
      <div className="flex items-center justify-between min-h-[3rem]">
        <div className="flex-1">
          {loading ? (
             <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md" />
          ) : isHidden && onReveal ? (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onReveal}
              className="group flex items-center space-x-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
            >
              <Lock size={14} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span>Tap to Reveal</span>
            </motion.button>
          ) : (
            <span className={`text-2xl font-bold font-mono break-all ${isError ? 'text-slate-400 dark:text-slate-500 text-lg' : 'text-slate-800 dark:text-white'}`}>
              {ip || 'Unavailable'}
            </span>
          )}
        </div>
        
        {!loading && !isHidden && !isError && ip && (
          <button
            onClick={handleCopy}
            className="ml-4 p-2 text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
          >
            <Copy size={20} />
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center text-xs text-slate-400 dark:text-slate-500">
        <ShieldCheck size={14} className="mr-1.5 text-slate-300 dark:text-slate-600" />
        {isLocal ? 'Internal Network Identifier' : 'External Network Identifier'}
      </div>
    </motion.div>
  );
};