import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { generateQuestions } from '../services/geminiService';
import { THEMES, ThemeConfig } from '../themes';
import { IconSparkles, IconUpload } from './Icons';

interface StartScreenProps {
  onStartGame: (questions: Question[], topic: string | undefined, theme: ThemeConfig) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('classic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = THEMES[selectedThemeId];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const questions = await generateQuestions(topic);
      if (questions.length < 5) {
        setError("Gemini did not generate enough questions. Try a broader topic.");
      } else {
        onStartGame(questions, topic, theme);
      }
    } catch (err) {
      setError("Failed to generate questions. Please check your API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedQuestions = JSON.parse(content) as Question[];
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
           if(parsedQuestions[0].question && Array.isArray(parsedQuestions[0].options)) {
             onStartGame(parsedQuestions, undefined, theme);
           } else {
             setError("Invalid JSON format. Must be an array of Question objects.");
           }
        } else {
          setError("JSON file is empty or not an array.");
        }
      } catch (err) {
        setError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-8 transition-colors duration-700 ${theme.appBg} ${theme.font}`}>
      
      <div className={`max-w-5xl w-full ${theme.panelBg} ${theme.panelBorder} p-8 md:p-12 rounded-3xl shadow-2xl text-center transition-all duration-300`}>
        <h1 className={`text-5xl md:text-7xl font-black mb-2 uppercase tracking-tight drop-shadow-sm ${theme.textAccent}`}>
          Classroom<br/>Millionaire
        </h1>
        <p className={`${theme.textMain} mb-12 text-xl font-light tracking-wide opacity-80`}>The Ultimate Classroom Experience</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
          
          {/* Left Column: Theme & File */}
          <div className="space-y-8">
            
            {/* Theme Selector */}
            <div>
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme.textMuted}`}>Visual Style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {Object.values(THEMES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedThemeId(t.id)}
                            className={`
                                p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200
                                ${selectedThemeId === t.id 
                                    ? `${theme.optionSelected} scale-[1.02]` 
                                    : `${theme.inputBg} hover:bg-opacity-70`
                                }
                            `}
                        >
                            <span className="text-3xl opacity-90">{t.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* File Import */}
            <div className={`p-6 rounded-2xl border ${theme.panelBorder} bg-white/5`}>
                 <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.textMain}`}>
                  <IconUpload className="w-5 h-5" />
                  <span>Import Questions</span>
                </h3>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full px-6 py-3 font-bold rounded-lg transition-colors ${theme.btnSecondary}`}
                >
                  Select JSON File
                </button>
            </div>

          </div>

          {/* Right Column: AI Generation */}
          <div className={`p-8 rounded-3xl border ${theme.panelBorder} bg-white/5 flex flex-col relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <IconSparkles className="w-32 h-32" />
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${theme.textAccent}`}>
              <IconSparkles className="w-6 h-6" />
              <span>AI Generator</span>
            </h3>
            <p className={`${theme.textMuted} text-sm mb-8 leading-relaxed`}>
              Instantly create a game by topic. The AI will generate 15 questions ranging from easy to hard.
            </p>
            
            <div className="flex flex-col gap-4 flex-grow justify-center z-10">
              <label className={`text-xs uppercase font-bold tracking-widest ${theme.textMuted}`}>Topic</label>
              <input
                type="text"
                dir="auto"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, World War II"
                className={`w-full px-6 py-5 text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${theme.inputBg}`}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic}
                className={`w-full px-6 py-5 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 ${theme.btnPrimary}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                     <span className="animate-spin">✦</span> Generating...
                  </span>
                ) : 'Generate Quiz'}
              </button>
            </div>
          </div>

        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
