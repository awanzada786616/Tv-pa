
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Settings, ArrowLeft, 
  Volume2, VolumeX, AlertTriangle
} from 'lucide-react';
import { QualityLevel } from '../types';
import { fetchChannelUrl } from '../utils/jazzApi';

interface VideoPlayerProps {
  url?: string;
  slug?: string;
  type?: string;
  autoPlay?: boolean;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, slug, type, autoPlay = true, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [state, setState] = useState({
    isPlaying: false,
    isLoading: true,
    levels: [] as QualityLevel[],
    currentQuality: -1,
    showControls: true,
    error: null as string | null,
    volume: 1,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    aspectRatio: 'contain' as 'contain' | 'cover' | 'fill'
  });

  const [isPortrait, setIsPortrait] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const isChannel = type === 'channel' || !type;

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (state.isPlaying && !showQualityMenu) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, 3500);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [state.isPlaying, showQualityMenu]);

  const toggleControls = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent toggling if clicking specific control elements
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    setState(prev => ({ ...prev, showControls: !prev.showControls }));
    if (showQualityMenu) setShowQualityMenu(false);
  };

  const safePlay = async (video: HTMLVideoElement) => {
    try {
      await video.play();
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        video.muted = true;
        setState(prev => ({ ...prev, isMuted: true }));
        try { await video.play(); } catch (e) {}
      }
    }
  };

  useEffect(() => {
    let hls: Hls | null = null;
    let isActive = true;
    const video = videoRef.current;
    if (!video) return;

    const initStream = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        let playUrl = url;
        try {
            if (!playUrl && slug) {
                playUrl = await fetchChannelUrl(slug, type || 'channel');
            }
            if (!playUrl || !isActive) {
                if (!playUrl) setState(prev => ({ ...prev, error: "Stream link unavailable.", isLoading: false }));
                return;
            }

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    maxBufferLength: 20,
                    autoStartLoad: true,
                });
                hlsRef.current = hls;
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (isActive && video) {
                        setState(prev => ({ ...prev, isLoading: false }));
                        safePlay(video);
                    }
                });
                hls.on(Hls.Events.LEVEL_LOADED, (_: any, data: any) => {
                    if (!isActive) return;
                    const levels: QualityLevel[] = data.levels?.map((level: any, index: number) => ({
                        index,
                        height: level.height,
                        name: level.height ? `${level.height}p` : `Auto`,
                    })) || [];
                    setState(prev => ({ ...prev, levels }));
                });
                hls.on(Hls.Events.LEVEL_SWITCHED, (_: any, data: any) => {
                    setState(prev => ({ ...prev, currentQuality: data.level }));
                });
                hls.on(Hls.Events.ERROR, (_: any, data: any) => {
                    if (data.fatal && isActive) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad();
                        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError();
                        else setState(prev => ({ ...prev, error: "Stream error.", isLoading: false }));
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
                video.addEventListener('loadedmetadata', () => {
                    if (isActive) {
                        setState(prev => ({ ...prev, isLoading: false }));
                        safePlay(video);
                    }
                });
            }
        } catch (err: any) {
            if (isActive) setState(prev => ({ ...prev, error: "Connection failed", isLoading: false }));
        }
    };

    const onPlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    initStream();
    return () => {
      isActive = false;
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      if (hls) hls.destroy();
      if (video) { video.pause(); video.src = ""; }
    };
  }, [url, slug, type]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (state.isPlaying) { videoRef.current.pause(); } else { safePlay(videoRef.current); }
    resetControlsTimeout();
  };

  const containerStyle: React.CSSProperties = isPortrait
    ? { position: 'fixed', top: '50%', left: '50%', width: '100vh', height: '100vw', transform: 'translate(-50%, -50%) rotate(90deg)', zIndex: 100, backgroundColor: 'black' }
    : { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, backgroundColor: 'black' };

  return (
    <div 
      style={containerStyle} 
      className="group overflow-hidden cursor-pointer" 
      onClick={toggleControls}
    >
      <video ref={videoRef} className={`w-full h-full object-${state.aspectRatio} bg-black`} playsInline crossOrigin="anonymous" />
      
      {/* WATERMARK LOGO */}
      <div className={`absolute top-8 left-24 z-10 flex flex-col items-start transition-all duration-700 pointer-events-none ${state.showControls ? 'opacity-100' : 'opacity-40 -translate-y-2'}`}>
          <div className="flex items-center gap-2">
              <h2 className="text-4xl font-[1000] italic text-white tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.7)] select-none">
                <span className="text-red-600">W</span>AISI
              </h2>
              {isChannel && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded shadow-lg">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">LIVE HD</span>
                  </div>
              )}
          </div>
      </div>

      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 pointer-events-none">
           <div className="flex flex-col items-center">
              <h2 className="text-5xl font-black italic text-red-600 mb-4 tracking-tighter">WAISI</h2>
              <div className="w-32 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-[loading-bar_2s_infinite]"></div>
              </div>
           </div>
        </div>
      )}

      {state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[60] p-6 text-center pointer-events-auto">
          <AlertTriangle className="w-10 h-10 text-red-600 mb-4" />
          <p className="text-gray-400 text-xs mb-6 uppercase font-bold tracking-widest">{state.error}</p>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-8 py-3 bg-red-600 text-white font-black rounded-full text-[10px] uppercase tracking-widest active:scale-95 transition-all">Close Player</button>
        </div>
      )}

      {/* CONTROLS OVERLAY */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-20 transition-all duration-500 ${state.showControls ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`} 
      >
        <div className="flex justify-between items-center p-8">
           <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-90 transition-all">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <button onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }} className={`p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-90 transition-all ${showQualityMenu ? 'text-red-500 border-red-500/30' : ''}`}>
             <Settings className="w-6 h-6" />
           </button>
        </div>

        {showQualityMenu && (
           <div className="absolute top-24 right-8 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden z-50 w-56 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
             <div className="px-5 py-3 border-b border-white/5"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quality</span></div>
             <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                {[{index: -1, name: 'Auto'}, ...state.levels].map((l) => (
                    <button key={l.index} onClick={() => { if(hlsRef.current) { hlsRef.current.currentLevel = l.index; setState(p => ({...p, currentQuality: l.index})); } setShowQualityMenu(false); }} className={`w-full text-left px-5 py-4 text-[10px] font-black border-b border-white/5 last:border-0 uppercase transition-colors ${state.currentQuality === l.index ? 'text-red-500 bg-red-600/10' : 'text-gray-300 hover:bg-white/5'}`}>{l.name}</button>
                ))}
             </div>
           </div>
        )}

        <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
           <div className="flex items-center gap-10">
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="active:scale-90 transition-all transform hover:scale-110">
                {state.isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-1" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); if(videoRef.current) videoRef.current.muted = !state.isMuted; setState(p => ({...p, isMuted: !p.isMuted})); }} className="active:scale-90 transition-all">
                {state.isMuted ? <VolumeX className="w-7 h-7 text-red-500" /> : <Volume2 className="w-7 h-7" />}
              </button>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); setState(p => ({...p, aspectRatio: p.aspectRatio === 'contain' ? 'cover' : p.aspectRatio === 'cover' ? 'fill' : 'contain'})) }} 
             className="text-[10px] font-black border border-white/20 px-5 py-2.5 rounded-2xl uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all"
           >
             {state.aspectRatio} Mode
           </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />
    </div>
  );
};
