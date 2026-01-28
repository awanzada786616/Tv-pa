
import React from 'react';
import { Tv, Home, Clapperboard, Crown, LucideIcon } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'tv' | 'movies' | 'premium';
  onTabChange: (tab: 'home' | 'tv' | 'movies' | 'premium') => void;
}

interface NavButtonProps {
  id: 'home' | 'tv' | 'movies' | 'premium';
  activeTab: string;
  label: string;
  Icon: LucideIcon;
  colorClass: string;
  glowClass: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ id, activeTab, label, Icon, colorClass, glowClass, onClick }) => {
  const isActive = activeTab === id;
  
  return (
    <button 
       onClick={onClick}
       className={`relative z-10 flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-500 transform 
       ${isActive ? `scale-125 -translate-y-2 ${colorClass}` : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className="relative">
         <Icon className={`w-6 h-6 transition-all duration-500 
           ${isActive ? `${colorClass} fill-current drop-shadow-[0_0_12px_rgba(239,68,68,1)] animate-icon-float` : 'text-gray-500'}`} 
           style={isActive && id === 'premium' ? { filter: 'drop-shadow(0 0 12px rgba(234,179,8,1))' } : {}}
         />
         {isActive && (
            <div className={`absolute inset-0 blur-xl animate-pulse rounded-full ${id === 'premium' ? 'bg-yellow-400/20' : 'bg-red-600/20'}`}></div>
         )}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? colorClass : 'text-gray-500'}`}>
        {label}
      </span>
      
      {/* Animated Ping Ring */}
      {isActive && (
        <div className={`absolute inset-0 rounded-2xl border animate-ping-slow pointer-events-none ${id === 'premium' ? 'border-yellow-500/30' : 'border-red-600/30'}`}></div>
      )}
      
      {/* Pulsing Dot */}
      {isActive && (
        <div className={`absolute -top-1 right-2 w-2 h-2 rounded-full animate-pulse shadow-lg ${id === 'premium' ? 'bg-yellow-400 shadow-yellow-500/50' : 'bg-red-500 shadow-red-600/50'}`}></div>
      )}
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 py-3 pb-8 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2 relative">
        
        {/* Animated Background Indicator */}
        <div 
          className="absolute h-full transition-all duration-500 ease-out z-0 rounded-2xl bg-white/5"
          style={{
            width: '20%',
            left: activeTab === 'home' ? '2.5%' : activeTab === 'tv' ? '27.5%' : activeTab === 'premium' ? '52.5%' : '77.5%',
            opacity: 0.5
          }}
        />

        <NavButton 
          id="home" 
          activeTab={activeTab} 
          label="Home" 
          Icon={Home} 
          colorClass="text-red-500" 
          glowClass="bg-red-600/20"
          onClick={() => onTabChange('home')} 
        />

        <NavButton 
          id="tv" 
          activeTab={activeTab} 
          label="Tv" 
          Icon={Tv} 
          colorClass="text-red-500" 
          glowClass="bg-red-600/20"
          onClick={() => onTabChange('tv')} 
        />

        <NavButton 
          id="premium" 
          activeTab={activeTab} 
          label="Premium" 
          Icon={Crown} 
          colorClass="text-yellow-500" 
          glowClass="bg-yellow-400/20"
          onClick={() => onTabChange('premium')} 
        />

        <NavButton 
          id="movies" 
          activeTab={activeTab} 
          label="Movies" 
          Icon={Clapperboard} 
          colorClass="text-red-500" 
          glowClass="bg-red-600/20"
          onClick={() => onTabChange('movies')} 
        />

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-icon-float {
          animation: icon-float 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
};
