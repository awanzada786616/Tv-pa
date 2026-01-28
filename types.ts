export interface Channel {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  image?: string; // For movies/slider
  group?: string;
  slug?: string;
  type?: string; // 'channel' | 'vod' | 'episode'
}

export interface SliderItem {
  id: string;
  title: string;
  thumbnail: string;
  slug: string;
  type: string;
}

export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  name: string;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  currentQuality: number;
  levels: QualityLevel[];
}