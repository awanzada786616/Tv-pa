
import React, { useEffect, useState } from 'react';
import { SliderItem } from '../types';

interface SliderProps {
  items: SliderItem[];
  onSelect: (item: SliderItem) => void;
}

export const Slider: React.FC<SliderProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden mb-8 bg-[#000] rounded-[1.5rem] border border-white/5 shadow-2xl">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          onClick={() => onSelect(item)}
        >
          {/* Main Image - object-cover ensures full fit without cuts */}
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover z-10"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/90 via-black/20 to-transparent z-15"></div>
          
          <div className="absolute bottom-5 left-5 z-20">
             <h3 className="text-[11px] font-black text-white drop-shadow-md tracking-tight uppercase">
                {item.title}
             </h3>
          </div>
        </div>
      ))}
      
      {/* Small subtle pagination dots as seen in screenshot */}
      <div className="absolute bottom-5 right-5 z-20 flex gap-1.5 items-center">
        {items.slice(0, 12).map((_, idx) => (
          <div 
             key={idx}
             className={`h-1 w-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-red-600 scale-125' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};
