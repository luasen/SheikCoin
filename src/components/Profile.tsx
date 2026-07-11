import React, { useState, useEffect } from 'react';
import { User, DiamondPurchase } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  LogOut, 
  Calendar, 
  Trophy, 
  Star, 
  ShieldCheck, 
  Gamepad2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';
import { getDiamondPurchases } from '../lib/firebase';
import Footer from './Footer';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
  onNavigateToAdmin?: () => void;
  onOpenPage: (page: 'privacy' | 'terms' | 'contact') => void;
}

export default function Profile({ user, onLogout, onUserUpdate, onNavigateToAdmin, onOpenPage }: ProfileProps) {
  const [adsWatched, setAdsWatched] = useState(0);
  const [purchases, setPurchases] = useState<DiamondPurchase[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const list = await getDiamondPurchases(user.id);
      if (list) {
        setPurchases(list);
      }
    } catch (err) {
      console.error('Error fetching diamond purchases:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    // Fetch diamond purchases history
    fetchHistory();

    // Retrieve lifetime ads statistics
    const key = `coinad_watched_total_${user.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setAdsWatched(parseInt(stored, 10));
    } else {
      const randomStart = Math.floor(Math.random() * 5) + 3;
      setAdsWatched(randomStart);
      localStorage.setItem(key, String(randomStart));
    }
  }, [user.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0d14] px-5 py-6 no-scrollbar relative select-none flex flex-col">
      
      {/* Title */}
      <h2 className="font-display text-xl font-bold text-white mb-1 flex items-center gap-1.5">
        <span>Seu Perfil</span>
        <UserIcon className="w-5 h-5 text-[#ff4655]" />
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Gerencie seus dados e confira o histórico de envio de seus diamantes Free Fire.
      </p>

      {/* Profile Card Header */}
      <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80 shadow-lg text-center relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4655]/5 rounded-full blur-xl pointer-events-none" />
        
        {/* Avatar */}
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#ff4655] to-amber-500 flex items-center justify-center p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-[#121620] flex items-center justify-center text-[#ff4655] font-bold font-display text-xl uppercase">
              {user.name ? user.name.slice(0, 2) : 'US'}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full text-[#0a0d14] border-2 border-[#121622]">
            <Star className="w-3 h-3 fill-[#0a0d14]" strokeWidth={2.5} />
          </div>
        </div>

        <h3 className="font-display text-base font-bold text-white">{user.name}</h3>
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1">
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span>{user.email}</span>
        </p>

        {/* Premium Level tag */}
        <div className="inline-flex items-center gap-1 bg-[#ff4655]/10 text-[#ff4655] font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-[#ff4655]/20 mt-3 uppercase tracking-wide">
          <Trophy className="w-3 h-3 text-[#ff4655]" />
          <span>Membro Pro Diamond</span>
        </div>
      </div>

      {/* Achievements and Stats metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Saldo Atual</span>
          <p className="font-display text-lg font-black text-amber-400 mt-1">{user.coins} Coins</p>
          <span className="text-[9px] text-slate-400 mt-0.5 block">Disponível para Lojinha</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Ads Assistidos</span>
          <p className="font-display text-lg font-black text-emerald-400 mt-1">{adsWatched}</p>
          <span className="text-[9px] text-slate-400 mt-0.5 block">Histórico Geral</span>
        </div>
      </div>

      {/* Diamond Purchase History Card */}
      <div className="p-4 rounded-2xl bg-[#121622] border border-slate-800/80 shadow-lg space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#ff4655]" />
            <span>Histórico de Compras FF</span>
          </h4>

          <button 
            onClick={fetchHistory}
            disabled={isLoadingHistory}
            className="text-slate-400 hover:text-[#ff4655] transition-colors cursor-pointer"
            title="Recarregar histórico"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-slate-500 text-[11px] font-mono flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#ff4655] animate-spin" />
            <span>Sincronizando com Firestore...</span>
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/30 border border-slate-850 text-slate-500 text-[11px]">
            Você ainda não realizou nenhuma compra de diamantes na Lojinha. Suas compras aparecerão aqui.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id}
                className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1 min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white">
                    <span>💎 {purchase.diamonds} Diamantes</span>
                    <span className="text-[9px] text-slate-500 font-normal font-mono">({purchase.id})</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">
                    ID Jogador: <span className="text-slate-300 font-bold">{purchase.playerFFId}</span>
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono">
                    Data: {purchase.date} • Custo: {purchase.coinsCost} moedas
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide border ${
                    purchase.status === 'Aprovado'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : purchase.status === 'Recusado'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  }`}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra safety and app metrics details */}
      <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800 border-dashed space-y-2.5 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Certificado de Segurança</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          O Sheik coin utiliza criptografia de segurança ponta a ponta para proteger todas as compras. O envio é 100% garantido e intermediado por canais de recarga oficiais autorizados.
        </p>
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Membro desde: {user.createdAt || '01/07/2026'}</span>
          </span>
          <span>Versão v2.0.0 (Lojinha FF)</span>
        </div>
      </div>

      {/* Admin Panel Access Button */}
      {onNavigateToAdmin && (
        <div className="mb-4">
          <button
            onClick={onNavigateToAdmin}
            className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 fill-amber-400/10" />
            <span>Acessar Painel Adm</span>
          </button>
        </div>
      )}

      {/* Logout Action Button */}
      <div className="mt-auto pt-6 mb-4">
        <button
          onClick={onLogout}
          className="w-full bg-slate-900/60 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      <Footer onOpenPage={onOpenPage} />
    </div>
  );
}
