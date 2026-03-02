import React from "react";
import { CheckCircle2, Circle, Trophy, Target, Zap, Shield } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
  icon: React.ReactNode;
}

interface QuestsProps {
  quests: Quest[];
  onClaim: (questId: string) => void;
}

export function Quests({ quests, onClaim }: QuestsProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Daily Missions
        </h3>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Resets in 12h
        </span>
      </div>

      <div className="space-y-4">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl border transition-all relative overflow-hidden group",
              quest.completed 
                ? "bg-emerald-50 border-emerald-100" 
                : "bg-gray-50 border-gray-100 hover:border-emerald-200"
            )}
          >
            {quest.completed && (
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                quest.completed ? "bg-emerald-100 text-emerald-600" : "bg-white text-gray-400 shadow-sm"
              )}>
                {quest.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    "text-sm font-bold truncate",
                    quest.completed ? "text-emerald-900" : "text-gray-900"
                  )}>
                    {quest.title}
                  </h4>
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                    quest.completed ? "bg-emerald-200 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    +{quest.reward} XP
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{quest.description}</p>
                
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                      quest.completed ? "bg-emerald-500" : "bg-emerald-400"
                    )}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {quest.progress} / {quest.total}
                  </span>
                  {quest.completed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onClaim(quest.id)}
                      className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                    >
                      Claim Reward
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
