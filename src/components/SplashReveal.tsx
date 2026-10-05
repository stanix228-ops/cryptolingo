import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { haptic } from '../services/telegram';

interface SplashRevealProps {
  onComplete: () => void;
}

export const SplashReveal: React.FC<SplashRevealProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (isFading) return;
    setIsFading(true);
    haptic.light();
    setTimeout(() => {
      onComplete();
    }, 450); // Smooth CSS fade transition
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay policy fallback: muted autoplay is allowed everywhere
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    // Safety timeout in case video stalls or fails to load
    const timer = setTimeout(() => {
      handleFinish();
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      haptic.selection();
    }
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-50 bg-[#07090E] flex items-center justify-center overflow-hidden transition-opacity duration-500 select-none cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src="./splash.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={handleFinish}
        className="w-full h-full object-contain max-w-lg max-h-screen"
      />

      {/* Skip and Sound Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={toggleSound}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:text-white transition-all shadow-lg"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Вкл. звук</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Звук</span>
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition-all shadow-lg"
        >
          <span>Пропустить</span>
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Tap hint at bottom */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center text-center pointer-events-none">
        <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
          Нажмите в любом месте, чтобы продолжить
        </span>
      </div>
    </div>
  );
};
