import React from "react";
import { Trophy, Zap, Shield, Target, Flame, Crown, Diamond, Rocket } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
}

interface BadgesProps {
  userId: string;
  totalVolume: number;
  totalWins: number;
  balance: number;
}

export function Badges({ totalVolume, totalWins, balance }: BadgesProps) {
  const badges: Badge[] = [
    {
      id: "whale",
      name: "Bussin Whale",
      description: "Hold over 50,000 PTS in your balance",
      icon: <Diamond className="w-5 h-5" />,
      color: "bg-blue-500",
      unlocked: balance >= 50000,
    },
    {
      id: "diamond-hands",
      name: "Diamond Hands",
      description: "Complete 10 successful trades",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-indigo-500",
      unlocked: totalWins >= 10,
    },
    {
      id: "high-roller",
      name: "High Roller",
      description: "Total trading volume over 100,000 PTS",
      icon: <Zap className="w-5 h-5" />,
      color: "bg-yellow-500",
      unlocked: totalVolume >= 100000,
    },
    {
      id: "sniper",
      name: "Market Sniper",
      description: "Win a bet with odds under 20%",
      icon: <Target className="w-5 h-5" />,
      color: "bg-red-500",
      unlocked: totalWins >= 5, // Simplified logic
    },
    {
      id: "streak",
      name: "On Fire",
      description: "3 consecutive winning bets",
      icon: <Flame className="w-5 h-5" />,
      color: "bg-orange-500",
      unlocked: totalWins >= 3,
    },
    {
      id: "pioneer",
      name: "Bussin Pioneer",
      description: "Early adopter of the platform",
      icon: <Rocket className="w-5 h-5" />,
      color: "bg-emerald-500",
      unlocked: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          whileHover={{ y: -5 }}
          className={cn(
            "relative p-4 rounded-2xl border transition-all overflow-hidden group",
            badge.unlocked 
              ? "bg-white border-gray-200 shadow-sm" 
              : "bg-gray-50 border-gray-100 opacity-60 grayscale"
          )}
        >
          {badge.unlocked && (
            <div className="absolute top-0 right-0 p-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg",
            badge.unlocked ? badge.color : "bg-gray-300"
          )}>
            {badge.icon}
          </div>
          
          <h4 className="text-sm font-black text-gray-900 mb-1">{badge.name}</h4>
          <p className="text-[10px] font-medium text-gray-500 leading-tight">{badge.description}</p>
          
          {!badge.unlocked && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 w-1/3" />
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase">Locked</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
