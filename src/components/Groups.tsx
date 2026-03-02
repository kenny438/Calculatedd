import React, { useState } from "react";
import { Group, UserProfile } from "../data/mockData";
import { Users, Plus, Search, Copy, Check, Shield, UserPlus, Trophy, MessageSquare, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useToast } from "./ui/Toast";
import confetti from "canvas-confetti";

interface GroupsProps {
  groups: Group[];
  onCreateGroup: (name: string, description: string, customization: {
    emoji: string;
    themeColor: string;
    rules: string;
    maxMembers: number;
    minBet: number;
  }) => void;
  onJoinGroup: (inviteCode: string) => void;
  onLeaveGroup: (groupId: string) => void;
  currentUser: UserProfile;
}

const EMOJIS = ["🎲", "🚀", "💰", "🏆", "🔥", "💎", "📈", "🎯", "🤝", "👑"];
const THEME_COLORS = [
  { name: "Emerald", value: "#059669" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Sky", value: "#0EA5E9" },
];

export function Groups({ groups, onCreateGroup, onJoinGroup, onLeaveGroup, currentUser }: GroupsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].value);
  const [rules, setRules] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);
  const [minBet, setMinBet] = useState(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    addToast("Invite code copied!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (selectedGroup) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedGroupId(null)}
          className="flex items-center gap-2 text-sm font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Groups
        </button>

        <div className="bg-black rounded-[3rem] p-12 text-white relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 flex items-center justify-center text-4xl md:text-6xl shadow-2xl shrink-0">
                {selectedGroup.emoji}
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">{selectedGroup.name}</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    {selectedGroup.members.length} Members
                  </span>
                  <button 
                    onClick={() => handleCopyCode(selectedGroup.inviteCode)}
                    className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    Code: {selectedGroup.inviteCode}
                    {copiedId === selectedGroup.inviteCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <button className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                  Invite Friends
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Group Leaderboard
              </h3>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="space-y-4"
              >
                {selectedGroup.members.sort((a, b) => b.totalVolume - a.totalVolume).map((member, idx) => (
                  <motion.div 
                    key={member.userId} 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-emerald-50 hover:border-emerald-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-6 text-xs font-black text-gray-400">#{idx + 1}</span>
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://picsum.photos/seed/${member.avatarSeed}/100/100`} alt={member.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{member.username}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member since {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-emerald-600 tracking-tighter">{member.totalVolume.toLocaleString()} pts</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Group Chat
              </h3>
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">No messages yet</p>
                  <p className="text-xs text-gray-400 font-medium max-w-[200px] mx-auto mt-1">Be the first to start a conversation with your group!</p>
                </div>
                <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-900 p-8 rounded-[3rem] border border-white/10 shadow-2xl text-white">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Group Rules</h3>
              <p className="text-lg font-medium leading-relaxed italic text-white/80">
                "{selectedGroup.rules || "No specific rules set for this group. Trade fair, trade hard."}"
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Min Entry</span>
                  <span className="font-black text-emerald-400">{selectedGroup.minBet} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Max Members</span>
                  <span className="font-black text-white">{selectedGroup.maxMembers}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Active Competitions</h3>
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center">
                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Weekly Volume Race</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-4">Ends in 2d 14h</p>
                <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden mb-4">
                  <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                </div>
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
            Betting Groups
          </h2>
          <p className="text-gray-500 font-medium mt-1">Create private arenas to dominate your social circle.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-xs font-black text-gray-900 uppercase tracking-widest hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Join Group
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {groups.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Groups Found</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">
              The world is quiet. Create a group and invite your friends to start the chaos.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <motion.div 
              key={group.id}
              layoutId={`group-${group.id}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              onClick={() => setSelectedGroupId(group.id)}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[3rem] border border-gray-100 p-10 hover:border-emerald-500/40 transition-all group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 flex items-center justify-center text-5xl bg-gray-50 rounded-[2rem] border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                    {group.emoji || "🎲"}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-emerald-600 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex -space-x-3">
                        {group.members.slice(0, 4).map((member, i) => (
                          <img 
                            key={i}
                            src={`https://picsum.photos/seed/${member.avatarSeed}/100/100`}
                            alt={member.username}
                            className="w-8 h-8 rounded-xl border-2 border-white bg-gray-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                        {group.members.length} Members
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Invite Code</p>
                   <p className="text-sm font-black font-mono text-emerald-600">{group.inviteCode}</p>
                </div>
              </div>

              <p className="text-lg text-gray-500 line-clamp-2 mb-10 leading-relaxed font-medium">
                {group.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Min Entry</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">{group.minBet} pts</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Capacity</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">{group.members.length} / {group.maxMembers}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Create Betting Group</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Group Name</label>
                    <input 
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., The High Rollers"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                    <textarea 
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      placeholder="What's this group about?"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all h-24 resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Select Emoji</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedEmoji(emoji)}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 transition-all",
                            selectedEmoji === emoji ? "border-emerald-500 bg-emerald-50" : "border-transparent bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            selectedColor === color.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Advanced Settings
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase">Max Members</label>
                          <input 
                            type="number"
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase">Min Bet (pts)</label>
                          <input 
                            type="number"
                            value={minBet}
                            onChange={(e) => setMinBet(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase">Group Rules</label>
                          <textarea 
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            placeholder="Set some ground rules..."
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-medium outline-none h-20 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!groupName) return;
                    onCreateGroup(groupName, groupDesc, {
                      emoji: selectedEmoji,
                      themeColor: selectedColor,
                      rules,
                      maxMembers,
                      minBet
                    });

                    // Trigger confetti
                    confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#059669', '#10B981', '#34D399', '#F59E0B', '#F43F5E']
                    });

                    setGroupName("");
                    setGroupDesc("");
                    setRules("");
                    setShowCreateModal(false);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Create Group
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Join a Group</h3>
                <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Invite Code</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ENTER-CODE"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-mono font-bold text-lg outline-none transition-all uppercase"
                      maxLength={8}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (!inviteCode) return;
                    onJoinGroup(inviteCode);
                    setInviteCode("");
                    setShowJoinModal(false);
                  }}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all"
                >
                  Join Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
