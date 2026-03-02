import React from "react";
import { Gift, Flame, Calendar, CheckCircle2, Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface DailyRewardsProps {
  streak: number;
  lastLogin?: string;
  onClaim: () => void;
}

export function DailyRewards({ streak, lastLogin, onClaim }: DailyRewardsProps) {
  const isClaimedToday = lastLogin ? new Date(lastLogin).toDateString() === new Date().toDateString() : false;
  
  const days = [1, 2, 3, 4, 5, 6, 7];
  const currentDay = (streak % 7) || 7;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Gift className="w-32 h-32 text-emerald-600" />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-900">Daily Streak</h3>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{streak} Day Streak</p>
          </div>
        </div>
        <motion.button
          whileHover={!isClaimedToday ? { scale: 1.05 } : {}}
          whileTap={!isClaimedToday ? { scale: 0.95 } : {}}
          onClick={onClaim}
          disabled={isClaimedToday}
          className={cn(
            "px-6 py-2 rounded-xl font-black text-sm transition-all shadow-md",
            isClaimedToday 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-200"
          )}
        >
          {isClaimedToday ? "Claimed Today" : "Claim Reward"}
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-2 relative z-10">
        {days.map((day) => {
          const isCompleted = day < currentDay || (day === currentDay && isClaimedToday);
          const isCurrent = day === currentDay && !isClaimedToday;
          const reward = 100 + (day * 10);

          return (
            <div 
              key={day}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl border transition-all",
                isCompleted ? "bg-emerald-50 border-emerald-100" : 
                isCurrent ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-100" : 
                "bg-gray-50 border-gray-100"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase mb-1",
                isCompleted ? "text-emerald-600" : isCurrent ? "text-emerald-700" : "text-gray-400"
              )}>
                Day {day}
              </span>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mb-1",
                isCompleted ? "bg-emerald-100" : isCurrent ? "bg-emerald-50" : "bg-white"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : day === 7 ? (
                  <Star className={cn("w-4 h-4", isCurrent ? "text-emerald-600" : "text-gray-300")} />
                ) : (
                  <Gift className={cn("w-4 h-4", isCurrent ? "text-emerald-600" : "text-gray-300")} />
                )}
              </div>
              <span className={cn(
                "text-[8px] font-bold",
                isCompleted ? "text-emerald-600" : isCurrent ? "text-emerald-700" : "text-gray-400"
              )}>
                +{reward}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
        Don't break the streak! Miss a day and it resets to Day 1.
      </p>
    </div>
  );
}
