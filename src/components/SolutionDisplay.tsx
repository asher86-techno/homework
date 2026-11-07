import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Share2,
  HelpCircle,
  TrendingUp,
  Edit3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HomeworkSolution } from '../types/homework';
import { FunctionGrapher } from './FunctionGrapher';
import { Scratchpad } from './Scratchpad';
import { TutorChat } from './TutorChat';

interface SolutionDisplayProps {
  solution: HomeworkSolution;
  onOpenPythonCode: (tab: string) => void;
  onNewProblem: () => void;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({
  solution,
  onOpenPythonCode,
  onNewProblem,
}) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>(() => {
    // Expand all by default
    const map: Record<number, boolean> = {};
    solution.stepByStep.forEach((s) => (map[s.stepNumber] = true));
    return map;
  });

  // Audio Speech Synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(solution.finalAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleCopyFullSolution = () => {
    let full = `=== ${solution.problemTitle} ===\n`;
    full += `Subject: ${solution.subject} · Topic: ${solution.topic}\n\n`;
    full += `Problem:\n${solution.extractedProblemText}\n\n`;
    full += `FINAL ANSWER:\n${solution.finalAnswer}\n\n`;
    full += `STEP-BY-STEP SOLUTION:\n`;
    solution.stepByStep.forEach((s) => {
      full += `Step ${s.stepNumber}: ${s.title}\n`;
      full += `${s.explanation}\n`;
      if (s.mathFormula) full += `Formula: ${s.mathFormula}\n`;
      if (s.result) full += `Result: ${s.result}\n`;
      full += '\n';
    });
    full += `WHY THIS WORKS:\n${solution.whyItWorks}\n\n`;
    if (solution.formulasUsed?.length) {
      full += `FORMULAS USED:\n${solution.formulasUsed.map((f) => `• ${f}`).join('\n')}\n\n`;
    }
    navigator.clipboard.writeText(full);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  // Text to Speech
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (isPlayingAudio && isAudioPaused) {
      window.speechSynthesis.resume();
      setIsAudioPaused(false);
      return;
    }

    if (isPlayingAudio && !isAudioPaused) {
      window.speechSynthesis.pause();
      setIsAudioPaused(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Construct speech narrative
    let speechText = `The final answer is: ${solution.finalAnswer}. `;
    speechText += `Here is the step-by-step breakdown. `;
    solution.stepByStep.forEach((s) => {
      speechText += `Step ${s.stepNumber}: ${s.title}. ${s.explanation}. `;
      if (s.result) speechText += `This gives: ${s.result}. `;
    });
    speechText += `Concept summary: ${solution.whyItWorks}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };

    setIsPlayingAudio(true);
    setIsAudioPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          {/* Zero-Pill unboxed metadata as per §1.A of frontend-design */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-medium">
            <span className="text-indigo-400 font-semibold">{solution.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{solution.topic}</span>
            <span aria-hidden="true">·</span>
            <span>Confidence: {solution.confidence || 'High'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {solution.problemTitle}
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Audio read-aloud */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              title="Listen to step-by-step solution"
            >
              {isPlayingAudio && !isAudioPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Listen Voice</span>
                </>
              )}
            </button>
            {isPlayingAudio && (
              <button
                onClick={handleStopAudio}
                className="p-1.5 text-slate-400 hover:text-rose-400"
                title="Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showScratchpad
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>

          <button
            onClick={handleCopyFullSolution}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFull ? 'Copied Full' : 'Copy All'}</span>
          </button>

          <button
            onClick={() => onOpenPythonCode('solver')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-lg border border-emerald-700/50 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Python Code</span>
          </button>

          <button
            onClick={onNewProblem}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm ml-1"
          >
            New Question
          </button>
        </div>
      </div>

      {/* Optional Scratchpad View */}
      {showScratchpad && (
        <Scratchpad onClose={() => setShowScratchpad(false)} />
      )}

      {/* Highlighted Final Answer Card (The signature Gauth hallmark) */}
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Direct Final Answer
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight pt-1">
              {solution.finalAnswer}
            </div>
          </div>

          <button
            onClick={handleCopyAnswer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            {copiedAnswer ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAnswer ? 'Answer Copied!' : 'Copy Answer'}</span>
          </button>
        </div>

        {/* Original Problem Transcription */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
          <span className="text-slate-500 font-semibold uppercase tracking-wider mr-2">Transcribed Question:</span>
          <span className="font-mono text-slate-200">{solution.extractedProblemText}</span>
        </div>
      </div>

      {/* Main 2-Column Split: Steps on Left, Grapher / Tutor / Practice on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Step-by-Step Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Step-by-Step Solution Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {solution.stepByStep.length} pedagogical steps
              </span>
            </div>

            {/* List of steps */}
            <div className="space-y-3">
              {solution.stepByStep.map((step) => {
                const isExpanded = expandedSteps[step.stepNumber] !== false;
                return (
                  <div
                    key={step.stepNumber}
                    className="border border-slate-800 rounded-xl bg-slate-950/70 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleStep(step.stepNumber)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">
                          {step.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-2.5 text-xs sm:text-sm text-slate-300 border-t border-slate-900">
                        <p className="leading-relaxed text-slate-300">
                          {step.explanation}
                        </p>

                        {step.mathFormula && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-indigo-300 text-xs sm:text-sm overflow-x-auto">
                            {step.mathFormula}
                          </div>
                        )}

                        {step.result && (
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-md">
                            <span className="text-slate-400">Yields:</span>
                            <span className="font-semibold">{step.result}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why This Works (Concept Intuition) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Why This Method Works</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {solution.whyItWorks}
            </p>
          </div>

          {/* Formulas and Key Concepts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Core Formulas & Theorems Used</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {solution.formulasUsed?.map((f, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200"
                >
                  {f}
                </div>
              ))}
            </div>

            {solution.keyConcepts?.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Key Principles:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {solution.keyConcepts.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Common Pitfalls / Watch Out */}
          {solution.commonPitfalls && solution.commonPitfalls.length > 0 && (
            <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Watch Out! Common Traps & Mistakes</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                {solution.commonPitfalls.map((pit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Interactive Tools, Grapher, Practice, Tutor */}
        <div className="lg:col-span-5 space-y-4">
          {/* 2D Curve Grapher (if applicable) */}
          {solution.graphableExpression && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Interactive Curve Plotter</span>
              </h4>
              <FunctionGrapher expression={solution.graphableExpression} />
            </div>
          )}

          {/* Try a Similar Practice Problem (Gauth signature mastery feature) */}
          {solution.practiceProblem && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Mastery: Try a Similar Problem
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  Self-Check
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
                {solution.practiceProblem.question}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowPracticeHint(!showPracticeHint)}
                  className="px-3 py-1.5 text-xs text-amber-300 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  {showPracticeHint ? 'Hide Hint' : '💡 Show Hint'}
                </button>
                <button
                  onClick={() => setShowPracticeSolution(!showPracticeSolution)}
                  className="px-3 py-1.5 text-xs text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  {showPracticeSolution ? 'Hide Answer' : '🎯 Reveal Solution'}
                </button>
              </div>

              {showPracticeHint && (
                <div className="p-3 bg-slate-950 border border-amber-800/40 rounded-lg text-xs text-amber-200">
                  <span className="font-semibold">Hint: </span>
                  {solution.practiceProblem.hint}
                </div>
              )}

              {showPracticeSolution && (
                <div className="p-3 bg-slate-950 border border-emerald-800/40 rounded-lg text-xs font-mono text-emerald-300">
                  <span className="font-semibold text-slate-300">Solution: </span>
                  {solution.practiceProblem.solution}
                </div>
              )}
            </div>
          )}

          {/* 1-on-1 AI Tutor Follow-up Chat */}
          <TutorChat solution={solution} />
        </div>
      </div>
    </div>
  );
};
