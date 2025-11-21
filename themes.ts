import React from 'react';
import { IconCastle, IconCpu, IconGamepad, IconMicrophone } from './components/Icons';

export interface ThemeConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  font: string;
  
  // Main Containers
  appBg: string; 
  
  // Text
  textMain: string;
  textAccent: string;
  textMuted: string;
  
  // UI Elements (Panels, Inputs)
  panelBg: string;
  panelBorder: string;
  inputBg: string;
  
  // Buttons
  btnPrimary: string;
  btnSecondary: string;
  
  // Game Specific
  questionBox: string;
  
  optionBase: string;
  optionHover: string; 
  optionSelected: string;
  optionCorrect: string;
  optionWrong: string;
  
  lifelineAvailable: string;
  lifelineUsed: string;
  
  ladderContainer: string;
  ladderItemCurrent: string;
  ladderItemActive: string; 
  ladderItemPassed: string; 
  ladderItemSafety: string; 
  ladderItemBase: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Studio',
    icon: React.createElement(IconMicrophone, { className: "w-6 h-6" }),
    font: 'font-sans',
    appBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black',
    textMain: 'text-slate-100',
    textAccent: 'text-amber-400',
    textMuted: 'text-slate-400',
    panelBg: 'bg-slate-900/60 backdrop-blur-xl shadow-2xl',
    panelBorder: 'border-white/10',
    inputBg: 'bg-slate-800/50 border-white/10 focus:border-amber-500/50',
    btnPrimary: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 border-none',
    btnSecondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10',
    questionBox: 'bg-slate-800/80 backdrop-blur-md border-t border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl',
    optionBase: 'bg-slate-800/50 border border-white/5 text-slate-200',
    optionHover: 'hover:bg-slate-700/50 hover:border-amber-500/30 hover:text-amber-100',
    optionSelected: 'bg-amber-500 text-white border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    optionCorrect: 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    optionWrong: 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.4)]',
    lifelineAvailable: 'bg-slate-800/80 border border-white/10 text-amber-400 hover:bg-slate-700 hover:scale-105',
    lifelineUsed: 'bg-slate-900/50 border border-transparent text-slate-700 grayscale',
    ladderContainer: 'bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-xl',
    ladderItemCurrent: 'bg-amber-500/20 border-l-4 border-amber-500',
    ladderItemActive: 'text-amber-100 font-bold',
    ladderItemPassed: 'text-emerald-500/60',
    ladderItemSafety: 'text-white font-semibold',
    ladderItemBase: 'text-slate-500'
  },
  scifi: {
    id: 'scifi',
    name: 'Cyber',
    icon: React.createElement(IconCpu, { className: "w-6 h-6" }),
    font: 'font-orbitron',
    appBg: 'bg-black bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:4rem_4rem]',
    textMain: 'text-cyan-50',
    textAccent: 'text-cyan-400',
    textMuted: 'text-cyan-900',
    panelBg: 'bg-black/90 backdrop-blur-sm border border-cyan-900',
    panelBorder: 'border-cyan-900',
    inputBg: 'bg-black border border-cyan-900 text-cyan-100 focus:border-cyan-500',
    btnPrimary: 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    btnSecondary: 'bg-black border border-cyan-900 text-cyan-700 hover:text-cyan-400',
    questionBox: 'bg-black/80 border-y border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-none',
    optionBase: 'bg-black border border-cyan-900/50 text-cyan-200 clip-path-polygon',
    optionHover: 'hover:bg-cyan-950/30 hover:border-cyan-500',
    optionSelected: 'bg-cyan-900/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    optionCorrect: 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    optionWrong: 'bg-red-950/50 border-red-500 text-red-100',
    lifelineAvailable: 'bg-black border border-cyan-800 text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    lifelineUsed: 'bg-black border border-cyan-950 text-cyan-950',
    ladderContainer: 'bg-black/80 border border-cyan-900',
    ladderItemCurrent: 'bg-cyan-900/30 border-r-2 border-cyan-400',
    ladderItemActive: 'text-cyan-100 font-bold',
    ladderItemPassed: 'text-cyan-800',
    ladderItemSafety: 'text-fuchsia-400',
    ladderItemBase: 'text-cyan-900'
  },
  fantasy: {
    id: 'fantasy',
    name: 'Kingdom',
    icon: React.createElement(IconCastle, { className: "w-6 h-6" }),
    font: 'font-cinzel',
    appBg: 'bg-[#1c1917] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#451a03] via-[#1c1917] to-black',
    textMain: 'text-[#f5e6d3]',
    textAccent: 'text-amber-500',
    textMuted: 'text-stone-600',
    panelBg: 'bg-[#292524] border-2 border-[#78350f] shadow-2xl',
    panelBorder: 'border-[#78350f]',
    inputBg: 'bg-[#1c1917] border-[#44403c] text-amber-100',
    btnPrimary: 'bg-[#92400e] hover:bg-[#b45309] text-[#fef3c7] border border-[#fcd34d]/20 shadow-lg',
    btnSecondary: 'bg-[#44403c] hover:bg-[#57534e] text-[#d6d3d1] border border-[#78350f]',
    questionBox: 'bg-[#292524] border-2 border-[#b45309] shadow-[0_0_30px_rgba(180,83,9,0.2)] rounded-lg',
    optionBase: 'bg-[#1c1917] border border-[#57534e] text-[#e7e5e4]',
    optionHover: 'hover:border-[#b45309] hover:bg-[#292524]',
    optionSelected: 'bg-[#78350f] border-[#fcd34d] text-[#fffbeb]',
    optionCorrect: 'bg-[#14532d] border-[#4ade80] text-[#f0fdf4]',
    optionWrong: 'bg-[#7f1d1d] border-[#f87171] text-[#fef2f2]',
    lifelineAvailable: 'bg-[#292524] border-2 border-[#78350f] text-[#fcd34d] hover:bg-[#451a03]',
    lifelineUsed: 'bg-[#0c0a09] border border-[#292524] text-[#44403c]',
    ladderContainer: 'bg-[#1c1917] border-2 border-[#78350f]',
    ladderItemCurrent: 'bg-[#78350f]/50 border-y border-[#b45309]',
    ladderItemActive: 'text-[#fef3c7] font-bold',
    ladderItemPassed: 'text-[#65a30d]',
    ladderItemSafety: 'text-[#fbbf24]',
    ladderItemBase: 'text-[#78350f]'
  },
  retro: {
    id: 'retro',
    name: 'Arcade',
    icon: React.createElement(IconGamepad, { className: "w-6 h-6" }),
    font: 'font-vt323',
    appBg: 'bg-[#1a1a1a]',
    textMain: 'text-[#eeeeee]',
    textAccent: 'text-[#4ade80]',
    textMuted: 'text-gray-600',
    panelBg: 'bg-[#222] border-4 border-white shadow-none',
    panelBorder: 'border-white',
    inputBg: 'bg-black border-2 border-gray-500 text-white',
    btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 active:border-0 active:translate-y-1',
    btnSecondary: 'bg-gray-700 hover:bg-gray-600 text-white border-b-4 border-gray-900 active:border-0',
    questionBox: 'bg-[#222] border-4 border-white shadow-none rounded-none',
    optionBase: 'bg-black border-2 border-gray-600 text-gray-300 rounded-none',
    optionHover: 'hover:bg-gray-800 hover:border-white hover:text-white',
    optionSelected: 'bg-yellow-500 border-2 border-white text-black rounded-none',
    optionCorrect: 'bg-[#4ade80] border-2 border-white text-black rounded-none',
    optionWrong: 'bg-red-500 border-2 border-white text-black rounded-none',
    lifelineAvailable: 'bg-black border-2 border-white text-white hover:bg-gray-800 rounded-none',
    lifelineUsed: 'bg-gray-900 border-2 border-gray-800 text-gray-700 rounded-none',
    ladderContainer: 'bg-black border-4 border-white rounded-none',
    ladderItemCurrent: 'bg-blue-600',
    ladderItemActive: 'text-white',
    ladderItemPassed: 'text-[#4ade80]',
    ladderItemSafety: 'text-yellow-400',
    ladderItemBase: 'text-gray-600'
  }
};
