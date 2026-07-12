import React, { useState, useEffect } from 'react';
import { User, AdBanner } from '../types';
import { Coins, Sparkles, Flame, Play, Clock, ChevronRight, Trophy, BellRing, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from './Footer';

interface DashboardProps {
  user: User;
  onAdClicked: (banner: AdBanner) => void;
  cooldownStates: Record<string, number>; // bannerId -> epoch timestamp when cooldown ends
  onOpenPage: (page: 'privacy' | 'terms' | 'contact') => void;
}

const BANNERS_DATA: AdBanner[] = [
  {
    id: 'banner_gamer',
    title: 'Gamer Premium Quest',
    reward: 10,
    cooldownSeconds: 30,
    color: 'from-purple-600 via-indigo-600 to-indigo-800',
    borderColor: 'border-indigo-500/30',
    tag: 'Games',
    sponsor: 'Hero Quest: Legends',
    logoColor: 'text-indigo-400'
  },
  {
    id: 'banner_casino',
    title: 'Casino Mega Spin 777',
    reward: 10,
    cooldownSeconds: 30,
    color: 'from-amber-600 via-rose-600 to-pink-700',
    borderColor: 'border-rose-500/30',
    tag: 'Diversão',
    sponsor: 'Slots Mega Fortune',
    logoColor: 'text-amber-400'
  },
  {
    id: 'banner_crypto',
    title: 'Crypto Miner Applet',
    reward: 10,
    cooldownSeconds: 30,
    color: 'from-teal-600 via-emerald-600 to-cyan-700',
    borderColor: 'border-emerald-500/30',
    tag: 'Finanças',
    sponsor: 'Crypto Tycoon Corp',
    logoColor: 'text-emerald-400'
  }
];

// Rolling ticker announcements to make the application feel active with online users
const LIVE_ANNOUNCEMENTS = [
  "Mariana S. acabou de sacar R$ 15,00 via Pix!",
  "Pedro H. assistiu todos os banners e ganhou bônus!",
  "Carlos M. resgatou R$ 10,00 via CPF!",
  "Beatriz G. acaba de se cadastrar no Sheik coin!",
  "Lucas V. bateu a meta diária de 10 anúncios!"
];

export default function Dashboard({ user, onAdClicked, cooldownStates, onOpenPage }: DashboardProps) {
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [remainingCooldowns, setRemainingCooldowns] = useState<Record<string, number>>({});
  const [totalWatchedToday, setTotalWatchedToday] = useState(0);

  // Load and calculate mock stats of today's progress
  useEffect(() => {
    const key = `coinad_watched_today_${user.id}_${new Date().toDateString()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setTotalWatchedToday(parseInt(stored, 10));
    } else {
      setTotalWatchedToday(2); // Start with 2 completed to feel warm
    }
  }, [user.id]);

  // Rolling announcement intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % LIVE_ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Update remaining cooldown timer states
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const newCooldowns: Record<string, number> = {};
      
      Object.entries(cooldownStates).forEach(([id, expireTime]) => {
        const diff = Math.max(0, Math.ceil((expireTime - now) / 1000));
        if (diff > 0) {
          newCooldowns[id] = diff;
        }
      });
      setRemainingCooldowns(newCooldowns);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [cooldownStates]);

  const handleBannerAction = (banner: AdBanner) => {
    // If banner is on cooldown, do nothing
    if (remainingCooldowns[banner.id]) return;
    onAdClicked(banner);
  };

  const dailyGoal = 10;
  const progressRatio = Math.min(100, (totalWatchedToday / dailyGoal) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0d14] pb-6 no-scrollbar">
      {/* Live payout feed ticker */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center gap-2 select-none shrink-0 overflow-hidden">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-500 shrink-0">
          <BellRing className="w-3.5 h-3.5 animate-bounce" />
          <span>Ao Vivo:</span>
        </div>
        <div className="flex-1 overflow-hidden h-4 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeAnnouncement}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[11px] text-slate-400 font-medium truncate"
            >
              {LIVE_ANNOUNCEMENTS[activeAnnouncement]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Header Area */}
      <div className="p-5 space-y-4">
        {/* User Info & Main balance card */}
        <div className="flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            {/* Native style premium avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/10">
                <div className="w-full h-full rounded-full bg-[#121620] flex items-center justify-center text-amber-400 font-bold font-display text-sm uppercase">
                  {user.name ? user.name.slice(0, 2) : 'US'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#0a0d14] flex items-center justify-center" />
            </div>

            <div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Bem-vindo(a)</p>
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">{user.name}</h3>
            </div>
          </div>

          {/* Quick Streak Indicator */}
          <div className="flex items-center gap-1 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
            <span>Día 1</span>
          </div>
        </div>

        {/* Big Balance Wallet Display */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0e121d] border border-slate-800/80 shadow-xl relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saldo Acumulado</span>
              <div className="flex items-center gap-2">
                <Coins className="w-7 h-7 text-amber-400 fill-amber-400/10" />
                <motion.span 
                  key={user.coins}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-3xl font-black tracking-tight text-white"
                >
                  {user.coins}
                </motion.span>
                <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/15">
                  Coins
                </span>
              </div>
            </div>
            
            {/* Quick Value Conversion display */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Convertido</span>
              <p className="font-display text-lg font-bold text-emerald-400 mt-1">
                R$ {(user.coins / 100).toFixed(2)}
              </p>
              <p className="text-[9px] text-slate-400">100 Coins = R$ 1,00</p>
            </div>
          </div>

          {/* Custom micro divider */}
          <div className="h-px bg-slate-800/80 my-4" />

          {/* Progress to reward bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Meta Diária de Anúncios</span>
              </span>
              <span>{totalWatchedToday}/{dailyGoal} Assistidos</span>
            </div>
            
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressRatio}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            
            {progressRatio >= 100 ? (
              <p className="text-[9px] text-amber-400 font-bold flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>Meta diária concluída! Volte amanhã para novos bônus.</span>
              </p>
            ) : (
              <p className="text-[9px] text-slate-500">
                Ganhe bônus de 50 Coins ao completar os 10 anúncios do dia.
              </p>
            )}
          </div>
        </div>

        {/* Interactive action header */}
        <div className="pt-2">
          <h2 className="font-display text-base font-bold text-white flex items-center gap-1.5">
            <span>Banners Premiados</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-400">
            Toque nos banners abaixo para assistir a anúncios rápidos de 8s e acumular moedas.
          </p>
        </div>

        {/* Banners Grid list */}
        <div className="space-y-3 pt-1">
          {BANNERS_DATA.map((banner) => {
            const cooldownSec = remainingCooldowns[banner.id];
            const isOnCooldown = !!cooldownSec;

            return (
              <motion.button
                key={banner.id}
                whileActive={{ scale: 0.99 }}
                disabled={isOnCooldown}
                onClick={() => handleBannerAction(banner)}
                className={`w-full p-4 rounded-2xl bg-gradient-to-r ${banner.color} border ${banner.borderColor} shadow-md flex flex-col justify-between items-start h-[125px] text-left transition-all relative overflow-hidden select-none ${
                  isOnCooldown ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
                }`}
              >
                {/* Visual Glass/Glow elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-black/10 rounded-full blur-lg pointer-events-none" />

                {/* Banner tag header */}
                <div className="w-full flex justify-between items-center z-10">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-black/30 border border-white/10 text-white">
                    {banner.tag}
                  </span>
                  
                  <span className="text-[10px] text-white/80 font-medium">
                    Patrocinador: {banner.sponsor}
                  </span>
                </div>

                {/* Middle title body */}
                <div className="z-10 mt-1">
                  <h3 className="font-display text-[15px] font-bold text-white tracking-tight leading-tight">
                    {banner.title}
                  </h3>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Assista para resgatar coins instantâneas
                  </p>
                </div>

                {/* Footer reward & CTA button */}
                <div className="w-full flex justify-between items-center z-10 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-white font-black text-sm">
                    <Coins className="w-4 h-4 fill-white/10 text-yellow-300" />
                    <span>+{banner.reward} Coins</span>
                  </div>

                  {/* Dynamic action indicator depending on cooldown */}
                  <AnimatePresence mode="wait">
                    {isOnCooldown ? (
                      <motion.div
                        key="cooldown"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-black/40 text-yellow-300 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-yellow-400/20"
                      >
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Aguarde {cooldownSec}s</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-white text-[#0a0d14] font-bold text-[10px] px-3 py-1 rounded-lg shadow"
                      >
                        <Play className="w-3 h-3 fill-[#0a0d14] text-[#0a0d14]" />
                        <span>Assistir</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {/* AdsTerra Legal Compliance Footer */}
        <Footer onOpenPage={onOpenPage} />
      </div>
    </div>
  );
}
