import React, { useState, useEffect } from "react";
import { LiveMatch, MicroChallenge, MOCK_LIVE_MATCHES, MOCK_MICRO_CHALLENGES, UserProfile } from "../data/mockData";
import { Zap, Timer, Trophy, ChevronLeft, Activity, Wind, Gauge, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { useToast } from "./ui/Toast";

interface LiveMatchModeProps {
  userProfile: UserProfile;
  onBack: () => void;
  onWinPoints: (amount: number, reason: string) => void;
}

export function LiveMatchMode({ userProfile, onBack, onWinPoints }: LiveMatchModeProps) {
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [challenges, setChallenges] = useState<MicroChallenge[]>(MOCK_MICRO_CHALLENGES);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [resolvedChallenges, setResolvedChallenges] = useState<string[]>([]);
  const { addToast } = useToast();

  // Simulate new challenges appearing
  useEffect(() => {
    if (!selectedMatch) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newId = `mc-${Date.now()}`;
        const questions = selectedMatch.type === 'f1' 
          ? ["Fastest lap: Verstappen or Leclerc?", "Will DRS lead to overtake in Sector 3?", "Pit stop for Hamilton next lap?"]
          : ["Yellow card before 85'?", "Next corner: which team?", "Substitution impact? Yes or no?"];
        
        const question = questions[Math.floor(Math.random() * questions.length)];
        const options = question.includes('or') ? ["Verstappen", "Leclerc"] : ["Yes", "No"];

        const newChallenge: MicroChallenge = {
          id: newId,
          matchId: selectedMatch.id,
          question,
          options,
          expiresAt: new Date(Date.now() + 45000).toISOString(),
          type: selectedMatch.type,
          points: Math.floor(Math.random() * 300) + 100
        };

        setChallenges(prev => [newChallenge, ...prev]);
        addToast("⚡ New Micro-Challenge!", "info");
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedMatch, addToast]);

  // Simulate challenge resolution
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setChallenges(prev => {
        const expired = prev.filter(c => new Date(c.expiresAt) < now && !resolvedChallenges.includes(c.id));
        
        expired.forEach(c => {
          const prediction = predictions[c.id];
          if (prediction) {
            // 50/50 chance of being right for simulation
            const isCorrect = Math.random() > 0.5;
            if (isCorrect) {
              onWinPoints(c.points, `Correct Prediction: ${c.question}`);
              addToast(`🎯 CALLED IT! +${c.points} pts`, "success");
            } else {
              addToast(`❌ Missed it: ${c.question}`, "error");
            }
          }
          setResolvedChallenges(r => [...r, c.id]);
        });

        return prev.filter(c => new Date(c.expiresAt) > now);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [predictions, resolvedChallenges, onWinPoints, addToast]);

  const handlePredict = (challengeId: string, option: string) => {
    setPredictions(prev => ({ ...prev, [challengeId]: option }));
    addToast("Prediction locked! 🔒", "success");
  };

  if (!selectedMatch) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Live Match Mode</h2>
            <p className="text-gray-500 font-medium">Micro-challenges. Instant validation. Pure instinct.</p>
          </div>
          <button 
            onClick={onBack}
            className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_LIVE_MATCHES.map(match => (
            <motion.div
              key={match.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMatch(match)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-xl border border-white/10"
            >
              <img 
                src={match.image} 
                alt={match.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Activity className="w-3 h-3" />
                  Live
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  {match.type === 'f1' ? <Wind className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  <span className="text-xs font-black uppercase tracking-widest">{match.type}</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">{match.title}</h3>
                <p className="text-white/60 text-sm font-medium">{match.subtitle}</p>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg">
                    <span className="text-white font-black text-sm">{match.currentEvent}</span>
                  </div>
                  {match.stats && Object.entries(match.stats).slice(0, 1).map(([key, val]) => (
                    <div key={key} className="text-xs text-white/40 font-bold uppercase">
                      {key}: <span className="text-white/80">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0502] text-white -mx-4 -mt-8 p-4 md:p-8 relative overflow-hidden">
      {/* Atmospheric Background (Recipe 7) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMatch(null)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Exit Arena
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <Activity className="w-3 h-3" />
              Live Broadcast
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {selectedMatch.currentEvent}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main View: Match Info & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={selectedMatch.image} 
                alt={selectedMatch.title} 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0502] via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-2">{selectedMatch.title}</h1>
                <p className="text-white/60 font-medium text-lg">{selectedMatch.subtitle}</p>
              </div>

              {/* Live Overlay Elements */}
              <div className="absolute top-8 right-8 space-y-2">
                {selectedMatch.stats && Object.entries(selectedMatch.stats).map(([key, val]) => (
                  <div key={key} className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center justify-between gap-8">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{key}</span>
                    <span className="text-sm font-black text-white">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware-style Stats (Recipe 3) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
                <Gauge className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Intensity</p>
                <p className="text-2xl font-black tracking-tighter">HIGH</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Active Fans</p>
                <p className="text-2xl font-black tracking-tighter">12.4K</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Prize Pool</p>
                <p className="text-2xl font-black tracking-tighter">50K</p>
              </div>
            </div>
          </div>

          {/* Sidebar: Micro-Challenges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Micro-Challenges
              </h3>
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Real-time
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {challenges.filter(c => c.matchId === selectedMatch.id).map((challenge) => {
                  const isPredicted = !!predictions[challenge.id];
                  const timeLeft = Math.max(0, Math.floor((new Date(challenge.expiresAt).getTime() - Date.now()) / 1000));
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "bg-white/5 border border-white/10 rounded-[2rem] p-6 transition-all",
                        isPredicted && "border-emerald-500/50 bg-emerald-500/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Timer className={cn("w-4 h-4", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white/60")} />
                          </div>
                          <span className={cn("text-xs font-black font-mono", timeLeft < 10 ? "text-red-500" : "text-white/60")}>
                            {timeLeft}s
                          </span>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                          {challenge.points} PTS
                        </div>
                      </div>

                      <h4 className="text-xl font-black tracking-tight mb-6 leading-tight italic">
                        "{challenge.question}"
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {challenge.options.map((option) => (
                          <button
                            key={option}
                            disabled={isPredicted}
                            onClick={() => handlePredict(challenge.id, option)}
                            className={cn(
                              "py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                              predictions[challenge.id] === option
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : isPredicted
                                ? "bg-white/5 text-white/20 border border-white/5"
                                : "bg-white/10 text-white hover:bg-white/20 border border-white/10 active:scale-95"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {challenges.filter(c => c.matchId === selectedMatch.id).length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                  <Activity className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Scanning for micro-moments...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
