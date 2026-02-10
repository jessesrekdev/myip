import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Shield, Terminal, Sparkles } from 'lucide-react';
import { NetworkInsight } from '../types';
import { getNetworkInsights } from '../services/geminiService';

interface NetworkInfoProps {
  ip: string | null;
  isLocal: boolean;
}

export const NetworkInfo: React.FC<NetworkInfoProps> = ({ ip, isLocal }) => {
  const [insights, setInsights] = useState<NetworkInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!ip || ip === 'Unavailable' || ip === 'Hidden by Browser') return;
      
      setLoading(true);
      const data = await getNetworkInsights(ip, isLocal);
      setInsights(data);
      setLoading(false);
    };

    fetchInsights();
  }, [ip, isLocal]);

  if (!ip || ip === 'Unavailable') return null;

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-4 px-2">
        <Sparkles size={18} className="text-purple-500 dark:text-purple-400" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">AI Analysis</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, idx) => {
            const Icon = insight.type === 'security' ? Shield : insight.type === 'technical' ? Terminal : Lightbulb;
            const color = insight.type === 'security' ? 'text-rose-500 dark:text-rose-400' : insight.type === 'technical' ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500 dark:text-amber-400';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 flex gap-3 transition-colors duration-300"
              >
                <div className={`mt-0.5 ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insight.content}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};