import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  PYTHON_OCR_MODULE,
  PYTHON_SOLVER_MODULE,
  PYTHON_COMBINED_APP,
  PYTHON_STREAMLIT_APP,
} from '../utils/pythonTemplates';
import { HomeworkSolution } from '../types/homework';
import { generateCustomPythonScript } from '../services/api';

interface PythonExporterProps {
  currentSolution?: HomeworkSolution | null;
  initialTab?: string;
}

export const PythonExporter: React.FC<PythonExporterProps> = ({
  currentSolution,
  initialTab = 'combined',
}) => {
  const [activeTab, setActiveTab] = useState<'combined' | 'ocr' | 'solver' | 'streamlit' | 'custom'>(
    (initialTab as any) || 'combined'
  );
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState<string>('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customMode, setCustomMode] = useState<'cli' | 'gui' | 'streamlit'>('cli');

  const getCodeForTab = (): string => {
    switch (activeTab) {
      case 'combined':
        return PYTHON_COMBINED_APP;
      case 'ocr':
        return PYTHON_OCR_MODULE;
      case 'solver':
        return PYTHON_SOLVER_MODULE;
      case 'streamlit':
        return PYTHON_STREAMLIT_APP;
      case 'custom':
        return customCode || '# Click "Generate Tailored Script" below to create a custom Python solver for your scanned question.';
      default:
        return PYTHON_COMBINED_APP;
    }
  };

  const getFilenameForTab = (): string => {
    switch (activeTab) {
      case 'combined':
        return 'gauth_homework_app.py';
      case 'ocr':
        return 'homework_ocr.py';
      case 'solver':
        return 'homework_solver.py';
      case 'streamlit':
        return 'streamlit_gauth_app.py';
      case 'custom':
        return 'custom_homework_solver.py';
    }
  };

  const handleCopy = () => {
    const code = getCodeForTab();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getCodeForTab();
    const filename = getFilenameForTab();
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateCustom = async () => {
    if (!currentSolution) return;
    setIsGeneratingCustom(true);
    try {
      const code = await generateCustomPythonScript(
        currentSolution.problemTitle,
        currentSolution.subject,
        currentSolution.extractedProblemText,
        customMode
      );
      setCustomCode(code);
      setActiveTab('custom');
    } catch (err: any) {
      alert(`Error generating script: ${err?.message}`);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const activeCode = getCodeForTab();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white font-display">
                Python Homework Solver Codebase
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Run homework photo solving, OCR, and algebra/calculus step-by-step algorithms directly in Python using the official <code className="text-emerald-300 font-mono text-xs">google-genai</code> SDK.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download .py</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('combined')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
            activeTab === 'combined'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Full CLI Solver (gauth_homework_app.py)
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
            activeTab === 'ocr'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          OCR Module (homework_ocr.py)
        </button>

        <button
          onClick={() => setActiveTab('solver')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
            activeTab === 'solver'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Algebra & Calculus Solver (homework_solver.py)
        </button>

        <button
          onClick={() => setActiveTab('streamlit')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 ${
            activeTab === 'streamlit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Interactive Web UI (streamlit_gauth_app.py)
        </button>

        {currentSolution && (
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored for Scanned Problem</span>
          </button>
        )}
      </div>

      {/* Tailored Generation CTA if currentSolution exists */}
      {currentSolution && activeTab === 'custom' && !customCode && (
        <div className="bg-slate-900 border border-emerald-800/40 rounded-2xl p-5 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-white">
            Generate Custom Python Solver for: {currentSolution.problemTitle}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Creates a dedicated Python program specially tailored to solve this exact subject ({currentSolution.subject}) and problem structure.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <select
              value={customMode}
              onChange={(e) => setCustomMode(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg"
            >
              <option value="cli">Command-Line Script (CLI)</option>
              <option value="gui">Desktop GUI (Tkinter)</option>
              <option value="streamlit">Streamlit Web App</option>
            </select>
            <button
              onClick={handleGenerateCustom}
              disabled={isGeneratingCustom}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isGeneratingCustom ? 'Generating Python Code...' : 'Generate Python Script'}
            </button>
          </div>
        </div>
      )}

      {/* Terminal Setup Instructions Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">How to Run in Python (3 Simple Steps)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-indigo-400 font-bold block">1. Install Dependencies</span>
            <code className="text-slate-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded mt-1 overflow-x-auto">
              pip install google-genai pillow pydantic python-dotenv
            </code>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-indigo-400 font-bold block">2. Set Gemini API Key</span>
            <code className="text-slate-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded mt-1 overflow-x-auto">
              export GEMINI_API_KEY="your_api_key_here"
            </code>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-indigo-400 font-bold block">3. Run Solver Script</span>
            <code className="text-slate-300 font-mono text-[11px] block bg-slate-900 p-1.5 rounded mt-1 overflow-x-auto">
              python {getFilenameForTab()} {activeTab === 'solver' ? '"Solve for x: 3x^2 - 11x - 4 = 0"' : 'homework.jpg'}
            </code>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>{getFilenameForTab()}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-5 overflow-x-auto font-mono text-xs sm:text-[13px] text-slate-200 leading-relaxed selection:bg-indigo-500/30 max-h-[600px] overflow-y-auto">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
};
