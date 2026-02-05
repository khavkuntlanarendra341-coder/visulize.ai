import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Target } from 'lucide-react';

const ImageCanvas = ({ image, onTap, selectedPoint, components, isLoading }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [tapIndicators, setTapIndicators] = useState([]);

  const handleImageClick = useCallback((e) => {
    if (isPanning || isLoading) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Add tap indicator with animation
    const newIndicator = { x, y, id: Date.now() };
    setTapIndicators(prev => [...prev, newIndicator]);
    
    // Remove indicator after animation
    setTimeout(() => {
      setTapIndicators(prev => prev.filter(i => i.id !== newIndicator.id));
    }, 1500);
    
    onTap(x, y, rect.width, rect.height);
  }, [isPanning, isLoading, onTap]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    
    const dx = e.clientX - lastPanPoint.x;
    const dy = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Reset View"
          >
            <Move className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-sm ml-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Target className="w-4 h-4 text-primary-400" />
          <span>Click anywhere to analyze</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-gray-900 cursor-crosshair"
        style={{ height: 'calc(100vh - 420px)', minHeight: '300px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out'
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            ref={imageRef}
            src={image}
            alt="Uploaded for analysis"
            onClick={handleImageClick}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
          
          {/* Tap Indicators */}
          {tapIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className="tap-indicator"
              style={{
                left: `${indicator.x}%`,
                top: `${indicator.y}%`,
                position: 'absolute'
              }}
            />
          ))}
          
          {/* Selected Point Marker */}
          {selectedPoint && (
            <div
              className="absolute w-6 h-6 border-2 border-accent-400 rounded-full animate-pulse"
              style={{
                left: `${selectedPoint.x}%`,
                top: `${selectedPoint.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="absolute inset-1 bg-accent-400 rounded-full opacity-50" />
            </div>
          )}
          
          {/* Component Labels (if detected) */}
          {components.map((component, index) => (
            <div
              key={index}
              className="absolute px-2 py-1 bg-primary-600/90 text-white text-xs rounded-lg whitespace-nowrap"
              style={{
                left: `${component.x}%`,
                top: `${component.y}%`,
                transform: 'translate(-50%, -100%)',
                marginTop: '-8px'
              }}
            >
              {component.name}
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-primary-400 text-sm">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>🖱️ Click to analyze</span>
        <span>🔍 Scroll to zoom</span>
        <span>✋ Ctrl+Drag to pan</span>
      </div>
    </div>
  );
};

export default ImageCanvas;
