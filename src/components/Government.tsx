import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Gavel, 
  ShieldCheck, 
  ScrollText, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ChevronRight,
  Crown,
  Lock,
  Zap,
  DollarSign,
  PieChart,
  History
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { UserProfile } from "../data/mockData";

interface GovernmentProps {
  userProfile: UserProfile;
  onClaimTaxes: () => void;
  taxBalance: number;
}

export function Government({ userProfile, onClaimTaxes, taxBalance }: GovernmentProps) {
  const isMinister = userProfile.email === "mgethmikadinujakumarathunga@gmail.com";
  const [activeSection, setActiveSection] = useState<"overview" | "laws" | "treasury">("overview");

  const laws = [
    {
      id: "win-tax",
      title: "The Winner's Tithe",
      description: "A mandatory 12% contribution to the Ministry from all winning trades.",
      status: "Active",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      id: "deposit-tax",
      title: "Entry Protocol 15",
      description: "15% processing fee on all incoming point deposits to ensure market stability.",
      status: "Active",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "withdraw-tax",
      title: "Capital Exit Levy",
      description: "20% withdrawal tax to discourage paper hands and promote long-term holding.",
      status: "Active",
      icon: <Lock className="w-5 h-5" />,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      id: "audit-law",
      title: "Wealth Redistribution Act",
      description: "Random 5% wealth audits for accounts exceeding 1,000 points. No one is above the law.",
      status: "Active",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      id: "minister-immunity",
      title: "Ministerial Prerogative",
      description: "The Minister of Bussin is exempt from all tithes, levies, and audits.",
      status: "Active",
      icon: <Crown className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-emerald-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl -ml-10 -mb-10" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <ShieldCheck className="w-3 h-3" />
              Official Ministry of Bussin
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9]">
              The Green <br />
              <span className="text-emerald-400 italic">Government</span>
            </h1>
            <p className="text-emerald-100/70 text-lg font-medium leading-relaxed">
              Maintaining order, stability, and maximum bussin-ness across the global prediction markets. 
              Our laws are absolute, our audits are random, and our treasury is growing.
            </p>
          </div>

          {isMinister && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 min-w-[280px]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Minister of Bussin</p>
                  <p className="text-lg font-bold">Your Excellency</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-emerald-100/50 mb-1">Treasury Balance</p>
                  <p className="text-3xl font-black tracking-tight">{formatCurrency(taxBalance)}</p>
                </div>
                
                <button 
                  onClick={onClaimTaxes}
                  disabled={taxBalance <= 0}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Claim Treasury
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
        {[
          { id: "overview", label: "Overview", icon: <PieChart className="w-4 h-4" /> },
          { id: "laws", label: "Laws & Decrees", icon: <ScrollText className="w-4 h-4" /> },
          { id: "treasury", label: "Treasury History", icon: <History className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
              activeSection === tab.id 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Active Citizens</p>
                  <p className="text-2xl font-black text-gray-900">1,248</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    +12% this week
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Gavel className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Laws Enforced</p>
                  <p className="text-2xl font-black text-gray-900">42</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600">
                    <ShieldCheck className="w-3 h-3" />
                    100% Compliance
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-emerald-600" />
                  Ministerial Address
                </h3>
                <div className="prose prose-emerald max-w-none">
                  <p className="text-gray-600 leading-relaxed italic">
                    "Citizens of Calculated, we are entering a new era of prosperity. 
                    The markets are green, the bets are bussin, and the treasury is full. 
                    Remember that your taxes fund the very platform you trade on. 
                    Without the 12% tithe, there would be no liquidity. Without the audits, 
                    there would be no fairness. Trade hard, trade fast, and stay bussin."
                  </p>
                  <p className="mt-4 font-black text-gray-900">— The Minister of Bussin</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "laws" && (
            <div className="space-y-4">
              {laws.map((law) => (
                <motion.div 
                  key={law.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-6 hover:border-emerald-200 transition-all group"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm", law.bg, law.color)}>
                    {law.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-gray-900 text-lg">{law.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        {law.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{law.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors self-center" />
                </motion.div>
              ))}
            </div>
          )}

          {activeSection === "treasury" && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-900">Recent Treasury Inflow</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { type: "Winning Tax", amount: 450, user: "TraderX", time: "2m ago" },
                  { type: "Deposit Fee", amount: 1500, user: "Whale99", time: "15m ago" },
                  { type: "Audit Seizure", amount: 89, user: "UnluckyOne", time: "1h ago" },
                  { type: "Winning Tax", amount: 12, user: "SmallFry", time: "3h ago" },
                  { type: "Withdrawal Tax", amount: 2000, user: "PaperHands", time: "5h ago" },
                ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.type}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">From {item.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">+{item.amount} pts</p>
                      <p className="text-[10px] text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl">
            <h4 className="font-black text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
              Public Service Announcement
            </h4>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
              The Ministry of Bussin reminds all citizens that "Paper Hands" are a threat to market stability. 
              Hold your positions, trust the process, and stay bussin.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xs font-medium text-emerald-200">Current Tax Rate</span>
                <span className="text-sm font-black">12%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xs font-medium text-emerald-200">Market Stability</span>
                <span className="text-sm font-black text-emerald-400">EXCELLENT</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-black text-gray-900 mb-4">Ministerial Staff</h4>
            <div className="space-y-4">
              {[
                { name: "The Minister", role: "Supreme Leader", seed: "minister" },
                { name: "Bussin Bot", role: "Audit Enforcement", seed: "bot" },
                { name: "Tax Man", role: "Treasury Collector", seed: "tax" }
              ].map((staff, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${staff.seed}/100/100`} 
                      alt={staff.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
