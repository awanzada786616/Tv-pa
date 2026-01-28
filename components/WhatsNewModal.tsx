
import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check } from 'lucide-react';

interface WhatsNewModalProps {
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to let the app settle
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('hideWhatsNew_v1.1', 'true');
    onClose();
  };

  const updates = [
    "Removed Movies from Home for a cleaner browsing experience.",
    "Enlarged Sports Section cards for better channel visibility.",
    "Smart Scrolling: Names only move if they are too long to fit.",
    "Optimized Jazz TV streaming gateway for faster loading.",
    "Enhanced UI with smoother transitions and dark mode refinements."
  ];

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className={`relative bg-[#111111] w-full max-w-md rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,45,45,0.2)] overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-600/20 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">What's New!</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Version 1.1 Update</p>
            </div>
            <button onClick={onClose} className="ml-auto p-2 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {updates.map((update, idx) => (
              <div key={idx} className="flex gap-3 group">
                <div className="mt-1 flex-shrink-0">
                  <div className="bg-red-600 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors leading-snug">
                  {update}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 transition-all active:scale-95"
            >
              Got It!
            </button>
            <button 
              onClick={handleDontShowAgain}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
