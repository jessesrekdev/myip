import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, ChevronRight, Shield, FileText, Lock, ArrowLeft, Check } from 'lucide-react';
import { getLocalIp } from '../services/ipUtils';

interface SettingsViewProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type SubPage = 'TERMS' | 'PRIVACY' | null;

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, toggleTheme }) => {
  const [activePage, setActivePage] = useState<SubPage>(null);
  const [permStatus, setPermStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRequestPermission = async () => {
    try {
      const result = await getLocalIp(true);
      if (result && result !== 'Permission Denied') {
        setPermStatus('success');
      } else {
        setPermStatus('error');
      }
      setTimeout(() => setPermStatus('idle'), 3000);
    } catch (e) {
      setPermStatus('error');
      setTimeout(() => setPermStatus('idle'), 3000);
    }
  };

  const menuItems = [
    {
      icon: isDarkMode ? Sun : Moon,
      label: 'Appearance',
      value: isDarkMode ? 'Dark Mode' : 'Light Mode',
      action: toggleTheme,
      type: 'toggle'
    },
    {
      icon: Shield,
      label: 'Permissions',
      value: 'Manage Access',
      action: handleRequestPermission,
      type: 'button',
      status: permStatus
    },
    {
      icon: FileText,
      label: 'Terms of Use',
      action: () => setActivePage('TERMS'),
      type: 'link'
    },
    {
      icon: Lock,
      label: 'Privacy Policy',
      action: () => setActivePage('PRIVACY'),
      type: 'link'
    }
  ];

  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        {activePage === null ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {menuItems.map((item, idx) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm group transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-slate-700 dark:text-slate-200 font-medium text-sm">
                        {item.label}
                      </span>
                      {item.value && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {item.status === 'success' ? 'Granted!' : item.status === 'error' ? 'Check Settings' : item.value}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.status === 'success' ? (
                     <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1 rounded-full">
                        <Check size={16} />
                     </div>
                  ) : item.type === 'link' ? (
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                  ) : item.type === 'toggle' ? (
                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <motion.div 
                          layout 
                          className={`w-4 h-4 bg-white rounded-full shadow-sm ${isDarkMode ? 'ml-4' : 'ml-0'}`} 
                        />
                     </div>
                  ) : null}
                </motion.button>
              ))}
            </div>
            
            <div className="text-center pt-8">
              <p className="text-xs text-slate-400 dark:text-slate-600">
                My IP v1.1.0
                <br />
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subpage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 bg-slate-50 dark:bg-slate-950 z-20 overflow-y-auto no-scrollbar pb-20"
          >
            <button
              onClick={() => setActivePage(null)}
              className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mb-6 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-medium text-sm">Back to Settings</span>
            </button>
            
            <div className="prose prose-slate dark:prose-invert prose-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                {activePage === 'TERMS' ? 'Terms of Use' : 'Privacy Policy'}
              </h2>
              
              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {activePage === 'TERMS' ? (
                  <>
                    <p>By using My IP, you agree to these terms. This application is provided "as is" for informational purposes only.</p>
                    <h3 className="font-semibold text-slate-800 dark:text-white mt-4">1. Usage</h3>
                    <p>You may use this app to view your own network information. Do not use this tool for malicious network scanning.</p>
                    <h3 className="font-semibold text-slate-800 dark:text-white mt-4">2. Accuracy</h3>
                    <p>While we strive for accuracy, IP geolocation and local IP detection methods may not always be 100% precise depending on your network configuration.</p>
                  </>
                ) : (
                  <>
                    <p>Your privacy is important to us. My IP is designed to process data locally wherever possible.</p>
                    <h3 className="font-semibold text-slate-800 dark:text-white mt-4">1. Data Collection</h3>
                    <p>Your IP address is sent to IPify (for public IP detection) and Google Gemini (for AI insights). We do not store your IP address on our servers.</p>
                    <h3 className="font-semibold text-slate-800 dark:text-white mt-4">2. Local Network Access</h3>
                    <p>We request microphone permissions solely to utilize WebRTC for local IP discovery. No audio is recorded or transmitted.</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};