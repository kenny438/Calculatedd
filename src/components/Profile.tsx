import React, { useState } from "react";
import { UserProfile } from "../data/mockData";
import { User, Mail, Calendar, Edit2, Save, Camera, LogOut, Lock, Crown, Zap, ChevronRight, Shield, Skull, BadgeCheck, ShieldCheck, Users, Plus, Star, Flame, Trophy } from "lucide-react";
import { useToast } from "./ui/Toast";
import { MembershipCard, CardTier, TIER_THRESHOLDS, TIER_DETAILS } from "./MembershipCard";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "../data/mockData";
import { Badges } from "./Badges";
import { DailyRewards } from "./DailyRewards";

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  transactions: Transaction[];
  stats: {
    totalBets: number;
    totalVolume: number;
    winRate: number;
    totalWins: number;
  };
  onClaimDaily: () => void;
  balance: number;
}

export function Profile({ profile, onUpdateProfile, transactions, stats, onClaimDaily, balance }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [expandedTier, setExpandedTier] = useState<CardTier | null>(null);
  const { addToast } = useToast();

  // Determine Tier
  let currentTier: CardTier = "SILVER";
  if (stats.totalVolume >= TIER_THRESHOLDS.BLACK) currentTier = "BLACK";
  else if (stats.totalVolume >= TIER_THRESHOLDS.GOLD) currentTier = "GOLD";
  
  if (profile.isAdmin) {
    currentTier = "GOD";
  }

  const nextTier = currentTier === "SILVER" ? "GOLD" : currentTier === "GOLD" ? "BLACK" : null;
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : 0;
  const progress = nextTier ? Math.min(100, (stats.totalVolume / nextThreshold) * 100) : 100;

  const handleSave = () => {
    if (!editedProfile.username.trim()) {
      addToast("Username cannot be empty", "error");
      return;
    }
    onUpdateProfile(editedProfile);
    setIsEditing(false);
    addToast("Profile updated successfully", "success");
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? This will clear your local session.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const tiers: CardTier[] = ["SILVER", "GOLD", "BLACK", "GOD"];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      {/* Editorial Header */}
      <motion.header 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="relative py-12 px-8 bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[100px] rounded-full -ml-32 -mb-32" />
        
        {/* Bussin Industries Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[20vw] font-black text-white/[0.03] whitespace-nowrap select-none tracking-tighter uppercase">
            BUSSIN INDUSTRIES ↈ∭
          </span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] border-4 border-white/10 bg-gray-900 overflow-hidden shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
              <img 
                src={`https://picsum.photos/seed/${profile.avatarSeed}/400/400`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isEditing && (
              <button 
                className="absolute -bottom-2 -right-2 p-3 md:p-4 bg-emerald-500 text-white rounded-xl md:rounded-2xl shadow-2xl hover:bg-emerald-400 transition-all transform hover:scale-110 active:scale-90"
                onClick={() => setEditedProfile({...editedProfile, avatarSeed: Math.random().toString()})}
              >
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.username}
                  onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                  className="text-3xl md:text-5xl font-black text-white bg-white/5 border-b-4 border-emerald-500 focus:outline-none w-full max-w-md px-4 py-2 rounded-t-xl"
                  placeholder="Username"
                />
              ) : (
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex items-center justify-center md:justify-start gap-3 md:gap-4">
                  {profile.username}
                  {profile.isVerified && <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 fill-emerald-400/20" />}
                </h1>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-white/50">
              <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10">
                <span className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  currentTier === "SILVER" ? "bg-gray-400" :
                  currentTier === "GOLD" ? "bg-yellow-400" :
                  currentTier === "BLACK" ? "bg-white" : "bg-emerald-400"
                )} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{currentTier} TIER</span>
              </div>
              
              <div className="flex items-center gap-3 bg-indigo-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-indigo-500/20">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-indigo-400 fill-indigo-400/20" />
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Level {profile.level || 1}</span>
                  <div className="w-16 md:w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${((profile.xp || 0) % 1000) / 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Save
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Left: Stats & Membership */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <DailyRewards 
              streak={profile.dailyStreak || 0} 
              lastLogin={profile.lastLogin} 
              onClaim={onClaimDaily} 
            />
          </motion.div>

          {/* Bento Stats */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Win Rate</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.winRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bets</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.totalBets}</p>
            </div>
            <div className="sm:col-span-2 bg-emerald-600 p-8 rounded-[2rem] shadow-xl shadow-emerald-100 text-white">
              <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mb-1">Total Trading Volume</p>
              <p className="text-3xl md:text-4xl font-black tracking-tighter">{formatCurrency(stats.totalVolume)}</p>
            </div>
          </motion.div>

          {/* Membership Card Display */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-gray-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Digital Membership</h3>
            <div className="flex justify-center mb-8">
              <MembershipCard profile={profile} tier={currentTier} size="sm" />
            </div>
            
            {nextTier && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Next Tier</p>
                    <p className="text-xl font-black text-white tracking-tight">{nextTier}</p>
                  </div>
                  <p className="text-sm font-black text-emerald-400">{progress.toFixed(0)}%</p>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-white/30 font-medium text-center italic">
                  Trade {formatCurrency(nextThreshold - stats.totalVolume)} more to ascend.
                </p>
              </div>
            )}
          </motion.div>

          {/* Card Museum */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Card Museum</h3>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="space-y-4">
              {tiers.map((tier) => {
                const isUnlocked = 
                  (tier === "SILVER") ||
                  (tier === "GOLD" && (currentTier === "GOLD" || currentTier === "BLACK" || currentTier === "GOD")) ||
                  (tier === "BLACK" && (currentTier === "BLACK" || currentTier === "GOD")) ||
                  (tier === "GOD" && currentTier === "GOD");
                
                const isExpanded = expandedTier === tier;
                
                return (
                  <div key={tier} className="relative">
                    <button 
                      onClick={() => setExpandedTier(isExpanded ? null : tier)}
                      className={cn(
                        "w-full text-left transition-all duration-500 rounded-2xl p-2",
                        !isUnlocked && "opacity-30 grayscale",
                        isExpanded && "bg-gray-50 ring-1 ring-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-200">
                           <MembershipCard profile={profile} tier={tier} size="sm" className="scale-[0.4] -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{tier}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {isUnlocked ? "Unlocked" : `Locked • ${formatCurrency(TIER_THRESHOLDS[tier])}`}
                          </p>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-4 pb-4"
                        >
                          <div className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                              {TIER_DETAILS[tier].abilities.map((ability, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                  {ability}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right: Bio & Activity */}
        <div className="lg:col-span-8 space-y-10">
          {/* Bio Section */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] hidden md:block">
               <Users className="w-48 h-48 text-black" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">The Manifesto</h3>
            {isEditing ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                className="w-full p-4 md:p-6 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] md:rounded-[2rem] font-medium text-gray-900 outline-none transition-all min-h-[150px] md:min-h-[200px] text-base md:text-lg leading-relaxed"
                placeholder="Write your trading philosophy..."
              />
            ) : (
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed italic">
                "{profile.bio || "This trader prefers to let their volume do the talking. No manifesto recorded yet."}"
              </p>
            )}
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Achievements</h3>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <Badges 
              userId={profile.email} 
              totalVolume={stats.totalVolume} 
              totalWins={stats.totalWins} 
              balance={balance} 
            />
          </motion.div>

          {/* Tax & Compliance */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 shadow-sm group hover:bg-red-100/50 transition-colors">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">Tax Compliance</h3>
                <Skull className="w-6 h-6 text-red-600 animate-bounce" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-red-900/40 uppercase tracking-widest">Status</p>
                  <p className="text-2xl font-black text-red-600 tracking-tighter">NON-COMPLIANT</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-red-900/40 uppercase tracking-widest">Total Seized</p>
                  <p className="text-2xl font-black text-red-600 tracking-tighter">
                    {formatCurrency(transactions.filter(t => t.type === 'tax').reduce((acc, t) => acc + t.amount, 0))}
                  </p>
                </div>
                <p className="text-[10px] text-red-900/40 font-bold uppercase tracking-widest mt-4">
                  "Death and taxes are the only certainties. We handle the latter."
                </p>
              </div>
            </div>

            <div className="bg-gray-900 p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-2">Account Security</h3>
                <p className="text-white font-bold text-lg mb-6">Session active on 1 device</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 border border-white/10 hover:border-red-500/20 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Terminate Session
              </button>
              <button 
                onClick={() => {
                  if (confirm("DANGER: This will wipe all your data, bets, and balance. Are you sure?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full mt-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <Skull className="w-5 h-5" />
                Reset Account
              </button>
            </div>
          </motion.div>

          {/* Referral Section */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-indigo-600 p-10 rounded-[3rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
              <Plus className="w-32 h-32 text-white" />
            </div>
            <h3 className="text-[10px] font-black text-indigo-100/60 uppercase tracking-[0.3em] mb-4">Referral Program</h3>
            <p className="text-xl font-black mb-6 leading-tight">Invite your friends and earn 500 PTS for each signup! 🚀</p>
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/20">
              <code className="flex-1 px-4 font-mono text-sm">{profile.referralCode || "BUSSIN-REF-123"}</code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}?ref=${profile.referralCode || "BUSSIN-REF-123"}`);
                  addToast("Referral link copied to clipboard!", "success");
                }}
                className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Trading Activity</h3>
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {Array.from({ length: 112 }).map((_, i) => {
                const count = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0;
                return (
                  <div 
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-md transition-all hover:scale-125 cursor-help",
                      count === 0 ? "bg-gray-100" :
                      count < 2 ? "bg-emerald-200" :
                      count < 4 ? "bg-emerald-400" : "bg-emerald-600"
                    )}
                    title={`${count} trades`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>Less</span>
              <div className="w-3 h-3 bg-gray-100 rounded-md" />
              <div className="w-3 h-3 bg-emerald-200 rounded-md" />
              <div className="w-3 h-3 bg-emerald-400 rounded-md" />
              <div className="w-3 h-3 bg-emerald-600 rounded-md" />
              <span>More</span>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Recent Operations</h3>
            <div className="space-y-6">
              {transactions.slice().reverse().slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                      tx.type.startsWith('bet') ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                      tx.type === 'deposit' ? "bg-blue-50 border-blue-100 text-blue-600" :
                      tx.type === 'tax' ? "bg-red-50 border-red-100 text-red-600" :
                      "bg-gray-50 border-gray-100 text-gray-600"
                    )}>
                      {tx.type.startsWith('bet') ? <Zap className="w-5 h-5" /> :
                       tx.type === 'deposit' ? <Plus className="w-5 h-5" /> :
                       tx.type === 'tax' ? <Skull className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        {tx.type.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(tx.date).toLocaleDateString()} &bull; {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className={cn(
                    "text-lg font-black tracking-tighter",
                    tx.amount > 0 && !tx.type.startsWith('bet') ? "text-emerald-600" : "text-gray-900"
                  )}>
                    {tx.amount > 0 && !tx.type.startsWith('bet') ? "+" : ""}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
