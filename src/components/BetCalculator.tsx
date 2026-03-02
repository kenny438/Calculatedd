import React, { useState } from "react";
import { Market } from "../data/mockData";
import { formatCurrency, formatPercent } from "../lib/utils";
import { X, Calculator } from "lucide-react";
import { motion } from "motion/react";

interface BetCalculatorProps {
  market: Market;
  onClose: () => void;
}

export function BetCalculator({ market, onClose }: BetCalculatorProps) {
  const [amount, setAmount] = useState(100);
  const [side, setSide] = useState<'YES' | 'NO'>('YES');

  const price = side === 'YES' ? market.yesPrice : (1 - market.yesPrice);
  const shares = amount / price;
  const potentialReturn = shares * 1; // Each share pays out 1
  const profit = potentialReturn - amount;
  const roi = (profit / amount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Bet Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Side</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide('YES')}
                className={`py-3 rounded-xl font-black uppercase tracking-widest border-2 transition-all ${
                  side === 'YES' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                Yes ({formatPercent(market.yesPrice)})
              </button>
              <button
                onClick={() => setSide('NO')}
                className={`py-3 rounded-xl font-black uppercase tracking-widest border-2 transition-all ${
                  side === 'NO' 
                    ? 'bg-red-50 border-red-500 text-red-600' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                No ({formatPercent(1 - market.yesPrice)})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 text-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Est. Shares</span>
              <span className="font-mono font-bold">{shares.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Potential Return</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(potentialReturn)}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm text-gray-400">Net Profit</span>
              <div className="text-right">
                <span className="block font-black text-xl text-emerald-400">+{formatCurrency(profit)}</span>
                <span className="text-xs text-emerald-400/60 font-bold">{roi.toFixed(1)}% ROI</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
