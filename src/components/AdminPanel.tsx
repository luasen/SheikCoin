import React, { useState, useEffect } from 'react';
import { User, DiamondPurchase } from '../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  Coins, 
  ShoppingBag, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Minus, 
  AlertCircle,
  Zap,
  Gamepad2,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getAllUsers, 
  getAllDiamondPurchases, 
  updatePurchaseStatusAndRefund, 
  updateUserCoins 
} from '../lib/firebase';

interface AdminPanelProps {
  currentUser: User;
  onBack: () => void;
  onRefreshCurrentUser: () => void;
}

export default function AdminPanel({ currentUser, onBack, onRefreshCurrentUser }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<DiamondPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [purchaseFilter, setPurchaseFilter] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Recusado'>('Todos');
  const [activeSubTab, setActiveSubTab] = useState<'compras' | 'usuarios'>('compras');

  // Edit Coin Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(100);

  // Load all system data
  const loadSystemData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const allUsers = await getAllUsers();
      const allPurchases = await getAllDiamondPurchases();
      
      if (allUsers) setUsers(allUsers);
      if (allPurchases) setPurchases(allPurchases);
    } catch (err: any) {
      console.error('Error loading admin panel data:', err);
      setError('Falha ao obter dados do Firebase. Verifique suas permissões.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  // Sync to localstorage also to prevent drift
  const syncLocalUserRegistry = (updatedUser: User) => {
    const usersData = localStorage.getItem('coinad_users');
    if (usersData) {
      const localUsers: User[] = JSON.parse(usersData);
      const idx = localUsers.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
        localUsers[idx] = updatedUser;
        localStorage.setItem('coinad_users', JSON.stringify(localUsers));
      }
    }
  };

  // Handle Approve (Liberar Diamantes)
  const handleApprove = async (purchase: DiamondPurchase) => {
    setActionInProgress(purchase.id);
    setSuccessMsg('');
    try {
      await updatePurchaseStatusAndRefund(purchase.id, 'Aprovado', purchase.userId, 0);
      
      // Update local state
      setPurchases(prev => prev.map(p => p.id === purchase.id ? { ...p, status: 'Aprovado' } : p));
      setSuccessMsg(`Pedido de ${purchase.diamonds} Diamantes enviado com sucesso para o ID ${purchase.playerFFId}!`);
      
      // If the current logged-in user got approved in another context, refresh
      if (purchase.userId === currentUser.id) {
        onRefreshCurrentUser();
      }
      
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error approving purchase:', err);
      setError('Falha ao liberar diamantes.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Refund (Entornar / Recusar Compra e devolver moedas)
  const handleRefund = async (purchase: DiamondPurchase) => {
    setActionInProgress(purchase.id);
    setSuccessMsg('');
    try {
      // Refund the coins back to the user
      await updatePurchaseStatusAndRefund(purchase.id, 'Recusado', purchase.userId, purchase.coinsCost);
      
      // Update local state for purchases
      setPurchases(prev => prev.map(p => p.id === purchase.id ? { ...p, status: 'Recusado' } : p));
      
      // Update local state for users
      setUsers(prev => prev.map(u => {
        if (u.id === purchase.userId) {
          const updated = { ...u, coins: u.coins + purchase.coinsCost };
          syncLocalUserRegistry(updated);
          return updated;
        }
        return u;
      }));

      setSuccessMsg(`Pedido cancelado e ${purchase.coinsCost} Coins estornados com sucesso para o ID do Free Fire!`);
      
      // Refresh current user session if it was them
      if (purchase.userId === currentUser.id) {
        onRefreshCurrentUser();
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error refunding purchase:', err);
      setError('Falha ao estornar diamantes.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Modify User Coins Manually (Add/Subtract)
  const handleAdjustCoins = async (type: 'add' | 'subtract') => {
    if (!selectedUser) return;
    setActionInProgress(selectedUser.id);
    setSuccessMsg('');
    
    let coinsChange = type === 'add' ? coinAmount : -coinAmount;
    const newCoins = Math.max(0, selectedUser.coins + coinsChange);
    
    try {
      await updateUserCoins(selectedUser.id, newCoins);
      
      const updatedUser = { ...selectedUser, coins: newCoins };
      
      // Update users state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      
      // Sync local database too
      syncLocalUserRegistry(updatedUser);

      setSuccessMsg(`Saldo de ${selectedUser.name} alterado para ${newCoins} Coins!`);
      
      // If we adjusted our own coins, refresh
      if (selectedUser.id === currentUser.id) {
        onRefreshCurrentUser();
      }

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error adjusting coins:', err);
      setError('Falha ao ajustar moedas.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Metrics calculations
  const totalUsersCount = users.length;
  const totalCirculatingCoins = users.reduce((acc, curr) => acc + (curr.coins || 0), 0);
  const totalPurchasesCount = purchases.length;
  
  const totalDiamondsPaid = purchases
    .filter(p => p.status === 'Aprovado')
    .reduce((acc, curr) => acc + (curr.diamonds || 0), 0);
    
  const pendingPurchases = purchases.filter(p => p.status === 'Pendente');
  const pendingPurchasesCount = pendingPurchases.length;
  const pendingDiamondsCount = pendingPurchases.reduce((acc, curr) => acc + (curr.diamonds || 0), 0);

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPurchases = purchases.filter(p => {
    if (purchaseFilter === 'Todos') return true;
    return p.status === purchaseFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14] text-slate-100 relative">
      
      {/* Admin Title Header */}
      <div className="px-5 py-4 bg-[#0d111d] border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-sm font-bold text-white flex items-center gap-1.5 leading-none">
              <span>Painel Admin Sheik Coin</span>
              <ShieldCheck className="w-4 h-4 text-amber-400 fill-amber-400/10" />
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Controle de envios de diamantes Free Fire</p>
          </div>
        </div>

        <button 
          onClick={loadSystemData} 
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors disabled:opacity-55"
          title="Recarregar dados"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Admin View Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar space-y-4">
        
        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Analytics Dashboard Metrics Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Card 1: Users count */}
          <div className="p-3 rounded-xl bg-[#121622] border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-1 right-1 p-1 bg-amber-500/5 rounded-lg text-amber-500 pointer-events-none">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jogadores</span>
            <p className="font-display text-lg font-black text-white mt-1">
              {isLoading ? '...' : totalUsersCount}
            </p>
            <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">Contas registradas</span>
          </div>

          {/* Card 2: Circulating Coins */}
          <div className="p-3 rounded-xl bg-[#121622] border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-1 right-1 p-1 bg-amber-500/5 rounded-lg text-amber-400 pointer-events-none">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coins Emitidas</span>
            <p className="font-display text-lg font-black text-amber-400 mt-1">
              {isLoading ? '...' : totalCirculatingCoins.toLocaleString('pt-BR')}
            </p>
            <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">Total em circulação</span>
          </div>

          {/* Card 3: Total Diamonds Sent */}
          <div className="p-3 rounded-xl bg-[#121622] border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-1 right-1 p-1 bg-[#ff4655]/5 rounded-lg text-[#ff4655] pointer-events-none">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Diamantes Enviados</span>
            <p className="font-display text-lg font-black text-[#ff4655] mt-1">
              {isLoading ? '...' : `${totalDiamondsPaid} 💎`}
            </p>
            <span className="text-[9px] text-slate-400 mt-0.5 block leading-none">Total enviado ao FF</span>
          </div>

          {/* Card 4: Pending Purchases */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-1 right-1 p-1 bg-amber-500/10 rounded-lg text-amber-500 pointer-events-none">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-500/95 uppercase tracking-wider block">Pendentes</span>
            <p className="font-display text-lg font-black text-amber-400 mt-1">
              {isLoading ? '...' : `${pendingPurchasesCount} pedidos`}
            </p>
            <span className="text-[9px] text-amber-300/80 mt-0.5 block leading-none">
              Aguardando: {pendingDiamondsCount} 💎
            </span>
          </div>
        </div>

        {/* View Switcher Tabs (Compras vs Usuários) */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveSubTab('compras')}
            className={`flex-1 py-2.5 font-display text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'compras' 
                ? 'border-[#ff4655] text-[#ff4655]' 
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Pedidos de Dimas ({pendingPurchasesCount})
          </button>
          <button
            onClick={() => setActiveSubTab('usuarios')}
            className={`flex-1 py-2.5 font-display text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'usuarios' 
                ? 'border-[#ff4655] text-[#ff4655]' 
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Saldos de Jogadores ({totalUsersCount})
          </button>
        </div>

        {/* Tab content view */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Sincronizando com Firestore...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* SUBTAB 1: DIAMOND PURCHASES */}
            {activeSubTab === 'compras' && (
              <div className="space-y-3">
                
                {/* Purchase Filters */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                  {(['Todos', 'Pendente', 'Aprovado', 'Recusado'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setPurchaseFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer shrink-0 transition-all ${
                        purchaseFilter === filter 
                          ? 'bg-[#ff4655] text-white' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {filter === 'Todos' ? 'Todos os Pedidos' : filter}
                    </button>
                  ))}
                </div>

                {filteredPurchases.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-850 text-slate-500 text-xs">
                    Nenhum pedido de diamantes encontrado nesta categoria.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredPurchases.map(purchase => {
                      const reqUser = users.find(u => u.id === purchase.userId);
                      return (
                        <div 
                          key={purchase.id}
                          className="p-3.5 rounded-xl bg-[#121622] border border-slate-800 flex flex-col gap-3 relative"
                        >
                          {/* Header info */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold font-mono text-slate-500">ID COMPRA: {purchase.id.slice(-8)}</span>
                              <h4 className="text-xs font-bold text-white mt-0.5">
                                {reqUser ? reqUser.name : 'Jogador Deletado'}
                              </h4>
                              <p className="text-[10px] text-slate-400">{reqUser?.email || 'N/A'}</p>
                            </div>

                            {/* Status label */}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                              purchase.status === 'Aprovado'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : purchase.status === 'Recusado'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            }`}>
                              {purchase.status === 'Recusado' ? 'Estornado' : purchase.status}
                            </span>
                          </div>

                          {/* Details Row */}
                          <div className="grid grid-cols-3 gap-1.5 py-1.5 border-y border-slate-850 text-center font-mono">
                            <div className="text-left">
                              <span className="text-[8px] text-slate-500 uppercase block leading-none">Diamantes</span>
                              <span className="text-xs font-black text-[#ff4655] flex items-center gap-0.5">💎 {purchase.diamonds}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-500 uppercase block leading-none">Coins Custo</span>
                              <span className="text-xs font-bold text-amber-400">{purchase.coinsCost}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-500 uppercase block leading-none">Data</span>
                              <span className="text-[10px] text-slate-300">{purchase.date}</span>
                            </div>
                          </div>

                          {/* Free Fire ID Info */}
                          <div className="bg-[#ff4655]/5 px-2.5 py-2 rounded-lg border border-[#ff4655]/10 text-xs font-mono text-slate-300 flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Gamepad2 className="w-3.5 h-3.5 text-[#ff4655]" />
                              <span>ID do Jogador no Free Fire:</span>
                            </span>
                            <span className="text-white font-bold tracking-wider select-all bg-black/30 px-2 py-0.5 rounded border border-slate-850">{purchase.playerFFId}</span>
                          </div>

                          {/* Actions */}
                          {purchase.status === 'Pendente' && (
                            <div className="flex gap-2 pt-1">
                              {/* APPROVE BUTTON */}
                              <button
                                onClick={() => handleApprove(purchase)}
                                disabled={actionInProgress !== null}
                                className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                              >
                                {actionInProgress === purchase.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Liberar Diamantes</span>
                              </button>

                              {/* REFUND BUTTON (ENTORNAR) */}
                              <button
                                onClick={() => handleRefund(purchase)}
                                disabled={actionInProgress !== null}
                                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-bold text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1 hover:border-red-500/35 transition-all"
                                title="Recusar pedido e devolver moedas ao usuário"
                              >
                                {actionInProgress === purchase.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                <span>Entornar Coins</span>
                              </button>
                            </div>
                          )}

                          {purchase.status === 'Aprovado' && (
                            <div className="text-[10px] text-emerald-500 flex items-center gap-1 justify-end font-medium">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Diamantes creditados no ID informado</span>
                            </div>
                          )}

                          {purchase.status === 'Recusado' && (
                            <div className="text-[10px] text-red-400 flex items-center gap-1 justify-end font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Moedas estornadas com sucesso</span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: USERS MANAGEMENT (USUÁRIOS) */}
            {activeSubTab === 'usuarios' && (
              <div className="space-y-3">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[#121622] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none"
                    placeholder="Buscar por nome, email ou ID..."
                  />
                </div>

                {/* Users List */}
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-850 text-slate-500 text-xs">
                      Nenhum usuário encontrado.
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          selectedUser?.id === user.id 
                            ? 'bg-[#151c2f] border-[#ff4655]/50 shadow-md' 
                            : 'bg-[#121622] border-slate-800 hover:border-slate-750'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="bg-amber-400/10 text-amber-400 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-400/20 uppercase">
                                  Você
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                            <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Criado em: {user.createdAt || 'N/A'}</span>
                          </div>

                          {/* Coins balance tag */}
                          <button
                            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                            className="bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-lg py-1.5 px-3 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
                            <span className="text-xs font-black text-amber-400 font-mono">{user.coins || 0}</span>
                          </button>
                        </div>

                        {/* Interactive edit panel when user is selected */}
                        {selectedUser?.id === user.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ajustar Saldo (Coins)</span>
                              
                              {/* Quick selection of amounts */}
                              <div className="flex gap-1.5">
                                {[50, 100, 500, 1000].map(amt => (
                                  <button
                                    key={amt}
                                    onClick={() => setCoinAmount(amt)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                                      coinAmount === amt ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {amt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Adjustment input controls */}
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                value={coinAmount}
                                onChange={(e) => setCoinAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xs font-mono font-bold text-white focus:outline-none"
                              />

                              {/* Deduct button */}
                              <button
                                onClick={() => handleAdjustCoins('subtract')}
                                disabled={actionInProgress !== null}
                                className="flex-1 bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 hover:border-red-500/50 transition-all"
                              >
                                <Minus className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>

                              {/* Add button */}
                              <button
                                onClick={() => handleAdjustCoins('add')}
                                disabled={actionInProgress !== null}
                                className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 hover:border-emerald-500/50 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
