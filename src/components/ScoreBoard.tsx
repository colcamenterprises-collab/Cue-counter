import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Trophy, RotateCcw, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import ProfileAvatar from './ProfileAvatar';

export type GameType = 'pool' | 'snooker' | '9ball';

interface ScoreBoardProps {
  gameType: GameType;
  profiles: UserProfile[];
  onGameEnd: (winnerId: string, score: { p1: number, p2: number }, players: { p1: UserProfile, p2: UserProfile }) => void;
}

export default function ScoreBoard({ gameType, profiles, onGameEnd }: ScoreBoardProps) {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Profile, setP1Profile] = useState<UserProfile | null>(profiles[0] || null);
  const [p2Profile, setP2Profile] = useState<UserProfile | null>(profiles[1] || null);

  useEffect(() => {
    if (profiles.length > 0) {
      if (!p1Profile) setP1Profile(profiles[0]);
      if (!p2Profile && profiles.length > 1) setP2Profile(profiles[1]);
    }
  }, [profiles, p1Profile, p2Profile]);

  const reset = () => {
    setP1Score(0);
    setP2Score(0);
  };

  const handleFinish = () => {
    if (!p1Profile || !p2Profile) return;
    const winnerId = p1Score > p2Score ? p1Profile.id : p2Score > p1Score ? p2Profile.id : 'draw';
    onGameEnd(winnerId, { p1: p1Score, p2: p2Score }, { p1: p1Profile, p2: p2Profile });
    reset();
  };

  const PlayerCard = ({ 
    score, 
    setScore, 
    player, 
    setPlayer, 
    otherPlayer,
    isLeft 
  }: { 
    score: number, 
    setScore: (s: number) => void, 
    player: UserProfile | null, 
    setPlayer: (p: UserProfile | null) => void,
    otherPlayer: UserProfile | null,
    isLeft: boolean
  }) => (
    <div className={cn(
      "bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-between text-center transition-all hover:border-emerald-200 group relative min-h-[400px] md:min-h-[500px]",
      !player && "border-dashed border-slate-200 bg-slate-50/50"
    )}>
      {player ? (
        <>
          <div className="flex flex-col items-center gap-2 md:gap-4 w-full">
            <div className="relative group/avatar">
              <ProfileAvatar username={player.username} seed={player.id} size="md" className="md:hidden ring-2 ring-slate-50 shadow-lg" />
              <ProfileAvatar username={player.username} seed={player.id} size="lg" className="hidden md:block ring-4 ring-slate-50 transition-all group-hover:scale-105 shadow-xl shadow-slate-200/50" />
              <button 
                onClick={() => setPlayer(null)}
                className="absolute -top-1 -right-1 bg-white shadow-md border border-slate-100 p-1 md:p-1.5 rounded-full text-slate-300 hover:text-slate-600 opacity-0 group-hover/avatar:opacity-100 transition-opacity"
              >
                <RotateCcw size={10} />
              </button>
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">{isLeft ? 'Player 1' : 'Player 2'}</span>
              <h4 className="text-lg md:text-xl font-bold text-slate-800 truncate px-4 mt-1">{player.username}</h4>
            </div>
          </div>

          <div className="flex flex-col items-center py-4">
            <motion.div 
              key={score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[120px] md:text-[160px] font-extralight leading-none text-slate-800 tracking-tighter mb-6"
            >
              {score.toString().padStart(2, '0')}
            </motion.div>
            <div className="flex gap-4">
              <button 
                onClick={() => setScore(Math.max(0, score - 1))}
                className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 transition-all active:scale-95 bg-white shadow-sm"
              >
                <Minus size={24} />
              </button>
              <button 
                onClick={() => setScore(score + 1)}
                className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 shadow-lg transition-all active:scale-90"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="w-full flex justify-between px-2 pt-4 md:pt-6 border-t border-slate-50 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
             <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               Level A1
             </span>
             <span className="text-emerald-500 font-bold">Winning: {score > 0 ? "82%" : "–"}</span>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
            <UserIcon size={32} className="text-slate-300" />
          </div>
          <div className="space-y-4 w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Assign Tournament Athlete</p>
            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {profiles.filter(p => p.id !== otherPlayer?.id).map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlayer(p)}
                  className="w-full p-4 rounded-3xl border border-slate-100 bg-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-xs font-semibold text-slate-600 flex items-center gap-4 group/item"
                >
                  <ProfileAvatar username={p.username} seed={p.id} size="sm" className="transition-transform group-hover/item:scale-110" />
                  <span className="flex-1 text-left">{p.username}</span>
                </button>
              ))}
              {profiles.length === 0 && (
                <div className="text-center p-4">
                  <p className="text-[10px] text-slate-300 italic">No registered athletes found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 h-full">
        <PlayerCard 
          score={p1Score} 
          setScore={setP1Score} 
          player={p1Profile} 
          setPlayer={setP1Profile}
          otherPlayer={p2Profile}
          isLeft={true}
        />
        <PlayerCard 
          score={p2Score} 
          setScore={setP2Score} 
          player={p2Profile} 
          setPlayer={setP2Profile}
          otherPlayer={p1Profile}
          isLeft={false}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={reset}
          className="flex-1 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-200 bg-white text-slate-400 font-bold uppercase tracking-[0.25em] text-[8px] md:text-[10px] hover:text-slate-900 hover:border-slate-400 hover:shadow-md transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw size={14} className="md:size-4" />
          Reset Shot Data
        </button>
        <button 
          onClick={handleFinish}
          disabled={!p1Profile || !p2Profile}
          className="flex-[2] p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-slate-900 text-white font-bold uppercase tracking-[0.25em] text-[8px] md:text-[10px] hover:bg-emerald-600 shadow-2xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-20 translate-y-0 active:translate-y-1"
        >
          <Trophy size={14} className="md:size-4" />
          Submit Official Record
        </button>
      </div>
    </div>
  );
}
