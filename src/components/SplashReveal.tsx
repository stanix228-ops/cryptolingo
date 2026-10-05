import React, { useState, useRef, useEffect } from 'react';

interface SplashRevealProps {
  onComplete: () => void;
}

export const SplashReveal: React.FC<SplashRevealProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Smooth cinematic fade out to main app
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = 1.0;
      video.muted = false;

      // Attempt to play with sound enabled
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio autoplay requires user interaction fallback:', err);
          // If browser strictly blocks unmuted autoplay without prior interaction, fallback to muted then unmute on first frame
          video.muted = true;
          video.play().then(() => {
            video.muted = false;
          }).catch(() => {});
        });
      }
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#000000] flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-out select-none pointer-events-auto ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* High Quality Cinematic Video Player */}
      <video
        ref={videoRef}
        src="./splash.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        className="w-full h-full object-contain md:object-cover max-w-full max-h-full drop-shadow-2xl"
        style={{
          transform: 'translate3d(0, 0, 0)',
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  );
};
