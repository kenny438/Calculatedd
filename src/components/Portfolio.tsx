import React from "react";
import { Position, Market } from "../data/mockData";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2 } from "lucide-react";
import { PortfolioChart } from "./PortfolioChart";
import { motion } from "motion/react";
import { CountUp } from "./ui/CountUp";

interface PortfolioProps {
  positions: Position[];
  markets: Market[];
  onSellPosition: (marketId: string, side: "YES" | "NO") => void;
  history: { balance: number; timestamp: string }[];
}

export function Portfolio({ positions, markets, onSellPosition, history }: PortfolioProps) {
  const getMarket = (id: string) => markets.find((m) => m.id === id);

  const totalInvested = positions.reduce((acc, p) => acc + (p.shares * p.avgPrice), 0);
  const currentValue = positions.reduce((acc, p) => {
    const m = getMarket(p.marketId);
    if (!m) return acc;
    const currentPrice = p.side === "YES" ? m.yesPrice : (1 - m.yesPrice);
    return acc + (p.shares * currentPrice);
  }, 0);
  
  const totalReturn = currentValue - totalInvested;
  const returnPercent = totalInvested > 0 ? totalReturn / totalInvested : 0;

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
      className="space-y-8"
    >
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Value</div>
          <div className="text-3xl font-bold text-gray-900">
            <CountUp value={currentValue} prefix="$" decimals={2} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-1">Invested</div>
          <div className="text-3xl font-bold text-gray-900">
            <CountUp value={totalInvested} prefix="$" decimals={2} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Return</div>
          <div className={cn("text-3xl font-bold flex items-center gap-2", totalReturn >= 0 ? "text-emerald-600" : "text-red-600")}>
            <CountUp 
              value={Math.abs(totalReturn)} 
              prefix={totalReturn >= 0 ? "+$" : "-$"} 
              decimals={2} 
            />
            <span className={cn("text-sm px-2 py-1 rounded-full", totalReturn >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
              {formatPercent(returnPercent)}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Performance History</h2>
        </div>
        <PortfolioChart data={history} />
      </motion.div>

      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Active Positions</h2>
        </div>
        
        {positions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No active positions found. Start trading!</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {positions.map((position, i) => {
                const market = getMarket(position.marketId);
                if (!market) return null;
                
                const currentPrice = position.side === "YES" ? market.yesPrice : (1 - market.yesPrice);
                const value = position.shares * currentPrice;
                const cost = position.shares * position.avgPrice;
                const ret = value - cost;
                const retPercent = ret / cost;

                return (
                  <motion.div 
                    key={`${position.marketId}-${position.side}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-gray-900 leading-tight mb-1">{market.title}</div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{market.category}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                        position.side === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {position.side}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shares</p>
                        <p className="font-mono font-bold text-gray-900">{position.shares.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Return</p>
                        <div className={cn("font-mono font-bold flex items-center gap-1", ret >= 0 ? "text-emerald-600" : "text-red-600")}>
                          {ret >= 0 ? "+" : ""}{formatPercent(retPercent)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Value</p>
                        <p className="font-mono font-bold text-gray-900">{formatCurrency(value)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Price</p>
                        <p className="font-mono font-bold text-gray-500">{formatCurrency(position.avgPrice)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSellPosition(position.marketId, position.side)}
                      className="w-full py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Sell Position
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Market</th>
                    <th className="px-6 py-4 text-left">Side</th>
                    <th className="px-6 py-4 text-right">Shares</th>
                    <th className="px-6 py-4 text-right">Avg Price</th>
                    <th className="px-6 py-4 text-right">Current Price</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    <th className="px-6 py-4 text-right">Return</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {positions.map((position, i) => {
                    const market = getMarket(position.marketId);
                    if (!market) return null;
                    
                    const currentPrice = position.side === "YES" ? market.yesPrice : (1 - market.yesPrice);
                    const value = position.shares * currentPrice;
                    const cost = position.shares * position.avgPrice;
                    const ret = value - cost;
                    const retPercent = ret / cost;

                    return (
                      <motion.tr 
                        key={`${position.marketId}-${position.side}`} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{market.title}</div>
                          <div className="text-xs text-gray-500">{market.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold uppercase",
                            position.side === "YES" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {position.side}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-gray-600">
                          {position.shares.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-gray-600">
                          {formatCurrency(position.avgPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-gray-900 font-medium">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-gray-900 font-bold">
                          {formatCurrency(value)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={cn("text-sm font-medium flex items-center justify-end gap-1", ret >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {ret >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatPercent(retPercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onSellPosition(position.marketId, position.side)}
                            className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                          >
                            Sell
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
