import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../themes';
import { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  theme: ThemeConfig;
  selectedAnswerIndex: number | null;
  isAnswerRevealed: boolean;
  wrongAnswersEliminated: number[];
  onAnswerSelect: (index: number) => void;
}

// Helper to detect Arabic text
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  theme,
  selectedAnswerIndex,
  isAnswerRevealed,
  wrongAnswersEliminated,
  onAnswerSelect
}) => {
  const [displayQuestion, setDisplayQuestion] = useState<Question>(question);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger transition only if the question text content actually changes
    if (question.question !== displayQuestion.question) {
      // Fade out
      setIsVisible(false);
      
      const timer = setTimeout(() => {
        setDisplayQuestion(question);
        // Fade in
        setIsVisible(true);
      }, 300); // Matches duration-300

      return () => clearTimeout(timer);
    }
  }, [question, displayQuestion]);

  // Check if the currently displayed question text is Arabic
  const isQArabic = isArabic(displayQuestion.question);
  const length = displayQuestion.question.length;

  // Dynamic font scaling based on length and language
  let textSizeClass = 'text-2xl md:text-4xl';
  
  if (isQArabic) {
      if (length < 50) textSizeClass = 'text-4xl md:text-6xl';
      else if (length < 100) textSizeClass = 'text-3xl md:text-5xl';
      else textSizeClass = 'text-2xl md:text-4xl';
  } else {
      if (length < 50) textSizeClass = 'text-3xl md:text-5xl';
      else if (length < 120) textSizeClass = 'text-2xl md:text-4xl';
      else textSizeClass = 'text-xl md:text-3xl';
  }

  const lineHeight = isQArabic ? 'leading-[2.0]' : 'leading-tight';
  const fontFamily = isQArabic ? 'font-amiri' : '';

  return (
    <div className="w-full max-w-5xl mb-6 z-10 px-4 md:px-0 flex flex-col gap-6 md:gap-8">
      
      {/* Question Text Box */}
      <div className={`
        relative w-full min-h-[160px] md:min-h-[200px] py-8 md:py-10 px-8 md:px-16
        flex items-center justify-center text-center 
        transition-all duration-500 
        ${theme.questionBox}
      `}>
        <h2 
          dir={isQArabic ? 'rtl' : 'ltr'}
          className={`
            font-bold drop-shadow-sm w-full break-words
            transition-all duration-300 ease-in-out transform
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            ${fontFamily} 
            ${textSizeClass} 
            ${lineHeight}
          `}
        >
          {displayQuestion.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className={`
          grid grid-cols-1 md:grid-cols-2 gap-5 w-full
          transition-all duration-300 ease-in-out transform
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}>
          {displayQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswerIndex === idx;
              const isCorrect = displayQuestion.correctAnswerIndex === idx;
              const isEliminated = wrongAnswersEliminated.includes(idx);
              const isOptArabic = isArabic(option);

              let optionClass = theme.optionBase;
              if (isAnswerRevealed) {
                  if (isCorrect) optionClass = theme.optionCorrect;
                  else if (isSelected) optionClass = theme.optionWrong;
              } else if (isSelected) {
                  optionClass = theme.optionSelected;
              } else if (!isEliminated) {
                  optionClass += ` ${theme.optionHover} cursor-pointer`;
              }

              return (
                  <div 
                      key={idx}
                      onClick={() => isVisible && !isEliminated && onAnswerSelect(idx)}
                      className={`
                          relative py-5 px-8 rounded-xl shadow-md 
                          flex items-center group
                          ${optionClass}
                          ${!isAnswerRevealed && !isSelected && !isEliminated ? 'active:scale-[0.98]' : ''}
                          transition-all ease-out
                          ${isEliminated ? 'opacity-0 pointer-events-none duration-1000 scale-95' : 'opacity-100 duration-200 scale-100'}
                          ${isSelected && !isAnswerRevealed ? 'scale-[1.02] shadow-xl brightness-110 z-10 ring-1 ring-white/30' : ''}
                          ${isAnswerRevealed && isCorrect ? 'animate-pulse scale-[1.02] brightness-125 z-10' : ''}
                      `}
                  >
                      <span className={`mr-6 text-2xl font-black opacity-70 ${theme.textAccent} ${isSelected && !isAnswerRevealed ? 'text-inherit' : ''}`}>
                          {letter}
                      </span>
                      <span 
                        dir={isOptArabic ? 'rtl' : 'ltr'}
                        className={`
                        ${isOptArabic ? 'font-amiri text-2xl md:text-3xl leading-[2.0]' : 'text-xl md:text-2xl text-left'}
                         flex-1 ${isOptArabic ? 'text-right' : ''} font-medium
                      `}>{option}</span>
                  </div>
              );
          })}
      </div>
    </div>
  );
};