import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { motion } from 'motion/react';
import { Loader2, Mail, Lock, ArrowRight, TrendingUp } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          addToast('Account created successfully!', 'success');
        } else {
          // If email confirmation is enabled in Supabase
          addToast('Please check your email to verify your account.', 'info');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        addToast('Successfully signed in!', 'success');
      }
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-emerald-950 selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* Vertical Divider */}
      <div className="hidden md:block absolute left-[55%] top-0 bottom-0 w-px bg-white/10 z-20" />

      {/* Left Side: Immersive Brand Experience */}
      <div className="md:flex md:w-[55%] p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-emerald-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-400 rounded-full blur-[100px] opacity-10 animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[140px] opacity-10" />
        </div>
        
        {/* Grid & Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]" />

        {/* Floating Data Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: Math.random() * 100 + "%", x: Math.random() * 100 + "%" }}
              animate={{ 
                opacity: [0, 0.8, 0],
                y: ["-10%", "110%"],
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 hidden md:block"
        >
          <div className="flex items-center gap-4 mb-20">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 20px rgba(255,255,255,0.1)", "0 0 40px rgba(255,255,255,0.4)", "0 0 20px rgba(255,255,255,0.1)"],
                rotate: [6, 8, 6]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] group cursor-pointer transition-transform hover:rotate-12"
            >
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <div>
              <span className="text-4xl font-black text-white tracking-tighter uppercase italic block leading-none">Calculated</span>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mt-1 block">Prediction Terminal</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-8xl lg:text-9xl font-black text-white leading-[0.8] tracking-tighter mb-10">
              TRADE<br />
              THE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-400 to-white animate-gradient-x">TRUTH.</span>
            </h1>
            <p className="text-2xl text-white/80 max-w-lg font-medium leading-tight tracking-tight border-l-4 border-white/30 pl-6">
              The world's first decentralized intelligence layer. Predict politics, science, and culture with precision.
            </p>
          </div>
        </motion.div>

        {/* Floating Market Cards - Visual Interest */}
        <div className="absolute right-[-2%] top-[45%] -translate-y-1/2 w-80 space-y-8 hidden lg:block">
          {[
            { label: "Will AI reach AGI by 2026?", price: "64¢", trend: "+12%", color: "emerald" },
            { label: "Mars Landing Success?", price: "12¢", trend: "-4%", color: "rose" },
            { label: "Global GDP Growth > 3%?", price: "88¢", trend: "+2%", color: "emerald" }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.15), type: "spring", damping: 20 }}
              whileHover={{ x: -10, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/30 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rotate-[-3deg] cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-3">Live Market Data</div>
              <div className="text-white font-bold text-xl leading-tight mb-6 group-hover:text-white transition-colors">{card.label}</div>
              <div className="flex justify-between items-end">
                <div className="text-4xl font-black text-white tracking-tighter">{card.price}</div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${card.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {card.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 hidden md:flex items-center gap-16"
        >
          <div className="group cursor-default">
            <div className="text-6xl font-black text-white mb-1 group-hover:text-white transition-all group-hover:scale-110 origin-left">$2.4M+</div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Protocol Volume</div>
          </div>
          <div className="w-px h-16 bg-white/20" />
          <div className="group cursor-default">
            <div className="text-6xl font-black text-white mb-1 group-hover:text-white transition-all group-hover:scale-110 origin-left">12k+</div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Active Nodes</div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Auth Form with Clean White Contrast */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-white relative">
        {/* Subtle Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-50/20 blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative"
        >
          <div className="md:hidden flex items-center gap-3 mb-14">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-emerald-950 tracking-tighter uppercase italic">Calculated</span>
          </div>

          <div className="mb-14 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "60px" }}
              className="h-2 bg-emerald-600 mb-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            />
            <h2 className="text-6xl font-black text-emerald-950 mb-4 tracking-tighter leading-[0.9] uppercase">
              {isSignUp ? 'Join the\nElite.' : 'Access\nTerminal.'}
            </h2>
            <p className="text-gray-400 font-bold text-lg tracking-tight">
              {isSignUp ? 'Initialize your prediction node.' : 'Resume your market positions.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] ml-2">Node Identity</label>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-600 transition-colors w-6 h-6" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] focus:border-emerald-500/50 transition-all outline-none font-bold text-emerald-950 placeholder:text-gray-300 text-lg shadow-sm"
                  placeholder="operator@network.io"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-3">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Access Key</label>
                {!isSignUp && (
                  <button type="button" className="text-[10px] font-black text-gray-300 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                    Recovery?
                  </button>
                )}
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-600 transition-colors w-6 h-6" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] focus:border-emerald-500/50 transition-all outline-none font-bold text-emerald-950 placeholder:text-gray-300 text-lg shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 bg-white border-2 border-gray-100 rounded-[2.5rem] group hover:border-emerald-500/20 transition-all cursor-pointer shadow-sm">
              <div className="relative flex items-center">
                <input
                  id="age-check"
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="peer w-7 h-7 appearance-none border-2 border-gray-200 rounded-xl checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-default"
                />
                <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-2">
                  <svg className="w-3 h-3 fill-current stroke-white stroke-2" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                </div>
              </div>
              <label htmlFor="age-check" className="text-[11px] font-bold text-gray-400 leading-tight group-hover:text-gray-500 transition-colors">
                I verify my <span className="text-emerald-600 font-black">12+ seniority</span> and accept the protocol governance.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-black rounded-[2.5rem] shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm active:scale-[0.97] group relative overflow-hidden"
            >
              {/* Button Shimmer */}
              <motion.div
                animate={{ left: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
              />
              
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  <span className="group-hover:translate-x-1 transition-transform relative z-10">
                    {isSignUp ? 'Initialize Node' : 'Enter Terminal'}
                  </span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="group relative inline-flex flex-col items-center"
            >
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                {isSignUp ? 'Protocol Registered?' : 'New Operator?'}
              </span>
              <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-sm group-hover:text-emerald-500 transition-all group-hover:scale-110">
                {isSignUp ? 'Sign In' : 'Create Node'}
                <div className="h-1 w-full bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left mt-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
