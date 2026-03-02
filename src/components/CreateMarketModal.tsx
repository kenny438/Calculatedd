import React, { useState } from "react";
import { X, Calendar, Tag, Type, Shield, Hash, Users } from "lucide-react";
import { Market, Group } from "../data/mockData";
import { useToast } from "./ui/Toast";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface CreateMarketModalProps {
  onClose: () => void;
  onCreate: (market: Omit<Market, "id" | "volume" | "liquidity" | "history" | "yesPrice" | "comments">) => void;
  groups?: Group[];
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

export function CreateMarketModal({ onClose, onCreate, groups = [] }: CreateMarketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Market["category"]>("Politics");
  const [endDate, setEndDate] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].value);
  const [rules, setRules] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !endDate) {
      addToast("Please fill in all fields", "error");
      return;
    }

    const selectedDate = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      addToast("End date must be in the future", "error");
      return;
    }

    const keywordList = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    onCreate({
      title,
      description,
      category,
      endDate,
      emoji: selectedEmoji,
      themeColor: selectedColor,
      rules,
      keywords: keywordList,
      groupId: selectedGroupId || undefined,
    });
    onClose();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { when: "afterChildren" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Market</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Market Title</label>
            <div className="relative">
              <Type className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Max Verstappen wins Australian GP"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the event..."
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all min-h-[100px] resize-none"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none appearance-none transition-all"
                >
                  <option value="Politics">Politics</option>
                  <option value="Economics">Economics</option>
                  <option value="Science">Science</option>
                  <option value="Culture">Culture</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all"
                  required
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Keywords / Tags</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., f1, racing, crypto, election (comma separated)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none transition-all"
              />
            </div>
          </motion.div>

          {groups.length > 0 && (
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Post to Group (Optional)</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium outline-none appearance-none transition-all"
                >
                  <option value="">Public Market (No Group)</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Select Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 transition-all",
                    selectedEmoji === emoji ? "border-emerald-500 bg-emerald-50" : "border-transparent bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Theme Color</label>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  key={color.value}
                  type="button"
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Advanced Rules
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Quick Bet Mode</span>
                  <div className="w-8 h-4 bg-emerald-200 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-600 rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Set specific ground rules for this market..."
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-medium outline-none h-20 resize-none"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all"
            >
              Create Market
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
