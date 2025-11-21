import React from 'react';
import { ThemeConfig } from '../themes';
import { IconFiftyFifty, IconUser, IconUsers } from './Icons';

interface LifelinesProps {
  lifelines: {
    fiftyFifty: boolean;
    phoneFriend: boolean;
    askAudience: boolean;
  };
  onUseLifeline: (type: 'fiftyFifty' | 'phoneFriend' | 'askAudience') => void;
  disabled: boolean;
  theme: ThemeConfig;
}

export const Lifelines: React.FC<LifelinesProps> = ({ lifelines, onUseLifeline, disabled, theme }) => {
  return (
    <div className="flex gap-4 justify-center mb-8">
      <LifelineButton 
        icon={<IconFiftyFifty className="w-8 h-8" />} 
        label="50:50"
        isUsed={!lifelines.fiftyFifty} 
        onClick={() => onUseLifeline('fiftyFifty')} 
        disabled={disabled}
        theme={theme}
      />
      <LifelineButton 
        icon={<IconUser className="w-8 h-8" />} 
        label="Student"
        isUsed={!lifelines.phoneFriend} 
        onClick={() => onUseLifeline('phoneFriend')} 
        disabled={disabled}
        theme={theme}
      />
      <LifelineButton 
        icon={<IconUsers className="w-8 h-8" />} 
        label="Class Vote"
        isUsed={!lifelines.askAudience} 
        onClick={() => onUseLifeline('askAudience')} 
        disabled={disabled}
        theme={theme}
      />
    </div>
  );
};

const LifelineButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string;
  isUsed: boolean; 
  onClick: () => void;
  disabled: boolean;
  theme: ThemeConfig;
}> = ({ icon, label, isUsed, onClick, disabled, theme }) => (
  <button
    onClick={onClick}
    disabled={isUsed || disabled}
    className={`
      relative w-28 h-20 rounded-2xl transition-all duration-300 group overflow-hidden
      flex flex-col items-center justify-center gap-1
      ${isUsed ? theme.lifelineUsed : `${theme.lifelineAvailable}`}
      ${disabled && !isUsed ? 'opacity-60 cursor-not-allowed' : ''}
    `}
  >
    <div className={`transition-transform duration-300 ${!isUsed && !disabled ? 'group-hover:-translate-y-1' : ''}`}>
        {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
    
    {isUsed && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
        <svg className="w-12 h-12 text-red-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )}
  </button>
);
