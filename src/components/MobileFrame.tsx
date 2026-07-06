import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-0 md:p-6 select-none font-sans overflow-x-hidden">
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container: Mobile Mockup on Desktop, Full screen on Mobile */}
      <div className="relative w-full max-w-[420px] h-[100vh] md:h-[860px] md:rounded-[48px] md:border-[10px] md:border-[#1E232F] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] md:ring-8 md:ring-slate-800/20 bg-[#0c0f14] overflow-hidden flex flex-col">
        {/* Phone Speaker & Camera Notch (Dynamic Island style) - Only on Desktop view */}
        <div className="hidden md:flex absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-2xl items-center justify-center z-50 shadow-inner">
          <div className="w-12 h-1 bg-slate-900 rounded-full mr-3" />
          <div className="w-3 h-3 bg-[#0a0a0d] border border-blue-900/40 rounded-full" />
        </div>

        {/* App Content viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Home Indicator bar (simulates iOS home swipe bar) - Only on Desktop view */}
        <div className="hidden md:flex justify-center items-center pb-2 bg-[#0c0f14] z-40">
          <div className="w-32 h-1 bg-slate-700/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}
