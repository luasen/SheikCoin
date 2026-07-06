import React, { useState } from 'react';
import { User, DiamondPurchase } from '../types';
import { Coins, Gamepad2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveDiamondPurchase, updateUserCoins } from '../lib/firebase';

interface DiamondStoreProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const DIAMOND_PACKAGES = [
  { id: 'dimas_100', diamonds: 100, cost: 2000, color: 'from-[#ff4655] to-orange-500', badge: 'Popular' },
  { id: 'dimas_200', diamonds: 200, cost: 4000, color: 'from-[#ff4655] via-pink-600 to-amber-500', badge: 'Melhor Custo' },
  { id: 'dimas_300', diamonds: 300, cost: 6000, color: 'from-purple-600 to-pink-500', badge: 'Mais Vendido' },
  { id: 'dimas_400', diamonds: 400, cost: 8000, color: 'from-[#ff4655] via-amber-500 to-yellow-400', badge: 'Mega Pack' },
];

export default function DiamondStore({ user, onUserUpdate }: DiamondStoreProps) {
  const [playerFFId, setPlayerFFId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePurchase = async (pkg: typeof DIAMOND_PACKAGES[0]) => {
    // Basic validation
    if (!playerFFId.trim()) {
      setErrorMsg('Por favor, insira o ID do jogador no Free Fire.');
      return;
    }
    if (user.coins < pkg.cost) {
      setErrorMsg('Saldo de moedas insuficiente.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Calculate new coins balance
      const updatedCoins = user.coins - pkg.cost;
      
      // 1. Deduct coins in Firestore
      await updateUserCoins(user.id, updatedCoins);

      // 2. Generate a custom transaction ID
      const orderId = 'FF-' + Math.floor(100000 + Math.random() * 900000);
      
      // 3. Format Date as DD/MM/AAAA
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      // 4. Create the purchase document matching user requests
      const newPurchase: DiamondPurchase = {
        id: orderId,
        userId: user.id,
        diamonds: pkg.diamonds,
        playerFFId: playerFFId.trim(),
        coinsCost: pkg.cost,
        status: 'Pendente',
        date: formattedDate
      };

      // 5. Save to Firestore "Historico_Compras"
      await saveDiamondPurchase(newPurchase);

      // 6. Update local user registry so context flows nicely
      const usersData = localStorage.getItem('coinad_users');
      if (usersData) {
        const localUsers: User[] = JSON.parse(usersData);
        const idx = localUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          localUsers[idx] = { ...user, coins: updatedCoins };
          localStorage.setItem('coinad_users', JSON.stringify(localUsers));
        }
      }

      // Update parent component state
      onUserUpdate({ ...user, coins: updatedCoins });

      setSuccessMsg(`Compra realizada! ${pkg.diamonds} Diamantes estão a caminho do ID: ${playerFFId.trim()}`);
      
      // Clear player id or keep it for ease of use
      // setPlayerFFId('');
    } catch (err) {
      console.error('Error during diamond purchase:', err);
      setErrorMsg('Ocorreu um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0d14] pb-6 no-scrollbar">
      
      {/* Upper header segment */}
      <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-900 flex justify-between items-center select-none shrink-0">
        <div>
          <h2 className="font-display text-base font-black text-white tracking-tight flex items-center gap-1.5">
            <span>Lojinha de Diamantes</span>
            <span className="text-[10px] bg-[#ff4655] text-white font-black px-1.5 py-0.2 rounded-md">FF</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Resgate diamantes usando suas moedas acumuladas</p>
        </div>

        {/* Current coins display */}
        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-400 fill-amber-400/10" />
          <span className="text-sm font-black font-mono text-amber-400">{user.coins}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Error / Success Notifications */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Pedido Enviado com Sucesso!</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {successMsg}. Nosso administrador analisará seu pedido e enviará seus diamantes em até 24 horas úteis. Acompanhe no seu perfil!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Free Fire ID Form Input Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0e121d] border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ff4655]/10 rounded-lg text-[#ff4655]">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Identificação do Jogador</h3>
              <p className="text-[10px] text-slate-500">Insira seu ID para podermos enviar os diamantes</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={playerFFId}
              onChange={(e) => {
                setPlayerFFId(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white font-mono placeholder-slate-500 focus:border-[#ff4655]/50 focus:outline-none transition-colors"
              placeholder="Digite seu ID do Free Fire (ex: 12345678)"
            />
            {playerFFId.trim() && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                Válido
              </span>
            )}
          </div>
          
          <p className="text-[9px] text-slate-500 leading-normal flex items-start gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70 shrink-0 mt-0.5" />
            <span>Nossos envios são feitos via Recarga Jogo oficial. Certifique-se de que o ID esteja 100% correto! Não nos responsabilizamos por IDs digitados incorretamente.</span>
          </p>
        </div>

        {/* Packages Grid */}
        <div className="space-y-3">
          <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Escolha o Pacote de Diamantes</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {DIAMOND_PACKAGES.map((pkg) => {
              const hasEnoughCoins = user.coins >= pkg.cost;
              const isIdFilled = !!playerFFId.trim();
              const isButtonDisabled = !hasEnoughCoins || !isIdFilled || isSubmitting;

              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-2xl bg-slate-900/40 border transition-all flex flex-col justify-between h-[155px] relative overflow-hidden select-none ${
                    hasEnoughCoins 
                      ? 'border-slate-800 hover:border-[#ff4655]/40 shadow-sm' 
                      : 'border-slate-900 opacity-65'
                  }`}
                >
                  {/* Decorative Glow */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#ff4655]/5 rounded-full blur-xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[8px] font-extrabold uppercase bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20 px-2 py-0.5 rounded-full font-mono">
                      {pkg.badge}
                    </span>
                    <Coins className={`w-4 h-4 ${hasEnoughCoins ? 'text-amber-400' : 'text-slate-600'}`} />
                  </div>

                  {/* Diamond Display */}
                  <div className="z-10 mt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-white tracking-tight">💎 {pkg.diamonds}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">Diamantes FF</span>
                  </div>

                  {/* Pricing and Button */}
                  <div className="z-10 pt-2 border-t border-slate-800/60 mt-1 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-medium">Preço:</span>
                      <span className="text-amber-400 font-bold font-mono">{pkg.cost} Coins</span>
                    </div>

                    <button
                      type="button"
                      disabled={isButtonDisabled}
                      onClick={() => handlePurchase(pkg)}
                      className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all ${
                        isButtonDisabled
                          ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#ff4655] to-orange-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <span>Comprar</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative Help Card */}
        <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850/60 text-[10px] text-slate-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <HelpCircle className="w-4 h-4 text-[#ff4655]" />
            <span>Como funciona a entrega?</span>
          </div>
          <p>
            1. Você acumula moedas assistindo aos banners premiados na tela inicial.<br />
            2. Digita seu ID do Free Fire e escolhe a quantidade de diamantes.<br />
            3. Nossa equipe faz o carregamento através do ID fornecido via Recarga Jogo.<br />
            4. O status mudará de <strong className="text-amber-500">Pendente</strong> para <strong className="text-emerald-500">Aprovado</strong> assim que for enviado.
          </p>
        </div>

      </div>
    </div>
  );
}
