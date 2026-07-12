import React from 'react';
import { Shield, FileText, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPage: (page: 'privacy' | 'terms' | 'contact') => void;
}

export default function Footer({ onOpenPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 pt-6 pb-4 px-5 border-t border-slate-900/80 bg-slate-950/40 select-none">
      <div className="flex flex-col items-center text-center space-y-4">
        
        {/* AdsTerra Verification Badge / Clean UI indicator */}
        <div className="flex items-center gap-1.5 bg-[#0d111a] px-3 py-1 rounded-full border border-slate-800 text-[10px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Plataforma Segura e Auditada</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
          <button 
            onClick={() => onOpenPage('privacy')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Política de Privacidade</span>
          </button>

          <button 
            onClick={() => onOpenPage('terms')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso</span>
          </button>

          <button 
            onClick={() => onOpenPage('contact')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contato</span>
          </button>
        </div>

        {/* Decorative divider line */}
        <div className="w-12 h-0.5 bg-slate-900 rounded-full" />

        {/* Copyright notice and Hostinger ready details */}
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 leading-normal">
            &copy; {currentYear} Sheik Coin. Todos os direitos reservados.
          </p>
          <p className="text-[9px] text-slate-600 flex items-center justify-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="w-2.5 h-2.5 text-[#ff4655] fill-[#ff4655]" />
            <span>• Otimizado para Hostinger e AdsTerra</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
