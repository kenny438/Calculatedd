import React, { useState } from "react";
import { formatCurrency, cn } from "../lib/utils";
import { CreditCard, ArrowDownCircle, ArrowUpCircle, History, TrendingUp, TrendingDown, Skull, AlertTriangle } from "lucide-react";
import { useToast } from "./ui/Toast";
import { Transaction, UserProfile } from "../data/mockData";
import { motion } from "motion/react";

interface WalletProps {
  balance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  transactions: Transaction[];
  currentUser: UserProfile;
  onClaimTaxes?: () => void;
}

export function Wallet({ balance, onDeposit, onWithdraw, transactions, currentUser, onClaimTaxes }: WalletProps) {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const { addToast } = useToast();

  const totalTaxes = transactions
    .filter(tx => tx.type === 'tax')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
  const isTaxCollector = currentUser?.email === TAX_COLLECTOR;

  // Calculate Performance for ATM Limit
  const totalInvested = transactions
    .filter(tx => tx.type === 'bet_yes' || tx.type === 'bet_no')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalReturns = transactions
    .filter(tx => tx.type === 'sell')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netProfit = totalReturns - totalInvested;
  const isProfitable = netProfit >= 0;

  // ATM Limit Logic
  let atmLimit = 5000; // Default (Loss)
  if (isTaxCollector) {
    atmLimit = Infinity;
  } else if (isProfitable) {
    atmLimit = 50000;
  }

  const handleAction = () => {
    if (!amount) return;
    const val = parseFloat(amount);
    if (val <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (activeTab === "deposit") {
      if (val > atmLimit) {
        addToast(`ATM Limit Exceeded! Your limit is ${formatCurrency(atmLimit)}`, "error");
        return;
      }
      onDeposit(val);
    } else {
      if (val > balance) {
        addToast("Insufficient funds", "error");
        return;
      }
      onWithdraw(val);
    }
    setAmount("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group perspective-1000">
        <motion.div 
          initial={{ rotateY: -20, opacity: 0, scale: 0.9 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          whileHover={{ 
            rotateY: 5, 
            rotateX: -5,
            scale: 1.02,
            boxShadow: "0 60px 100px -20px rgba(6,78,59,0.6)"
          }}
          transition={{ 
            type: "spring" as const,
            stiffness: 260,
            damping: 20
          }}
          className="relative w-full h-64 bg-gradient-to-br from-emerald-950 via-emerald-900 to-black rounded-[2.5rem] p-10 text-white shadow-[0_50px_100px_-20px_rgba(6,78,59,0.5)] overflow-hidden border border-emerald-500/20 cursor-pointer"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          
          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-8 bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-600 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                    <div className="w-6 h-4 border border-black/10 rounded-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] text-emerald-200 uppercase leading-none">Calculated</span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase leading-none mt-0.5">Emerald</span>
                  </div>
                </div>
                <p className="text-emerald-400/60 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Available Liquidity</p>
                <h1 className="text-6xl font-black tracking-tighter drop-shadow-2xl text-emerald-50">
                  {formatCurrency(balance)}
                </h1>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end opacity-80">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 shadow-inner border border-emerald-400/30" />
                  <div className="w-8 h-8 rounded-full bg-emerald-800 -ml-5 shadow-inner border border-emerald-400/30" />
                </div>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">Emerald Member</p>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-500 tracking-[0.2em] uppercase">Account Holder</p>
                <p className="text-lg font-black tracking-tight uppercase text-gray-100">{currentUser?.username || "Valued Trader"}</p>
              </div>
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("deposit")}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-xl",
                    activeTab === "deposit" 
                      ? "bg-white text-gray-900 border-white" 
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  )}
                >
                  Deposit
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("withdraw")}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-xl",
                    activeTab === "withdraw" 
                      ? "bg-white text-gray-900 border-white" 
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  )}
                >
                  Redeem
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Taxes Paid</p>
          <p className="text-xl font-black text-red-600 tracking-tight">{formatCurrency(totalTaxes)}</p>
        </div>
        {isTaxCollector ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClaimTaxes}
            className="bg-black text-white rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col justify-center items-center group"
          >
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Claim Collected Taxes</p>
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500" />
              <span className="text-xl font-black tracking-tighter">ↈ∭ COLLECT</span>
            </div>
          </motion.button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">Active</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          {activeTab === "deposit" ? "Get More Points" : "Redeem Points"}
        </h2>
        
        <div className="space-y-6">
          {activeTab === "deposit" && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ATM Status</span>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest px-2 py-1 rounded",
                  isTaxCollector ? "bg-purple-100 text-purple-700" :
                  isProfitable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {isTaxCollector ? "Admin Override" : isProfitable ? "High Roller" : "Risk Management"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Net Profit</p>
                  <p className={cn("text-sm font-black font-mono", netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Daily Limit</p>
                  <p className="text-sm font-black font-mono text-gray-900">
                    {isTaxCollector ? "∞" : formatCurrency(atmLimit)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-start bg-blue-50 p-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                  {isTaxCollector 
                    ? "Admin Access: Unlimited withdrawals enabled." 
                    : isProfitable 
                      ? "Your trading performance is solid. Limit increased to 50,000 pts." 
                      : "Due to recent losses, your ATM limit is restricted to 5,000 pts."}
                </p>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 leading-relaxed">
              {activeTab === "deposit" 
                ? "NOTICE: A 15% 'Processing Tax' will be deducted from all deposits. The Tax Man is watching. 😈" 
                : "WARNING: A 20% 'Capital Gains Tax' applies to all redemptions. Escape is impossible. 😵"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Points)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className="py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                +{val}
              </button>
            ))}
          </div>

          <button
            onClick={handleAction}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-[0.99]"
          >
            {activeTab === "deposit" ? "Confirm Points" : "Confirm Redemption"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Transactions</h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No recent transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.slice().reverse().map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' :
                    tx.type === 'withdraw' ? 'bg-gray-100 text-gray-600' :
                    tx.type === 'bet_yes' ? 'bg-emerald-50 text-emerald-600' :
                    tx.type === 'tax' ? 'bg-red-100 text-red-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {tx.type === 'deposit' && <ArrowDownCircle className="w-5 h-5" />}
                    {tx.type === 'withdraw' && <ArrowUpCircle className="w-5 h-5" />}
                    {tx.type === 'bet_yes' && <TrendingUp className="w-5 h-5" />}
                    {tx.type === 'bet_no' && <TrendingDown className="w-5 h-5" />}
                    {tx.type === 'tax' && <Skull className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {tx.type === 'deposit' ? 'Points Added' :
                       tx.type === 'withdraw' ? 'Points Redeemed' :
                       tx.type === 'bet_yes' ? 'Bet YES' : 
                       tx.type === 'tax' ? 'TAX COLLECTED' : 'Bet NO'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.marketTitle ? tx.marketTitle.substring(0, 30) + (tx.marketTitle.length > 30 ? '...' : '') : new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-bold font-mono ${
                  tx.type === 'deposit' ? 'text-emerald-600' : 
                  tx.type === 'tax' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 pb-8">
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to reset your balance and positions? This cannot be undone.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-xs text-red-500 hover:text-red-700 font-medium underline opacity-50 hover:opacity-100 transition-opacity"
        >
          Reset Demo Account
        </button>
      </div>
    </div>
  );
}
