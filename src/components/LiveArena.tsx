import React, { useState, useEffect, useRef } from "react";
import { ArenaSession, ArenaChallenge, UserProfile } from "../data/mockData";
import { Zap, Timer, Trophy, ChevronLeft, Activity, Play, Plus, Send, CheckCircle2, XCircle, Users, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { useToast } from "./ui/Toast";

interface LiveArenaProps {
  userProfile: UserProfile;
  userId: string;
  onBack: () => void;
  onWinPoints: (amount: number, reason: string) => void;
}

export function LiveArena({ userProfile, userId, onBack, onWinPoints }: LiveArenaProps) {
  const [sessions, setSessions] = useState<ArenaSession[]>([]);
  const [activeSession, setActiveSession] = useState<ArenaSession | null>(null);
  const [challenges, setChallenges] = useState<ArenaChallenge[]>([]);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const { addToast } = useToast();

  // New Session Form
  const [newSession, setNewSession] = useState({ title: '', video_url: '', sport: 'F1' });
  // New Challenge Form
  const [newChallenge, setNewChallenge] = useState({ question: '', option1: 'Yes', option2: 'No', points: 250 });

  const SPORTS = ["F1", "Football", "Basketball", "Tennis", "UFC", "Boxing", "Esports"];

  // Fetch Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/arena/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Challenges for Active Session
  useEffect(() => {
    if (!activeSession) return;

    const fetchChallenges = async () => {
      try {
        const res = await fetch(`/api/arena/sessions/${activeSession.id}/challenges`);
        if (res.ok) {
          const data = await res.json();
          setChallenges(data);
        }
      } catch (err) {
        console.error("Failed to fetch challenges:", err);
      }
    };
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 3000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSession.sport === "Cricket") {
      addToast("We hate cricket. No cricket allowed.", "error");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    const sessionData = { ...newSession, id, created_by: userId };
    
    try {
      const res = await fetch('/api/arena/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (res.ok) {
        setSessions(prev => [sessionData as ArenaSession, ...prev]);
        setActiveSession(sessionData as ArenaSession);
        setIsCreatingSession(false);
        addToast("Arena Session Created! 🏟️", "success");
      }
    } catch (err) {
      addToast("Failed to create session", "error");
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    const id = Math.random().toString(36).substr(2, 9);
    const challengeData = {
      id,
      session_id: activeSession.id,
      created_by: userId,
      username: userProfile.username,
      question: newChallenge.question,
      options: [newChallenge.option1, newChallenge.option2],
      points: newChallenge.points,
      expires_at: new Date(Date.now() + 60000).toISOString() // 1 minute expiry
    };

    try {
      const res = await fetch('/api/arena/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData)
      });
      if (res.ok) {
        setChallenges(prev => [challengeData as any, ...prev]);
        setIsCreatingChallenge(false);
        setNewChallenge({ question: '', option1: 'Yes', option2: 'No', points: 250 });
        addToast("Challenge Pushed to Arena! ⚡", "success");
      }
    } catch (err) {
      addToast("Failed to push challenge", "error");
    }
  };

  const handlePredict = async (challengeId: string, option: string) => {
    setPredictions(prev => ({ ...prev, [challengeId]: option }));
    try {
      await fetch('/api/arena/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId, user_id: userId, prediction: option })
      });
      addToast("Prediction Locked! 🔒", "success");
    } catch (err) {
      addToast("Failed to lock prediction", "error");
    }
  };

  const handleResolveChallenge = async (challengeId: string, result: string) => {
    try {
      const res = await fetch(`/api/arena/challenges/${challengeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      });
      if (res.ok) {
        addToast(`Challenge Resolved: ${result}`, "info");
      }
    } catch (err) {
      addToast("Failed to resolve challenge", "error");
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1] || url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
    }
    if (url.includes('twitch.tv')) {
      const channel = url.split('/').pop();
      return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=true`;
    }
    return url;
  };

  if (!activeSession) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Live Arena</h2>
            <p className="text-gray-500 font-medium text-sm md:text-base">Watch. Predict. Dominate. (No Cricket Allowed)</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsCreatingSession(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Create Arena
            </button>
            <button 
              onClick={onBack}
              className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isCreatingSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-emerald-100 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Arena Title</label>
                  <input 
                    required
                    value={newSession.title}
                    onChange={e => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Bahrain GP: Hamilton vs Verstappen"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sport</label>
                  <select 
                    value={newSession.sport}
                    onChange={e => setNewSession(prev => ({ ...prev, sport: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Video URL (YouTube/Twitch)</label>
                <input 
                  required
                  value={newSession.video_url}
                  onChange={e => setNewSession(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200"
                >
                  Launch Arena
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <motion.div
              key={session.id}
              whileHover={{ y: -8 }}
              onClick={() => setActiveSession(session)}
              className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl cursor-pointer hover:border-emerald-200 transition-all"
            >
              <div className="aspect-video rounded-2xl bg-gray-100 mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-600/10 flex items-center justify-center group-hover:bg-emerald-600/20 transition-all">
                  <Play className="w-12 h-12 text-emerald-600 opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110" />
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Activity className="w-3 h-3" />
                  Live
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Video className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{session.sport}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{session.title}</h3>
                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">24 Active</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Join Arena →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0502] text-white -mx-4 -mt-8 p-4 md:p-8 relative overflow-hidden pb-20">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-600/10 blur-[100px] md:blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/5 blur-[80px] md:blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => setActiveSession(null)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-black uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Exit Arena
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 bg-emerald-600 px-3 md:px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <Activity className="w-3 h-3" />
              Arena Live
            </div>
            <div className="bg-white/5 border border-white/10 px-3 md:px-4 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              {activeSession.sport}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main View: Video Player */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe 
                src={getVideoEmbedUrl(activeSession.video_url)}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] gap-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic mb-2">{activeSession.title}</h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-[10px] md:text-xs">Created by Arena Master</p>
              </div>
              <button 
                onClick={() => setIsCreatingChallenge(true)}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
              >
                <Zap className="w-5 h-5" />
                Push Challenge
              </button>
            </div>

            {isCreatingChallenge && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-600 rounded-[2.5rem] p-8 shadow-2xl"
              >
                <form onSubmit={handleCreateChallenge} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Your Challenge Question</label>
                    <input 
                      required
                      value={newChallenge.question}
                      onChange={e => setNewChallenge(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="e.g., Will Max overtake Lewis in the next 2 laps?"
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-lg font-black placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Option 1</label>
                      <input 
                        required
                        value={newChallenge.option1}
                        onChange={e => setNewChallenge(prev => ({ ...prev, option1: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Option 2</label>
                      <input 
                        required
                        value={newChallenge.option2}
                        onChange={e => setNewChallenge(prev => ({ ...prev, option2: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-white text-emerald-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-all"
                    >
                      Broadcast Challenge
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsCreatingChallenge(false)}
                      className="px-8 bg-black/20 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black/30 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Live Challenges */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Live Arena Feed
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                <Users className="w-3 h-3" />
                24 Watching
              </div>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {challenges.map((challenge) => {
                  const isPredicted = !!predictions[challenge.id];
                  const isCreator = challenge.created_by === userId;
                  const isResolved = !!challenge.result;
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "bg-white/5 border border-white/10 rounded-[2rem] p-6 transition-all relative overflow-hidden",
                        isPredicted && !isResolved && "border-emerald-500/50 bg-emerald-500/5",
                        isResolved && "opacity-60"
                      )}
                    >
                      {isResolved && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                          Resolved: {challenge.result}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            <img src={`https://picsum.photos/seed/${challenge.username}/40/40`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">{challenge.username}</p>
                            <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Arena Master</p>
                          </div>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                          {challenge.points} PTS
                        </div>
                      </div>

                      <h4 className="text-xl font-black tracking-tight mb-6 leading-tight italic">
                        "{challenge.question}"
                      </h4>

                      {!isResolved ? (
                        <div className="grid grid-cols-2 gap-3">
                          {challenge.options.map((option) => (
                            <button
                              key={option}
                              disabled={isPredicted || isCreator}
                              onClick={() => handlePredict(challenge.id, option)}
                              className={cn(
                                "py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                                predictions[challenge.id] === option
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                  : isPredicted || isCreator
                                  ? "bg-white/5 text-white/20 border border-white/5"
                                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10 active:scale-95"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                          {predictions[challenge.id] === challenge.result ? (
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> You Won!</span>
                          ) : predictions[challenge.id] ? (
                            <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> You Lost</span>
                          ) : (
                            <span className="text-white/20">Challenge Ended</span>
                          )}
                        </div>
                      )}

                      {isCreator && !isResolved && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Resolve this challenge</p>
                          <div className="grid grid-cols-2 gap-2">
                            {challenge.options.map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleResolveChallenge(challenge.id, opt)}
                                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                {opt} Won
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
