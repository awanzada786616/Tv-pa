import React, { useState, useEffect, useRef } from 'react';
import { Channel, SliderItem } from './types';
import { fetchJazzChannels, fetchHomeSections, fetchGenrePrograms, triggerAutoPost } from './utils/jazzApi';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { Slider } from './components/Slider';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { HomeHeader } from './components/HomeHeader';
import { HorizontalRow } from './components/HorizontalRow';
import { WhatsNewModal } from './components/WhatsNewModal';
import { 
  MessageCircle, Send, Zap, ShieldAlert, Crown
} from 'lucide-react';

interface HomeSection {
    title: string;
    items: Channel[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies' | 'premium'>('home');
  const mainRef = useRef<HTMLElement>(null);
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [movies, setMovies] = useState<Channel[]>([]);
  const [sports, setSports] = useState<Channel[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const premiumSports: Channel[] = [
    {
      id: 'ext-star-sports',
      name: 'Star Sports',
      url: 'https://tvsen5.aynaott.com/c9EpzZ6fQBJ3/tracks-v1a1/mono.ts.m3u8',
      logo: 'https://i.postimg.cc/zvC2qVRx/IMG-20251227-WA0011.jpg',
      type: 'channel'
    },
    {
      id: 'ext-willow-hd',
      name: 'Willow HD',
      url: 'https://tvsen5.aynaott.com/willowhd/tracks-v1a1/mono.ts.m3u8',
      logo: 'https://i.postimg.cc/xTrSYzBH/IMG-20251227-WA0010.jpg',
      type: 'channel'
    }
  ];

  useEffect(() => {
    const runSecurityCheck = async () => {
        // 1. Timezone Check (Pakistan Only)
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        
        if (timeZone !== 'Asia/Karachi' && !isLocal) {
            setSecurityError("VPN DETECTED! Access is restricted to Pakistan region.");
            return;
        }

        // 2. IP Geolocation & Proxy Check
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            
            if (!isLocal) {
                if (data.country_code !== 'PK') {
                    setSecurityError(`REGIONAL LOCK: Access from ${data.country_name} is prohibited. Disable VPN.`);
                    return;
                }
                if (data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
                    setSecurityError("SECURITY RISK: Proxy or VPN tunnel detected.");
                    return;
                }
            }
        } catch (e) {
            console.debug("Geo-check connectivity issue.");
        }

        // 3. Debugger & HTTP Canary Detection
        const detectSniffers = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                setSecurityError("TAMPER ALERT: Sniffing tool (HTTP Canary/DevTools) detected.");
            }
        };
        const securityInterval = setInterval(detectSniffers, 2000);

        // 4. Disable Inspection Keys
        const blockInspector = (e: KeyboardEvent) => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) {
                e.preventDefault();
                return false;
            }
        };
        const blockRightClick = (e: MouseEvent) => e.preventDefault();

        window.addEventListener('keydown', blockInspector);
        window.addEventListener('contextmenu', blockRightClick);

        return () => {
            clearInterval(securityInterval);
            window.removeEventListener('keydown', blockInspector);
            window.removeEventListener('contextmenu', blockRightClick);
        };
    };

    runSecurityCheck();
  }, []);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    loadInitialData();
    const splashTimer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(splashTimer);
  }, []);

  const formatPrograms = (programs: any[]): Channel[] => {
    return (programs || []).map((p: any) => ({
        id: `pg-${p.slug || p.programId || p.id || Math.random()}`,
        name: p.programName || p.program_name || p.name || p.title || "Untitled Program", 
        logo: p.portrait_poster || p.image || p.poster || p.landscape_poster,
        slug: p.slug,
        type: p.type || 'vod'
    }));
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const homeData = await fetchHomeSections();
      setSliderItems(homeData.slider || []);
      const chunks = homeData.chunks || [];
      
      let allSections: HomeSection[] = [];
      let tempMovies: Channel[] = [];
      let tempSports: Channel[] = [];

      chunks.forEach((chunk: any) => {
          const name = chunk.categoryName || "Featured";
          const progs = chunk.programs || chunk.programData || [];
          const formatted = formatPrograms(progs);
          
          if (formatted.length > 0) {
              const lowerName = name.toLowerCase();
              allSections.push({ title: name, items: formatted });

              if (lowerName.includes('movie') || lowerName.includes('dubbed')) {
                  tempMovies = [...tempMovies, ...formatted];
              }
              if (lowerName.includes('sport') || lowerName.includes('cricket')) {
                  tempSports = [...tempSports, ...formatted];
              }
          }
      });

      if (tempMovies.length < 5) {
          const fetchedMovies = await fetchGenrePrograms('urdu-dubbed-movies');
          tempMovies = [...tempMovies, ...fetchedMovies];
      }
      if (tempSports.length < 3) {
          const fetchedSports = await fetchGenrePrograms('sports');
          tempSports = [...tempSports, ...fetchedSports];
      }

      setHomeSections(allSections);
      setMovies(tempMovies);
      setSports(tempSports);
      
      const tvData = await fetchJazzChannels();
      setChannels(tvData);
    } catch (e) { 
        console.error("Load Error", e); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleSelectChannel = (channel: Channel) => {
    triggerAutoPost();
    setCurrentChannel(channel);
  };

  if (securityError) {
    return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-red-600/10 p-6 rounded-full border border-red-600/30">
                    <ShieldAlert className="w-20 h-20 text-red-600" />
                </div>
            </div>
            <h1 className="text-4xl font-[1000] text-white mb-4 tracking-tighter uppercase italic">
                <span className="text-red-600">Access</span> Locked
            </h1>
            <div className="max-w-xs space-y-4">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">
                    {securityError}
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent w-full"></div>
                <p className="text-gray-600 text-[9px] uppercase font-black tracking-widest">
                    Detection System v3.0 Active
                </p>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="mt-10 px-10 py-3.5 bg-red-600 text-white font-black rounded-full text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-red-600/20"
            >
                Retry Connection
            </button>
        </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col">
      {showSplash && <SplashScreen />}
      {showUpdateModal && <WhatsNewModal onClose={() => setShowUpdateModal(false)} />}

      <div className="z-30 bg-[#0a0a0a]/95 backdrop-blur-md flex-none pt-4 pb-2">
          <header className="flex justify-center">
             <div className="flex items-center gap-2 px-8 py-1.5 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg shadow-red-900/40 active:scale-95 transition-all cursor-pointer" onClick={() => setActiveTab('tv')}>
                <Zap className="w-4 h-4 text-white fill-white" />
                <span className="text-xs font-black text-white uppercase tracking-tight">Waisi TV</span>
             </div>
          </header>
      </div>

      <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-7xl mx-auto px-3">
            {isLoading && !showSplash ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                    <h2 className="text-5xl font-black italic text-red-600 mb-4 tracking-tighter">WAISI</h2>
                    <div className="w-32 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 animate-[loading-bar_2s_infinite]"></div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'home' && (
                        <div className="flex flex-col">
                            <HomeHeader />
                            {sliderItems.length > 0 && <Slider items={sliderItems} onSelect={(i) => handleSelectChannel({ id: i.id, name: i.title, slug: i.slug, type: i.type, logo: i.thumbnail })} />}
                            
                            <div className="px-1 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                                    <Zap className="w-4 h-4 text-red-600" />
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Live Sports</h2>
                                </div>
                                <ChannelList channels={sports.slice(0, 12)} onSelectChannel={handleSelectChannel} columns={4} className="pb-0" />
                            </div>

                            {homeSections.map((section, idx) => (
                                <HorizontalRow 
                                    key={idx}
                                    title={section.title} 
                                    items={section.items} 
                                    onSelect={handleSelectChannel}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'premium' && (
                        <div className="pt-6">
                             <div className="flex items-center flex-col gap-2 mb-10 px-4 text-center">
                                <div className="bg-yellow-500/20 p-4 rounded-full border border-yellow-500/30 mb-2 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                    <Crown className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-3xl font-[1000] italic text-white uppercase tracking-tighter">Premium Menu</h2>
                                <p className="text-yellow-500/70 text-[10px] font-black uppercase tracking-[0.3em]">VIP High Bitrate Streams</p>
                             </div>
                             <ChannelList channels={premiumSports} onSelectChannel={handleSelectChannel} isMovie={false} columns={2} />
                        </div>
                    )}

                    {activeTab === 'movies' && (
                        <div className="pt-4">
                             <div className="flex items-center gap-3 mb-6 px-1">
                                <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Latest Movies</h2>
                             </div>
                             <ChannelList channels={movies} onSelectChannel={handleSelectChannel} isMovie={true} columns={3} />
                        </div>
                    )}

                    {activeTab === 'tv' && (
                        <div className="pt-4">
                             <div className="flex items-center gap-3 mb-6 px-1">
                                <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Live Channels</h2>
                             </div>
                             <ChannelList channels={channels} onSelectChannel={handleSelectChannel} isMovie={false} columns={3} />
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {currentChannel && <VideoPlayer url={currentChannel.url} slug={currentChannel.slug} type={currentChannel.type} onClose={() => setCurrentChannel(null)} />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'home' && (
        <div className="fixed bottom-28 right-4 flex flex-col gap-4 z-40">
             <a href="https://t.me/aloneboywasi" target="_blank" rel="noreferrer" className="bg-[#0088cc] text-white p-3.5 rounded-full shadow-2xl active:scale-90 transition-all">
               <Send className="w-6 h-6" />
             </a>
             <a href="https://wa.me/923342002756" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl active:scale-90 transition-all">
               <MessageCircle className="w-6 h-6" />
             </a>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />
    </div>
  );
};

export default App;