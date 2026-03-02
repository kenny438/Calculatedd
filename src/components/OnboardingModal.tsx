import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../data/mockData";
import { useToast } from "./ui/Toast";
import { CheckCircle, User, FileText, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  onComplete: (profileData: Partial<UserProfile>) => void;
  initialEmail: string;
}

export function OnboardingModal({ onComplete, initialEmail }: OnboardingModalProps) {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isOver12, setIsOver12] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      addToast("Please enter a username", "error");
      return;
    }
    
    if (!isOver12) {
      addToast("You must be over 12 years old to use this platform", "error");
      return;
    }

    onComplete({
      username,
      bio,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center relative"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
            
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-12 h-12 text-emerald-600" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-gray-900 mb-1 tracking-tight"
            >
              Welcome to <span className="text-emerald-600">Calculated</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[9px] font-black text-emerald-600/40 uppercase tracking-[0.3em] mb-6"
            >
              An app by BUSSIN INDUSTRIES ↈ∭
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 mb-8 text-lg leading-relaxed"
            >
              The next generation of prediction markets. <br/> Trade on your beliefs.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep('form')}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gray-50 p-8 border-b border-gray-100 text-center">
              <h2 className="text-xl font-bold text-gray-900">Create your Profile</h2>
              <p className="text-gray-500 text-sm mt-1">Tell us a bit about yourself</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                    placeholder="CryptoKing"
                    maxLength={20}
                    autoFocus
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Bio (Optional)</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors w-5 h-5" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 transition-all outline-none resize-none h-32"
                    placeholder="Tell us a bit about yourself..."
                    maxLength={160}
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100"
              >
                <div className="flex items-center h-6">
                  <input
                    id="age-verification"
                    type="checkbox"
                    checked={isOver12}
                    onChange={(e) => setIsOver12(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="age-verification" className="text-sm text-gray-600 cursor-pointer select-none">
                  I certify that I am at least <span className="font-bold text-gray-900">12 years of age</span> and agree to the <button type="button" className="text-emerald-600 font-bold hover:underline">Terms of Service</button>.
                </label>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-lg"
              >
                Complete Setup
                <CheckCircle className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
