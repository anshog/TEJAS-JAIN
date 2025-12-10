import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingTool } from '../types';
import { Download, ArrowLeft, Trash2, CheckCircle2, PaintBucket, Paintbrush, Eraser } from 'lucide-react';

interface CanvasProps {
  imageSrc: string;
  tool: DrawingTool;
  onBack: () => void;
  setTool: (tool: DrawingTool) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ imageSrc, tool, onBack, setTool }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineArtCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!canvas || !lineArtCanvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    const lineArtContext = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!context || !lineArtContext) return;

    // Fixed resolution for high quality
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    lineArtCanvas.width = size;
    lineArtCanvas.height = size;
    
    // Setup drawing context
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, size, size);
    setCtx(context);

    // Load line art into offscreen canvas for analysis
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      lineArtContext.drawImage(img, 0, 0, size, size);
    };

  }, [imageSrc]);

  // Update tool settings
  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = tool.type === 'eraser' ? '#FFFFFF' : tool.color;
    ctx.lineWidth = tool.size;
  }, [ctx, tool]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clientY - rect.top) * scaleY)
    };
  };

  // FLOOD FILL ALGORITHM
  const floodFill = (startX: number, startY: number, fillColorHex: string) => {
    const canvas = canvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!canvas || !lineArtCanvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Get image data
    const drawingImageData = ctx.getImageData(0, 0, width, height);
    const lineArtImageData = lineArtCanvas.getContext('2d')!.getImageData(0, 0, width, height);
    
    const drawingData = drawingImageData.data; // The pixels we color
    const lineArtData = lineArtImageData.data; // The boundaries (black pixels)

    // Parse fill color
    const r = parseInt(fillColorHex.slice(1, 3), 16);
    const g = parseInt(fillColorHex.slice(3, 5), 16);
    const b = parseInt(fillColorHex.slice(5, 7), 16);

    // Stack for pixels to check [x, y]
    const stack = [[startX, startY]];
    const seen = new Set<number>(); // Track visited pixels to avoid loops

    // Helper to check if pixel is boundary (dark enough on line art layer)
    // We assume line art is black on white. 
    // Boundary = Dark pixel (R,G,B < 128)
    const isBoundary = (idx: number) => {
      // Check brightness. If low, it's a line.
      const brightness = (lineArtData[idx] + lineArtData[idx+1] + lineArtData[idx+2]) / 3;
      return brightness < 200; // Strict threshold for lines
    };

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = (y * width + x) * 4;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (seen.has(idx)) continue;
      
      // Stop if we hit a boundary in the line art
      if (isBoundary(idx)) continue;

      // Color the pixel in drawing layer
      drawingData[idx] = r;
      drawingData[idx+1] = g;
      drawingData[idx+2] = b;
      drawingData[idx+3] = 255;

      seen.add(idx);

      // Add neighbors (4-way connectivity)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(drawingImageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); 
    
    if (tool.type === 'bucket') {
      const { x, y } = getCoordinates(e);
      // Use setTimeout to allow UI to update if it freezes momentarily (simple async)
      setTimeout(() => floodFill(x, y, tool.color), 0);
      return;
    }

    setIsDrawing(true);
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !ctx || tool.type === 'bucket') return;
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const downloadArtwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 1. Draw user artwork
    tempCtx.drawImage(canvas, 0, 0);

    // 2. Draw outline overlay
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.globalCompositeOperation = 'source-over';

      const link = document.createElement('a');
      link.download = `my-doodle-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    };
  }, [imageSrc]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button 
          onClick={onBack}
          className="btn-3d bg-white text-slate-600 px-4 md:px-6 py-2 md:py-3 rounded-2xl border-b-4 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm text-sm md:text-base"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex gap-3">
           <button 
            onClick={clearCanvas}
            className="btn-3d bg-red-100 text-red-600 px-4 md:px-6 py-2 md:py-3 rounded-2xl border-b-4 border-red-200 font-bold hover:bg-red-200 flex items-center gap-2 transition-all text-sm md:text-base"
          >
            <Trash2 size={20} strokeWidth={3} />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button 
            onClick={downloadArtwork}
            className="btn-3d bg-brand-pink text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl border-b-4 border-pink-700 font-bold hover:brightness-110 flex items-center gap-2 transition-all shadow-lg shadow-pink-200 text-sm md:text-base"
          >
            <Download size={20} strokeWidth={3} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Canvas Container - The "Paper" */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <div 
            ref={containerRef}
            className="relative h-full aspect-square max-h-full bg-white rounded-[2rem] shadow-2xl border-8 border-white overflow-hidden ring-8 ring-black/5"
        >
            {/* Drawing Layer (User Colors) */}
            <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`absolute inset-0 w-full h-full touch-none z-10 ${tool.type === 'bucket' ? 'cursor-bucket' : 'cursor-brush'}`}
            />

            {/* Hidden Canvas for Line Art Analysis */}
            <canvas 
                ref={lineArtCanvasRef}
                className="hidden"
            />

            {/* Visual Overlay Layer (Line Art) - Pointer events none so clicks go to canvas */}
            <img 
            src={imageSrc} 
            alt="Coloring Template" 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-multiply opacity-90 select-none z-20" 
            />
        </div>
      </div>
      
      {/* Mobile-only tools hint */}
      <div className="md:hidden text-center mt-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
        {tool.type === 'bucket' ? 'Tap an area to fill!' : 'Drag to color!'}
      </div>
    </div>
  );
};