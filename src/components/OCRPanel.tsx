import React, { useState } from 'react';
import { ScanText, Copy, Check, Sparkles, Upload, Camera, FileText, ArrowRight, Code } from 'lucide-react';
import { extractTextFromImage } from '../services/api';
import { SAMPLE_PROBLEMS } from '../utils/sampleData';

interface OCRPanelProps {
  initialImage?: string | null;
  onSolveExtractedString: (text: string) => void;
  onOpenPythonCode: (tab: string) => void;
  onOpenCamera: () => void;
}

export const OCRPanel: React.FC<OCRPanelProps> = ({
  initialImage,
  onSolveExtractedString,
  onOpenPythonCode,
  onOpenCamera,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setExtractedText('');
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunOcr = async () => {
    if (!imageSrc) return;
    setIsLoading(true);
    setError(null);
    try {
      const text = await extractTextFromImage(imageSrc);
      setExtractedText(text);
    } catch (err: any) {
      setError(err?.message || 'Failed to extract text from image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSample = (sampleSvg: string) => {
    setImageSrc(sampleSvg);
    setExtractedText('');
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScanText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white font-display">
                Optical Character Recognition (OCR) Engine
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Extract equations, algebraic symbols, calculus notation, and handwritten text from photos into a clean string.
            </p>
          </div>
          <button
            onClick={() => onOpenPythonCode('ocr')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shrink-0"
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>View Python OCR Code</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Image Input & Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">1. Input Homework Image</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCamera}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
            }}
          />

          {imageSrc ? (
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden aspect-4/3 flex items-center justify-center p-2 group">
              <img
                src={imageSrc}
                alt="Homework to OCR"
                className="max-h-full max-w-full object-contain rounded"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs bg-slate-900/80 hover:bg-slate-900 text-slate-200 rounded border border-slate-700 shadow backdrop-blur transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all aspect-4/3 flex flex-col items-center justify-center"
            >
              <Upload className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-300">Click to upload homework photo</p>
              <p className="text-xs text-slate-500 mt-1">or drag and drop / paste (Ctrl+V)</p>
            </div>
          )}

          {/* Quick Samples Strip */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Or choose a test sample:</p>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_PROBLEMS.slice(0, 3).map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => handleSelectSample(sp.imageSvgDataUrl)}
                  className="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-colors text-xs text-slate-300 truncate"
                >
                  <span className="font-semibold block truncate text-white">{sp.title}</span>
                  <span className="text-[10px] text-slate-500">{sp.subject}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger OCR Button */}
          <button
            onClick={handleRunOcr}
            disabled={!imageSrc || isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
              !imageSrc || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting Text via OCR...</span>
              </>
            ) : (
              <>
                <ScanText className="w-4 h-4" />
                <span>Run OCR & Extract Text String</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Extracted Text String & Next Action */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">2. Extracted Text String</h3>
              </div>
              {extractedText && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {extractedText.length} characters
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted homework text will appear here. You can also edit or paste text directly..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y leading-relaxed"
            />
            <p className="text-xs text-slate-500 mt-2">
              Our vision OCR recognizes algebraic powers (x²), roots (√), integrals (∫), fractions, and Greek letters.
            </p>
          </div>

          {/* Action to solve the extracted string */}
          <div className="pt-2">
            <button
              onClick={() => onSolveExtractedString(extractedText)}
              disabled={!extractedText.trim() || isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                !extractedText.trim() || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.99]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Solve This Extracted Text Step-by-Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
