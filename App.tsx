import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Settings, Info, RefreshCw } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { IpCard } from './components/IpCard';
import { NetworkInfo } from './components/NetworkInfo';
import { SettingsView } from './components/SettingsView';
import { getLocalIp, getPublicIp } from './services/ipUtils';
import { Tab, IpData } from './types';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ipData, setIpData] = useState<IpData>({
    localIp: null,
    publicIp: null,
    loading: true,
    error: null,
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.cookie = `theme=${newTheme ? 'dark' : 'light'}; path=/; max-age=31536000`;
  };

  const fetchIps = async () => {
    setIpData(prev => ({ ...prev, loading: true }));
    
    // Parallel fetch for speed
    const [local, publicAddr] = await Promise.all([
      getLocalIp(false), // Default: don't ask for permission
      getPublicIp()
    ]);

    setIpData({
      localIp: local,
      publicIp: publicAddr,
      loading: false,
      error: null
    });
  };

  const handleRevealLocalIp = async () => {
    setIpData(prev => ({ ...prev, loading: true }));
    // Retry with permission flag true
    const local = await getLocalIp(true);
    setIpData(prev => ({
      ...prev,
      localIp: local,
      loading: false
    }));
  };

  useEffect(() => {
    // Start fetching immediately
    fetchIps();

    // Load theme from cookie
    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Re-fetch when connection is restored
    const handleOnline = () => {
      fetchIps();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const navItems = [
    { id: Tab.HOME, icon: Home, label: 'Dashboard' },
    { id: Tab.INSIGHTS, icon: Info, label: 'Insights' },
    { id: Tab.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    // Outer wrapper handles the 'dark' class for Tailwind
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        </AnimatePresence>

        {!showSplash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-slate-950 relative shadow-2xl overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white dark:bg-slate-900 rounded-b-[2.5rem] shadow-sm z-10 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {activeTab === Tab.SETTINGS ? 'Settings' : 'My Network'}
                  </h1>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {activeTab === Tab.SETTINGS ? 'Preferences & Legal' : 'Active Connection'}
                  </p>
                </div>
                {activeTab === Tab.HOME && (
                  <button 
                    onClick={fetchIps}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <RefreshCw size={20} className={ipData.loading ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>
            </header>

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24">
              {activeTab === Tab.HOME && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <IpCard 
                    label="Private IP Address" 
                    ip={ipData.localIp} 
                    type="local" 
                    loading={ipData.loading}
                    onRefresh={fetchIps}
                    onReveal={handleRevealLocalIp}
                  />
                  
                  <IpCard 
                    label="Public IP Address" 
                    ip={ipData.publicIp} 
                    type="public" 
                    loading={ipData.loading}
                  />

                  {/* Info Note about Private IPs */}
                  {ipData.localIp === 'Hidden by Browser' && (
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm">
                       <p className="font-semibold mb-1">Why do I need to tap reveal?</p>
                       Browsers hide your local IP for privacy. Granting temporary permission allows us to unmask it safely.
                     </div>
                  )}
                  
                  {ipData.localIp === 'Permission Denied' && (
                     <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
                       <p className="font-semibold mb-1">Access Denied</p>
                       We could not retrieve the local IP without permission. You can try again or check your browser settings.
                     </div>
                  )}

                  {ipData.publicIp === 'Offline' && (
                     <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center">
                       <p>You are currently offline. Public IP cannot be retrieved.</p>
                     </div>
                  )}
                </motion.div>
              )}

              {activeTab === Tab.INSIGHTS && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <NetworkInfo ip={ipData.publicIp} isLocal={false} />
                  <div className="h-4"></div>
                  <NetworkInfo ip={ipData.localIp} isLocal={true} />
                </motion.div>
              )}

              {activeTab === Tab.SETTINGS && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full"
                >
                   <SettingsView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                </motion.div>
              )}
            </main>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-6 left-6 right-6 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-2 flex justify-between items-center z-20 transition-colors duration-300">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${
                      isActive ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.span
                        layoutId="navLabel"
                        className="text-[10px] font-bold mt-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </nav>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default App;