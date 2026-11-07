import React from 'react';
import { Camera, Code2, BookOpen, Sparkles, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'solve' | 'ocr' | 'text-input' | 'python' | 'history';
  onSelectTab: (tab: 'solve' | 'ocr' | 'text-input' | 'python' | 'history') => void;
  onOpenQuickSnap: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickSnap,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('solve')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              ∑
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap">
              SnapSolve AI
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('solve')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 ${
              activeTab === 'solve'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Photo Solver
          </button>

          <button
            onClick={() => onSelectTab('ocr')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 ${
              activeTab === 'ocr'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OCR Text Extractor
          </button>

          <button
            onClick={() => onSelectTab('text-input')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1.5 ${
              activeTab === 'text-input'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Math & Science Solver
          </button>

          <button
            onClick={() => onSelectTab('python')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-1.5 ${
              activeTab === 'python'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Python Solver Code</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-1.5 ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({historyCount})</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickSnap}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Snap Homework</span>
          </button>
        </div>
      </div>
    </header>
  );
};
