import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { generateQuestions } from '../services/geminiService';
import { THEMES, ThemeConfig } from '../themes';
import { IconSparkles, IconUpload, IconDownload } from './Icons';

interface StartScreenProps {
  onStartGame: (questions: Question[], topic: string | undefined, theme: ThemeConfig) => void;
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, currentTheme, onThemeChange }) => {
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the passed theme prop instead of local state
  const theme = currentTheme;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const questions = await generateQuestions(topic, subTopic);
      if (questions.length < 5) {
        setError("Gemini did not generate enough questions. Try a broader topic.");
      } else {
        const fullTopic = subTopic.trim() ? `${topic} (${subTopic})` : topic;
        onStartGame(questions, fullTopic, theme);
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

  const handleDownloadTemplate = () => {
    const template = [
      {
        question: "Contoh Pertanyaan: Siapakah penemu lampu pijar?",
        options: ["Thomas Alva Edison", "Nikola Tesla", "Alexander Graham Bell", "Albert Einstein"],
        correctAnswerIndex: 0,
        difficulty: "easy",
        explanation: "Thomas Edison mematenkan lampu pijar komersial pertama."
      }
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "template_soal.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full overflow-y-auto p-4 md:p-8`}>
      
      <div className={`max-w-5xl w-full ${theme.panelBg} ${theme.panelBorder} p-8 md:p-12 rounded-3xl shadow-2xl text-center transition-all duration-300 my-auto`}>
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
                <div className="grid grid-cols-2 gap-4">
                    {Object.values(THEMES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => onThemeChange(t)}
                            className={`
                                relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 group text-left
                                ${theme.id === t.id 
                                    ? 'border-white ring-2 ring-offset-2 ring-offset-black/50 scale-105 z-10 opacity-100 shadow-xl' 
                                    : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-105 hover:border-white/30 grayscale-[0.3] hover:grayscale-0'
                                }
                            `}
                        >
                            {/* Preview Background */}
                            <div className={`absolute inset-0 ${t.appBg}`} />
                            
                            {/* Preview Elements */}
                            <div className={`absolute top-2 left-2 right-12 h-2 rounded-full border ${t.panelBorder} ${t.panelBg} opacity-50`} />
                            <div className={`absolute top-6 left-2 w-12 h-2 rounded-full border ${t.panelBorder} ${t.btnPrimary} opacity-50`} />

                            {/* Theme Icon */}
                            <div className={`absolute top-2 right-2 p-1.5 rounded-lg border ${t.panelBorder} ${t.panelBg} ${t.textAccent} shadow-sm`}>
                                {t.icon}
                            </div>

                            {/* Theme Name Label */}
                            <div className={`absolute bottom-0 inset-x-0 p-2 border-t ${t.panelBorder} ${t.panelBg} backdrop-blur-md flex items-center justify-between`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMain}`}>
                                    {t.name}
                                </span>
                                {/* Small color dot for accent */}
                                <div className={`w-2 h-2 rounded-full ${t.btnPrimary}`}></div>
                            </div>
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
                <div className="flex gap-2">
                    <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 px-4 py-3 font-bold rounded-lg transition-colors ${theme.btnSecondary}`}
                    >
                    Select JSON File
                    </button>
                     <button
                    onClick={handleDownloadTemplate}
                    title="Download Template"
                    className={`px-4 py-3 font-bold rounded-lg transition-colors ${theme.btnSecondary}`}
                    >
                     <IconDownload className="w-5 h-5" />
                    </button>
                </div>
                <p className={`text-xs mt-3 ${theme.textMuted} opacity-70`}>
                    Supports JSON format. Use the download button for a template.
                </p>
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
            <p className={`${theme.textMuted} text-sm mb-6 leading-relaxed`}>
              Instantly create a game. The AI will generate 15 questions ranging from easy to hard.
            </p>
            
            <div className="flex flex-col gap-4 flex-grow justify-center z-10">
              <div className="space-y-2">
                  <label className={`text-xs uppercase font-bold tracking-widest ${theme.textMuted}`}>Main Topic</label>
                  <input
                    type="text"
                    dir="auto"
                    value={topic}
                    disabled={isLoading}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., History, Biology, Math"
                    className={`w-full px-6 py-3 text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${theme.inputBg} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                  />
              </div>

              <div className="space-y-2">
                  <label className={`text-xs uppercase font-bold tracking-widest ${theme.textMuted}`}>Keywords / Focus (Optional)</label>
                  <input
                    type="text"
                    dir="auto"
                    value={subTopic}
                    disabled={isLoading}
                    onChange={(e) => setSubTopic(e.target.value)}
                    placeholder="e.g., WWII, Photosynthesis, Fractions"
                    className={`w-full px-6 py-3 text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${theme.inputBg} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                  />
              </div>

              {isLoading ? (
                 <div className={`w-full px-6 py-4 mt-2 rounded-xl border ${theme.panelBorder} bg-black/20 flex items-center justify-center gap-3 cursor-wait shadow-inner`}>
                    <IconSparkles className={`w-6 h-6 animate-spin ${theme.textAccent}`} />
                    <span className={`${theme.textMain} font-bold tracking-wide animate-pulse`}>Generating Quiz...</span>
                 </div>
              ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!topic}
                    className={`w-full px-6 py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 ${theme.btnPrimary}`}
                  >
                    Generate Quiz
                  </button>
              )}
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