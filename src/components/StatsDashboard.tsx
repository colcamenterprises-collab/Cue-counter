import React, { useMemo } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion } from 'motion/react';
import { Trophy, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { UserProfile, MatchRecord } from '../types';
import { GameType } from './ScoreBoard';
import { cn } from '../lib/utils';
import ProfileAvatar from './ProfileAvatar';

interface StatsDashboardProps {
  user: UserProfile;
  matches: MatchRecord[];
}

export default function StatsDashboard({ user, matches }: StatsDashboardProps) {
  const userMatches = useMemo(() => {
    return matches.filter(m => m.p1.id === user.id || m.p2.id === user.id);
  }, [matches, user.id]);

  const stats = useMemo(() => {
    const byType: Record<GameType, { wins: number, games: number }> = {
      pool: { wins: 0, games: 0 },
      snooker: { wins: 0, games: 0 },
      '9ball': { wins: 0, games: 0 }
    };

    let streak = 0;
    let longestStreak = 0;
    let totalWins = 0;

    userMatches.forEach(m => {
      const isWinner = m.winnerId === user.id;
      byType[m.gameType].games++;
      if (isWinner) {
        byType[m.gameType].wins++;
        totalWins++;
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else if (m.winnerId !== 'draw') {
        streak = 0;
      }
    });

    const winRateData = (Object.keys(byType) as GameType[]).map(type => ({
      name: type === '9ball' ? '9-Ball' : type.charAt(0).toUpperCase() + type.slice(1),
      rate: byType[type].games > 0 ? Math.round((byType[type].wins / byType[type].games) * 100) : 0,
      games: byType[type].games
    }));

    return { totalWins, totalGames: userMatches.length, longestStreak, winRateData, byType };
  }, [userMatches, user.id]);

  const recentPerformance = useMemo(() => {
    return userMatches.slice(-10).map((m, i) => ({
      name: `G${i + 1}`,
      score: m.p1.id === user.id ? m.p1.score : m.p2.score
    }));
  }, [userMatches, user.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Prime Stat Header */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-10">
        <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto">
           <ProfileAvatar username={user.username} seed={user.id} size="lg" className="md:hidden shadow-xl ring-4 ring-slate-50" />
           <ProfileAvatar username={user.username} seed={user.id} size="xl" className="hidden md:block shadow-2xl shadow-slate-200 ring-8 ring-slate-50" />
           <div>
             <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Official Athlete Profile</span>
             <h3 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight mt-1 truncate max-w-[200px] md:max-w-none">{user.username}</h3>
             <div className="mt-2 flex gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Season
                </div>
                <div className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  UID: {user.id.slice(0, 8)}
                </div>
             </div>
           </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 md:gap-16 w-full lg:w-auto pt-6 lg:pt-0 border-t border-slate-50 lg:border-t-0">
          <div className="flex flex-col items-center">
            <Trophy size={14} className="md:size-[18px] text-slate-200 mb-1 md:mb-2" />
            <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wins</span>
            <span className="text-xl md:text-4xl font-mono text-slate-800 font-light tracking-tighter">{stats.totalWins}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-100 px-4 md:px-0 md:border-x-0">
            <TrendingUp size={14} className="md:size-[18px] text-emerald-500 mb-1 md:mb-2" />
            <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Win %</span>
            <span className="text-xl md:text-4xl font-mono text-emerald-500 font-light tracking-tighter">{stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0}%</span>
          </div>
          <div className="flex flex-col items-center">
             <Target size={14} className="md:size-[18px] text-slate-200 mb-1 md:mb-2" />
             <span className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</span>
             <span className="text-xl md:text-4xl font-mono text-slate-800 font-light tracking-tighter">{stats.longestStreak}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Win Rate Bar Chart */}
        <div className="lg:col-span-12 glass-card p-6 md:p-10 h-[300px] md:h-[450px] flex flex-col hover:border-slate-100">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-widest">Mastery Index</h3>
              <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Win Rate % per Game Type</p>
            </div>
            <BarChart3 className="text-slate-100" size={24} md:size={32} />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.winRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  unit="%" 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '16px', 
                    fontSize: '10px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="rate" radius={[40, 40, 40, 40]} barSize={40}>
                  {stats.winRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#059669' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Performance Trend */}
        <div className="lg:col-span-12 bg-slate-900 rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-white h-[300px] md:h-[450px] flex flex-col shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 md:p-20 opacity-5 rotate-12 scale-150 transition-transform group-hover:rotate-0 duration-1000">
             <TrendingUp size={160} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <div>
                <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-[0.2em]">Tournament Velocity</h3>
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Shot-by-Shot Performance Trend</p>
              </div>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentPerformance}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '10px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/5 flex justify-between items-center text-[7px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
               <div className="flex flex-col gap-1">
                 <span>Baseline</span>
                 <span className="text-white">Pro Circuit</span>
               </div>
               <div className="flex flex-col gap-1 text-center">
                 <span>Current Status</span>
                 <span className="text-emerald-500">Ascending</span>
               </div>
               <div className="flex flex-col gap-1 text-right">
                 <span>Prognosis</span>
                 <span className="text-white">Consistent</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
