import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../themes';
import { IconGraduationCap } from './Icons';

interface StudentSpotlightProps {
  onClose: () => void;
  theme: ThemeConfig;
}

export const StudentSpotlight: React.FC<StudentSpotlightProps> = ({ onClose, theme }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <div className={`w-full max-w-lg border-2 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center ${theme.panelBg} ${theme.panelBorder}`} onClick={e => e.stopPropagation()}>
      <div className="mb-10 flex flex-col items-center">
         <div className={`p-6 rounded-full mb-6 bg-white/5 ${theme.textAccent} animate-bounce`}>
            <IconGraduationCap className="w-16 h-16" />
         </div>
         <h2 className={`text-3xl font-black uppercase tracking-wider ${theme.textAccent}`}>Student Spotlight</h2>
         <p className={`mt-4 text-lg font-light ${theme.textMain} opacity-80`}>Select a student to assist the player!</p>
      </div>

      <div className="relative mb-10 p-6 rounded-2xl bg-black/20">
          <div className={`text-8xl font-mono font-bold tabular-nums tracking-tighter ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : theme.textMain}`}>
            {timeLeft}
          </div>
          <div className={`text-xs uppercase font-bold tracking-widest mt-2 ${theme.textMuted}`}>Seconds Remaining</div>
      </div>

      <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-3 rounded-xl font-bold border transition-all hover:brightness-110 ${isActive ? theme.btnPrimary : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'}`}
          >
            {isActive ? 'PAUSE' : 'RESUME'}
          </button>
          <button
            onClick={onClose}
            className={`px-8 py-3 rounded-xl font-bold border ${theme.btnSecondary}`}
          >
            DONE
          </button>
      </div>
    </div>
  );
};