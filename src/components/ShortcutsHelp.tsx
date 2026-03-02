import React from "react";
import { X, Command, Search, Trophy, LineChart, Activity, Briefcase, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const shortcuts = [
    { key: "/", label: "Search", icon: <Search className="w-4 h-4" /> },
    { key: "M", label: "Markets", icon: <LineChart className="w-4 h-4" /> },
    { key: "L", label: "Live", icon: <Activity className="w-4 h-4" /> },
    { key: "P", label: "Portfolio", icon: <Briefcase className="w-4 h-4" /> },
    { key: "C", label: "Create Party", icon: <Trophy className="w-4 h-4" /> },
    { key: "Esc", label: "Close Modal", icon: <XCircle className="w-4 h-4" /> },
    { key: "?", label: "Show Shortcuts", icon: <Command className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Command className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Keyboard Shortcuts</h3>
                  <p className="text-xs text-gray-500 font-medium">Power up your workflow</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                {shortcuts.map((shortcut) => (
                  <div 
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900 font-medium">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        {shortcut.icon}
                      </div>
                      {shortcut.label}
                    </div>
                    <kbd className="px-3 py-1.5 bg-gray-100 border-b-2 border-gray-200 rounded-lg text-xs font-black text-gray-500 min-w-[2rem] text-center font-mono group-hover:bg-white group-hover:border-gray-200 group-hover:shadow-sm transition-all">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold mx-1">?</kbd> to toggle this menu anytime
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
