import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Timer as TimerIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TournamentTimerProps {
  initialSeconds?: number;
  onTimeUp?: () => void;
}

export default function TournamentTimer({ initialSeconds = 30, onTimeUp }: TournamentTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, duration: number) => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Failed to play beep', e);
    }
  }, [isMuted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 6 && prev > 1) {
            playBeep(440, 0.1); 
          } else if (prev === 1) {
            playBeep(880, 0.5);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      onTimeUp?.();
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, playBeep, onTimeUp]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-10 text-white flex flex-col items-center justify-center shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "p-2.5 rounded-full transition-all",
            isMuted ? "text-slate-600 bg-white/5" : "text-emerald-400 bg-emerald-500/10"
          )}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <span className="text-[11px] font-bold text-slate-500 tracking-[0.4em] uppercase mb-10 flex items-center gap-2">
        SHOT CLOCK REMAINING
      </span>
      
      <div className={cn(
        "text-6xl md:text-7xl font-mono tracking-[0.2em] mb-12 font-light transition-all duration-300",
        seconds <= 5 ? "text-emerald-400 scale-110" : "text-white"
      )}>
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-4 w-full">
        <button 
          onClick={resetTimer}
          className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          RESET
        </button>
        <button 
          onClick={toggleTimer}
          className={cn(
            "flex-[2] py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
            isActive 
              ? "bg-rose-500 hover:bg-rose-600 text-white" 
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-xl shadow-emerald-500/20"
          )}
        >
          {isActive ? 'STOP' : 'START TIMER'}
        </button>
      </div>

      <div className="flex gap-1.5 md:gap-2 w-full mt-4 md:mt-6">
        {[15, 30, 45, 60].map((t) => (
          <button
            key={t}
            onClick={() => {
              setIsActive(false);
              setSeconds(t);
            }}
            className={cn(
              "flex-1 py-1 md:py-1.5 text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all",
              seconds === t 
                ? "bg-white/20 border-white/30 text-white" 
                : "border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            {t}s
          </button>
        ))}
      </div>
    </div>
  );
}
