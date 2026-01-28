
import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldExit(true), 4800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center transition-opacity duration-1000 ${shouldExit ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Cinematic Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_70%)] animate-pulse"></div>

      {/* Main Logo Container */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Subtle reflection/glow behind text */}
          <div className="absolute -inset-4 bg-red-600/20 blur-3xl rounded-full animate-pulse"></div>
          
          <h1 className="relative text-7xl md:text-9xl font-[1000] italic tracking-tighter text-red-600 animate-[cinematic-in_3.5s_ease-out_forwards]">
            WAISI
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="mt-2 overflow-hidden">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 animate-[slide-up_2s_ease-out_0.5s_both]">
             Premium Streaming
           </p>
        </div>
      </div>

      {/* Synchronized Loading Bar */}
      <div className="absolute bottom-24 flex flex-col items-center gap-3">
        <div className="w-40 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 animate-[loading-fill_4s_ease-in-out_forwards]"></div>
        </div>
        <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">
            Initializing System
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cinematic-in {
          0% { transform: scale(0.9); opacity: 0; filter: blur(20px); letter-spacing: -0.05em; }
          20% { opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.05); opacity: 1; letter-spacing: -0.02em; }
        }
        @keyframes loading-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};
