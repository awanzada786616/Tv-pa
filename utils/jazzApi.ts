import { Channel, SliderItem } from '../types';
import CryptoJS from 'crypto-js';

const API_V5_BASE = "https://web.jazztv.pk/alpha/api_gateway/v5/web/";
const API_V3_BASE = "https://web.jazztv.pk/alpha/api_gateway/v3/web/";
const PHP_GATEWAY = "https://jazztv.pk/alpha/api_gateway/index.php/media/";

// --- 1. Global Variable to store token temporarily ---
let cachedToken: string | null = null;

// --- 2. Decryption Logic (Same as before) ---
function decryptAes(text: string): any {
  if (!text || typeof text !== 'string') return null;
  const keyStr = "gTOwkDMjlDZ0EjY58GcsVWM4oGOllnd4VzN3UmZsBHc"; 
  const decodeKey = (str: string) => {
      let reversed = "";
      for (let i = str.length - 1; i >= 0; i--) reversed += str[i];
      try { return atob(reversed); } catch(e) { return ""; }
  };
  const key = decodeKey(keyStr);
  const iv = "fpmjlrbhpljoennm";
  try {
    const ct = CryptoJS.enc.Hex.parse(text);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ct }, CryptoJS.enc.Utf8.parse(key), { iv: CryptoJS.enc.Utf8.parse(iv) });
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (e) { return null; }
}

// --- 3. NEW: Automatic Guest Token Generator ---
// Ye function fake Device ID banata hai aur server se naya token mangta hai
const getAuthToken = async (): Promise<string> => {
    // Agar token pehle se memory me hai to wahi use karo
    if (cachedToken) return cachedToken;

    try {
        // Random Device ID generate karna (UUID format)
        const deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        console.log("Generating New Guest Token...");

        // Guest Login API Call (No OTP required)
        const response = await fetch(`${API_V5_BASE}auth/guest-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: deviceId,
                platform: "web"
            })
        });

        const json = await response.json();
        const data = decryptAes(json.eData);

        if (data && data.access_token) {
            cachedToken = data.access_token;
            return data.access_token;
        }
    } catch (e) {
        console.error("Auto Auth Failed:", e);
    }
    
    // Agar fail ho jaye to empty string return karo taki crash na ho
    return "";
};

// --- 4. API FUNCTIONS (Updated to use await getAuthToken()) ---

export const triggerAutoPost = async () => {
    const token = await getAuthToken(); // Get fresh token
    try {
        await fetch(`${API_V5_BASE}genre-programs-carousal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ genre_slug: 'live-tv', project_id: "2", platform: "web" })
        });
    } catch (e) { /* ignore error */ }
};

export const fetchHomeSections = async () => {
  const token = await getAuthToken(); // Get fresh token
  try {
    const response = await fetch(`${API_V5_BASE}home-programs-carousal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ user_id: "0", project_id: "2", platform: "web" })
    });
    const json = await response.json();
    const data = decryptAes(json.eData);
    
    return {
      slider: (data?.data?.slider || []).map((item: any) => ({
        id: `slide-${item.id || item.programId || Math.random()}`,
        title: item.channelName || item.name || item.title,
        thumbnail: item.image || item.thumbnail || item.poster || item.portrait_poster || "",
        slug: item.channelSlug || item.slug,
        type: item.type || 'channel'
      })),
      chunks: data?.data?.chunks || []
    };
  } catch (e) { return { slider: [], chunks: [] }; }
};

export const fetchJazzChannels = async (): Promise<Channel[]> => {
  const token = await getAuthToken(); // Get fresh token
  try {
    const response = await fetch(`${API_V3_BASE}live-tv`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ project_id: "2", platform: "web" }),
    });
    const json = await response.json();
    const data = decryptAes(json.eData);
    let channels = data?.data?.channels || [];

    if (channels.length === 0) {
        const fallback = await fetch(`${API_V5_BASE}genre-programs-carousal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ genre_slug: 'live-tv', project_id: "2", platform: "web" })
        });
        const fallbackJson = await fallback.json();
        const fallbackData = decryptAes(fallbackJson.eData);
        channels = fallbackData?.data?.programData || fallbackData?.data?.programs || [];
    }

    return channels.map((ch: any) => ({
      id: `jazz-${ch.id || ch.channelId || ch.programId}`,
      name: ch.channelName || ch.name || ch.title,
      logo: ch.logo || ch.image || ch.portrait_poster || ch.landscape_poster,
      slug: ch.channelSlug || ch.slug,
      type: 'channel'
    }));
  } catch (error) { 
    console.error("Fetch Jazz Error:", error);
    return []; 
  }
};

export const fetchGenrePrograms = async (genre: string): Promise<Channel[]> => {
    const token = await getAuthToken(); // Get fresh token
    try {
        const response = await fetch(`${API_V5_BASE}genre-programs-carousal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ genre_slug: genre, project_id: "2", platform: "web" })
        });
        const json = await response.json();
        const data = decryptAes(json.eData);
        const programs = data?.data?.programData || data?.data?.programs || [];
        return programs.map((p: any) => ({
            id: `gen-${p.slug || p.id}`,
            name: p.name || p.title || p.programName,
            logo: p.portrait_poster || p.image || p.poster || p.landscape_poster,
            slug: p.slug,
            type: p.type || 'vod'
        }));
    } catch (e) { return []; }
};

export const fetchChannelUrl = async (slug: string, type: string = 'channel'): Promise<string> => {
  // Is request ke liye usually token zaruri nahi hota, par user_id '0' (Guest) hona chahiye
  try {
    const response = await fetch(`${PHP_GATEWAY}get-channel-url`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "slug": slug,
        "phone_details": navigator.userAgent,
        "ip": "",
        "type": type === 'movie' || type === 'vod' || type === 'episode' ? 'vod' : 'channel',
        "user_id": "0", // Guest User ID
        "mobile": "0"   // Guest Mobile
      })
    });
    const json = await response.json();
    const data = decryptAes(json.eData);
    return data?.data?.ChannelStreamingUrls || data?.data?.HlsUrl || data?.ChannelStreamingUrls || data?.HlsUrl || "";
  } catch (e) { return ""; }
};