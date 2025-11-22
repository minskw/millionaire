import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../themes';
import { IconUsers } from './Icons';

interface AudienceInteractionProps {
  onClose: () => void;
  theme: ThemeConfig;
}

export const AudienceInteraction: React.FC<AudienceInteractionProps> = ({ onClose, theme }) => {
  const [votes, setVotes] = useState([0, 0, 0, 0]);
  const [showResults, setShowResults] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (showResults) {
      // Small delay to trigger the CSS transition after render
      const timer = setTimeout(() => {
        setAnimateBars(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showResults]);

  const handleVoteChange = (index: number, value: number) => {
    const newVotes = [...votes];
    newVotes[index] = value;
    setVotes(newVotes);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className={`w-full max-w-2xl border rounded-2xl p-8 shadow-2xl ${theme.panelBg} ${theme.panelBorder}`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-center gap-3 mb-8">
        <IconUsers className={`w-8 h-8 ${theme.textAccent}`} />
        <h2 className={`text-3xl font-bold uppercase tracking-wide ${theme.textAccent}`}>
            {showResults ? "Results" : "Class Vote"}
        </h2>
      </div>

      {!showResults ? (
        <div className="space-y-8">
            <p className={`${theme.textMain} text-center text-lg opacity-80 leading-relaxed`}>
                Conduct a class vote using hands or cards.<br/>Enter the approximate count for each option below.
            </p>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {['A', 'B', 'C', 'D'].map((label, idx) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <label className={`text-2xl font-bold ${theme.textMain}`}>Option {label}</label>
                  <span className={`text-xl font-mono ${theme.textAccent}`}>{votes[idx]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={votes[idx]}
                  onChange={(e) => handleVoteChange(idx, parseInt(e.target.value))}
                  className={`w-full h-3 rounded-full appearance-none cursor-pointer ${theme.inputBg} opacity-80 hover:opacity-100`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowResults(true)}
            className={`w-full mt-4 py-4 text-xl font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] ${theme.btnPrimary}`}
          >
            REVEAL RESULTS
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
            <div className="h-64 flex items-end justify-around gap-4 px-4 pb-4 border-b border-white/10">
            {votes.map((count, idx) => {
                const percentage = Math.round((count / totalVotes) * 100);
                // Start at 0 height, animate to actual percentage
                const height = animateBars ? `${Math.max(percentage, 1)}%` : '0%'; 
                
                return (
                <div key={idx} className="flex flex-col items-center justify-end h-full w-1/5 group relative">
                    <span className={`font-bold mb-2 text-xl transition-all duration-1000 delay-300 ${animateBars ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${theme.textAccent}`}>
                        {percentage}%
                    </span>
                    <div 
                        style={{ height }} 
                        className={`w-full rounded-t-lg transition-all duration-1000 ease-out opacity-80 ${theme.ladderItemCurrent}`}
                    ></div>
                    <span className={`font-black text-2xl mt-3 ${theme.textMain}`}>{String.fromCharCode(65 + idx)}</span>
                </div>
                );
            })}
            </div>
            <button
                onClick={onClose}
                className={`mt-8 w-full py-3 font-bold rounded-xl border transition-colors ${theme.btnSecondary}`}
            >
                Close Results
            </button>
        </div>
      )}
    </div>
  );
};