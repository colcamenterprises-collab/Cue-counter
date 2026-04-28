/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  History, 
  BarChart3, 
  CircleDot,
  Dices,
  Circle,
  Plus,
  User as UserIcon,
  Search,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import ScoreBoard, { GameType } from './components/ScoreBoard';
import TournamentTimer from './components/TournamentTimer';
import StatsDashboard from './components/StatsDashboard';
import ProfileAvatar from './components/ProfileAvatar';
import { cn } from './lib/utils';
import { getGameReview } from './services/geminiService';
import { UserProfile, MatchRecord } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'history' | 'stats' | 'profiles'>('play');
  const [selectedGame, setSelectedGame] = useState<GameType>('pool');
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [selectedUserForStats, setSelectedUserForStats] = useState<UserProfile | null>(null);

  const [review, setReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchRecord | null>(null);

  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setUsers(data.users);
      setMatches(data.matches);
      if (data.users.length > 0 && !selectedUserForStats) {
        setSelectedUserForStats(data.users[0]);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, [selectedUserForStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createUser = async () => {
    if (!newUsername.trim()) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, avatarSeed: Math.random().toString() })
      });
      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      setNewUsername('');
      setShowNewUserModal(false);
      if (!selectedUserForStats) setSelectedUserForStats(newUser);
    } catch (err) {
      console.error(err);
    }
  };

  const saveMatch = async (winnerId: string, score: { p1: number, p2: number }, players: { p1: UserProfile, p2: UserProfile }) => {
    const matchData = {
      gameType: selectedGame,
      p1: { id: players.p1.id, name: players.p1.username, score: score.p1 },
      p2: { id: players.p2.id, name: players.p2.username, score: score.p2 },
      winnerId
    };

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      const savedMatch = await res.json();
      setMatches(prev => [savedMatch, ...prev]);
      setLastMatch(savedMatch);
      setShowReviewModal(true);
      
      setIsReviewing(true);
      const feedback = await getGameReview(
        selectedGame, 
        score, 
        winnerId === 'draw' ? 'Draw' : (winnerId === players.p1.id ? players.p1.username : players.p2.username)
      );
      setReview(feedback);
      setIsReviewing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white pb-24">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">CUECOUNT<span className="text-emerald-500">.</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Tournament Management v1.0</p>
          </div>

          <nav className="hidden md:flex bg-slate-100 p-1 rounded-full border border-slate-200/50">
             {(['play', 'history', 'stats', 'profiles'] as const).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                   activeTab === tab ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {tab === 'stats' ? 'ANALYTICS' : tab.toUpperCase()}
               </button>
             ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">LIVE SESSION</span>
            
            {/* Mobile Nav Toggle / Simple indicators */}
            <div className="md:hidden flex gap-1 bg-slate-100 p-1 rounded-full">
               {(['play', 'stats'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-bold transition-all",
                     activeTab === tab ? "bg-white shadow-sm text-slate-800" : "text-slate-400"
                   )}
                 >
                   {tab.toUpperCase()}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32">
        <AnimatePresence mode="wait">
          {activeTab === 'play' && (
            <motion.div 
              key="play"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-2 flex flex-col gap-10">
                <div className="flex gap-4">
                  {(['pool', 'snooker', '9ball'] as const).map((game) => (
                    <button
                      key={game}
                      onClick={() => setSelectedGame(game)}
                      className={cn(
                        "flex-1 hardware-btn group relative overflow-hidden h-24 flex flex-col items-center justify-center gap-2",
                        selectedGame === game ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10" : "bg-white/50 border-slate-200"
                      )}
                    >
                      {game === 'pool' && <CircleDot size={20} className={cn(selectedGame === game ? "text-emerald-500" : "text-slate-400")} />}
                      {game === 'snooker' && <Circle size={20} className={cn(selectedGame === game ? "text-emerald-500" : "text-slate-400")} />}
                      {game === '9ball' && <Dices size={20} className={cn(selectedGame === game ? "text-emerald-500" : "text-slate-400")} />}
                      <span className={cn(
                        "text-[10px] uppercase tracking-[0.2em] font-bold",
                        selectedGame === game ? "text-slate-900" : "text-slate-400"
                      )}>
                        {game === '9ball' ? '9-Ball' : game}
                      </span>
                    </button>
                  ))}
                </div>

                <ScoreBoard 
                  gameType={selectedGame}
                  profiles={users}
                  onGameEnd={saveMatch}
                />
              </div>

              <div className="flex flex-col gap-10">
                <TournamentTimer initialSeconds={30} />
                
                <div className="glass-card">
                   <div className="flex justify-between items-center mb-10">
                     <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Recent Profiles</h3>
                     <button onClick={() => setShowNewUserModal(true)} className="text-emerald-500 hover:text-emerald-600 transition-colors p-1.5 rounded-full hover:bg-emerald-50">
                       <Plus size={18} />
                     </button>
                   </div>
                   <div className="flex flex-col gap-4">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-all">
                           <div className="flex items-center gap-4">
                             <ProfileAvatar username={user.username} seed={user.id} size="sm" />
                             <span className="text-sm font-semibold text-slate-700">{user.username}</span>
                           </div>
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-400" />
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="text-center py-10">
                          <UserIcon size={32} className="mx-auto text-slate-200 mb-2" />
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">No profiles yet</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Match Repository</h2>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Verified Tournament Records</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                  <History size={14} />
                  <span>{matches.length} Total Records</span>
                </div>
              </div>

              <div className="space-y-6">
                {matches.map((record) => (
                  <div key={record.id} className="glass-card hover:translate-x-1 md:hover:translate-x-2 transition-transform shadow-sm p-4 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center justify-between md:justify-start gap-4 md:gap-12 flex-1">
                          <div className="flex items-center gap-2 md:gap-4 flex-1">
                            <ProfileAvatar username={record.p1.name} seed={record.p1.id} size="sm" />
                            <div className="flex flex-col min-w-0">
                              <span className={cn("text-xs md:text-sm font-bold truncate", record.winnerId === record.p1.id ? "text-emerald-600" : "text-slate-600")}>{record.p1.name}</span>
                              <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">P1</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center min-w-fit">
                            <span className="text-xl md:text-3xl font-mono tracking-tighter text-slate-800 font-light">{record.p1.score} <span className="text-slate-200">–</span> {record.p2.score}</span>
                            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-slate-300 font-bold mt-1">{record.gameType}</span>
                          </div>

                          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end text-right">
                            <div className="flex flex-col min-w-0">
                              <span className={cn("text-xs md:text-sm font-bold truncate", record.winnerId === record.p2.id ? "text-emerald-600" : "text-slate-600")}>{record.p2.name}</span>
                              <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">P2</span>
                            </div>
                            <ProfileAvatar username={record.p2.name} seed={record.p2.id} size="sm" />
                          </div>
                       </div>
                       <div className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] md:pl-10 md:border-l md:border-slate-50 md:ml-10 text-center md:text-left">
                          {new Date(record.timestamp).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
               key="stats"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col gap-6 md:gap-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Performance Analytics</h2>
                  <p className="text-[10px] md:text-sm text-slate-400 font-medium uppercase tracking-[0.2em] mt-1">Deep Technical Metrics</p>
                </div>
                
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserForStats(u)}
                      className={cn(
                        "p-1 rounded-full transition-all border-2 shrink-0",
                        selectedUserForStats?.id === u.id ? "border-emerald-500 scale-105 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <ProfileAvatar username={u.username} seed={u.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {selectedUserForStats ? (
                <StatsDashboard user={selectedUserForStats} matches={matches} />
              ) : (
                <div className="glass-card py-40 text-center border-dashed">
                  <BarChart3 size={48} className="mx-auto text-slate-200 mb-6" />
                  <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-slate-400">Select a profile above to begin analysis</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profiles' && (
            <motion.div 
              key="profiles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <button 
                onClick={() => setShowNewUserModal(true)}
                className="bg-white rounded-3xl h-72 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 hover:border-emerald-400 hover:bg-emerald-50/10 transition-all group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform bg-slate-50">
                  <Plus size={32} className="text-slate-400 group-hover:text-emerald-500" />
                </div>
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-400">Add Tournament Player</span>
              </button>

              {users.map((profile) => (
                <div key={profile.id} className="glass-card h-72 flex flex-col items-center justify-center gap-6 group hover:-translate-y-2">
                  <ProfileAvatar username={profile.username} seed={profile.id} size="xl" className="group-hover:scale-110 transition-transform shadow-xl" />
                  <div className="text-center">
                    <h3 className="text-2xl font-bold tracking-tight text-slate-800">{profile.username}</h3>
                    <p className="text-[10px] uppercase text-slate-400 tracking-[0.3em] font-bold mt-2">
                      Registered Season {new Date(profile.createdAt).getFullYear()}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedUserForStats(profile); setActiveTab('stats'); }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Deep Metrics <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && lastMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="bg-white rounded-[40px] max-w-lg w-full relative z-10 border border-slate-100 p-10 flex flex-col gap-10 shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <Trophy size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Match Secured<span className="text-emerald-500">.</span></h2>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                 <div className="p-4 md:p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 md:mb-3 truncate">{lastMatch.p1.name}</p>
                    <p className="text-3xl md:text-5xl font-mono tracking-tighter text-slate-800">{lastMatch.p1.score}</p>
                 </div>
                 <div className="p-4 md:p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 md:mb-3 truncate">{lastMatch.p2.name}</p>
                    <p className="text-3xl md:text-5xl font-mono tracking-tighter text-slate-800">{lastMatch.p2.score}</p>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white">
                 <div className="flex items-center gap-3 mb-4">
                   <Sparkles size={16} className="text-emerald-400" />
                   <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Technical Breakdown</span>
                 </div>
                 <div className="min-h-[60px] flex items-center justify-center">
                    {isReviewing ? (
                      <div className="flex gap-1.5">
                         {[0,1,2].map(i => (
                           <motion.div 
                             key={i}
                             animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} 
                             transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                             className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                           />
                         ))}
                      </div>
                    ) : (
                      <p className="text-[11px] md:text-sm leading-relaxed text-slate-300 italic text-center font-medium">
                        "{review}"
                      </p>
                    )}
                 </div>
              </div>

              <button 
                onClick={() => { setShowReviewModal(false); setActiveTab('stats'); }}
                className="w-full bg-slate-900 text-white font-bold py-4 md:py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-emerald-600 transition-all shadow-xl"
              >
                Review Analytics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New User Modal */}
      <AnimatePresence>
        {showNewUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowNewUserModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] max-w-sm w-full relative z-10 border border-slate-100 p-10 flex flex-col gap-10 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">Add Tournament Player</h3>
                <button onClick={() => setShowNewUserModal(false)} className="text-slate-300 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">Player Username</label>
                  <input 
                    autoFocus
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createUser()}
                    placeholder="Enter athlete name..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                  />
                </div>
                <button 
                  onClick={createUser}
                  disabled={!newUsername.trim()}
                  className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl disabled:opacity-20 transition-all hover:bg-emerald-600"
                >
                  Register Athlete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


