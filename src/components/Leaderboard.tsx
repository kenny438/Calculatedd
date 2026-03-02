import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, X, TrendingUp, Medal, User } from "lucide-react";
import { UserProfile } from "../data/mockData";
import { cn, formatCurrency } from "../lib/utils";

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentUserStats: {
    totalVolume: number;
    winRate: number;
    rank: number;
  };
}

const MOCK_LEADERBOARD: { rank: number; username: string; volume: number; winRate: number; avatar: string }[] = [];

export function Leaderboard({ isOpen, onClose, currentUser, currentUserStats }: LeaderboardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[85vh] border border-emerald-100"
          >
            {/* Header Section */}
            <div className="bg-emerald-600 p-10 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
              
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/30 shadow-xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter leading-none mb-2">Hall of Fame</h2>
                    <p className="text-emerald-100 text-xs font-black uppercase tracking-[0.2em] opacity-80">Top 10 Global Traders</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-gray-50/30">
              {MOCK_LEADERBOARD.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">No Champions Yet</h3>
                    <p className="text-sm text-gray-400 font-medium">Be the first to claim the throne.</p>
                  </div>
                </div>
              ) : (
                MOCK_LEADERBOARD.map((user, i) => (
                <motion.div 
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 10,
                    backgroundColor: "rgba(16, 185, 129, 0.05)"
                  }}
                  transition={{ 
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-emerald-100/50 group",
                    user.rank === 1 ? "bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100/50" : 
                    user.rank <= 3 ? "bg-white border-emerald-100" : 
                    "bg-white border-gray-100 hover:border-emerald-200"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-transform group-hover:scale-110",
                      user.rank === 1 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" :
                      user.rank === 2 ? "bg-emerald-100 text-emerald-700" :
                      user.rank === 3 ? "bg-emerald-50 text-emerald-600" :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {user.rank === 1 ? <Medal className="w-5 h-5" /> : user.rank}
                    </div>
                    
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 overflow-hidden border-2 border-white shadow-md group-hover:rotate-3 transition-transform">
                      <img 
                        src={`https://picsum.photos/seed/${user.avatar}/100/100`} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div>
                      <p className="font-black text-gray-900 text-lg tracking-tight group-hover:text-emerald-600 transition-colors">{user.username}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <TrendingUp className="w-3 h-3" />
                          {user.winRate}% Win Rate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-gray-900 text-xl tracking-tighter">{formatCurrency(user.volume)}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total Volume</p>
                  </div>
                </motion.div>
              )))}
            </div>

            {/* Footer Section (Current User) */}
            <div className="p-8 bg-white border-t border-emerald-100 shrink-0">
              <div className="bg-emerald-900 rounded-[2.5rem] p-6 shadow-2xl shadow-emerald-900/20 flex items-center justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl font-black text-lg bg-emerald-800 text-emerald-400 border border-emerald-700">
                    {currentUserStats.rank || "-"}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-800 overflow-hidden border-2 border-emerald-500 shadow-xl">
                    <img 
                      src={`https://picsum.photos/seed/${currentUser.avatarSeed}/100/100`} 
                      alt={currentUser.username} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="font-black text-white text-lg tracking-tight">You ({currentUser.username})</p>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Keep trading to climb!</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="font-black text-white text-2xl tracking-tighter">{formatCurrency(currentUserStats.totalVolume)}</p>
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Your Volume</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
