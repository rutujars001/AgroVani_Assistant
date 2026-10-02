import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services/speechService';

interface AudioPlayerButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  label = 'ऐका',
  size = 'md',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.hapticFeedback(30);

    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speechService.playTone('confirm');
      speechService.speak(text, () => {
        setIsPlaying(false);
      });
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2.5 font-bold'
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isPlaying ? 'आवाज थांबवा' : 'माहिती ऐका'}
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all shadow-sm active:scale-95 cursor-pointer ${
        isPlaying
          ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 animate-bounce" />
          <span>थांबवा</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
