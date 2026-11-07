import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Sparkles,
  ScanText,
  Calculator,
  Code2,
  BookOpen,
  ArrowRight,
  Layers,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CameraCapture } from './components/CameraCapture';
import { ImageCropper } from './components/ImageCropper';
import { OCRPanel } from './components/OCRPanel';
import { TextProblemInput } from './components/TextProblemInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { PythonExporter } from './components/PythonExporter';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SAMPLE_PROBLEMS, SampleProblem } from './utils/sampleData';
import { solveHomeworkImage, solveProblemString, extractTextFromImage } from './services/api';
import { HomeworkSolution, SolvedProblemHistoryItem } from './types/homework';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solve' | 'ocr' | 'text-input' | 'python' | 'history'>('solve');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [currentSolution, setCurrentSolution] = useState<HomeworkSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing homework problem...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [ocrTextToSolve, setOcrTextToSolve] = useState<string>('');
  const [pythonTabToOpen, setPythonTabToOpen] = useState<string>('combined');

  const [history, setHistory] = useState<SolvedProblemHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('snapsolve_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('snapsolve_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const saveToHistory = (sol: HomeworkSolution, thumb: string) => {
    const item: SolvedProblemHistoryItem = {
      id: `sol-${Date.now()}`,
      timestamp: Date.now(),
      thumbnail: thumb,
      solution: sol,
    };
    setHistory((prev) => [item, ...prev.slice(0, 24)]);
  };

  const fireSuccessCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#38bdf8', '#fbbf24'],
    });
  };

  // Flow 1: Photo captured from Camera or Upload
  const handlePhotoCaptured = (imageDataUrl: string) => {
    setIsCameraOpen(false);
    setCapturedImage(imageDataUrl);
    setIsCropping(true);
    setErrorMessage(null);
  };

  // Flow 2: Cropped confirmed -> direct solve
  const handleConfirmCropSolve = async (croppedDataUrl: string, doDirectSolve: boolean) => {
    setIsCropping(false);
    if (!doDirectSolve) {
      setCapturedImage(croppedDataUrl);
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Scanning homework & recognizing equations...');
    setErrorMessage(null);

    try {
      const solution = await solveHomeworkImage(croppedDataUrl, 'image/jpeg');
      setCurrentSolution(solution);
      saveToHistory(solution, croppedDataUrl);
      fireSuccessCelebration();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to solve homework photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Flow 3: Cropped confirmed -> extract OCR only
  const handleExtractOcrOnly = (croppedDataUrl: string) => {
    setIsCropping(false);
    setCapturedImage(croppedDataUrl);
    setActiveTab('ocr');
  };

  // Flow 4: Solve string of math/science problem (common algebra and calculus)
  const handleSolveTextProblem = async (problemText: string, subjectHint: string = 'Auto-detect') => {
    setIsLoading(true);
    setLoadingMessage('Solving problem step-by-step using algebra & calculus engine...');
    setErrorMessage(null);

    try {
      const solution = await solveProblemString(problemText, subjectHint);
      setCurrentSolution(solution);
      saveToHistory(solution, '');
      setActiveTab('solve');
      fireSuccessCelebration();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to solve problem string. Please check the equation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick test sample selection
  const handleSelectSample = (sample: SampleProblem) => {
    setCapturedImage(sample.imageSvgDataUrl);
    setIsCropping(true);
  };

  const handleOpenPythonTab = (tabName: string) => {
    setPythonTabToOpen(tabName);
    setActiveTab('python');
  };

  const handleNewProblem = () => {
    setCurrentSolution(null);
    setCapturedImage(null);
    setIsCropping(false);
    setErrorMessage(null);
    setActiveTab('solve');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setErrorMessage(null);
        }}
        onOpenQuickSnap={() => setIsCameraOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs sm:text-sm text-rose-200 flex items-center justify-between gap-3 shadow-lg">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold uppercase tracking-wider text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="my-16 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display">SnapSolve AI at Work</h3>
              <p className="text-xs text-slate-400">{loadingMessage}</p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <span>Extracting steps</span>
              <span>·</span>
              <span>Verifying rules</span>
              <span>·</span>
              <span>Formatting LaTeX</span>
            </div>
          </div>
        )}

        {/* View 1: Active Solution Display (when a problem has just been solved) */}
        {!isLoading && currentSolution && activeTab === 'solve' && (
          <SolutionDisplay
            solution={currentSolution}
            onOpenPythonCode={handleOpenPythonTab}
            onNewProblem={handleNewProblem}
          />
        )}

        {/* View 2: Image Cropper (when a photo has been snapped or uploaded) */}
        {!isLoading && !currentSolution && isCropping && capturedImage && (
          <ImageCropper
            imageSrc={capturedImage}
            onConfirmCrop={handleConfirmCropSolve}
            onExtractOcrOnly={handleExtractOcrOnly}
            onRetake={() => {
              setIsCropping(false);
              setCapturedImage(null);
              setIsCameraOpen(true);
            }}
          />
        )}

        {/* View 3: Default Home Solver Screen (when no active solution or crop) */}
        {!isLoading && !currentSolution && !isCropping && activeTab === 'solve' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3 py-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
                Snap Your Homework, Get Instant Solutions
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Take a photo of any algebra, calculus, physics, or chemistry problem.
                Get the exact answer, step-by-step breakdown, formulas, and runnable Python code.
              </p>
            </div>

            {/* Primary Action Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Camera Snap */}
              <div
                onClick={() => setIsCameraOpen(true)}
                className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/70 rounded-2xl p-6 transition-all cursor-pointer group shadow-lg flex flex-col justify-between h-56"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Take Photo with Camera
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Point your camera at notebook pages, worksheets, or textbook exercises.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Open Camera Viewfinder</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Upload or Drop */}
              <label className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all cursor-pointer group shadow-lg flex flex-col justify-between h-56">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          handlePhotoCaptured(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Upload Homework Image
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Drop a JPG, PNG, screenshot, or paste directly with Ctrl+V.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white">
                  <span>Browse Device Files</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </label>
            </div>

            {/* Quick 1-Click Interactive Test Samples */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Try Instant Sample Problems
                  </h3>
                  <p className="text-xs text-slate-400">
                    No camera or worksheet nearby? Click any handwritten notebook sample below:
                  </p>
                </div>
                <span className="text-[11px] text-indigo-400 font-mono">1-Click Test</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SAMPLE_PROBLEMS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-all group flex flex-col justify-between h-36"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          sample.subject === 'Calculus' ? 'text-indigo-400' : sample.subject === 'Algebra' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {sample.subject}
                        </span>
                        <span className="text-[10px] text-slate-500">{sample.difficulty}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 line-clamp-2 mt-1">
                        {sample.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500 group-hover:text-indigo-400">
                      <span>Click to scan & solve</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Breakdown</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every algebraic step and calculus derivation explained with underlying rules.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <ScanText className="w-4 h-4 text-indigo-400" />
                  <span>Precision Math OCR</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Extracts complex mathematical notation, integrals, powers, and roots faithfully.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Python Solver Code Export</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Complete, copy-pasteable Python scripts to run offline using Google GenAI SDK.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 4: Dedicated OCR Text Extractor Tab */}
        {!isLoading && activeTab === 'ocr' && (
          <OCRPanel
            initialImage={capturedImage}
            onSolveExtractedString={(extractedText) => {
              setOcrTextToSolve(extractedText);
              handleSolveTextProblem(extractedText);
            }}
            onOpenPythonCode={handleOpenPythonTab}
            onOpenCamera={() => setIsCameraOpen(true)}
          />
        )}

        {/* View 5: Dedicated Math & Science Problem Solver Tab (Accepts string input) */}
        {!isLoading && activeTab === 'text-input' && (
          <TextProblemInput
            initialText={ocrTextToSolve}
            onSolve={handleSolveTextProblem}
            isLoading={isLoading}
            onOpenPythonCode={handleOpenPythonTab}
          />
        )}

        {/* View 6: Python Code Exporter */}
        {!isLoading && activeTab === 'python' && (
          <PythonExporter
            currentSolution={currentSolution}
            initialTab={pythonTabToOpen}
          />
        )}

        {/* View 7: Solved Homework History */}
        {!isLoading && activeTab === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectProblem={(item) => {
              setCurrentSolution(item.solution);
              setActiveTab('solve');
            }}
            onClearHistory={() => setHistory([])}
            onNewProblem={handleNewProblem}
          />
        )}
      </main>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handlePhotoCaptured}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Clean Footer adhering to frontend-design anti-slop rules */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>SnapSolve AI · Photo Homework Solver & Educational STEM Assistant</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('python')}
              className="hover:text-white transition-colors"
            >
              Python Code
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('ocr')}
              className="hover:text-white transition-colors"
            >
              OCR Module
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('text-input')}
              className="hover:text-white transition-colors"
            >
              Math Solver
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
