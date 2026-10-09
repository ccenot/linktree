import { useState, useEffect } from 'react';
import { BUILD_VERSION } from './version';
import { createClient } from '@supabase/supabase-js';
import SpinWheel from './SpinWheel';
import JoinNetwork from './JoinNetwork';
import DonatePage from './DonatePage';
import OverlayPage from './OverlayPage';
import AdminDonations from './AdminDonations';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Custom inline SVG Icons for maximum compatibility and speed
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"></path>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"></path>
  </svg>
);

const DiscordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.71,1.63,1.4,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129,54.65,123.48,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const CoffeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
    <line x1="6" y1="2" x2="6" y2="4"></line>
    <line x1="10" y1="2" x2="10" y2="4"></line>
    <line x1="14" y1="2" x2="14" y2="4"></line>
  </svg>
);

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
    <path d="M12 2a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5v14"></path>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const DragIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'grab', opacity: 0.4 }}>
    <circle cx="9" cy="5" r="1"></circle>
    <circle cx="9" cy="12" r="1"></circle>
    <circle cx="9" cy="19" r="1"></circle>
    <circle cx="15" cy="5" r="1"></circle>
    <circle cx="15" cy="12" r="1"></circle>
    <circle cx="15" cy="19" r="1"></circle>
  </svg>
);

const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const getIconComponent = (type) => {
  if (!type) return <GlobeIcon />;
  if (type.startsWith('http://') || type.startsWith('https://')) {
    return <img src={type} alt="custom-icon" style={{ width: '20px', height: '20px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />;
  }
  if (type.trim().startsWith('<svg')) {
    return <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: type }} />;
  }
  switch (type) {
    case 'globe': return <GlobeIcon />;
    case 'sparkles': return <SparklesIcon />;
    case 'discord': return <DiscordIcon />;
    case 'coffee': return <CoffeeIcon />;
    case 'doc': return <DocIcon />;
    case 'cart': return <CartIcon />;
    case 'book': return <BookIcon />;
    case 'trophy': return <TrophyIcon />;
    case 'tiktok': return <TiktokIcon />;
    default: return <GlobeIcon />;
  }
};

const DEFAULT_BIO_LINKS = [
  { title: 'webstore (soon)', url: 'https://toko.notnot.store', iconType: 'cart' },
  { title: 'MANGA', url: 'https://baca.notnot.store', iconType: 'book' },
  { title: 'PIALA DUNIA', url: 'https://bola.notnot.store', iconType: 'trophy' },
  { title: 'TikTok', url: 'https://www.tiktok.com/@ccenot', iconType: 'tiktok' },
  { title: 'Donasi', url: '/donate', iconType: 'coffee' },
  { title: 'Discord', url: 'https://tr.ee/sans', iconType: 'discord' },
  { title: 'SPIN', url: '/spin', iconType: 'sparkles' },
];

const DEFAULT_WEB_LINKS = [
  { title: 'Donasi', url: '/donate', iconType: 'coffee' },
  { title: 'Discord', url: 'https://tr.ee/sans', iconType: 'discord' },
  { title: 'SPIN', url: '/spin', iconType: 'sparkles' },
];

// Helper to parse links from DB/storage with backward compatibility
const parseRawLinks = (raw) => {
  if (!raw) return { bioLinks: DEFAULT_BIO_LINKS, webLinks: DEFAULT_WEB_LINKS };

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      bioLinks: Array.isArray(raw.bioLinks) ? raw.bioLinks : DEFAULT_BIO_LINKS,
      webLinks: Array.isArray(raw.webLinks) ? raw.webLinks : DEFAULT_WEB_LINKS,
    };
  }

  if (Array.isArray(raw)) {
    const hasTabProp = raw.some(item => item.tab || item.category);
    if (hasTabProp) {
      const bio = raw.filter(item => item.tab === 'bio' || item.category === 'bio' || (!item.tab && !item.category));
      const web = raw.filter(item => item.tab === 'web' || item.category === 'web');
      return {
        bioLinks: bio.length > 0 ? bio : DEFAULT_BIO_LINKS,
        webLinks: web.length > 0 ? web : DEFAULT_WEB_LINKS,
      };
    } else {
      return {
        bioLinks: raw.length > 0 ? raw : DEFAULT_BIO_LINKS,
        webLinks: DEFAULT_WEB_LINKS,
      };
    }
  }

  return { bioLinks: DEFAULT_BIO_LINKS, webLinks: DEFAULT_WEB_LINKS };
};

// SHA-256 Hashing helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function App() {
  // --- CLIENT ROUTING ---
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // --- AUTO RELOAD CACHE/VERSION CHECK ---
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.version && data.version !== BUILD_VERSION) {
            console.log('New version detected! Reloading page to clear cache...');
            window.location.reload(true);
          }
        }
      } catch (err) {
        console.error('Failed to check app version:', err);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check when user switches tabs/focuses back
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodically check every 2 minutes
    const intervalId = setInterval(checkVersion, 120000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // --- STATE ---
  const [profileName, setProfileName] = useState(() => localStorage.getItem('shinigami_profileName') || 'CENOT');
  const [profileBio, setProfileBio] = useState(() => localStorage.getItem('shinigami_profileBio') || 'powerd by SANS DISCORD SERVER');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('shinigami_avatarUrl') || 'https://avatarfiles.alphacoders.com/174/174875.png');
  const [slogan, setSlogan] = useState(() => localStorage.getItem('shinigami_slogan') || 'aut vincere aut mori');
  
  // 2-Tab Links State (Left: Bio Links, Right: Web Links)
  const [bioLinks, setBioLinks] = useState(() => {
    const savedBio = localStorage.getItem('shinigami_bio_links');
    if (savedBio) {
      try { return JSON.parse(savedBio); } catch (e) { console.error(e); }
    }
    const savedAll = localStorage.getItem('shinigami_links');
    if (savedAll) {
      try { return parseRawLinks(JSON.parse(savedAll)).bioLinks; } catch (e) { console.error(e); }
    }
    return DEFAULT_BIO_LINKS;
  });

  const [webLinks, setWebLinks] = useState(() => {
    const savedWeb = localStorage.getItem('shinigami_web_links');
    if (savedWeb) {
      try { return JSON.parse(savedWeb); } catch (e) { console.error(e); }
    }
    const savedAll = localStorage.getItem('shinigami_links');
    if (savedAll) {
      try { return parseRawLinks(JSON.parse(savedAll)).webLinks; } catch (e) { console.error(e); }
    }
    return DEFAULT_WEB_LINKS;
  });

  // Admin Tab active ('bio' | 'web')
  const [adminTab, setAdminTab] = useState('bio');
  // Admin Section ('profile' | 'donations')
  const [adminSection, setAdminSection] = useState('donations');
  // Mobile Public Tab active ('bio' | 'web')
  const [publicActiveTab, setPublicActiveTab] = useState('bio');

  // --- DATABASE SYNC STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // --- FETCH FROM SUPABASE ON MOUNT & REALTIME SYNC ---
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profile_config')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (error) {
          console.error('Error fetching from Supabase:', error);
        } else if (data) {
          const pName = data.profile_name || 'CENOT';
          const pBio = data.profile_bio || 'powerd by SANS DISCORD SERVER';
          const pAvatar = data.avatar_url || 'https://avatarfiles.alphacoders.com/174/174875.png';
          const pSlogan = data.slogan || 'aut vincere aut mori';
          
          setProfileName(pName);
          setProfileBio(pBio);
          setAvatarUrl(pAvatar);
          setSlogan(pSlogan);

          localStorage.setItem('shinigami_profileName', pName);
          localStorage.setItem('shinigami_profileBio', pBio);
          localStorage.setItem('shinigami_avatarUrl', pAvatar);
          localStorage.setItem('shinigami_slogan', pSlogan);

          if (data.links) {
            const parsed = parseRawLinks(data.links);
            setBioLinks(parsed.bioLinks);
            setWebLinks(parsed.webLinks);
            localStorage.setItem('shinigami_bio_links', JSON.stringify(parsed.bioLinks));
            localStorage.setItem('shinigami_web_links', JSON.stringify(parsed.webLinks));
            localStorage.setItem('shinigami_links', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDb();

    // ⚡ Supabase Realtime Subscription: Instantly reflect changes when database updates
    const channel = supabase
      .channel('profile_config_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profile_config', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) {
            const data = payload.new;
            const pName = data.profile_name || 'CENOT';
            const pBio = data.profile_bio || 'powerd by SANS DISCORD SERVER';
            const pAvatar = data.avatar_url || 'https://avatarfiles.alphacoders.com/174/174875.png';
            const pSlogan = data.slogan || 'aut vincere aut mori';
            
            setProfileName(pName);
            setProfileBio(pBio);
            setAvatarUrl(pAvatar);
            setSlogan(pSlogan);

            localStorage.setItem('shinigami_profileName', pName);
            localStorage.setItem('shinigami_profileBio', pBio);
            localStorage.setItem('shinigami_avatarUrl', pAvatar);
            localStorage.setItem('shinigami_slogan', pSlogan);

            if (data.links) {
              const parsed = parseRawLinks(data.links);
              setBioLinks(parsed.bioLinks);
              setWebLinks(parsed.webLinks);
              localStorage.setItem('shinigami_bio_links', JSON.stringify(parsed.bioLinks));
              localStorage.setItem('shinigami_web_links', JSON.stringify(parsed.webLinks));
              localStorage.setItem('shinigami_links', JSON.stringify(parsed));
            }
          }
        }
      )
      .subscribe();

    // Refetch latest DB data whenever tab becomes visible / focused
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadFromDb();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // --- AUTH & SUPABASE ADMIN CREDENTIALS STATE ---
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('shinigami_admin_auth') === 'true';
  });
  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    return sessionStorage.getItem('shinigami_admin_user') || 'cenot';
  });

  // Admin Credentials Change State
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [credsStatus, setCredsStatus] = useState(''); // 'success' | 'error' | ''
  const [credsMessage, setCredsMessage] = useState('');

  // Load current admin username from Supabase upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      const loadAdminInfo = async () => {
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('username')
            .limit(1);
          if (data && data.length > 0 && data[0].username) {
            setCurrentAdminUser(data[0].username);
            setNewAdminUser(data[0].username);
            sessionStorage.setItem('shinigami_admin_user', data[0].username);
          }
        } catch (err) {
          console.error('Failed to load admin user info:', err);
        }
      };
      loadAdminInfo();
    }
  }, [isAuthenticated]);

  // --- DRAG AND DROP STATE ---
  const [draggedItem, setDraggedItem] = useState(null); // { index, listType }

  const handleDragStart = (e, index, listType) => {
    setDraggedItem({ index, listType });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index, listType) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.listType !== listType || draggedItem.index === index) return;
    
    if (listType === 'bio') {
      const updated = [...bioLinks];
      const item = updated.splice(draggedItem.index, 1)[0];
      updated.splice(index, 0, item);
      setDraggedItem({ index, listType });
      setBioLinks(updated);
    } else {
      const updated = [...webLinks];
      const item = updated.splice(draggedItem.index, 1)[0];
      updated.splice(index, 0, item);
      setDraggedItem({ index, listType });
      setWebLinks(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('shinigami_profileName', profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem('shinigami_profileBio', profileBio);
  }, [profileBio]);

  useEffect(() => {
    localStorage.setItem('shinigami_avatarUrl', avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    localStorage.setItem('shinigami_slogan', slogan);
  }, [slogan]);

  useEffect(() => {
    localStorage.setItem('shinigami_bio_links', JSON.stringify(bioLinks));
  }, [bioLinks]);

  useEffect(() => {
    localStorage.setItem('shinigami_web_links', JSON.stringify(webLinks));
  }, [webLinks]);

  useEffect(() => {
    localStorage.setItem('shinigami_links', JSON.stringify({ bioLinks, webLinks }));
  }, [bioLinks, webLinks]);

  // --- ACTIONS ---
  const handleUpdateLink = (listType, index, field, value) => {
    if (listType === 'bio') {
      const updated = [...bioLinks];
      updated[index] = { ...updated[index], [field]: value };
      setBioLinks(updated);
    } else {
      const updated = [...webLinks];
      updated[index] = { ...updated[index], [field]: value };
      setWebLinks(updated);
    }
  };

  const handleAddLink = (listType) => {
    if (listType === 'bio') {
      setBioLinks([...bioLinks, { title: 'New Bio Link', url: 'https://', iconType: 'globe' }]);
    } else {
      setWebLinks([...webLinks, { title: 'New Web Link', url: 'https://', iconType: 'globe' }]);
    }
  };

  const handleRemoveLink = (listType, index) => {
    if (listType === 'bio') {
      setBioLinks(bioLinks.filter((_, i) => i !== index));
    } else {
      setWebLinks(webLinks.filter((_, i) => i !== index));
    }
  };

  const handleMoveLink = (fromType, index) => {
    if (fromType === 'bio') {
      const item = bioLinks[index];
      setBioLinks(bioLinks.filter((_, i) => i !== index));
      setWebLinks([...webLinks, item]);
    } else {
      const item = webLinks[index];
      setWebLinks(webLinks.filter((_, i) => i !== index));
      setBioLinks([...bioLinks, item]);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua data ke default?')) {
      setProfileName('CENOT');
      setProfileBio('powerd by SANS DISCORD SERVER');
      setAvatarUrl('https://avatarfiles.alphacoders.com/174/174875.png');
      setSlogan('aut vincere aut mori');
      setBioLinks(DEFAULT_BIO_LINKS);
      setWebLinks(DEFAULT_WEB_LINKS);
    }
  };

  // --- SAVE TO SUPABASE ---
  const handleSaveToDb = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('');
      const { error } = await supabase
        .from('profile_config')
        .upsert({
          id: 1,
          profile_name: profileName,
          profile_bio: profileBio,
          avatar_url: avatarUrl,
          slogan: slogan,
          links: {
            bioLinks: bioLinks,
            webLinks: webLinks,
          },
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGIN SUBMIT (VERIFIED AGAINST SUPABASE ADMIN_USERS) ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const trimmedUser = usernameInput.trim();
    if (!trimmedUser || !passwordInput) {
      setAuthError('Silakan masukkan ID Pengguna dan Kata Sandi!');
      return;
    }

    setIsAuthenticating(true);
    try {
      const hashedInput = await sha256(passwordInput);

      // Query Supabase admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('username', trimmedUser)
        .limit(1);

      if (error) {
        console.error('Supabase auth error:', error);
        setAuthError('Gagal menghubungkan ke database auth: ' + (error.message || 'Error'));
        return;
      }

      if (data && data.length > 0) {
        const user = data[0];
        if (user.password_hash === hashedInput) {
          setIsAuthenticated(true);
          setCurrentAdminUser(user.username);
          setNewAdminUser(user.username);
          sessionStorage.setItem('shinigami_admin_auth', 'true');
          sessionStorage.setItem('shinigami_admin_user', user.username);
          setAuthError('');
          setPasswordInput('');
          setUsernameInput('');
          return;
        }
      }

      setAuthError('ID Pengguna atau Kata Sandi salah!');
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Terjadi kesalahan saat memproses login: ' + (err.message || 'Error'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shinigami_admin_auth');
    sessionStorage.removeItem('shinigami_admin_user');
  };

  // --- UPDATE ADMIN CREDENTIALS IN SUPABASE ---
  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();
    setCredsStatus('');
    setCredsMessage('');

    const trimmedUser = newAdminUser.trim();
    if (!trimmedUser) {
      setCredsStatus('error');
      setCredsMessage('Username tidak boleh kosong!');
      return;
    }

    if (newAdminPass && newAdminPass.length < 6) {
      setCredsStatus('error');
      setCredsMessage('Kata sandi baru minimal 6 karakter!');
      return;
    }

    if (newAdminPass && newAdminPass !== confirmAdminPass) {
      setCredsStatus('error');
      setCredsMessage('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const updatePayload = {
        username: trimmedUser,
        updated_at: new Date().toISOString()
      };

      if (newAdminPass) {
        updatePayload.password_hash = await sha256(newAdminPass);
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updatePayload)
        .eq('id', 1);

      if (error) throw error;

      setCurrentAdminUser(trimmedUser);
      sessionStorage.setItem('shinigami_admin_user', trimmedUser);
      setNewAdminPass('');
      setConfirmAdminPass('');
      setCredsStatus('success');
      setCredsMessage('✓ Username & Kata Sandi berhasil diperbarui di Supabase!');
      setTimeout(() => {
        setCredsStatus('');
        setCredsMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error updating credentials:', err);
      setCredsStatus('error');
      setCredsMessage('Gagal update database: ' + (err.message || 'Error'));
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // ==================== RENDER SPIN WHEEL (GACHA) ====================
  if (currentPath === '/spin') {
    return <SpinWheel onBack={() => navigateTo('/')} />;
  }

  // ==================== RENDER DONATE ====================
  if (currentPath === '/donate' || currentPath.startsWith('/donate')) {
    return <DonatePage onBack={() => navigateTo('/')} />;
  }

  // ==================== RENDER OBS OVERLAY ====================
  if (currentPath === '/overlay' || currentPath.startsWith('/overlay')) {
    return <OverlayPage />;
  }

  // ==================== RENDER JOIN NETWORK ====================
  if (currentPath === '/join' || currentPath.startsWith('/join')) {
    return <JoinNetwork onBack={() => navigateTo('/')} />;
  }

  // ==================== RENDER ADMIN INTERFACE ====================
  if (currentPath === '/admin' || currentPath === '/profile') {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          color: '#ffffff',
          fontFamily: '"Outfit", sans-serif',
          zIndex: 2,
          position: 'relative'
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
            color: '#8b5cf6'
          }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }} />
            <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
          </svg>
          <p style={{ color: '#84868c', fontSize: '14px' }}>Memuat data database...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Login Form View
      return (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          margin: '10vh auto 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          padding: '24px'
        }} className="animate-fade-in">
          <div style={{
            width: '100%',
            backgroundColor: '#121316',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <LockIcon />
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '750', fontFamily: '"Outfit", sans-serif', color: '#ffffff' }}>
              Masuk Admin
            </h2>
            <p style={{ margin: '0 0 28px 0', fontSize: '12.5px', color: '#84868c' }}>
              Silakan login untuk mengedit Landing Page
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID Pengguna</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan ID"
                  required
                  style={{
                    backgroundColor: '#1c1d22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kata Sandi</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan Kata Sandi"
                  required
                  style={{
                    backgroundColor: '#1c1d22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              {authError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  marginTop: '10px',
                  opacity: isAuthenticating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => { if (!isAuthenticating) e.currentTarget.style.backgroundColor = '#7c3aed'; }}
                onMouseOut={(e) => { if (!isAuthenticating) e.currentTarget.style.backgroundColor = '#8b5cf6'; }}
              >
                {isAuthenticating ? 'Memeriksa Database...' : 'Masuk Ke Panel'}
              </button>
            </form>
          </div>

          <button
            onClick={() => navigateTo('/')}
            style={{
              marginTop: '20px',
              background: 'none',
              border: 'none',
              color: '#84868c',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Kembali ke Halaman Utama
          </button>
        </div>
      );
    }

    // Authenticated Dashboard View
    return (
      <div style={{
        width: '100%',
        maxWidth: adminSection === 'donations' ? '1080px' : '560px',
        margin: '0 auto',
        padding: '24px 16px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2
      }} className="animate-fade-in">
        
        {/* Header Dashboard */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: '#121316',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px 20px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '750', color: '#ffffff', fontFamily: '"Outfit", sans-serif' }}>
              Dashboard Admin
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#84868c' }}>
              Selamat datang, {currentAdminUser}!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#84868c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Bersihkan Cache & Refresh"
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#84868c';
              }}
            >
              🧹 Clear Cache
            </button>

            <button
              onClick={() => navigateTo('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            >
              <EyeIcon /> Lihat Halaman
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            >
              <LogOutIcon /> Keluar
            </button>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          backgroundColor: '#121316',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setAdminSection('donations')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid ' + (adminSection === 'donations' ? '#f59e0b' : 'transparent'),
              backgroundColor: adminSection === 'donations' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: adminSection === 'donations' ? '#f59e0b' : '#84868c',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            💰 Kelola Saweran (Saweria)
          </button>
          <button
            onClick={() => setAdminSection('profile')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid ' + (adminSection === 'profile' ? '#8b5cf6' : 'transparent'),
              backgroundColor: adminSection === 'profile' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: adminSection === 'profile' ? '#8b5cf6' : '#84868c',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            ⚙️ Linktree Editor
          </button>
        </div>

        {adminSection === 'donations' ? (
          <AdminDonations />
        ) : (
        /* Form Editor */
        <div style={{
          backgroundColor: '#121316',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Profile Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Identitas Profil
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>URL Foto Avatar</label>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{
                  backgroundColor: '#1c1d22',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>Nama Profil</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{
                    backgroundColor: '#1c1d22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>Slogan Footer</label>
                <input 
                  type="text" 
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  style={{
                    backgroundColor: '#1c1d22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>Deskripsi Profil / Bio</label>
              <textarea 
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                rows={2}
                style={{
                  backgroundColor: '#1c1d22',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />

          {/* Links Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pengaturan Links
              </h3>
              <button
                type="button"
                onClick={() => handleAddLink(adminTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
              >
                <PlusIcon /> Tambah {adminTab === 'bio' ? 'Bio Link' : 'Web Link'}
              </button>
            </div>

            {/* Admin Tab Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: '#1c1d22',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setAdminTab('bio')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: adminTab === 'bio' ? '#272930' : 'transparent',
                  color: adminTab === 'bio' ? '#ffffff' : '#84868c',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span>🔗 Bio Link (Kiri)</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: adminTab === 'bio' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: adminTab === 'bio' ? '#c4b5fd' : '#84868c'
                }}>
                  {bioLinks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('web')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: adminTab === 'web' ? '#272930' : 'transparent',
                  color: adminTab === 'web' ? '#ffffff' : '#84868c',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span>🌐 Web (Kanan)</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: adminTab === 'web' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: adminTab === 'web' ? '#c4b5fd' : '#84868c'
                }}>
                  {webLinks.length}
                </span>
              </button>
            </div>

            {/* Link Items in Active Admin Tab */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(adminTab === 'bio' ? bioLinks : webLinks).length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 20px',
                  backgroundColor: '#18191e',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  color: '#84868c',
                  fontSize: '13px'
                }}>
                  Belum ada link di tab {adminTab === 'bio' ? 'Bio Link' : 'Web'}. Klik tombol "+ Tambah" di atas untuk menambahkan.
                </div>
              ) : (
                (adminTab === 'bio' ? bioLinks : webLinks).map((link, idx) => {
                  const currentListType = adminTab;
                  const isCurrentlyDragged = draggedItem && draggedItem.listType === currentListType && draggedItem.index === idx;

                  return (
                    <div 
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx, currentListType)}
                      onDragOver={(e) => handleDragOver(e, idx, currentListType)}
                      onDragEnd={handleDragEnd}
                      style={{
                        backgroundColor: '#1c1d22',
                        border: isCurrentlyDragged ? '1.5px dashed #8b5cf6' : '1px solid rgba(255, 255, 255, 0.05)',
                        opacity: isCurrentlyDragged ? 0.4 : 1,
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                        cursor: 'grab'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ paddingRight: '4px', display: 'flex', alignItems: 'center' }} title="Tarik untuk mengurutkan">
                          <DragIcon />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Judul Link"
                          value={link.title}
                          onChange={(e) => handleUpdateLink(currentListType, idx, 'title', e.target.value)}
                          style={{
                            backgroundColor: '#121316',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            flex: 2,
                            outline: 'none'
                          }}
                        />

                        <select 
                          value={['globe', 'sparkles', 'discord', 'coffee', 'tiktok', 'doc', 'cart', 'book', 'trophy'].includes(link.iconType) ? link.iconType : 'custom'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              handleUpdateLink(currentListType, idx, 'iconType', 'https://');
                            } else {
                              handleUpdateLink(currentListType, idx, 'iconType', val);
                            }
                          }}
                          style={{
                            backgroundColor: '#121316',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#ffffff',
                            fontSize: '12px',
                            flex: 1,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="globe">Globe/Web</option>
                          <option value="sparkles">Sparkles/Prem</option>
                          <option value="discord">Discord</option>
                          <option value="coffee">Coffee/Donasi</option>
                          <option value="tiktok">TikTok</option>
                          <option value="doc">Dokumen</option>
                          <option value="cart">Keranjang Shop</option>
                          <option value="book">Manga Buku</option>
                          <option value="trophy">Piala/Bola</option>
                          <option value="custom">Custom (URL/SVG)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleMoveLink(currentListType, idx)}
                          title={`Pindah ke tab ${currentListType === 'bio' ? 'Web' : 'Bio Link'}`}
                          style={{
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
                        >
                          {currentListType === 'bio' ? '➔ Web' : '➔ Bio'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveLink(currentListType, idx)}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {!['globe', 'sparkles', 'discord', 'coffee', 'tiktok', 'doc', 'cart', 'book', 'trophy'].includes(link.iconType) && (
                        <input 
                          type="text" 
                          placeholder="Icon URL (https://...) atau Kode SVG (<svg>...)"
                          value={link.iconType}
                          onChange={(e) => handleUpdateLink(currentListType, idx, 'iconType', e.target.value)}
                          style={{
                            backgroundColor: '#121316',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            outline: 'none'
                          }}
                        />
                      )}

                      <input 
                        type="text" 
                        placeholder="https://example.com atau /spin"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(currentListType, idx, 'url', e.target.value)}
                        style={{
                          backgroundColor: '#121316',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#84868c',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleResetToDefault}
              style={{
                backgroundColor: 'transparent',
                color: '#84868c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#84868c';
              }}
            >
              Reset Default
            </button>

            <button
              onClick={handleSaveToDb}
              disabled={isSaving}
              style={{
                backgroundColor: saveStatus === 'success' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isSaving ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isSaving && saveStatus !== 'success' && saveStatus !== 'error') {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                }
              }}
              onMouseOut={(e) => {
                if (!isSaving && saveStatus !== 'success' && saveStatus !== 'error') {
                  e.currentTarget.style.backgroundColor = '#8b5cf6';
                }
              }}
            >
              {isSaving ? 'Menyimpan...' : saveStatus === 'success' ? '✓ Tersimpan di DB' : saveStatus === 'error' ? '❌ Gagal Simpan' : 'Simpan ke Database'}
            </button>
          </div>

          {/* Admin Credentials Manager */}
          <div style={{
            backgroundColor: '#121316',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            marginTop: '20px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🔐 Keamanan & Akses Admin (Supabase DB)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#84868c' }}>
                Ubah ID Pengguna atau Kata Sandi admin yang tersimpan langsung di database Supabase.
              </p>
            </div>

            <form onSubmit={handleUpdateAdminCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>ID / Username Admin</label>
                <input 
                  type="text" 
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  placeholder="Username admin"
                  required
                  style={{
                    backgroundColor: '#1c1d22',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>Password Baru (Kosongkan jika tidak ganti)</label>
                  <input 
                    type="password" 
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    style={{
                      backgroundColor: '#1c1d22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#84868c', fontWeight: '500' }}>Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    placeholder="Ulangi password baru"
                    style={{
                      backgroundColor: '#1c1d22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {credsStatus && (
                <div style={{
                  backgroundColor: credsStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${credsStatus === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  color: credsStatus === 'success' ? '#10b981' : '#ef4444',
                  fontSize: '12.5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  {credsMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isUpdatingCreds}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isUpdatingCreds ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: isUpdatingCreds ? 0.7 : 1
                  }}
                  onMouseOver={(e) => { if (!isUpdatingCreds) e.currentTarget.style.backgroundColor = '#7c3aed'; }}
                  onMouseOut={(e) => { if (!isUpdatingCreds) e.currentTarget.style.backgroundColor = '#8b5cf6'; }}
                >
                  {isUpdatingCreds ? 'Menyimpan Kredensial...' : 'Update Akun di Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    );
  }

  // Helper to render individual link card
  const renderLinkCard = (link, idx) => {
    const isInternal = link.url && link.url.startsWith('/');
    return (
      <a
        key={idx}
        href={link.url}
        target={isInternal ? '_self' : '_blank'}
        rel={isInternal ? '' : 'noopener noreferrer'}
        onClick={(e) => {
          if (isInternal) {
            e.preventDefault();
            navigateTo(link.url);
          }
        }}
        className="link-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#121316',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textDecoration: 'none',
          color: '#ffffff',
          boxSizing: 'border-box'
        }}
      >
        {/* Left side: Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px'
          }}>
            {getIconComponent(link.iconType)}
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '-0.1px'
          }}>
            {link.title}
          </span>
        </div>
        
        {/* Right side: Chevron */}
        <ChevronRightIcon />
      </a>
    );
  };

  // ==================== RENDER PUBLIC LINKTREE INTERFACE ====================
  return (
    <>
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
      </div>
      
      <div className="public-container animate-fade-in">

      {/* Profile Avatar */}
      <div 
        className="avatar-container"
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#121316',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          marginBottom: '16px'
        }}
      >
        {avatarUrl === 'default' || !avatarUrl ? (
          <svg viewBox="0 0 100 100" style={{ width: '48%', height: '48%' }} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M35,15 L75,15 L50,45 L85,45 L25,85 L45,53 L15,53 Z" fill="url(#logoGrad)" />
          </svg>
        ) : (
          <img 
            src={avatarUrl} 
            alt="Shinigami Avatar" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/96x96/121316/ffffff?text=S';
            }}
          />
        )}
      </div>

      {/* Main Title & Subtitle */}
      <h1 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#ffffff',
        margin: '0',
        letterSpacing: '-0.3px',
        fontFamily: '"Outfit", sans-serif'
      }}>
        {profileName}
      </h1>
      
      <p style={{
        fontSize: '12.5px',
        color: '#84868c',
        margin: '6px 0 28px 0',
        fontWeight: '400',
        letterSpacing: '0.1px',
        textAlign: 'center'
      }}>
        {profileBio}
      </p>

      {/* Mobile Tab Switcher (Visible on mobile screens) */}
      <div className="mobile-tab-nav">
        <button
          className={`mobile-tab-btn ${publicActiveTab === 'bio' ? 'active' : ''}`}
          onClick={() => setPublicActiveTab('bio')}
        >
          <span>🔗 Bio Link</span>
          <span className="tab-count-badge">{bioLinks.length}</span>
        </button>
        <button
          className={`mobile-tab-btn ${publicActiveTab === 'web' ? 'active' : ''}`}
          onClick={() => setPublicActiveTab('web')}
        >
          <span>🌐 Web</span>
          <span className="tab-count-badge">{webLinks.length}</span>
        </button>
      </div>

      {/* 2-Column Links Container */}
      <div className="links-grid-layout">
        {/* Kolom Kiri: Bio Link */}
        <div className={`links-column ${publicActiveTab !== 'bio' ? 'mobile-hidden' : ''}`}>
          <div className="column-tab-header">
            <div className="tab-indicator-bar" />
          </div>
          {bioLinks.map((link, idx) => renderLinkCard(link, idx))}
        </div>

        {/* Kolom Kanan: Web */}
        <div className={`links-column ${publicActiveTab !== 'web' ? 'mobile-hidden' : ''}`}>
          <div className="column-tab-header">
            <div className="tab-indicator-bar" />
          </div>
          {webLinks.map((link, idx) => renderLinkCard(link, idx))}
        </div>
      </div>

      {/* Slogan */}
      <p style={{
        fontSize: '11px',
        color: '#3e4046',
        letterSpacing: '1px',
        textTransform: 'lowercase',
        margin: '0 0 10px 0',
        fontStyle: 'italic'
      }}>
        {slogan}
      </p>

      {/* Copyright */}
      <p style={{
        fontSize: '11px',
        color: '#3e4046',
        margin: '0',
        letterSpacing: '0.5px'
      }}>
        &copy; {profileName} {new Date().getFullYear()}
      </p>

      </div>
    </>
  );
}

export default App;

