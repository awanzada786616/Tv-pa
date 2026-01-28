
import React, { useEffect, useRef } from 'react';
import { Channel } from '../types';

interface ChannelListProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  className?: string;
  isMovie?: boolean;
  columns?: number;
}

export const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  onSelectChannel, 
  className, 
  isMovie = false,
  columns = 3
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    const elements = document.querySelectorAll('.channel-card-anim');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [channels]);

  // Dynamic sizing based on columns
  const isFourCol = columns === 4;
  const gridCols = isFourCol ? 'grid-cols-4' : 'grid-cols-3';
  const gapSize = isFourCol ? 'gap-1.5' : 'gap-3';
  const cardPadding = isFourCol ? 'p-1.5' : 'p-3';
  const titleHeight = isFourCol ? 'h-6' : 'h-8';
  const textSize = isFourCol ? 'text-[7px]' : 'text-[9px]';

  return (
    <div className={`grid ${gridCols} ${gapSize} px-1 ${className || 'pb-32'}`}>
      {channels.map((channel, index) => {
        return (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className={`channel-card-anim group flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg active:scale-95 transition-all duration-300 opacity-0 translate-y-4 ${isMovie ? 'aspect-[2/3]' : 'aspect-[1/1.35]'}`}
            style={{ transitionDelay: `${(index % 12) * 30}ms` }} 
          >
            {/* Logo/Poster Container - object-contain ensures no cuts */}
            <div className={`flex-1 w-full flex items-center justify-center ${cardPadding} bg-white overflow-hidden`}>
               {channel.logo ? (
                 <img 
                   src={channel.logo} 
                   alt={channel.name} 
                   className="w-full h-full object-contain" 
                   loading="lazy"
                 />
               ) : (
                 <div className={`flex items-center justify-center h-full w-full font-black text-gray-300 uppercase px-1 text-center ${textSize}`}>
                   {channel.name}
                 </div>
               )}
            </div>

            {/* Title Section */}
            <div className={`w-full ${titleHeight} flex items-center justify-center px-1 bg-white border-t border-gray-50`}>
                <h3 className={`${textSize} font-bold text-gray-800 uppercase text-center leading-tight line-clamp-1 w-full px-1`}>
                    {channel.name}
                </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
};
