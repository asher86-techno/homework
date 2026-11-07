import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Eraser, RotateCcw, Trash2, X } from 'lucide-react';

interface ScratchpadProps {
  onClose?: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#38bdf8'); // sky blue
  const [lineWidth, setLineWidth] = useState(2.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'eraser') {
      ctx.strokeStyle = '#020617'; // background color
      ctx.lineWidth = 16;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Student Scratchpad / Whiteboard
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Tool selectors */}
          <button
            onClick={() => setMode('pen')}
            className={`p-1.5 rounded transition-colors ${
              mode === 'pen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
            title="Pen"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMode('eraser')}
            className={`p-1.5 rounded transition-colors ${
              mode === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Color choices */}
          {mode === 'pen' && (
            <div className="flex items-center gap-1 ml-2">
              {['#38bdf8', '#4ade80', '#fbbf24', '#f43f5e', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/50' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 bg-slate-800 transition-colors ml-2"
            title="Clear Scratchpad"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={700}
          height={260}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="w-full h-44 cursor-crosshair block"
        />
      </div>
      <p className="text-[11px] text-slate-500">
        Doodle intermediate math steps, factor trees, or scratch calculations here.
      </p>
    </div>
  );
};
