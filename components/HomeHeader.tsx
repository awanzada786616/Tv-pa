
import React from 'react';
import { Sun, Moon, Sunrise, MoonStar } from 'lucide-react';

export const HomeHeader: React.FC = () => {
  const pkTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
  const hour = pkTime.getHours();
  
  let greeting = "Good Morning";
  let Icon = Sunrise;
  
  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    Icon = Sun;
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
    Icon = Moon;
  } else if (hour >= 21 || hour < 5) {
    greeting = "Good Night";
    Icon = MoonStar;
  }

  const dateStr = pkTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long',
    day: 'numeric', 
  }).toUpperCase();

  return (
    <div className="px-1 py-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
      <div className="flex items-center gap-4">
          <div className="bg-red-600/15 p-2.5 rounded-full border border-red-600/20">
              <Icon className="w-7 h-7 text-red-600" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">
                  {greeting}
              </h1>
              <span className="text-gray-500 font-bold text-[9px] tracking-[0.1em] uppercase">
                  {dateStr}
              </span>
          </div>
      </div>
    </div>
  );
};
