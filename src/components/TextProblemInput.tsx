import React, { useState } from 'react';
import { Calculator, Sparkles, Code2, BookOpen, ChevronRight } from 'lucide-react';

interface TextProblemInputProps {
  initialText?: string;
  onSolve: (problemText: string, subjectHint: string) => void;
  isLoading: boolean;
  onOpenPythonCode: (tab: string) => void;
}

interface ProblemPreset {
  label: string;
  category: 'Algebra' | 'Calculus' | 'Physics';
  text: string;
}

const PRESETS: ProblemPreset[] = [
  {
    label: 'Quadratic Equation (Factoring & Formula)',
    category: 'Algebra',
    text: 'Solve the quadratic equation: 3x^2 - 11x - 4 = 0. Show factoring and quadratic formula steps.',
  },
  {
    label: 'Integration by Parts (∫ x · cos(2x) dx)',
    category: 'Calculus',
    text: 'Evaluate the indefinite integral: ∫ x * cos(2x) dx using integration by parts.',
  },
  {
    label: 'Chain & Product Rule Derivative',
    category: 'Calculus',
    text: 'Find the first derivative f\'(x) for f(x) = (2x^2 + 3)^3 * e^(4x).',
  },
  {
    label: 'System of Linear Equations',
    category: 'Algebra',
    text: 'Solve the system of equations for x and y: 2x + 3y = 12 and 5x - y = 13.',
  },
  {
    label: 'L\'Hôpital\'s Rule / Limit Evaluation',
    category: 'Calculus',
    text: 'Evaluate the limit: lim_{x -> 0} (sin(5x) / (3x)). State whether L\'Hôpital\'s rule applies.',
  },
  {
    label: 'Polynomial Factoring',
    category: 'Algebra',
    text: 'Factor completely over the real numbers: P(x) = 2x^3 - 4x^2 - 6x.',
  },
  {
    label: 'Definite Integral & Net Area',
    category: 'Calculus',
    text: 'Evaluate the definite integral from x = 1 to x = 3 of (4x^3 - 6x + 2) dx.',
  },
  {
    label: 'Physics Kinematics: Free Fall',
    category: 'Physics',
    text: 'A stone is dropped from a cliff 80 meters high. Calculate the time it takes to hit the ground and its impact velocity (g = 9.8 m/s²).',
  },
];

const MATH_SYMBOLS = [
  { symbol: '²', label: 'x²' },
  { symbol: '³', label: 'x³' },
  { symbol: '√', label: '√' },
  { symbol: '∫', label: '∫' },
  { symbol: 'd/dx', label: 'd/dx' },
  { symbol: 'lim', label: 'lim' },
  { symbol: 'π', label: 'π' },
  { symbol: 'θ', label: 'θ' },
  { symbol: '±', label: '±' },
  { symbol: '·', label: '·' },
  { symbol: '≠', label: '≠' },
  { symbol: '≤', label: '≤' },
  { symbol: '≥', label: '≥' },
  { symbol: '∞', label: '∞' },
];

export const TextProblemInput: React.FC<TextProblemInputProps> = ({
  initialText = '',
  onSolve,
  isLoading,
  onOpenPythonCode,
}) => {
  const [problemText, setProblemText] = useState<string>(initialText);
  const [subjectHint, setSubjectHint] = useState<string>('Auto-detect');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleInsertSymbol = (sym: string) => {
    if (!textareaRef.current) {
      setProblemText((prev) => prev + sym);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextText = problemText.substring(0, start) + sym + problemText.substring(end);
    setProblemText(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  const handleSelectPreset = (preset: ProblemPreset) => {
    setProblemText(preset.text);
    setSubjectHint(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || isLoading) return;
    onSolve(problemText.trim(), subjectHint);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white font-display">
                Algebra & Calculus Problem Solver
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Input any math or science problem string to generate an instant, pedagogical step-by-step breakdown.
            </p>
          </div>
          <button
            onClick={() => onOpenPythonCode('solver')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shrink-0"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Python Solver Module</span>
          </button>
        </div>
      </div>

      {/* Input Box and Controls */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label htmlFor="problem-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Problem String
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Subject:</span>
            <select
              value={subjectHint}
              onChange={(e) => setSubjectHint(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Auto-detect">Auto-detect</option>
              <option value="Algebra">Algebra</option>
              <option value="Calculus">Calculus</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Geometry">Geometry</option>
            </select>
          </div>
        </div>

        <textarea
          id="problem-input"
          ref={textareaRef}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="e.g. Solve for x: 3x^2 - 11x - 4 = 0 OR Evaluate the integral: ∫ x * cos(2x) dx..."
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y leading-relaxed"
        />

        {/* Math Symbol Toolbar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500">Insert Math Symbols:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATH_SYMBOLS.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleInsertSymbol(item.symbol)}
                className="px-2.5 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded transition-colors"
                title={`Insert ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!problemText.trim() || isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
              !problemText.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Solving step-by-step...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Step-by-Step Solution</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Common Algebra & Calculus Examples */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Quick Test Problems (Common Algebra & Calculus)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click any problem to test instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-all group flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    p.category === 'Calculus' ? 'text-indigo-400' : p.category === 'Algebra' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {p.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                    {p.label}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 line-clamp-1">
                  {p.text}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
