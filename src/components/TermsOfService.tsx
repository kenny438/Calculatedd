import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, Scale, UserX, Clock, ArrowLeft } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-black text-emerald-600 hover:text-emerald-700 transition-all mb-8 uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] border border-emerald-100 p-12 shadow-xl shadow-emerald-200/20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Scale className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
            <p className="text-emerald-600/60 font-bold uppercase tracking-[0.2em] text-xs mt-1">Last Updated: February 2026</p>
          </div>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">1. Age Requirement & Eligibility</h2>
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 mb-4">
              <p className="text-red-900 font-bold mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                CRITICAL NOTICE: MINIMUM AGE REQUIREMENT
              </p>
              <p className="text-red-800/80 text-sm">
                You MUST be at least 12 years of age to use Calculated. If you are under the age of 12, you are strictly prohibited from creating an account or accessing any part of the service.
              </p>
            </div>
            <p>
              Calculated is designed for users who have reached a level of maturity to understand the risks and mechanics of prediction markets. Users under 12 years old lack the legal capacity and cognitive development required to navigate the complexities of our platform. We take this requirement seriously to ensure a safe environment for our community.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">2. Why the 12+ Restriction?</h2>
            <p className="mb-4">
              Our 12-year-old age limit is not arbitrary. It is based on several key factors:
            </p>
            <ul className="list-disc pl-5 space-y-3 font-medium">
              <li><span className="text-gray-900 font-bold">Data Privacy (COPPA):</span> We comply with international data protection laws that restrict the collection of personal information from children under 13.</li>
              <li><span className="text-gray-900 font-bold">Risk Management:</span> Prediction markets involve analyzing complex data and understanding probability. Research suggests that cognitive abilities for these tasks mature significantly around age 12.</li>
              <li><span className="text-gray-900 font-bold">Community Safety:</span> Calculated is a social platform. Maintaining an age floor helps us foster a more mature and responsible community interaction.</li>
            </ul>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">3. Account Termination</h2>
            <p>
              If we discover that an account has been created by a user under the age of 12, we will immediately terminate the account and delete all associated data without prior notice. We reserve the right to request proof of age at any time if we have reason to believe a user is underage.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">4. Boring Legal Stuff</h2>
            <p className="text-sm italic opacity-70">
              By using Calculated, you agree that you are not a tiny child. You agree that you will not lie about your age. You agree that if you are caught being 11 years old, you will accept your ban with dignity. We are not responsible for your tears if your account is deleted because you were born in 2015 or later.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-10 border-t border-emerald-50 text-center">
          <p className="text-xs font-black text-emerald-600/40 uppercase tracking-[0.3em]">
            CALCULATED &bull; AN APP BY BUSSIN INDUSTRIES ↈ∭ &bull; &copy; 2026
          </p>
        </div>
      </div>
    </motion.div>
  );
}
