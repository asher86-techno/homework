import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface FunctionGrapherProps {
  expression: string;
}

export const FunctionGrapher: React.FC<FunctionGrapherProps> = ({ expression }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [range, setRange] = useState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Helpers to convert math coords to canvas pixels
    const toCanvasX = (x: number) => ((x - range.xMin) / (range.xMax - range.xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - range.yMin) / (range.yMax - range.yMin)) * height;
    const toMathX = (px: number) => range.xMin + (px / width) * (range.xMax - range.xMin);
    const toMathY = (py: number) => range.yMin + ((height - py) / height) * (range.yMax - range.yMin);

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    const stepX = (range.xMax - range.xMin) / 10;
    for (let x = Math.ceil(range.xMin / stepX) * stepX; x <= range.xMax; x += stepX) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
    }

    const stepY = (range.yMax - range.yMin) / 10;
    for (let y = Math.ceil(range.yMin / stepY) * stepY; y <= range.yMax; y += stepY) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // X Axis
    const originY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Compile function safely
    let evalFunc: (x: number) => number;
    try {
      // Replace standard mathematical shortcuts for safety
      const safeExpr = expression
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/ln/g, 'Math.log')
        .replace(/exp/g, 'Math.exp')
        .replace(/pi/gi, 'Math.PI');

      evalFunc = new Function('x', `with(Math) { return ${safeExpr}; }`) as (x: number) => number;
    } catch {
      return;
    }

    // Plot curve
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let isDrawing = false;
    for (let px = 0; px <= width; px += 2) {
      const x = toMathX(px);
      try {
        const y = evalFunc(x);
        if (!isNaN(y) && isFinite(y)) {
          const py = toCanvasY(y);
          if (py >= -100 && py <= height + 100) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      } catch {
        isDrawing = false;
      }
    }
    ctx.stroke();
  }, [expression, range]);

  const handleZoom = (factor: number) => {
    setRange((prev) => ({
      xMin: prev.xMin * factor,
      xMax: prev.xMax * factor,
      yMin: prev.yMin * factor,
      yMax: prev.yMax * factor,
    }));
  };

  const handleResetZoom = () => {
    setRange({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = range.xMin + (px / canvas.width) * (range.xMax - range.xMin);
    const y = range.yMin + ((canvas.height - py) / canvas.height) * (range.yMax - range.yMin);
    setHoverCoord({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-indigo-400 font-semibold truncate">
          f(x) = {expression}
        </span>
        <div className="flex items-center gap-1">
          {hoverCoord && (
            <span className="font-mono text-[10px] text-slate-400 mr-2">
              ({hoverCoord.x}, {hoverCoord.y})
            </span>
          )}
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reset Zoom"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative aspect-16/9 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          className="w-full h-full block cursor-crosshair"
        />
      </div>
    </div>
  );
};
