import React, { useState, useEffect } from 'react';
import { User, AdBanner } from './types';
import MobileFrame from './components/MobileFrame';
import Login from './components/Login';
import AdPlayer from './components/AdPlayer';
import Dashboard from './components/Dashboard';
import DiamondStore from './components/DiamondStore';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import { Home, ShoppingBag, User as UserIcon, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUserById, updateUserCoins } from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lojinha' | 'perfil' | 'admin'>('dashboard');
  const [currentAdBanner, setCurrentAdBanner] = useState<AdBanner | null>(null);
  const [cooldownStates, setCooldownStates] = useState<Record<string, number>>({});
  const [isCoinsAnimating, setIsCoinsAnimating] = useState(false);


  // Initialize and load session from localStorage & Firestore (Collection: 'users', Field: 'coinsApproved') on mount
  useEffect(() => {
    const loadSession = async () => {
      const currentUserId = localStorage.getItem('coinad_current_user_id');
      if (currentUserId) {
        // Try getting user from Firestore 'users' collection first (which automatically resolves 'coinsApproved' into 'coins' property for our frontend)
        try {
          const cloudUser = await getUserById(currentUserId);
          if (cloudUser) {
            setCurrentUser(cloudUser);
            // Sync locally
            const usersData = localStorage.getItem('coinad_users');
            if (usersData) {
              const users: User[] = JSON.parse(usersData);
              const idx = users.findIndex((u) => u.id === cloudUser.id);
              if (idx !== -1) {
                users[idx] = cloudUser;
              } else {
                users.push(cloudUser);
              }
              localStorage.setItem('coinad_users', JSON.stringify(users));
            } else {
              localStorage.setItem('coinad_users', JSON.stringify([cloudUser]));
            }
          } else {
            // Fallback to local storage if Firestore has no record
            const usersData = localStorage.getItem('coinad_users');
            if (usersData) {
              const users: User[] = JSON.parse(usersData);
              const found = users.find((u) => u.id === currentUserId);
              if (found) {
                setCurrentUser(found);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load user session from Firestore:', err);
          const usersData = localStorage.getItem('coinad_users');
          if (usersData) {
            const users: User[] = JSON.parse(usersData);
            const found = users.find((u) => u.id === currentUserId);
            if (found) {
              setCurrentUser(found);
            }
          }
        }
      }
    };
    
    loadSession();

    // Load active banner cooldowns if saved
    const savedCooldowns = localStorage.getItem('coinad_cooldowns');
    if (savedCooldowns) {
      const parsed = JSON.parse(savedCooldowns);
      // Filter out past cooldowns
      const filtered: Record<string, number> = {};
      const now = Date.now();
      Object.entries(parsed).forEach(([id, exp]) => {
        if (typeof exp === 'number' && exp > now) {
          filtered[id] = exp;
        }
      });
      setCooldownStates(filtered);
    }
  }, []);

  // Save cooldowns to localStorage when they change
  useEffect(() => {
    if (Object.keys(cooldownStates).length > 0) {
      localStorage.setItem('coinad_cooldowns', JSON.stringify(cooldownStates));
    }
  }, [cooldownStates]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('coinad_current_user_id');
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Trigger when a banner ad is tapped
  const handleAdClicked = async (banner: AdBanner) => {
    if (!currentUser) return;

    // 1. Immediately apply the 30-second cooldown lock to this specific banner on click
    const nextCooldownExpire = Date.now() + 30 * 1000;
    setCooldownStates((prev) => ({
      ...prev,
      [banner.id]: nextCooldownExpire,
    }));

    // Trigger visual coins scaling pop animation in header
    setIsCoinsAnimating(true);
    setTimeout(() => setIsCoinsAnimating(false), 800);

    try {
      // 3. Instant reward of +10 coins as requested
      const updatedCoins = currentUser.coins + 10;
      const updatedUser: User = {
        ...currentUser,
        coins: updatedCoins,
      };

      // 4. Save to Firestore 'users' collection (updates both coinsApproved and coins)
      await updateUserCoins(currentUser.id, updatedCoins);

      // 5. Update global users database in localStorage for offline resiliency
      const usersData = localStorage.getItem('coinad_users');
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = updatedUser;
          localStorage.setItem('coinad_users', JSON.stringify(users));
        }
      }

      // 6. Update statistics of watched ads today
      const todayKey = `coinad_watched_today_${currentUser.id}_${new Date().toDateString()}`;
      const totalToday = parseInt(localStorage.getItem(todayKey) || '0', 10) + 1;
      localStorage.setItem(todayKey, String(totalToday));

      // 7. Update career lifetime ads watched count
      const careerKey = `coinad_watched_total_${currentUser.id}`;
      const careerTotal = parseInt(localStorage.getItem(careerKey) || '0', 10) + 1;
      localStorage.setItem(careerKey, String(careerTotal));

      // 8. Update current user state
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Failed to reward user:', err);
    }
  };

  // Keep reward claimed as fallback for legacy components
  const handleRewardClaimed = async () => {
    if (!currentUser || !currentAdBanner) return;

    setIsCoinsAnimating(true);
    setTimeout(() => setIsCoinsAnimating(false), 800);

    const updatedCoins = currentUser.coins + currentAdBanner.reward;
    const updatedUser: User = {
      ...currentUser,
      coins: updatedCoins,
    };

    try {
      await updateUserCoins(currentUser.id, updatedCoins);
    } catch (err) {
      console.error('Failed to update user coins in Firestore, falling back to local storage:', err);
    }

    const usersData = localStorage.getItem('coinad_users');
    if (usersData) {
      const users: User[] = JSON.parse(usersData);
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = updatedUser;
        localStorage.setItem('coinad_users', JSON.stringify(users));
      }
    }

    const nextCooldownExpire = Date.now() + 30 * 1000; // Force 30s as requested
    setCooldownStates((prev) => ({
      ...prev,
      [currentAdBanner.id]: nextCooldownExpire,
    }));

    const todayKey = `coinad_watched_today_${currentUser.id}_${new Date().toDateString()}`;
    const totalToday = parseInt(localStorage.getItem(todayKey) || '0', 10) + 1;
    localStorage.setItem(todayKey, String(totalToday));

    const careerKey = `coinad_watched_total_${currentUser.id}`;
    const careerTotal = parseInt(localStorage.getItem(careerKey) || '0', 10) + 1;
    localStorage.setItem(careerKey, String(careerTotal));

    setCurrentUser(updatedUser);
    setCurrentAdBanner(null);
  };

  const handleAdPlayerClose = () => {
    setCurrentAdBanner(null);
  };

  const refreshCurrentUser = async () => {
    if (currentUser) {
      try {
        const freshUser = await getUserById(currentUser.id);
        if (freshUser) {
          setCurrentUser(freshUser);
        }
      } catch (err) {
        console.error('Error refreshing current user session:', err);
      }
    }
  };

  return (
    <MobileFrame>
      {/* Absolute positioning relative to Mobile viewport */}
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0a0d14]">
        
        {/* AdPlayer Overlay */}
        <AnimatePresence>
          {currentAdBanner && currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 z-50"
            >
              <AdPlayer
                userId={currentUser.id}
                bannerTitle={currentAdBanner.title}
                onRewardClaimed={handleRewardClaimed}
                onClose={handleAdPlayerClose}
              />
            </motion.div>
          )}
        </AnimatePresence>



        {/* Client Session Flow router */}
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : activeTab === 'admin' ? (
          <AdminPanel
            currentUser={currentUser}
            onBack={() => setActiveTab('perfil')}
            onRefreshCurrentUser={refreshCurrentUser}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Top Micro balance bar (Sticky header across all views) */}
            <div className="px-5 py-3.5 bg-[#0c0f14]/90 backdrop-blur-md border-b border-slate-900/80 flex justify-between items-center z-30 select-none">
              <span className="font-display font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] to-amber-400">
                Sheik Coin
              </span>

              {/* Animated Coins bubble */}
              <motion.div
                animate={isCoinsAnimating ? { scale: [1, 1.25, 0.95, 1.05, 1] } : {}}
                transition={{ duration: 0.65 }}
                className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-inner"
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400/10" />
                <span className="text-xs font-black text-amber-400 font-mono tracking-tight">
                  {currentUser.coins}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Coins</span>
              </motion.div>
            </div>

            {/* Core Router Views body */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeTab === 'dashboard' && (
                <Dashboard
                  user={currentUser}
                  onAdClicked={handleAdClicked}
                  cooldownStates={cooldownStates}
                />
              )}

              {activeTab === 'lojinha' && (
                <DiamondStore
                  user={currentUser}
                  onUserUpdate={handleUserUpdate}
                />
              )}

              {activeTab === 'perfil' && (
                <Profile
                  user={currentUser}
                  onLogout={handleLogout}
                  onUserUpdate={handleUserUpdate}
                  onNavigateToAdmin={() => setActiveTab('admin')}
                />
              )}
            </div>

            {/* Fixed Bottom App Navigation Bar */}
            <div className="bg-[#0c0f14]/95 backdrop-blur-md border-t border-slate-900/60 py-2.5 px-6 flex justify-between items-center z-30 shadow-2xl shrink-0">
              {/* Tab Button 1 */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'dashboard' ? 'text-[#ff4655] scale-105' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Home className="w-5.5 h-5.5" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Início</span>
              </button>

              {/* Tab Button 2 - Diamond Store (Lojinha) */}
              <button
                onClick={() => setActiveTab('lojinha')}
                className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'lojinha' ? 'text-[#ff4655] scale-105' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ShoppingBag className="w-5.5 h-5.5" strokeWidth={activeTab === 'lojinha' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Lojinha</span>
              </button>

              {/* Tab Button 3 */}
              <button
                onClick={() => setActiveTab('perfil')}
                className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'perfil' ? 'text-[#ff4655] scale-105' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <UserIcon className="w-5.5 h-5.5" strokeWidth={activeTab === 'perfil' ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Perfil</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </MobileFrame>
  );
}
