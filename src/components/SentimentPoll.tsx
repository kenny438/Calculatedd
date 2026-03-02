import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Users, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { cn, formatPercent } from "../lib/utils";

interface SentimentPollProps {
  marketId: string;
  onVote: (sentiment: 'YES' | 'NO') => void;
}

export function SentimentPoll({ marketId, onVote }: SentimentPollProps) {
  const [counts, setCounts] = useState<{ YES: number; NO: number }>({ YES: 0, NO: 0 });
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await fetch(`/api/sentiment/${marketId}`);
        const data = await res.json();
        const yesCount = data.find((d: any) => d.sentiment === 'YES')?.count || 0;
        const noCount = data.find((d: any) => d.sentiment === 'NO')?.count || 0;
        setCounts({ YES: yesCount, NO: noCount });
      } catch (err) {
        console.error("Failed to fetch sentiment:", err);
      }
    };
    fetchSentiment();
  }, [marketId, hasVoted]);

  const total = counts.YES + counts.NO;
  const yesPercent = total > 0 ? counts.YES / total : 0.5;
  const noPercent = total > 0 ? counts.NO / total : 0.5;

  const handleVote = (sentiment: 'YES' | 'NO') => {
    onVote(sentiment);
    setHasVoted(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Vibe Check</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
          <Users className="w-3 h-3" />
          {total} Votes
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVote('YES')}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
              hasVoted ? "bg-gray-50 border-gray-100 text-gray-400 cursor-default" : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-500"
            )}
            disabled={hasVoted}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-black uppercase">Bullish</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVote('NO')}
            className={cn(
              "flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
              hasVoted ? "bg-gray-50 border-gray-100 text-gray-400 cursor-default" : "bg-red-50 border-red-100 text-red-700 hover:border-red-500"
            )}
            disabled={hasVoted}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xs font-black uppercase">Bearish</span>
          </motion.button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-emerald-600">Yes {formatPercent(yesPercent)}</span>
            <span className="text-red-600">No {formatPercent(noPercent)}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${yesPercent * 100}%` }}
              className="h-full bg-emerald-500" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${noPercent * 100}%` }}
              className="h-full bg-red-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
