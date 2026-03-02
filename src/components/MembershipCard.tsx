import React from "react";
import { UserProfile } from "../data/mockData";
import { cn, formatCurrency } from "../lib/utils";
import { Shield, Star, Crown, Zap } from "lucide-react";
import { motion } from "motion/react";

export type CardTier = "SILVER" | "GOLD" | "BLACK" | "GOD";

interface MembershipCardProps {
  profile: UserProfile;
  tier: CardTier;
  className?: string;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
}

export const TIER_THRESHOLDS = {
  SILVER: 0,
  GOLD: 50000,
  BLACK: 250000,
  GOD: Infinity, // Unreachable via normal means
};

export const TIER_DETAILS = {
  SILVER: {
    abilities: ["Standard Trading", "1% Trading Fee", "$10,000 Max Bet"],
    rules: ["Standard withdrawal times", "Public profile only"],
  },
  GOLD: {
    abilities: ["Priority Trading", "0.5% Trading Fee", "$50,000 Max Bet", "Priority Support"],
    rules: ["Faster withdrawals (24h)", "Custom avatar seeds"],
  },
  BLACK: {
    abilities: ["Elite Trading", "0.1% Trading Fee", "Unlimited Betting", "VIP Event Access", "Early Feature Access"],
    rules: ["Instant withdrawals", "Private profile option", "Dedicated Account Manager"],
  },
  GOD: {
    abilities: ["Platform Governance", "0% Trading Fee", "Unlimited Everything", "Owner Badge", "Direct Dev Access"],
    rules: ["Immunity to bans", "Can create custom markets instantly", "Global Chat Moderator"],
  },
};

export function MembershipCard({ profile, tier, className, locked = false, size = "md" }: MembershipCardProps) {
  const getCardStyle = (tier: CardTier) => {
    switch (tier) {
      case "SILVER":
        return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 text-gray-800 border-gray-300";
      case "GOLD":
        return "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 text-yellow-900 border-yellow-400";
      case "BLACK":
        return "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white border-gray-700";
      case "GOD":
        return "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-600 to-indigo-200 text-white border-indigo-400 bg-size-200 animate-gradient";
      default:
        return "bg-gray-200";
    }
  };

  const getIcon = (tier: CardTier) => {
    switch (tier) {
      case "SILVER": return <Shield className="w-full h-full opacity-80" />;
      case "GOLD": return <Star className="w-full h-full opacity-80" />;
      case "BLACK": return <Crown className="w-full h-full opacity-80" />;
      case "GOD": return <Zap className="w-full h-full text-yellow-300 drop-shadow-glow" />;
    }
  };

  const sizeClasses = {
    sm: "w-64 p-4 text-xs",
    md: "w-full max-w-md p-6",
    lg: "w-full max-w-xl p-8 text-lg"
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        rotateY: locked ? 0 : 0, 
        opacity: locked ? 0.6 : 1,
        scale: locked ? 0.95 : 1,
        filter: locked ? "grayscale(0.8)" : "none"
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative aspect-[1.586/1] rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300",
        getCardStyle(tier),
        sizeClasses[size],
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      
      {/* Shine Effect */}
      {!locked && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-30 pointer-events-none"></div>}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30",
            size === "sm" ? "w-6 h-6" : "w-10 h-10"
          )}>
            <div className={size === "sm" ? "w-3 h-3" : "w-6 h-6"}>
              {getIcon(tier)}
            </div>
          </div>
          <span className="font-mono font-bold tracking-widest uppercase opacity-80">
            {tier}
          </span>
        </div>
        {!locked && <span className="font-bold italic tracking-tighter opacity-90">Calculated</span>}
      </div>

      {/* Chip */}
      <div className={cn(
        "relative z-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 border border-yellow-600/30 flex items-center justify-center overflow-hidden shadow-inner",
        size === "sm" ? "w-8 h-6" : "w-12 h-9"
      )}>
        <div className="w-full h-[1px] bg-yellow-600/40 absolute top-1/3"></div>
        <div className="w-full h-[1px] bg-yellow-600/40 absolute bottom-1/3"></div>
        <div className="h-full w-[1px] bg-yellow-600/40 absolute left-1/3"></div>
        <div className="h-full w-[1px] bg-yellow-600/40 absolute right-1/3"></div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <div className="font-mono tracking-widest mb-1 opacity-90 drop-shadow-sm">
          •••• {profile.avatarSeed.slice(0, 4).toUpperCase()}
        </div>
        <div className="flex justify-between items-end">
          <div className="overflow-hidden">
            <div className="uppercase opacity-60 font-bold mb-0.5 text-[0.6em]">Cardholder</div>
            <div className="font-bold tracking-wide uppercase truncate max-w-[120px] md:max-w-[200px]">
              {profile.username}
            </div>
          </div>
          {!locked && (
            <div className="text-right">
              <div className="uppercase opacity-60 font-bold mb-0.5 text-[0.6em]">Member Since</div>
              <div className="font-mono font-medium">
                {new Date(profile.joinedDate).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
