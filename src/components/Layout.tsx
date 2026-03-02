import React, { useState } from "react";
import { Search, Bell, Menu, Trophy, ChevronDown, X, LogOut, BadgeCheck, Activity, Zap } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ui/Toast";

import { UserProfile } from "../data/mockData";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  balance: number;
  rightSidebar?: React.ReactNode;
  onOpenCreateModal: () => void;
  onOpenLeaderboard: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userProfile?: UserProfile;
  onLogout?: () => void;
}

export function Layout({ 
  children, 
  activeTab, 
  onTabChange, 
  balance, 
  rightSidebar, 
  onOpenCreateModal, 
  onOpenLeaderboard, 
  searchQuery, 
  setSearchQuery, 
  userProfile, 
  onLogout
}: LayoutProps) {
  const { addToast } = useToast();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "markets", label: "MARKETS" },
    { id: "live", label: "LIVE", badge: "12" },
    { id: "groups", label: "GROUPS" },
    { id: "social", label: "SOCIAL" },
    { id: "portfolio", label: "PORTFOLIO" },
    { id: "government", label: "GOVERNMENT" },
  ];

  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => onTabChange("markets")}>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-emerald-600 leading-none">Calculated</span>
                <span className="text-[7px] font-black text-emerald-600/30 uppercase tracking-[0.2em] mt-0.5">BY BUSSIN INDUSTRIES ↈ∭</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={cn(
                    "text-xs font-black tracking-widest transition-all flex items-center gap-1.5 hover:text-emerald-600 relative py-2",
                    activeTab === link.id ? "text-emerald-600" : "text-gray-500"
                  )}
                >
                  {link.label}
                  {activeTab === link.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                    />
                  )}
                  {link.badge && (
                    <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                      {link.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the green markets..." 
                className="w-full pl-10 pr-4 py-2.5 bg-emerald-50 border border-emerald-100/50 rounded-xl text-sm font-medium text-gray-900 placeholder:text-emerald-600/40 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Feature 2: XP Progress Bar (Mini) */}
            {userProfile && (
              <div className="hidden lg:flex items-center gap-2 mr-2">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Lvl {userProfile.level || 1}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${((userProfile.xp || 0) % 1000) / 10}%` }}
                    />
                  </div>
                </div>
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCreateModal}
              className="hidden md:flex bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200"
            >
              Create Party
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange("wallet")}
              className="bg-white hover:bg-gray-50 text-gray-900 text-sm font-black px-4 py-2 rounded-xl transition-all border-2 border-gray-100 shadow-sm flex items-center gap-2 group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-tight">{formatCurrency(balance)}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </motion.button>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

            <button 
              onClick={onOpenLeaderboard}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors hidden md:block"
            >
              <Trophy className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <button onClick={() => setIsNotificationsOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-2 h-2 mt-2 bg-emerald-500 rounded-full flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Welcome to Calculated!</p>
                          <p className="text-xs text-gray-500">Start trading on your favorite events.</p>
                        </div>
                      </div>
                      {/* Removed fake notifications */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => onTabChange("profile")}
                className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden ml-1 hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
              >
                <img 
                  src={`https://picsum.photos/seed/${userProfile?.avatarSeed || "user"}/100/100`} 
                  alt="User" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </button>
              {userProfile?.isVerified && (
                <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-50 absolute -bottom-1 -right-1 bg-white rounded-full" />
              )}
            </div>
            
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-emerald-600 leading-none">Calculated</span>
                  <span className="text-[7px] font-black text-emerald-600/30 uppercase tracking-[0.2em] mt-0.5">BY BUSSIN INDUSTRIES</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-2 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search markets..." 
                      className="w-full pl-10 pr-4 py-3 bg-emerald-50 border border-emerald-100/50 rounded-xl text-sm font-medium text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      onTabChange(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl text-sm font-black tracking-widest transition-all flex items-center justify-between",
                      activeTab === link.id ? "bg-emerald-50 text-emerald-600" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-emerald-100 space-y-4">
                <button 
                  onClick={() => {
                    onOpenCreateModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-200"
                >
                  Create Party
                </button>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="w-full py-4 bg-red-50 text-red-600 font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 pb-24 md:pb-6">
        {/* Main Feed */}
        <main className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {rightSidebar}
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => onTabChange("markets")}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === "markets" ? "text-emerald-600" : "text-gray-400")}
          >
            <div className="relative">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Markets</span>
          </button>
          
          <button 
            onClick={() => onTabChange("live")}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === "live" ? "text-emerald-600" : "text-gray-400")}
          >
            <div className="relative">
              <Activity className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-bold">Live</span>
          </button>

          <button 
            onClick={onOpenCreateModal}
            className="flex flex-col items-center justify-center w-full h-full -mt-6"
          >
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 text-white">
              <Trophy className="w-6 h-6" />
            </div>
          </button>

          <button 
            onClick={() => onTabChange("portfolio")}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === "portfolio" ? "text-emerald-600" : "text-gray-400")}
          >
            <div className="relative">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Portfolio</span>
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", isMobileMenuOpen ? "text-emerald-600" : "text-gray-400")}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto px-4 py-12 border-t border-emerald-100 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-emerald-600 leading-none">Calculated</span>
              <span className="text-[8px] font-black text-emerald-600/40 uppercase tracking-[0.1em] mt-1">An app by BUSSIN INDUSTRIES ↈ∭</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-[0.2em] ml-4 border-l border-emerald-100 pl-4">
              &copy; 2026 Prediction Markets
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onTabChange("terms")}
              className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors"
            >
              Terms of Service
            </button>
            <button className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">
              Privacy Policy
            </button>
            <button className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-[0.2em] transition-colors">
              Help Center
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
          <p className="text-[10px] text-emerald-800/60 font-medium leading-relaxed text-center">
            Calculated is a prediction market platform. All trades are made with virtual points. 
            Users must be 12 years or older to participate. Please trade responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}
