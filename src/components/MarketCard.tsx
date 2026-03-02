import React from "react";
import { Market } from "../data/mockData";
import { formatPercent, cn, createSparklinePath } from "../lib/utils";
import { motion } from "motion/react";
import { TrendingUp, Clock, Flame, Zap, BarChart3, ArrowRight, Star } from "lucide-react";

interface MarketCardProps {
  market: Market;
  onClick: (market: Market) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onClick, isWatchlisted, onToggleWatchlist }) => {
  const noPrice = 1 - market.yesPrice;
  const isHot = market.volume > 1000000;
  const isLive = new Date(market.endDate) > new Date();
  
  // Generate sparkline data from history or fallback
  const priceHistory = market.history.map(h => h.price);
  const sparklinePath = createSparklinePath(priceHistory, 120, 40);
  const isPositiveTrend = priceHistory[priceHistory.length - 1] >= priceHistory[0];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -8, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.15)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(market)}
      className="group bg-white/90 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100 p-6 md:p-8 cursor-pointer transition-all hover:border-emerald-500/40 relative overflow-hidden flex flex-col h-full shadow-sm hover:shadow-emerald-200/50"
    >
      {/* Premium Background Accents */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:opacity-[0.12]" 
        style={{ backgroundColor: market.themeColor || "#059669" }}
      />
      <div 
        className="absolute bottom-0 left-0 w-24 h-24 opacity-[0.03] rounded-full -ml-12 -mb-12 blur-xl" 
        style={{ backgroundColor: market.themeColor || "#059669" }}
      />

      {/* Top Bar Indicator */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5 opacity-90" 
        style={{ backgroundColor: market.themeColor || "#059669" }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center text-3xl bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
              {market.emoji || "🎲"}
            </div>
            <div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] inline-flex items-center gap-1 mb-1",
                market.status === 'resolved' 
                  ? "bg-gray-900 text-white border border-gray-800" 
                  : isLive 
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200/50" 
                    : "bg-gray-100 text-gray-500 border border-gray-200/50"
              )}>
                {market.status === 'resolved' ? (
                  <>Resolved: {market.result}</>
                ) : (
                  <>
                    {isLive && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                    {isLive ? "Live" : "Ended"}
                  </>
                )}
              </div>
              <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none">
                {market.category}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             {/* Watchlist Star */}
             {onToggleWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(e);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors mb-1"
              >
                <Star 
                  className={cn(
                    "w-4 h-4 transition-colors", 
                    isWatchlisted ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                  )} 
                />
              </button>
             )}

             {isHot && (
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1"
              >
                <Flame className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Hot</span>
              </motion.div>
            )}
            {/* Sparkline */}
            <div className="h-10 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
              <svg width="100%" height="100%" viewBox="0 0 120 40" preserveAspectRatio="none">
                <path 
                  d={sparklinePath} 
                  fill="none" 
                  stroke={isPositiveTrend ? "#059669" : "#EF4444"} 
                  strokeWidth="2" 
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-900 leading-[1.1] mb-4 group-hover:text-emerald-600 transition-colors tracking-tight">
          {market.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-8 leading-relaxed font-medium opacity-80">
          {market.description}
        </p>

        <div className="mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Odds</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {market.volume > 0 ? `${(market.volume / 1000000).toFixed(1)}M Vol` : "New Party"}
              </span>
            </div>
          </div>

          {market.status === 'resolved' ? (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Final Outcome</span>
              <span className={cn(
                "text-xl font-black uppercase tracking-tighter",
                market.result === 'YES' ? "text-emerald-600" : "text-red-600"
              )}>
                {market.result}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group/btn">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl" />
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(market); // Open details for now, but could be quick bet
                  }}
                  className="w-full relative flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all group/yes"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Yes</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover/yes:opacity-100 -translate-x-2 group-hover/yes:translate-x-0 transition-all" />
                  </div>
                  <span className="text-2xl font-black text-emerald-700 tracking-tighter leading-none">{formatPercent(market.yesPrice)}</span>
                </motion.button>
              </div>

              <div className="relative group/btn">
                <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl" />
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(market);
                  }}
                  className="w-full relative flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all group/no"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em]">No</span>
                    <ArrowRight className="w-3 h-3 text-red-400 opacity-0 group-hover/no:opacity-100 -translate-x-2 group-hover/no:translate-x-0 transition-all" />
                  </div>
                  <span className="text-2xl font-black text-red-700 tracking-tighter leading-none">{formatPercent(noPrice)}</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
