import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createSketchbookDocument } from './sketchbookDocument';

interface SketchbookViewerProps {
  className?: string;
}

export const SketchbookViewer: React.FC<SketchbookViewerProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const docHtml = useMemo(() => {
    return createSketchbookDocument('/sketchbook/', prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/4.2] sm:aspect-[4/3] md:aspect-[16/10] bg-[#C7DCB1] border-2 border-black shadow-[6px_6px_0px_#000000] overflow-hidden select-none ${className}`}
    >
      {/* Placeholder shown until iframe mounts and loads */}
      {(!shouldLoad || !isIframeLoaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-0 pointer-events-none">
          <div className="relative w-full max-w-[85%] aspect-[1760/1240] flex items-center justify-center">
            <img
              src="/sketchbook/spread-01.webp"
              alt="Sketchbook spread preview"
              className="w-full h-full object-contain filter drop-shadow-md"
              loading="lazy"
              width={1760}
              height={1240}
            />
          </div>
          <div className="mt-3 text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-[#171717] font-semibold bg-[#F4F1EA] px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000000]">
              Interactive Sketchbook
            </span>
          </div>
        </div>
      )}

      {/* Sandboxed iframe containing the page-turning engine */}
      {shouldLoad && (
        <iframe
          srcDoc={docHtml}
          sandbox="allow-scripts"
          title="Interactive sketchbook of my drawings"
          className={`w-full h-full border-0 relative z-10 transition-opacity duration-300 ${
            isIframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsIframeLoaded(true)}
        />
      )}
    </div>
  );
};

export default SketchbookViewer;
