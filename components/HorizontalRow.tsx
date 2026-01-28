
import React from 'react';
import { Channel } from '../types';
import { ChevronRight } from 'lucide-react';

interface HorizontalRowProps {
  title: string;
  items: Channel[];
  onSelect: (channel: Channel) => void;
  onViewMore?: () => void;
}

export const HorizontalRow: React.FC<HorizontalRowProps> = ({ title, items, onSelect, onViewMore }) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-1 mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <button 
          onClick={onViewMore}
          className="flex items-center gap-1 text-gray-400 active:text-white transition-colors group"
        >
          <span className="text-[13px] font-semibold">View More</span>
          <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 pb-4 -mx-1 snap-x">
        {items.map((item) => {
          const isCoke = item.name.toLowerCase().includes('coke') || title.toLowerCase().includes('coke');
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex-none w-[130px] snap-start group relative"
            >
              <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/5 shadow-2xl group-active:scale-95 transition-all">
                {item.logo ? (
                  <img 
                    src={item.logo} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] font-black uppercase text-gray-600 bg-gray-900">
                    {item.name}
                  </div>
                )}
                
                {/* Visual badge similar to screenshot for Coke Studio items */}
                {isCoke && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] bg-white rounded-full py-1 shadow-lg">
                      <p className="text-[8px] font-black text-red-600 uppercase tracking-tighter text-center">Season 15</p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] font-bold text-gray-300 truncate text-left tracking-tight group-hover:text-white transition-colors px-1">
                 {item.name.replace('Coke Studio | ', '').replace('Coke Studio Season 15 - ', '')}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
