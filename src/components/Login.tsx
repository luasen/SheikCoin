import React, { useState } from 'react';
import { User as UserType } from '../types';
import { Mail, Lock, User as UserIcon, Coins, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getUserByEmail, saveUser } from '../lib/firebase';
import Footer from './Footer';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  onOpenPage: (page: 'privacy' | 'terms' | 'contact') => void;
}

export default function Login({ onLoginSuccess, onOpenPage }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const usersData = localStorage.getItem('coinad_users');
    const localUsers: UserType[] = usersData ? JSON.parse(usersData) : [];

    if (isRegistering) {
      // Register logic
      if (!name) {
        setError('Por favor, informe seu nome.');
        return;
      }

      // Check Firestore
      try {
        const cloudUserExists = await getUserByEmail(email);
        if (cloudUserExists) {
          setError('Este e-mail já está cadastrado.');
          return;
        }
      } catch (err) {
        console.error('Firestore check failed, checking local database:', err);
        const localExists = localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (localExists) {
          setError('Este e-mail já está cadastrado.');
          return;
        }
      }

      // Create new user
      const newUser: UserType = {
        id: `user_${Date.now()}`,
        name,
        email: email.toLowerCase().trim(),
        password, 
        coins: 150, // Starter bonus of 150 coins to give them immediate progress!
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };

      // Save to Firebase
      try {
        await saveUser(newUser);
      } catch (err) {
        console.error('Failed to save user in Firestore, falling back to local storage:', err);
      }

      // Save to local storage
      localUsers.push(newUser);
      localStorage.setItem('coinad_users', JSON.stringify(localUsers));
      localStorage.setItem('coinad_current_user_id', newUser.id);

      setSuccess('Cadastro realizado com sucesso! Ganhou +150 Coins de bônus!');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1500);

    } else {
      // Login logic
      let matchedUser: UserType | null = null;

      try {
        const cloudUser = await getUserByEmail(email);
        if (cloudUser && cloudUser.password === password) {
          matchedUser = cloudUser;
        }
      } catch (err) {
        console.error('Failed to login from Firestore, checking local database:', err);
      }

      // Fallback
      if (!matchedUser) {
        const localMatched = localUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (localMatched) {
          matchedUser = localMatched;
          // Sync local user to Firestore if missing
          try {
            await saveUser(localMatched);
          } catch (err) {
            console.error('Failed to sync local user to Firestore:', err);
          }
        }
      }

      if (matchedUser) {
        localStorage.setItem('coinad_current_user_id', matchedUser.id);
        setSuccess('Bem-vindo de volta!');
        const userToLog = matchedUser;
        setTimeout(() => {
          onLoginSuccess(userToLog);
        }, 1000);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 overflow-y-auto bg-[#0a0d14] relative no-scrollbar">
      {/* Decorative lighting */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#ff4655]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Brand Logo Area */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#ff4655] to-amber-500 rounded-3xl shadow-[0_10px_25px_-5px_rgba(255,70,85,0.4)] mb-4"
        >
          <Coins className="w-9 h-9 text-[#0a0d14]" strokeWidth={2.2} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </motion.div>
        </motion.div>
        
        <h1 className="font-display text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-amber-200 to-yellow-400">
          Sheik Coin
        </h1>
        <p className="text-slate-400 text-xs text-center mt-1.5 max-w-[260px]">
          Assista a anúncios rápidos, acumule moedas e resgate diamantes do Free Fire!
        </p>
      </div>

      {/* Input Form area */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <h2 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-2">
          {isRegistering ? 'Criar Nova Conta' : 'Iniciar Sessão'}
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4655]"></span>
        </h2>

        <form onSubmit={handleAction} className="space-y-4">
          {/* Error & Success Messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121620] border border-slate-800 focus:border-[#ff4655]/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="Ex: joao@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121620] border border-slate-800 focus:border-[#ff4655]/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Min. 4 dígitos"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121620] border border-slate-800 focus:border-[#ff4655]/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ff4655] via-amber-500 to-yellow-500 text-slate-950 font-bold text-sm rounded-xl py-3.5 shadow-md shadow-[#ff4655]/10 active:scale-[0.98] transition-all duration-150 cursor-pointer text-center mt-2"
          >
            {isRegistering ? 'Registrar & Começar' : 'Entrar na Conta'}
          </button>
        </form>
      </div>

      {/* Switch state / Footer */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-500">
          {isRegistering ? 'Já tem uma conta?' : 'Não possui uma conta?'}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold ml-1.5 focus:outline-none cursor-pointer"
          >
            {isRegistering ? 'Faça Login' : 'Cadastre-se'}
          </button>
        </p>
      </div>

      <Footer onOpenPage={onOpenPage} />
    </div>
  );
}
