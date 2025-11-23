import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { THEMES, ThemeConfig } from '../themes';
import { IconUpload, IconDownload, IconPlus, IconTrash, IconSparkles, IconRefresh, IconGrip } from './Icons';
import { generateQuestions } from '../services/geminiService';

interface StartScreenProps {
  onStartGame: (questions: Question[], topic: string | undefined, theme: ThemeConfig, shuffleQuestions: boolean) => void;
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, currentTheme, onThemeChange }) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Questions State
  const [manualQuestions, setManualQuestions] = useState<Question[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Entry State
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // AI Entry State
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubTopic, setAiSubTopic] = useState('');
  const [aiCount, setAiCount] = useState(10);

  // Use the passed theme prop instead of local state
  const theme = currentTheme;

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
             setManualQuestions(prev => [...prev, ...parsedQuestions]);
           } else {
             setError("Format JSON tidak valid. Harus berupa array objek Question.");
           }
        } else {
          setError("File JSON kosong atau bukan array.");
        }
      } catch (err) {
        setError("Gagal membaca file JSON.");
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

  const handleAddQuestion = () => {
    if (!qText.trim() || options.some(o => !o.trim())) return;

    const newQ: Question = {
        question: qText,
        options: [...options],
        correctAnswerIndex: correctIdx,
        difficulty: difficulty,
        explanation: '' 
    };

    setManualQuestions([...manualQuestions, newQ]);
    
    // Reset form
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectIdx(0);
    setDifficulty('medium');
  };

  const handleAiGenerate = async () => {
      if (!aiTopic.trim()) {
          setError("Please enter a topic.");
          return;
      }
      setIsGenerating(true);
      try {
          const questions = await generateQuestions(aiTopic, aiSubTopic, aiCount);
          if (questions.length > 0) {
              setManualQuestions(prev => [...prev, ...questions]);
              setAiTopic('');
              setAiSubTopic('');
          } else {
              setError("AI returned no questions. Try a different topic.");
          }
      } catch (e) {
          setError("Failed to generate questions. Check API connection.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleRemoveQuestion = (index: number) => {
      const newQs = [...manualQuestions];
      newQs.splice(index, 1);
      setManualQuestions(newQs);
  };

  const handleClearAll = () => {
      if (window.confirm("Are you sure you want to delete all questions?")) {
          setManualQuestions([]);
      }
  };

  const handleOptionChange = (index: number, value: string) => {
      const newOpts = [...options];
      newOpts[index] = value;
      setOptions(newOpts);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Optional: Set drag image if needed
  };

  const handleDragEnter = (index: number) => {
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      
      const newQs = [...manualQuestions];
      const item = newQs[draggedItemIndex];
      newQs.splice(draggedItemIndex, 1);
      newQs.splice(index, 0, item);
      
      setDraggedItemIndex(index);
      setManualQuestions(newQs);
      
      // If user is manually reordering, they likely want this exact order
      if (shuffleQuestions) setShuffleQuestions(false);
  };

  const handleDragEnd = () => {
      setDraggedItemIndex(null);
  };

  const handleShuffleList = () => {
    const newQs = [...manualQuestions];
    for (let i = newQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newQs[i], newQs[j]] = [newQs[j], newQs[i]];
    }
    setManualQuestions(newQs);
    // If manually shuffled, disable auto-shuffle so this order is preserved
    setShuffleQuestions(false);
  };

  const isManualFormValid = qText.trim() !== '' && options.every(o => o.trim() !== '');

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full overflow-y-auto p-4 md:p-8`}>
      
      <div className={`max-w-7xl w-full ${theme.panelBg} ${theme.panelBorder} p-6 md:p-8 rounded-3xl shadow-2xl text-center transition-all duration-300 my-auto min-h-[85vh] flex flex-col`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6">
            <div className="text-left">
                <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-sm ${theme.textAccent}`}>
                Classroom Millionaire
                </h1>
                <p className={`${theme.textMain} text-sm font-light tracking-wide opacity-80`}>Game Show Interaktif untuk Kelas</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-3 items-center">
                <div className={`px-6 py-3 rounded-2xl border ${theme.panelBorder} bg-black/20 flex items-center gap-3`}>
                    <span className={`${theme.textMuted} text-xs font-bold uppercase`}>Total Soal</span>
                    <span className={`text-3xl font-black ${theme.textAccent}`}>{manualQuestions.length}</span>
                </div>
                
                {/* Shuffle Toggle */}
                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${theme.panelBorder} bg-white/5 cursor-pointer select-none hover:bg-white/10 transition-colors`}>
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={shuffleQuestions} 
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                    <span className={`${theme.textMain} text-xs font-bold uppercase`}>Acak Urutan</span>
                </label>

                <button
                    onClick={() => manualQuestions.length > 0 && onStartGame(manualQuestions, "Quiz Kelas", theme, shuffleQuestions)}
                    disabled={manualQuestions.length === 0}
                    className={`px-8 py-3 text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg ${manualQuestions.length > 0 ? theme.btnPrimary : 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'}`}
                >
                    START GAME
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left flex-1 min-h-0">
          
          {/* Left Column: Input Area (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            
            {/* Theme & Import Combined */}
            <div className={`p-4 rounded-2xl border ${theme.panelBorder} bg-white/5`}>
                 <div className="flex gap-2 justify-between items-center mb-4">
                     <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted}`}>Settings</h3>
                     <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className={`px-2 py-1 text-xs font-bold rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 ${theme.textMain}`}>
                             <IconUpload className="w-3 h-3" /> Import
                        </button>
                        <button onClick={handleDownloadTemplate} className={`px-2 py-1 text-xs font-bold rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 ${theme.textMain}`}>
                             <IconDownload className="w-3 h-3" /> Template
                        </button>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                     </div>
                 </div>
                 
                 {/* Theme Mini Selector */}
                 <div className="grid grid-cols-4 gap-2">
                    {Object.values(THEMES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => onThemeChange(t)}
                            className={`h-10 rounded-lg border transition-all ${theme.id === t.id ? 'border-white ring-1 ring-white bg-white/20' : 'border-transparent bg-black/30 hover:bg-white/10'}`}
                            title={t.name}
                        >
                            <div className={`w-full h-full rounded flex items-center justify-center ${t.textAccent}`}>{t.icon}</div>
                        </button>
                    ))}
                 </div>
            </div>

            {/* Input Tabs */}
            <div className={`flex-1 flex flex-col rounded-2xl border ${theme.panelBorder} bg-white/5 overflow-hidden`}>
                <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'manual' ? `${theme.textAccent} bg-white/5` : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Manual Input
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'ai' ? `${theme.textAccent} bg-white/5` : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <IconSparkles className="w-4 h-4" />
                        AI Generate
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    {activeTab === 'manual' ? (
                         <div className="space-y-4">
                            <div>
                                <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Question</label>
                                <textarea
                                    dir="auto"
                                    value={qText}
                                    onChange={(e) => setQText(e.target.value)}
                                    placeholder="Tulis pertanyaan di sini..."
                                    className={`w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none h-24 ${theme.inputBg}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Options (Select Correct)</label>
                                {[0,1,2,3].map(i => (
                                    <div key={i} className="flex items-center gap-2 group">
                                        <div 
                                            onClick={() => setCorrectIdx(i)}
                                            className={`
                                                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer border-2 transition-all
                                                ${correctIdx === i 
                                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105' 
                                                    : 'bg-black/20 border-white/10 text-white/30 hover:border-white/30'
                                                }
                                            `}
                                        >
                                            {String.fromCharCode(65+i)}
                                        </div>
                                        <input 
                                            dir="auto"
                                            type="text"
                                            value={options[i]}
                                            onChange={(e) => handleOptionChange(i, e.target.value)}
                                            placeholder={`Pilihan ${String.fromCharCode(65+i)}`}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.inputBg}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <div className="flex-1">
                                    <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Difficulty</label>
                                    <div className="flex gap-1">
                                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-all
                                                    ${difficulty === d 
                                                        ? (d === 'easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 
                                                        d === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 
                                                        'bg-red-500/20 border-red-500 text-red-400')
                                                        : `bg-black/20 border-transparent ${theme.textMuted} hover:bg-white/5`
                                                    }
                                                `}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddQuestion}
                                disabled={!isManualFormValid}
                                className={`w-full py-3 font-bold rounded-xl transition-all mt-2 flex items-center justify-center gap-2 ${isManualFormValid ? theme.btnSecondary : 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500'}`}
                            >
                                <IconPlus className="w-4 h-4" />
                                Tambahkan Soal
                            </button>
                         </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                             <div className={`p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20`}>
                                <p className="text-xs text-blue-200/80 mb-2">
                                    Gunakan AI untuk membuat soal secara otomatis berdasarkan topik.
                                </p>
                             </div>

                             <div>
                                <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Topik Utama</label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="Contoh: Sejarah Indonesia, Biologi Sel..."
                                    className={`w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.inputBg}`}
                                />
                             </div>
                             
                             <div>
                                <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Sub-Topik (Opsional)</label>
                                <input
                                    type="text"
                                    value={aiSubTopic}
                                    onChange={(e) => setAiSubTopic(e.target.value)}
                                    placeholder="Contoh: Perang Diponegoro..."
                                    className={`w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.inputBg}`}
                                />
                             </div>

                             <div>
                                <label className={`text-xs font-bold uppercase ${theme.textMuted} mb-1 block`}>Jumlah Soal: {aiCount}</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    step="1"
                                    value={aiCount}
                                    onChange={(e) => setAiCount(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                             </div>

                             <div className="flex-1"></div>

                             <button
                                onClick={handleAiGenerate}
                                disabled={isGenerating || !aiTopic.trim()}
                                className={`w-full py-4 font-bold rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-lg ${isGenerating ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <IconRefresh className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <IconSparkles className="w-4 h-4" />
                                        Generate Questions
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

          </div>

          {/* Right Column: Table (7 cols) */}
          <div className={`lg:col-span-7 flex flex-col h-full min-h-[500px]`}>
            <div className="flex justify-between items-center mb-3">
                 <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.textMain}`}>
                    <span className="bg-white/10 px-2 py-1 rounded text-xs uppercase tracking-wider text-white/60">Daftar Soal</span>
                    Current Questions
                </h3>
                <div className="flex items-center gap-2">
                    {manualQuestions.length > 0 && (
                        <>
                            <button 
                                onClick={handleShuffleList}
                                className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded transition-colors ${theme.textAccent} hover:bg-white/10`}
                                title="Acak urutan daftar"
                            >
                                <IconRefresh className="w-3 h-3" /> Shuffle
                            </button>
                            <div className="w-px h-3 bg-white/20"></div>
                            <button 
                                onClick={handleClearAll}
                                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                            >
                                <IconTrash className="w-3 h-3" /> Clear
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={`flex-1 overflow-hidden rounded-2xl border ${theme.panelBorder} bg-black/30 relative flex flex-col`}>
                {/* Header */}
                <div className={`flex text-xs font-bold uppercase tracking-wider p-3 border-b ${theme.panelBorder} ${theme.textMuted} bg-black/40`}>
                    <div className="w-10 text-center">Move</div>
                    <div className="w-10 text-center">#</div>
                    <div className="flex-1 px-2">Question</div>
                    <div className="w-24 hidden md:block px-2">Difficulty</div>
                    <div className="w-10 text-center">Del</div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {manualQuestions.length === 0 ? (
                        <div className={`h-full flex flex-col items-center justify-center opacity-40 p-8 text-center ${theme.textMuted}`}>
                            <div className="p-4 rounded-full bg-white/5 mb-3">
                                <IconPlus className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Belum ada soal.</p>
                            <p className="text-sm mt-1">Tambahkan manual, Import JSON, atau gunakan AI Generator.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {manualQuestions.map((q, idx) => (
                                <div 
                                    key={idx} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragEnter={() => handleDragEnter(idx)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`flex items-center p-3 hover:bg-white/5 transition-colors group text-sm cursor-move ${draggedItemIndex === idx ? 'bg-white/10' : ''}`}
                                >
                                    <div className={`w-10 text-center opacity-30 group-hover:opacity-100 cursor-grab active:cursor-grabbing ${theme.textMain}`}>
                                        <IconGrip className="w-4 h-4 mx-auto" />
                                    </div>
                                    <div className={`w-10 text-center font-mono opacity-50 ${theme.textMain}`}>{idx + 1}</div>
                                    <div className="flex-1 px-2 min-w-0">
                                        <div className={`truncate font-medium ${theme.textMain} mb-0.5`} title={q.question}>
                                            {q.question}
                                        </div>
                                        <div className="text-xs opacity-60 truncate flex items-center gap-2">
                                            <span className="text-emerald-400 font-bold">{String.fromCharCode(65 + q.correctAnswerIndex)}:</span> 
                                            <span className={theme.textMuted}>{q.options[q.correctAnswerIndex]}</span>
                                        </div>
                                    </div>
                                    <div className="w-24 hidden md:flex px-2 items-center">
                                         {q.difficulty && (
                                            <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider
                                                ${q.difficulty === 'easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                                  q.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' :
                                                  'border-red-500/30 text-red-400 bg-red-500/5'}
                                            `}>
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-10 text-center">
                                        <button 
                                            onClick={() => handleRemoveQuestion(idx)} 
                                            className="text-red-500/30 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-all"
                                            title="Hapus Soal"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

        </div>

        {error && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 p-4 bg-red-500/90 text-white rounded-xl shadow-xl backdrop-blur-md z-50 flex items-center gap-3 animate-bounce">
             <IconTrash className="w-5 h-5" /> 
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold underline">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
};