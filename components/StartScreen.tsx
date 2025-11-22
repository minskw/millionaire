import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { THEMES, ThemeConfig } from '../themes';
import { IconUpload, IconDownload, IconPlus, IconTrash } from './Icons';

interface StartScreenProps {
  onStartGame: (questions: Question[], topic: string | undefined, theme: ThemeConfig) => void;
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, currentTheme, onThemeChange }) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manual Entry State
  const [manualQuestions, setManualQuestions] = useState<Question[]>([]);
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

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
             // Load imported questions into manual list so user can edit/add to them
             setManualQuestions(parsedQuestions);
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

  const handleRemoveQuestion = (index: number) => {
      const newQs = [...manualQuestions];
      newQs.splice(index, 1);
      setManualQuestions(newQs);
  };

  const handleOptionChange = (index: number, value: string) => {
      const newOpts = [...options];
      newOpts[index] = value;
      setOptions(newOpts);
  };

  const isFormValid = qText.trim() !== '' && options.every(o => o.trim() !== '');

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full overflow-y-auto p-4 md:p-8`}>
      
      <div className={`max-w-6xl w-full ${theme.panelBg} ${theme.panelBorder} p-6 md:p-8 rounded-3xl shadow-2xl text-center transition-all duration-300 my-auto min-h-[80vh] flex flex-col`}>
        <h1 className={`text-4xl md:text-6xl font-black mb-1 uppercase tracking-tight drop-shadow-sm ${theme.textAccent}`}>
          Classroom<br/>Millionaire
        </h1>
        <p className={`${theme.textMain} mb-8 text-lg font-light tracking-wide opacity-80`}>The Ultimate Classroom Experience</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left flex-1 min-h-0">
          
          {/* Left Column: Theme & File (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* Theme Selector */}
            <div className="flex-shrink-0">
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Visual Style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {Object.values(THEMES).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => onThemeChange(t)}
                            className={`
                                relative h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 group text-left
                                ${theme.id === t.id 
                                    ? 'border-white ring-2 ring-offset-2 ring-offset-black/50 scale-105 z-10 opacity-100 shadow-xl' 
                                    : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-105 hover:border-white/30 grayscale-[0.3] hover:grayscale-0'
                                }
                            `}
                        >
                            <div className={`absolute inset-0 ${t.appBg}`} />
                            <div className={`absolute top-2 right-2 p-1 rounded-lg border ${t.panelBorder} ${t.panelBg} ${t.textAccent} shadow-sm`}>
                                {t.icon}
                            </div>
                            <div className={`absolute bottom-0 inset-x-0 p-1.5 border-t ${t.panelBorder} ${t.panelBg} backdrop-blur-md`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${t.textMain}`}>
                                    {t.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* File Import */}
            <div className={`p-5 rounded-2xl border ${theme.panelBorder} bg-white/5 flex-shrink-0`}>
                 <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme.textMain}`}>
                  <IconUpload className="w-4 h-4" />
                  <span>Import / Export</span>
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
                    className={`flex-1 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${theme.btnSecondary}`}
                    >
                    Import JSON
                    </button>
                     <button
                    onClick={handleDownloadTemplate}
                    title="Download Template"
                    className={`px-3 py-2 font-bold rounded-lg transition-colors ${theme.btnSecondary}`}
                    >
                     <IconDownload className="w-4 h-4" />
                    </button>
                </div>
            </div>

          </div>

          {/* Right Column: Manual Entry (8 cols) */}
          <div className={`lg:col-span-8 p-6 rounded-3xl border ${theme.panelBorder} bg-white/5 flex flex-col relative overflow-hidden h-full max-h-[650px]`}>
            
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${theme.textAccent}`}>
                    <IconPlus className="w-6 h-6" />
                    <span>Manual Entry</span>
                </h3>
                <span className={`text-sm font-mono ${theme.textMuted}`}>
                    Total: {manualQuestions.length}
                </span>
            </div>

            {/* Questions Table Preview */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2 min-h-0 border rounded-xl border-white/10 bg-black/20">
                {manualQuestions.length === 0 ? (
                    <div className={`text-center opacity-40 py-12 flex flex-col items-center ${theme.textMuted}`}>
                        <IconPlus className="w-12 h-12 mb-2 opacity-50" />
                        <p>No questions added yet.<br/>Import JSON or add manually below.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
                            <tr className={`border-b ${theme.panelBorder} ${theme.textMuted} text-xs uppercase tracking-wider`}>
                                <th className="p-3 w-12 text-center">#</th>
                                <th className="p-3">Question</th>
                                <th className="p-3 hidden md:table-cell">Correct Answer</th>
                                <th className="p-3 w-24">Difficulty</th>
                                <th className="p-3 w-16 text-center">Act</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {manualQuestions.map((q, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className={`p-3 text-center font-mono opacity-50`}>{idx + 1}</td>
                                    <td className={`p-3 max-w-[200px] md:max-w-xs`}>
                                        <div className={`truncate font-medium ${theme.textMain}`} title={q.question}>
                                            {q.question}
                                        </div>
                                        {/* Show answer on mobile only */}
                                        <div className="md:hidden text-xs opacity-60 mt-1 truncate">
                                            <span className="text-emerald-400 font-bold">{String.fromCharCode(65 + q.correctAnswerIndex)}:</span> {q.options[q.correctAnswerIndex]}
                                        </div>
                                    </td>
                                    <td className="p-3 hidden md:table-cell max-w-[150px]">
                                        <div className="truncate opacity-80" title={q.options[q.correctAnswerIndex]}>
                                            <span className={`font-bold mr-1 ${theme.textAccent}`}>{String.fromCharCode(65 + q.correctAnswerIndex)}.</span>
                                            {q.options[q.correctAnswerIndex]}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                         {q.difficulty && (
                                            <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold tracking-wider block w-fit
                                                ${q.difficulty === 'easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                                  q.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                  'border-red-500/30 text-red-400 bg-red-500/10'}
                                            `}>
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => handleRemoveQuestion(idx)} 
                                            className="text-red-500/40 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                                            title="Remove Question"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Input Form */}
            <div className={`flex-shrink-0 space-y-3 p-4 rounded-xl bg-black/10 border ${theme.panelBorder}`}>
                <div className="relative">
                     <textarea
                        dir="auto"
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        placeholder="Enter question text here..."
                        className={`w-full px-4 py-3 text-md rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none h-20 ${theme.inputBg}`}
                     />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0,1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-2 group">
                            <div 
                                onClick={() => setCorrectIdx(i)}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all
                                    ${correctIdx === i 
                                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-110' 
                                        : 'bg-black/20 border-white/10 text-white/30 hover:border-white/30'
                                    }
                                `}
                                title="Mark as Correct Answer"
                            >
                                {String.fromCharCode(65+i)}
                            </div>
                            <input 
                                dir="auto"
                                type="text"
                                value={options[i]}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65+i)}`}
                                className={`flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.inputBg}`}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Difficulty Selector */}
                <div className="flex gap-2 pt-1">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all
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

                <button
                    onClick={handleAddQuestion}
                    disabled={!isFormValid}
                    className={`w-full py-3 font-bold rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isFormValid ? theme.btnSecondary : 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500'}`}
                >
                    <IconPlus className="w-4 h-4" />
                    Add to Quiz
                </button>
            </div>

            <button
                onClick={() => manualQuestions.length > 0 && onStartGame(manualQuestions, "Custom Quiz", theme)}
                disabled={manualQuestions.length === 0}
                className={`w-full mt-4 py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg ${manualQuestions.length > 0 ? theme.btnPrimary : 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'}`}
            >
                START GAME ({manualQuestions.length})
            </button>

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