import React, { useState } from "react";
import { Market, UserProfile } from "../data/mockData";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { ArrowLeft, Share2, Star, Clock, Info, Shield, TrendingUp, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ui/Toast";
import { CommentSection } from "./CommentSection";
import { SentimentPoll } from "./SentimentPoll";
import confetti from "canvas-confetti";
import { BetCalculator } from "./BetCalculator";

interface MarketDetailProps {
  market: Market;
  onBack: () => void;
  onPlaceOrder: (marketId: string, side: "YES" | "NO", amount: number) => void;
  balance: number;
  isWatched: boolean;
  onToggleWatch: () => void;
  userProfile: UserProfile;
  onAddComment: (text: string, media?: { type: 'gif' | 'image', url: string }) => void;
  onDeleteComment: (commentId: string) => void;
  onVoteSentiment: (marketId: string, sentiment: 'YES' | 'NO') => void;
  onResolve?: (marketId: string, result: 'YES' | 'NO') => void;
}

export function MarketDetail({ market, onBack, onPlaceOrder, balance, isWatched, onToggleWatch, userProfile, onAddComment, onDeleteComment, onVoteSentiment, onResolve }: MarketDetailProps) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState<string>("");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { addToast } = useToast();
  
  const isLive = new Date(market.endDate) > new Date();
  const price = side === "YES" ? market.yesPrice : 1 - market.yesPrice;
  const potentialReturn = amount ? (parseFloat(amount) / price) : 0;
  const potentialProfit = amount ? potentialReturn - parseFloat(amount) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      addToast("Please enter an amount", "error");
      return;
    }
    const val = parseFloat(amount);
    if (val <= 0) {
      addToast("Amount must be greater than 0", "error");
      return;
    }
    if (val > balance) {
      addToast(`Insufficient balance. You have ${formatCurrency(balance)}`, "error");
      return;
    }
    
    onPlaceOrder(market.id, side, val);
    setAmount("");
    
    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: side === "YES" ? ['#059669', '#10B981', '#34D399'] : ['#EF4444', '#F87171', '#FCA5A5']
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard!", "success");
  };

  return (
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
      className="max-w-6xl mx-auto"
    >
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0 }
        }}
        className="mb-6 flex items-center justify-between"
      >
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Markets
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleWatch}
            className={cn(
              "p-2 rounded-full transition-colors",
              isWatched ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Star className={cn("w-4 h-4", isWatched && "fill-current")} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Section */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border border-emerald-100 p-10 shadow-sm relative overflow-hidden">
            {/* Premium Background Accents */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 opacity-[0.05] rounded-full -mr-32 -mt-32 blur-3xl" 
              style={{ backgroundColor: market.themeColor || "#059669" }}
            />
            
            {/* Top Bar Indicator */}
            <div 
              className="absolute top-0 left-0 w-full h-2 opacity-90" 
              style={{ backgroundColor: market.themeColor || "#059669" }}
            />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl md:text-5xl shadow-sm shrink-0">
                  {market.emoji || "🎲"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <span className={cn(
                      "px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5",
                      isLive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                    )}>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {isLive ? "Live Market" : "Market Ended"}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">
                      {market.category}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">{market.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-xs text-emerald-600/60 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Ends {new Date(market.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-emerald-600/60 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {formatCurrency(market.volume)} Volume
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-4xl md:text-6xl font-black text-emerald-600 tracking-tighter leading-none">{formatPercent(market.yesPrice)}</div>
                <div className="text-[10px] font-black text-emerald-600/40 uppercase tracking-[0.3em] mt-2">Current Odds</div>
              </div>
            </div>

            {market.rules && (
              <div className="mb-10 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1">Official Party Rules</h4>
                  <p className="text-base text-emerald-900/70 font-medium leading-relaxed italic">
                    "{market.rules}"
                  </p>
                </div>
              </div>
            )}
            
            <div className="h-[250px] md:h-[400px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={market.history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} 
                    minTickGap={40}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 1]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} 
                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', padding: '16px' }}
                    formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Probability']}
                    labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}
                    itemStyle={{ color: '#059669', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#059669" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Trading Interface */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
          className="lg:col-span-4 space-y-6"
        >
          <SentimentPoll marketId={market.id} onVote={(s) => onVoteSentiment(market.id, s)} />
          
          {userProfile.isAdmin && market.status === 'open' && (
            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black uppercase tracking-widest text-sm">Ministerial Resolution</h3>
              </div>
              <p className="text-xs text-emerald-200 mb-6 font-medium leading-relaxed">
                As a Minister, you have the authority to resolve this party. This action is irreversible and will distribute payouts to all winners.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onResolve?.(market.id, 'YES')}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/50"
                >
                  Resolve YES
                </button>
                <button
                  onClick={() => onResolve?.(market.id, 'NO')}
                  className="py-3 bg-red-500 hover:bg-red-400 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/50"
                >
                  Resolve NO
                </button>
              </div>
            </div>
          )}

          {market.status === 'resolved' && (
            <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl border border-gray-800 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-black uppercase tracking-widest text-lg mb-2">Party Resolved</h3>
              <p className="text-gray-400 text-sm mb-6">This party ended with the outcome:</p>
              <div className={cn(
                "inline-block px-8 py-4 rounded-2xl text-3xl font-black uppercase tracking-tighter",
                market.result === 'YES' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              )}>
                {market.result}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Place your bet</h3>
              <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                <Calculator className="w-3 h-3" />
                Calculate
              </button>
            </div>

            <div className="p-6">
                {market.status === 'open' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setSide("YES")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                          side === "YES" 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs font-bold uppercase mb-1">Yes</span>
                        <span className="text-2xl font-bold">{formatPercent(market.yesPrice)}</span>
                      </motion.button>
                      
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setSide("NO")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                          side === "NO" 
                            ? "bg-red-50 border-red-500 text-red-700 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs font-bold uppercase mb-1">No</span>
                        <span className="text-2xl font-bold">{formatPercent(1 - market.yesPrice)}</span>
                      </motion.button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                        <span>Stake Amount</span>
                        <span className="text-emerald-600 cursor-pointer hover:underline" onClick={() => setAmount(balance.toString())}>
                          Max: {formatCurrency(balance)}
                        </span>
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">PTS</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Shares</span>
                        <span className="font-mono font-medium text-gray-900">{amount ? (parseFloat(amount) / price).toFixed(2) : "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Potential Return</span>
                        <span className="font-mono font-bold text-emerald-600">{formatCurrency(potentialReturn)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200/50">
                        <span className="text-gray-500">ROI</span>
                        <span className="font-mono font-medium text-emerald-600">+{formatPercent(potentialProfit / (parseFloat(amount) || 1))}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all"
                    >
                      Place Bet
                    </motion.button>
                    
                    <p className="text-center text-xs text-gray-400">
                      By placing a bet, you agree to the Party Rules.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-medium">Betting is closed for this party.</p>
                  </div>
                )}
            </div>
          </div>
        </motion.div>

        {/* Info & Comments Section (Moved here for better mobile flow) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About this Party</h3>
            <p className="text-gray-600 leading-relaxed">
              {market.description}
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-1">Volume</div>
                <div className="text-xl font-mono font-medium text-gray-900">{formatCurrency(market.volume)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-1">Liquidity</div>
                <div className="text-xl font-mono font-medium text-gray-900">{formatCurrency(market.liquidity)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-1">End Date</div>
                <div className="text-xl font-mono font-medium text-gray-900">{new Date(market.endDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <CommentSection 
            comments={market.comments || []} 
            userProfile={userProfile}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
          />
        </div>
      </div>
      
      <AnimatePresence>
        {isCalculatorOpen && (
          <BetCalculator market={market} onClose={() => setIsCalculatorOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
