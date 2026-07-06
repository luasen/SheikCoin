import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Coins, Sparkles, AlertCircle, Play, Smartphone, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adService } from '../services/adService';

interface AdPlayerProps {
  userId: string;
  bannerTitle: string;
  onRewardClaimed: () => void;
  onClose: () => void;
}

export default function AdPlayer({ userId, bannerTitle, onRewardClaimed, onClose }: AdPlayerProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isMuted, setIsMuted] = useState(true);
  const [adStep, setAdStep] = useState<'playing' | 'confirmExit' | 'completed'>('playing');
  const [adGraphicIndex, setAdGraphicIndex] = useState(0);


  // Rotation of gameplay texts to mimic real mobile ads
  const adGraphics = [
    {
      title: "Hero Quest: Legends of Gold",
      tagline: "COMBINE 3 HEROIS DE OURO!",
      color: "from-purple-600 via-indigo-700 to-blue-800",
      accent: "from-yellow-400 to-amber-500",
      buttonText: "JOGAR AGORA",
      multiplier: "x100 Bônus",
      sponsor: "Hero Quest: Legends"
    },
    {
      title: "Slots Mega Fortune - Spin & Win",
      tagline: "VOCÊ GANHOU R$ 5.000 EM CRÉDITOS!",
      color: "from-red-600 via-pink-700 to-purple-800",
      accent: "from-yellow-300 to-amber-400",
      buttonText: "BAIXAR GRÁTIS",
      multiplier: "777 Jackpot",
      sponsor: "Slots Mega Fortune"
    },
    {
      title: "Crypto Tycoon - Miner Simulator",
      tagline: "MINE BITCOIN NO SEU CELULAR!",
      color: "from-teal-600 via-emerald-700 to-cyan-800",
      accent: "from-yellow-400 to-green-400",
      buttonText: "MINERAR GRÁTIS",
      multiplier: "+400% Rápido",
      sponsor: "Crypto Tycoon Corp"
    }
  ];

  // Pick ad design based on the clicked banner name if possible, or cycle
  const currentGraphic = adGraphics[adGraphicIndex];

  useEffect(() => {
    // Choose pseudo-random ad graphics based on the banner clicked
    const hash = bannerTitle.length % adGraphics.length;
    setAdGraphicIndex(hash);
  }, [bannerTitle]);

  useEffect(() => {
    // Under the hood, trigger the 5-second ad service simulation
    adService.triggerRewardAd(userId).then((res) => {
      console.log('Ad service validation response:', res);
    });
  }, [userId]);

  useEffect(() => {
    if (adStep !== 'playing') return;

    if (secondsLeft <= 0) {
      setAdStep('completed');
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, adStep]);

  const handleCloseAttempt = () => {
    if (adStep === 'playing') {
      setAdStep('confirmExit');
    } else if (adStep === 'confirmExit') {
      setAdStep('playing');
    }
  };

  const handleExitAnyway = () => {
    onClose();
  };

  const handleClaimReward = () => {
    onRewardClaimed();
  };

  const progressPercentage = ((5 - secondsLeft) / 5) * 100;

  return (
    <div className="absolute inset-0 bg-[#07090e] z-50 flex flex-col justify-between overflow-hidden">
      {/* Top Bar for Ad Control */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/60 border-b border-white/5 select-none z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2 py-0.5 bg-white/10 rounded-full">
            Anúncio
          </span>
          <span className="text-xs text-white font-medium max-w-[140px] truncate">
            {currentGraphic.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound simulation */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Countdown timer / Exit button */}
          {adStep === 'completed' ? (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 text-[#0c0f14] active:scale-90 transition-all cursor-pointer font-bold text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
                {secondsLeft}s
              </span>
              <button
                onClick={handleCloseAttempt}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {adStep === 'playing' && (
        <div className="w-full h-1 bg-slate-900">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      )}

      {/* Main Screen Ad Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {adStep === 'playing' && (
            <motion.div
              key="ad-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col justify-between items-center rounded-2xl p-4 overflow-hidden relative"
            >
              {/* Fake Gameplay video screen inside */}
              <div className={`absolute inset-0 bg-gradient-to-b ${currentGraphic.color} opacity-90 z-0`} />
              
              {/* Dynamic gameplay grid simulation */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-15 z-0">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-white/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>

              {/* Ad Header Info */}
              <div className="z-10 text-center pt-2">
                <span className="text-[10px] uppercase font-bold text-yellow-300 tracking-wider bg-black/40 px-3 py-1 rounded-full border border-yellow-300/20">
                  {currentGraphic.multiplier}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-3 drop-shadow-md">
                  {currentGraphic.title}
                </h3>
              </div>

              {/* Big interactive/visual element in the center */}
              <div className="z-10 flex flex-col items-center justify-center my-4">
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className={`p-6 rounded-3xl bg-gradient-to-tr ${currentGraphic.accent} shadow-2xl text-[#0c0f14] flex flex-col items-center text-center`}
                >
                  <Coins className="w-14 h-14 drop-shadow" />
                  <span className="font-display text-2xl font-black tracking-tight mt-2">
                    +10 COINS
                  </span>
                </motion.div>

                {/* Animated progress ring or fake loader */}
                <span className="text-white font-semibold text-sm tracking-wide mt-6 drop-shadow-md text-center bg-black/30 px-4 py-1.5 rounded-full border border-white/5 animate-pulse">
                  {currentGraphic.tagline}
                </span>
              </div>

              {/* CTA Button bottom */}
              <div className="w-full z-10 flex flex-col items-center">
                <button
                  type="button"
                  className={`w-full max-w-[240px] bg-white text-indigo-900 font-extrabold text-sm py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2 border-2 border-white`}
                >
                  <Play className="w-4 h-4 fill-indigo-900" />
                  <span>{currentGraphic.buttonText}</span>
                </button>
                <span className="text-[9px] text-white/60 mt-2 font-medium">
                  Patrocinado por {currentGraphic.sponsor || "Google Partners"}
                </span>
              </div>
            </motion.div>
          )}

          {adStep === 'confirmExit' && (
            <motion.div
              key="confirm-exit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 bg-[#121622] border border-slate-800 rounded-2xl max-w-sm text-center shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Abandonar anúncio?</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Se você sair agora, perderá a recompensa de <strong className="text-amber-400">+10 Coins</strong> acumulados para este banner.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setAdStep('playing')}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-[#0c0f14] font-bold text-xs py-3 rounded-lg cursor-pointer"
                >
                  Continuar Assistindo
                </button>
                <button
                  onClick={handleExitAnyway}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-medium text-xs py-3 rounded-lg cursor-pointer"
                >
                  Sair mesmo assim
                </button>
              </div>
            </motion.div>
          )}

          {adStep === 'completed' && (
            <motion.div
              key="ad-completed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center text-center space-y-6 z-10"
            >
              <div className="relative">
                {/* Shiny particles glow */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-125"
                />
                
                {/* Gold star spark burst */}
                <div className="absolute -top-4 -right-4">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <Sparkles className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </div>

                <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border-4 border-[#0a0d14]">
                  <Coins className="w-12 h-12 text-[#0c0f14] fill-transparent" strokeWidth={2.2} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                  Parabéns!
                </h3>
                <p className="text-slate-400 text-xs max-w-[220px] mx-auto leading-relaxed">
                  Você assistiu o anúncio completo e ajudou nossos patrocinadores.
                </p>
                <div className="inline-block bg-amber-500/10 text-amber-400 font-bold text-sm px-4 py-1.5 rounded-full border border-amber-500/20 mt-2">
                  Saldo: +10 Coins creditados!
                </div>
              </div>

              <button
                onClick={handleClaimReward}
                className="w-full max-w-[220px] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-[#0c0f14] font-bold text-sm py-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                Resgatar Recompensa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini warning footer during playback */}
      {adStep === 'playing' && (
        <div className="text-center p-4 bg-black/40 border-t border-white/5 select-none z-10">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mantenha o aplicativo ativo até o cronômetro zerar para acumular Coins.</span>
          </p>
        </div>
      )}
    </div>
  );
}
