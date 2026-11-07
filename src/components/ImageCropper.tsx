import React, { useState, useRef, useEffect } from 'react';
import { Crop, Check, RotateCcw, ScanText, Sparkles, ArrowRight } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onConfirmCrop: (croppedDataUrl: string, doDirectSolve: boolean) => void;
  onExtractOcrOnly: (croppedDataUrl: string) => void;
  onRetake: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onConfirmCrop,
  onExtractOcrOnly,
  onRetake,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Normalized crop coordinates [0, 1]
  const [crop, setCrop] = useState({ x: 0.05, y: 0.1, width: 0.9, height: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const startPos = useRef({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  // Handle pointer down
  const handlePointerDown = (mode: 'move' | 'nw' | 'ne' | 'se' | 'sw', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    startPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.width,
      cropH: crop.height,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = (e.clientX - startPos.current.mouseX) / rect.width;
      const deltaY = (e.clientY - startPos.current.mouseY) / rect.height;

      if (dragMode === 'move') {
        const newX = Math.max(0, Math.min(1 - startPos.current.cropW, startPos.current.cropX + deltaX));
        const newY = Math.max(0, Math.min(1 - startPos.current.cropH, startPos.current.cropY + deltaY));
        setCrop((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragMode === 'se') {
        const newW = Math.max(0.15, Math.min(1 - startPos.current.cropX, startPos.current.cropW + deltaX));
        const newH = Math.max(0.1, Math.min(1 - startPos.current.cropY, startPos.current.cropH + deltaY));
        setCrop((prev) => ({ ...prev, width: newW, height: newH }));
      } else if (dragMode === 'nw') {
        const maxDx = startPos.current.cropW - 0.15;
        const maxDy = startPos.current.cropH - 0.1;
        const clampedDx = Math.min(maxDx, Math.max(-startPos.current.cropX, deltaX));
        const clampedDy = Math.min(maxDy, Math.max(-startPos.current.cropY, deltaY));
        setCrop({
          x: startPos.current.cropX + clampedDx,
          y: startPos.current.cropY + clampedDy,
          width: startPos.current.cropW - clampedDx,
          height: startPos.current.cropH - clampedDy,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, dragMode]);

  // Generate cropped image data URL
  const getCroppedImageDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const sx = Math.floor(crop.x * img.naturalWidth);
        const sy = Math.floor(crop.y * img.naturalHeight);
        const sw = Math.floor(crop.width * img.naturalWidth);
        const sh = Math.floor(crop.height * img.naturalHeight);

        canvas.width = Math.max(10, sw);
        canvas.height = Math.max(10, sh);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(imageSrc);
        }
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  const handleFullSolve = async () => {
    const cropped = await getCroppedImageDataUrl();
    onConfirmCrop(cropped, true);
  };

  const handleOcrOnly = async () => {
    const cropped = await getCroppedImageDataUrl();
    onExtractOcrOnly(cropped);
  };

  const handleResetCrop = () => {
    setCrop({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-sm sm:text-base">
            Focus on Problem / Adjust Crop
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCrop}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800 transition-colors"
          >
            Reset to Full Page
          </button>
          <button
            onClick={onRetake}
            className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded bg-slate-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        </div>
      </div>

      {/* Interactive Crop Stage */}
      <div className="p-4 sm:p-6 bg-slate-950 flex justify-center">
        <div
          ref={containerRef}
          className="relative inline-block select-none max-h-[60vh] overflow-hidden rounded-lg shadow-inner"
          style={{ touchAction: 'none' }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Homework scan"
            className="max-h-[60vh] w-auto object-contain block pointer-events-none"
          />

          {/* Darkened overlay outside crop */}
          <div
            className="absolute inset-0 bg-slate-950/60 pointer-events-none"
            style={{
              clipPath: `polygon(
                0% 0%, 0% 100%, 
                ${crop.x * 100}% 100%, 
                ${crop.x * 100}% ${crop.y * 100}%, 
                ${(crop.x + crop.width) * 100}% ${crop.y * 100}%, 
                ${(crop.x + crop.width) * 100}% ${(crop.y + crop.height) * 100}%, 
                ${crop.x * 100}% ${(crop.y + crop.height) * 100}%, 
                ${crop.x * 100}% 100%, 
                100% 100%, 100% 0%
              )`,
            }}
          />

          {/* Draggable Active Crop Box */}
          <div
            className="absolute border-2 border-indigo-400 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] cursor-move"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
            onPointerDown={(e) => handlePointerDown('move', e)}
          >
            {/* Top banner tag */}
            <div className="absolute -top-6 left-0 bg-indigo-600 text-[10px] font-mono text-white px-2 py-0.5 rounded-t font-semibold">
              Selected Problem
            </div>

            {/* Corner resize handle NW */}
            <div
              className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow"
              onPointerDown={(e) => handlePointerDown('nw', e)}
            />
            {/* Corner resize handle SE */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow"
              onPointerDown={(e) => handlePointerDown('se', e)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Drag the box around the specific problem or equation you want to solve.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOcrOnly}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <ScanText className="w-4 h-4 text-emerald-400" />
            <span>Extract OCR Text</span>
          </button>

          <button
            onClick={handleFullSolve}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Solve Question Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
