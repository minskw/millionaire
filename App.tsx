import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { MoneyLadder } from './components/MoneyLadder';
import { Lifelines } from './components/Lifelines';
import { AudienceInteraction } from './components/AudienceInteraction';
import { StudentSpotlight } from './components/StudentSpotlight';
import { QuestionDisplay } from './components/QuestionDisplay';
import { Question, GameState, MONEY_LADDER, SAFETY_NETS } from './types';
import { playSound } from './services/soundService';
import { THEMES, ThemeConfig } from './themes';
import { IconRefresh, IconCheckCircle, IconXCircle, IconArrowRight } from './components/Icons';

type OverlayState = 
  | { type: 'none' }
  | { type: 'message', title: string, text: string }
  | { type: 'audience' }
  | { type: 'friend' };

// Helper function to shuffle array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Helper to prepare questions (shuffle options always, shuffle order optionally)
const prepareGameQuestions = (questions: Question[], shuffleOrder: boolean): Question[] => {
  // 1. Shuffle the order of questions ONLY if requested
  const orderedQs = shuffleOrder ? shuffleArray(questions) : [...questions];

  // 2. Shuffle options for each question and update correctAnswerIndex
  // We always shuffle options to ensure fairness/variety even if question order is fixed
  return orderedQs.map(q => {
    const optionsWithIndices = q.options.map((opt, idx) => ({
        opt,
        originalIndex: idx,
        isCorrect: idx === q.correctAnswerIndex
    }));

    const shuffledOptions = shuffleArray(optionsWithIndices);

    return {
        ...q,
        options: shuffledOptions.map(o => o.opt),
        correctAnswerIndex: shuffledOptions.findIndex(o => o.isCorrect)
    };
  });
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    money: 0,
    lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true },
    status: 'menu',
    questions: [],
    selectedAnswerIndex: null,
    isAnswerRevealed: false,
    wrongAnswersEliminated: [],
  });

  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' });
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.classic);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(true);
  
  // Stores remaining questions for future rounds
  const [queuedQuestions, setQueuedQuestions] = useState<Question[]>([]);

  const startGame = (questions: Question[], topic: string | undefined, theme: ThemeConfig, shuffleQuestions: boolean) => {
    playSound('start');
    setLastTopic(topic || null);
    setCurrentTheme(theme);
    setIsShuffleEnabled(shuffleQuestions);

    // Prepare questions based on shuffle preference
    const finalizedQuestions = prepareGameQuestions(questions, shuffleQuestions);

    // Split questions into current round (max 15) and queue
    const ROUND_LIMIT = 15;
    const currentRoundQs = finalizedQuestions.slice(0, ROUND_LIMIT);
    const remainingQs = finalizedQuestions.slice(ROUND_LIMIT);
    setQueuedQuestions(remainingQs);

    setGameState({
      currentQuestionIndex: 0,
      money: 0,
      lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true },
      status: 'playing',
      questions: currentRoundQs,
      selectedAnswerIndex: null,
      isAnswerRevealed: false,
      wrongAnswersEliminated: [],
    });
    setTimeLeft(60);
    setOverlay({ type: 'none' });
  };

  const handleNextRound = () => {
      const ROUND_LIMIT = 15;
      const nextRoundQs = queuedQuestions.slice(0, ROUND_LIMIT);
      const remainingQs = queuedQuestions.slice(ROUND_LIMIT);
      
      setQueuedQuestions(remainingQs);
      
      playSound('start');
      setGameState({
          currentQuestionIndex: 0,
          money: 0,
          lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true },
          status: 'playing',
          questions: nextRoundQs,
          selectedAnswerIndex: null,
          isAnswerRevealed: false,
          wrongAnswersEliminated: [],
      });
      setTimeLeft(60);
      setOverlay({ type: 'none' });
  };

  const handleAnswerSelect = (index: number) => {
    if (gameState.isAnswerRevealed || gameState.status !== 'playing') return;
    setGameState(prev => ({ ...prev, selectedAnswerIndex: index }));
  };

  const handleLockAnswer = () => {
    if (gameState.selectedAnswerIndex === null || gameState.isAnswerRevealed) return;

    playSound('lock');
    setGameState(prev => ({ ...prev, isAnswerRevealed: true }));

    setTimeout(() => {
      const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
      const isCorrect = gameState.selectedAnswerIndex === currentQuestion.correctAnswerIndex;

      if (isCorrect) {
        playSound('correct');
        playSound('cheer');
        const newMoney = MONEY_LADDER[gameState.currentQuestionIndex] || 0;
        
        if (gameState.currentQuestionIndex === gameState.questions.length - 1) {
             setGameState(prev => ({
                ...prev,
                money: newMoney,
                status: 'victory'
            }));
        } else {
             setGameState(prev => ({ ...prev, money: newMoney }));
        }

      } else {
        playSound('wrong');
        let safetyMoney = 0;
        const currentIdx = gameState.currentQuestionIndex;
        for (let i = SAFETY_NETS.length - 1; i >= 0; i--) {
            if (currentIdx > SAFETY_NETS[i]) {
                safetyMoney = MONEY_LADDER[SAFETY_NETS[i]];
                break;
            }
        }

        setGameState(prev => ({
          ...prev,
          money: safetyMoney,
          status: 'gameover'
        }));
      }
    }, 2000);
  };

  const handleNextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      selectedAnswerIndex: null,
      isAnswerRevealed: false,
      wrongAnswersEliminated: [],
    }));
    setTimeLeft(60);
  };

  const handleUseLifeline = (type: 'fiftyFifty' | 'phoneFriend' | 'askAudience') => {
    if (gameState.isAnswerRevealed) return;
    playSound('lifeline');

    if (type === 'fiftyFifty') {
        const currentQ = gameState.questions[gameState.currentQuestionIndex];
        const correct = currentQ.correctAnswerIndex;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correct);
        const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
        const toEliminate = shuffled.slice(0, 2);
        
        setGameState(prev => ({
            ...prev,
            lifelines: { ...prev.lifelines, fiftyFifty: false },
            wrongAnswersEliminated: toEliminate
        }));
    } else if (type === 'phoneFriend') {
        setGameState(prev => ({ ...prev, lifelines: { ...prev.lifelines, phoneFriend: false } }));
        setOverlay({ type: 'friend' });
    } else if (type === 'askAudience') {
        setGameState(prev => ({ ...prev, lifelines: { ...prev.lifelines, askAudience: false } }));
        setOverlay({ type: 'audience' });
    }
  };

  const handleBackToMenu = () => {
      setGameState(prev => ({ ...prev, status: 'menu', questions: [] }));
      setOverlay({ type: 'none' });
      setLastTopic(null);
      setQueuedQuestions([]); // Clear queue when returning to menu
  };

  const handleRestartCurrentGame = () => {
      // Restarts the current round
      playSound('start');
      
      // Prepare questions again based on initial shuffle preference
      // Note: We use current questions from state but re-process them to shuffle options again
      // If shuffleOrder was enabled, this will reshuffle the question order too.
      // If it was disabled, it preserves order but reshuffles options.
      const freshQuestions = prepareGameQuestions([...gameState.questions], isShuffleEnabled);

      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: 0,
        questions: freshQuestions,
        money: 0,
        lifelines: { fiftyFifty: true, phoneFriend: true, askAudience: true },
        status: 'playing',
        selectedAnswerIndex: null,
        isAnswerRevealed: false,
        wrongAnswersEliminated: [],
      }));
      setTimeLeft(60);
      setOverlay({ type: 'none' });
  };

  // Timer Logic
  useEffect(() => {
    // Only run timer if playing, answer not revealed, and no overlay is active
    if (gameState.status !== 'playing' || gameState.isAnswerRevealed || overlay.type !== 'none') return;

    if (timeLeft === 0) {
      playSound('wrong');
      
      // Calculate safety net money
      let safetyMoney = 0;
      const currentIdx = gameState.currentQuestionIndex;
      for (let i = SAFETY_NETS.length - 1; i >= 0; i--) {
          if (currentIdx > SAFETY_NETS[i]) {
              safetyMoney = MONEY_LADDER[SAFETY_NETS[i]];
              break;
          }
      }

      setGameState(prev => ({
        ...prev,
        money: safetyMoney,
        status: 'gameover',
        isAnswerRevealed: true // Show the answer as user timed out
      }));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState.status, gameState.isAnswerRevealed, overlay.type, gameState.currentQuestionIndex]);

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  return (
    <div className={`flex h-screen overflow-hidden select-none transition-colors duration-700 ${currentTheme.appBg} ${currentTheme.font} ${currentTheme.textMain}`}>
      
      {gameState.status === 'menu' ? (
          <StartScreen 
            onStartGame={startGame} 
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
      ) : (
          <>
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
              
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                  {/* Score & Reset */}
                  <div className="flex flex-col items-start">
                      <div className={`text-2xl font-black tracking-tight ${currentTheme.textAccent} drop-shadow-md`}>
                          Rp {gameState.money.toLocaleString('id-ID')}
                      </div>
                      {gameState.status === 'playing' && (
                          <button 
                              onClick={() => {
                                  if (window.confirm("Are you sure you want to restart this game? Progress will be lost.")) {
                                      handleRestartCurrentGame();
                                  }
                              }}
                              className={`mt-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${currentTheme.textMain} flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10`}
                          >
                              <IconRefresh className="w-3 h-3" />
                              <span>Reset</span>
                          </button>
                      )}
                  </div>

                  {/* Timer */}
                  {gameState.status === 'playing' && !gameState.isAnswerRevealed && (
                      <div className="flex flex-col items-center">
                          <div className={`
                              w-16 h-16 rounded-full border-[3px] flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-500
                              ${timeLeft <= 10 ? 'border-red-500 bg-red-900/40 scale-110 shadow-red-500/30' : `border-white/10 bg-black/20`}
                          `}>
                              <span className={`text-3xl font-bold font-mono tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : currentTheme.textMain}`}>
                                  {timeLeft}
                              </span>
                          </div>
                      </div>
                  )}
              </div>

              <div className="mb-8 scale-110 mt-12">
                  <Lifelines 
                      lifelines={gameState.lifelines} 
                      onUseLifeline={handleUseLifeline} 
                      disabled={gameState.isAnswerRevealed || gameState.status !== 'playing'}
                      theme={currentTheme}
                  />
              </div>
              
              {/* Question Container & Options */}
              {currentQuestion && (
                  <QuestionDisplay 
                      question={currentQuestion} 
                      theme={currentTheme}
                      selectedAnswerIndex={gameState.selectedAnswerIndex}
                      isAnswerRevealed={gameState.isAnswerRevealed}
                      wrongAnswersEliminated={gameState.wrongAnswersEliminated}
                      onAnswerSelect={handleAnswerSelect}
                  />
              )}

              {/* Game Controls */}
              <div className="mt-12 h-20 flex items-center justify-center z-10">
                  {gameState.status === 'playing' && !gameState.isAnswerRevealed && gameState.selectedAnswerIndex !== null && (
                      <button 
                          onClick={handleLockAnswer}
                          className={`px-16 py-4 text-xl font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-wider ${currentTheme.btnPrimary}`}
                      >
                          Lock Answer
                      </button>
                  )}

                  {gameState.isAnswerRevealed && gameState.status === 'playing' && (
                      gameState.selectedAnswerIndex === currentQuestion.correctAnswerIndex ? (
                          <div className="flex flex-col items-center gap-3 animate-bounce">
                              <div className="text-emerald-400 text-lg font-medium px-4 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                                  {currentQuestion.explanation || "Correct Answer!"}
                              </div>
                              <button 
                                  onClick={handleNextQuestion}
                                  className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-bold rounded-full shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all uppercase tracking-wide"
                              >
                                  Next Question ➜
                              </button>
                          </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-500 text-4xl font-black animate-pulse drop-shadow-lg">
                            <IconXCircle className="w-12 h-12" />
                            GAME OVER
                        </div>
                      )
                  )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:flex w-80 bg-black/20 backdrop-blur-md border-l border-white/5 p-6 items-center justify-center z-10">
              <MoneyLadder currentQuestionIndex={gameState.currentQuestionIndex} theme={currentTheme} />
            </div>
          </>
      )}

      {/* Overlays */}
      {(gameState.status === 'gameover' || gameState.status === 'victory') && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center text-center p-8">
            <div className="mb-6">
                {gameState.status === 'victory' ? 
                    <IconCheckCircle className="w-24 h-24 text-emerald-400" /> : 
                    <IconXCircle className="w-24 h-24 text-rose-500" />
                }
            </div>
            <h1 className={`text-6xl md:text-8xl font-black mb-4 tracking-tight ${gameState.status === 'victory' ? 'text-emerald-400' : 'text-rose-500'}`}>
                {gameState.status === 'victory' ? 'MILLIONAIRE!' : 'GAME OVER'}
            </h1>
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 mb-12">
                <p className="text-xl text-slate-400 uppercase tracking-widest font-bold mb-2">Total Winnings</p>
                <span className={`text-6xl font-black block ${currentTheme.textAccent} drop-shadow-lg`}>
                    Rp {gameState.money.toLocaleString('id-ID')}
                </span>
            </div>
            
            <div className="flex gap-4 flex-col sm:flex-row flex-wrap justify-center">
                 {queuedQuestions.length > 0 && (
                     <button 
                        onClick={handleNextRound}
                        className={`px-10 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/20 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white`}
                    >
                        Next Round ({queuedQuestions.length} left)
                        <IconArrowRight className="w-5 h-5" />
                    </button>
                 )}

                 <button 
                    onClick={handleRestartCurrentGame}
                    className={`px-10 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1 ${currentTheme.btnPrimary}`}
                >
                    Retry Quiz
                </button>

                <button 
                    onClick={handleBackToMenu}
                    className={`px-10 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1 ${currentTheme.btnSecondary}`}
                >
                    Main Menu
                </button>
            </div>
        </div>
      )}

      {/* Overlay Manager */}
      {overlay.type !== 'none' && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              {overlay.type === 'message' && (
                  <div className={`${currentTheme.panelBg} ${currentTheme.panelBorder} border p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl`} onClick={e => e.stopPropagation()}>
                      <h3 className={`text-3xl font-bold mb-6 ${currentTheme.textAccent}`}>{overlay.title}</h3>
                      <p className="text-xl font-light leading-relaxed mb-8">{overlay.text}</p>
                      <button 
                        onClick={() => setOverlay({ type: 'none' })}
                        className={`px-8 py-3 rounded-xl font-bold ${currentTheme.btnSecondary}`}
                      >
                          Close
                      </button>
                  </div>
              )}
              {overlay.type === 'audience' && (
                  <AudienceInteraction onClose={() => setOverlay({ type: 'none' })} theme={currentTheme} />
              )}
              {overlay.type === 'friend' && (
                  <StudentSpotlight onClose={() => setOverlay({ type: 'none' })} theme={currentTheme} />
              )}
          </div>
      )}

    </div>
  );
};

export default App;