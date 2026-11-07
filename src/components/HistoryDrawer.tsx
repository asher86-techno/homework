import React from 'react';
import { History, Trash2, ArrowRight, BookOpen, Clock, Calendar } from 'lucide-react';
import { SolvedProblemHistoryItem } from '../types/homework';

interface HistoryDrawerProps {
  history: SolvedProblemHistoryItem[];
  onSelectProblem: (item: SolvedProblemHistoryItem) => void;
  onClearHistory: () => void;
  onNewProblem: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectProblem,
  onClearHistory,
  onNewProblem,
}) => {
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-display">
              Solved Homework History
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Review past step-by-step solutions, key formulas, and answers.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No solved questions yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take a photo of a homework problem, or try one of the sample problems to see your history here!
          </p>
          <div className="pt-2">
            <button
              onClick={onNewProblem}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Solve First Problem
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProblem(item)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400">{item.solution.subject}</span>
                  <span>·</span>
                  <span>{item.solution.topic}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors truncate">
                  {item.solution.problemTitle}
                </h3>

                <p className="text-xs font-mono text-slate-400 line-clamp-1">
                  {item.solution.extractedProblemText}
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                    Ans: {item.solution.finalAnswer}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {item.solution.stepByStep.length} steps
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Steps</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
