import React from 'react';
import { MONEY_LADDER, SAFETY_NETS } from '../types';
import { ThemeConfig } from '../themes';

interface MoneyLadderProps {
  currentQuestionIndex: number;
  theme: ThemeConfig;
}

export const MoneyLadder: React.FC<MoneyLadderProps> = ({ currentQuestionIndex, theme }) => {
  const reversedLadder = [...MONEY_LADDER].map((amount, index) => ({
    amount,
    index,
  })).reverse();

  return (
    <div className={`flex flex-col w-full max-w-xs border-2 rounded-lg overflow-hidden shadow-2xl ${theme.ladderContainer}`}>
      {reversedLadder.map((step) => {
        const isCurrent = step.index === currentQuestionIndex;
        const isPassed = step.index < currentQuestionIndex;
        const isSafetyNet = SAFETY_NETS.includes(step.index);
        
        let textColor = theme.ladderItemBase;
        if (isCurrent) textColor = theme.ladderItemActive;
        else if (isPassed) textColor = theme.ladderItemPassed;
        else if (isSafetyNet) textColor = theme.ladderItemSafety;

        let bgColor = "bg-transparent";
        if (isCurrent) bgColor = theme.ladderItemCurrent;
        
        return (
          <div 
            key={step.index} 
            className={`flex justify-between px-4 py-1 ${bgColor} ${isCurrent ? 'font-bold scale-105' : ''}`}
          >
            <span className={`${textColor} w-8`}>{step.index + 1}</span>
            <span className={`${textColor}`}>
              {isSafetyNet && !isCurrent && !isPassed && "◆ "}
              Rp {step.amount.toLocaleString('id-ID')}
              {isSafetyNet && !isCurrent && !isPassed && " ◆"}
            </span>
          </div>
        );
      })}
    </div>
  );
};