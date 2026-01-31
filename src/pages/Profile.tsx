import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Edit2, Save, X, Camera, Upload, Settings, 
  Bell, Volume2, VolumeX, Globe, Moon, Sun, Monitor,
  Eye, EyeOff, Shield, Lock, Unlock, Palette, 
  Type, Zap, Download, Upload as UploadIcon, RotateCcw,
  CheckCircle, AlertCircle, Info, LogOut, Trophy, Trash2
} from 'lucide-react';
import { useProgress, defaultProgress } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import avatar1 from '../assets/avatars/avatar-1.svg';
import avatar2 from '../assets/avatars/avatar-2.svg';
import avatar3 from '../assets/avatars/avatar-3.svg';
import avatar4 from '../assets/avatars/avatar-4.svg';
import avatar5 from '../assets/avatars/avatar-5.svg';
import avatar6 from '../assets/avatars/avatar-6.svg';
import settingsService from '../services/settingsService';
import { UserProfile } from '../types/profile';
import { AppSettings } from '../types/profile';
import ResetProgressModal from '../components/ResetProgressModal';

export default function Profile() {
  const { state, reset, setState } = useProgress();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showAvatarChooser, setShowAvatarChooser] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    // Load profile immediately (from cache)
    loadProfile();
    
    // Load settings in parallel (non-blocking)
    Promise.all([
      loadSettings(),
      settingsService.initialize()
    ]).catch(() => {
      // Silently handle errors
    });
  }, []);

  // When user signs in, sync any locally-saved profile to the database
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const raw = localStorage.getItem('cybersec_arena_profile_v1');
        if (!raw) return;
        const local = JSON.parse(raw || '{}');
        if (local && local.name && String(local.name).trim().length > 0) {
          // If current in-memory profile doesn't have the same name, push local to DB
          if (!profile || (profile.name || '').trim() !== String(local.name).trim()) {
            try {
              const saved = await profileService.saveProfile({ name: String(local.name).trim() });
              setProfile(saved);
              setNameValue(saved.name || '');
            } catch (e) {
              console.error('Failed to sync local profile to DB on sign-in:', e);
            }
          }
        }
        // Sync avatar if present in local cache (upload data URL or save URL)
        if (local && local.avatar && String(local.avatar).trim().length > 0) {
          try {
            const localAvatar = String(local.avatar).trim();
            const needsSync = !profile || (profile.avatar || '').trim() !== localAvatar;
            if (needsSync) {
              // If the avatar is a data URL or asset URL, upload/save via service
              const updated = await profileService.uploadAvatarFromUrl(localAvatar);
              setProfile(updated);
              setAvatarPreview(updated.avatar || localAvatar);
            }
          } catch (e) {
            console.error('Failed to sync local avatar to DB on sign-in:', e);
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [isAuthenticated]);

  // Reload profile from authoritative source when the user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    // Fast path: read cached profile from localStorage to render immediately
    try {
      const raw = localStorage.getItem('cybersec_arena_profile_v1');
      if (raw) {
        try {
          const cached = JSON.parse(raw);
          setProfile(cached);
          setNameValue(cached.name || '');
          setUsernameValue(cached.username || '');
          setBioValue(cached.bio || '');
          if (cached.avatar) {
            setAvatarPreview(cached.avatar);
          } else {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                setAvatarPreview(profileService.generateAvatarSVG(cached.name, cached.username));
              });
            } else {
              setTimeout(() => {
                setAvatarPreview(profileService.generateAvatarSVG(cached.name, cached.username));
              }, 0);
            }
          }
        } catch (e) {
          // ignore parse errors and fall through to fetch
        }
      }
    } catch (e) {
      // ignore localStorage failures
    }

    // Background refresh: fetch authoritative profile but don't block initial render
    profileService.getProfile().then((loaded) => {
      if (!loaded) return;
      setProfile(loaded);
      setNameValue(loaded.name);
      setUsernameValue(loaded.username);
      setBioValue(loaded.bio || '');

      if (loaded.avatar) {
        setAvatarPreview(loaded.avatar);
      } else {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            setAvatarPreview(profileService.generateAvatarSVG(loaded.name, loaded.username));
          });
        } else {
          setTimeout(() => {
            setAvatarPreview(profileService.generateAvatarSVG(loaded.name, loaded.username));
          }, 0);
        }
      }
    }).catch(() => {
      // silent - keep whatever is already shown
    });
  };

  const loadSettings = async () => {
    const loaded = await settingsService.getSettings();
    setSettings(loaded);
  };

  const handleSaveName = async () => {
    // Allow saving even if `profile` is not yet fully loaded by creating a minimal fallback
    const trimmed = nameValue?.trim();
    if (!trimmed) {
      showMessage('error', 'Name cannot be empty');
      return;
    }

    // Avoid no-op
    if (profile && trimmed === (profile.name || '').trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      // Primary attempt: update via profileService which will save to Supabase when possible
      const updated = await profileService.updateName(trimmed);
      setProfile(updated);
      setIsEditingName(false);
      showMessage('success', 'Name updated successfully');
      return;
    } catch (error) {
      console.error('Failed to update name (primary):', error);
    }

    // Secondary: try saveProfile which has a local fallback when unauthenticated
    try {
      const saved = await profileService.saveProfile({ name: trimmed });
      setProfile(saved);
      setIsEditingName(false);
      showMessage('success', 'Name saved locally (will sync when available)');
      return;
    } catch (error) {
      console.error('Fallback saveProfile failed:', error);
    }

    // Last resort: write directly to localStorage so UI reflects the change
    try {
      const stored = localStorage.getItem('cybersec_arena_profile_v1');
      const current = stored ? JSON.parse(stored) : {};
      const fallback = { ...current, name: trimmed, updatedAt: new Date().toISOString() };
      localStorage.setItem('cybersec_arena_profile_v1', JSON.stringify(fallback));
      setProfile((prev) => ({ ...(prev || {}), ...fallback } as UserProfile));
      setIsEditingName(false);
      showMessage('success', 'Name saved locally (will sync when you sign in)');
    } catch (e) {
      console.error('Local fallback failed:', e);
      showMessage('error', 'Failed to update name');
    }
  };

  const handleSaveUsername = async () => {
    if (!profile) return;
    try {
      const updated = await profileService.updateUsername(usernameValue);
      setProfile(updated);
      setIsEditingUsername(false);
      setAvatarPreview(profileService.generateAvatarSVG(updated.name, updated.username));
      showMessage('success', 'Username updated successfully');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update username');
    }
  };

  const handleSaveBio = async () => {
    if (!profile) return;
    try {
      const updated = await profileService.updateBio(bioValue);
      setProfile(updated);
      setIsEditingBio(false);
      showMessage('success', 'Bio updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update bio');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage('error', 'Image size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Please select an image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAvatarPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview && !avatarFile) return;
    setIsUploading(true);
    try {
      let updated;
      if (avatarFile) {
        // Upload the selected file to Supabase storage and save resulting public URL
        updated = await profileService.uploadAvatarBlob(avatarFile, avatarFile.name);
      } else {
        // avatarPreview may be a data URL or an asset URL
        updated = await profileService.uploadAvatarFromUrl(avatarPreview);
      }
      setProfile(updated);
      setAvatarFile(null);
      setAvatarPreview(updated.avatar || avatarPreview);
      showMessage('success', 'Avatar saved');
    } catch (err: any) {
      console.error('handleSaveAvatar error:', err);
      const msg = (err && (err.message || String(err))) || 'Failed to update avatar';
      showMessage('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChooseAvatar = async (src: string) => {
    setIsUploading(true);
    try {
      setShowAvatarChooser(false);
      const updated = await profileService.uploadAvatarFromUrl(src);
      setProfile(updated);
      setAvatarPreview(updated.avatar || src);
      showMessage('success', 'Avatar saved');
    } catch (err: any) {
      console.error('choose avatar failed', err);
      const msg = (err && (err.message || String(err))) || 'Failed to select avatar';
      showMessage('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSettingChange = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    try {
      const updated = await settingsService.updateSetting(key, value);
      setSettings(updated);
      showMessage('success', 'Settings updated');
    } catch (error) {
      showMessage('error', 'Failed to update settings');
    }
  };

  const handleNestedSettingChange = async (
    category: keyof AppSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;
    try {
      const updated = {
        ...settings,
        [category]: {
          ...(settings[category] as any),
          [key]: value,
        },
      };
      const saved = await settingsService.saveSettings(updated);
      setSettings(saved);
      showMessage('success', 'Settings updated');
    } catch (error) {
      showMessage('error', 'Failed to update settings');
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        const reset = await settingsService.resetSettings();
        setSettings(reset);
        showMessage('success', 'Settings reset to default');
      } catch (error) {
        showMessage('error', 'Failed to reset settings');
      }
    }
  };

  const handleResetProgress = async () => {
    setShowResetConfirm(false);
    try {
      // Call the reset function from context to clear progress in memory
      reset();
      showMessage('success', 'All progress has been reset! You can now start fresh from the beginning.');
    } catch (error) {
      showMessage('error', 'Failed to reset progress');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const exportData = async () => {
    // Create PDF content from progress data
    const ctfCount = state.ctf.solvedIds.length;
    const phishCount = state.phish.solvedIds.length;
    const codeCount = state.code.solvedIds.length;
    const quizStats = `${state.quiz.correct}/${state.quiz.answered}`;
    const badgeCount = state.badges.length;

    // Safely prepare display name for HTML
    const escapeHtml = (str: string) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // Try to get the authoritative profile (may return cached or DB-backed)
    let displayNameRaw: string | null = null;
    try {
      const authoritative = await profileService.getProfile();
      if (authoritative && authoritative.name && String(authoritative.name).trim().length > 0) {
        displayNameRaw = authoritative.name;
      }
    } catch (e) {
      // ignore
    }

    if (!displayNameRaw && profile && profile.name && profile.name.trim().length > 0) {
      displayNameRaw = profile.name;
    }

    if (!displayNameRaw) {
      try {
        const stored = localStorage.getItem('cybersec_arena_profile_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name && String(parsed.name).trim().length > 0) {
            displayNameRaw = parsed.name;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (!displayNameRaw) displayNameRaw = 'Player';
    const displayName = escapeHtml(displayNameRaw);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cybersec Arena - Progress Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #8B5CF6;
            padding-bottom: 20px;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #8B5CF6;
            margin: 0;
          }
          .subtitle {
            font-size: 14px;
            color: #888;
            margin: 10px 0 0 0;
          }
          .date {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #8B5CF6;
            margin-bottom: 15px;
            border-left: 4px solid #8B5CF6;
            padding-left: 10px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .stat-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #8B5CF6;
          }
          .stat-description {
            font-size: 11px;
            color: #999;
            margin-top: 5px;
          }
          .badges-section {
            margin-top: 20px;
          }
          .badge-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          .badge-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .badge {
            background-color: #fbbf24;
            color: #333;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .no-badges {
            color: #999;
            font-size: 12px;
            font-style: italic;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🛡️ Cybersec Arena</h1>
            <p class="subtitle">Progress Report — ${displayName}</p>
            <p class="date">Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="section-title">📊 Challenge Progress</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">CTF Challenges</div>
                <div class="stat-value">${ctfCount}</div>
                <div class="stat-description">Challenges solved</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Phishing Detection</div>
                <div class="stat-value">${phishCount}</div>
                <div class="stat-description">Phishing attempts detected</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Code Security</div>
                <div class="stat-value">${codeCount}</div>
                <div class="stat-description">Code vulnerabilities fixed</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Cyber Quiz</div>
                <div class="stat-value">${quizStats}</div>
                <div class="stat-description">Correct answers / Total</div>
              </div>
            </div>
          </div>

          <!-- Game Performance section removed (Firewall Defender omitted) -->

          <div class="section badges-section">
            <div class="section-title">🏆 Achievements</div>
            <div class="badge-label">Unlocked Badges (${badgeCount})</div>
            ${badgeCount > 0 ? `
              <div class="badge-list">
                ${state.badges.map(badge => `<div class="badge">${badge}</div>`).join('')}
              </div>
            ` : `
              <div class="no-badges">No badges unlocked yet. Keep playing to earn achievements!</div>
            `}
          </div>

          <div class="footer">
            <p>This report was automatically generated by Cybersec Arena.</p>
            <p>Keep challenging yourself and improving your cybersecurity skills! 🔐</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob from the HTML content
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    // Use print dialog to save as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait a moment for the content to render, then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    document.body.removeChild(element);
    showMessage('success', 'Progress report opened. Use your browser\'s Print function to save as PDF.');
  };

  if (!profile || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-[#8B5CF6]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400 mb-2">Profile & Settings</h1>
        <p className="text-slate-400">Manage your profile information and application settings</p>
      </div>

      {/* Success/Error Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-green-500/10 border-green-400/30 text-green-300'
              : 'bg-red-500/10 border-red-400/30 text-red-300'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={18} className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={18} className="inline mr-2" />
          Settings
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-[#8B5CF6] mb-4">Avatar</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-2 border-[#8B5CF6]/30 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-slate-400" size={48} />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <label className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-400 hover:bg-purple-500/30 cursor-pointer transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                  
                  <button
                    onClick={() => setShowAvatarChooser(true)}
                    className="px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-400/30 text-violet-300 hover:bg-violet-500/30 transition-colors flex items-center gap-2"
                  >
                    <User size={16} />
                    Choose Avatar
                  </button>
                  {avatarFile && (
                    <button
                      onClick={handleSaveAvatar}
                      disabled={isUploading}
                      className={`px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 transition-colors flex items-center gap-2 ${isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-500/30'}`}
                    >
                      <Save size={16} />
                      Save Avatar
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Upload an image (max 2MB) or generate an avatar with your initials
                </p>
              </div>
            </div>
          </div>

          {/* Avatar chooser modal */}
          {showAvatarChooser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowAvatarChooser(false)} />
              <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-lg w-full z-10">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Choose an Avatar</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[avatar1, avatar2, avatar3, avatar4, avatar5, avatar6].map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChooseAvatar(src)}
                      disabled={isUploading}
                      className={`p-2 rounded-lg bg-slate-800 border border-slate-700 transform transition-all ${isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      <img src={src} alt={`avatar-${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAvatarChooser(false)}
                    className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Name Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Name</h2>
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={() => { handleSaveName(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                  placeholder="Enter your name"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setNameValue(profile.name);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300">{profile.name || 'Not set'}</p>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Username Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Username</h2>
            {isEditingUsername ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={usernameValue}
                  onChange={(e) => setUsernameValue(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                />
                <p className="text-xs text-slate-500">
                  Username must be at least 3 characters and can only contain letters, numbers, and underscores
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameValue(profile.username);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300 font-mono">@{profile.username}</p>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Bio</h2>
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioValue(profile.bio || '');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-300">{profile.bio || 'No bio set'}</p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  {profile.bio ? 'Edit Bio' : 'Add Bio'}
                </button>
              </div>
            )}
          </div>

          {/* Achievement Badges Gallery */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              Achievement Badges
            </h2>
            {state.badges && state.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {state.badges.map((badge) => (
                  <div
                    key={badge}
                    className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-400/30 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-sm font-semibold text-yellow-300">{badge}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Trophy className="mx-auto mb-2 opacity-50" size={48} />
                <p>No badges earned yet. Complete challenges to unlock achievements!</p>
              </div>
            )}
          </div>

          {/* Progress Charts */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Progress Analytics
            </h2>
            <div className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {Math.round(
                      ((state.ctf.solvedIds.length + state.phish.solvedIds.length + state.code.solvedIds.length) /
                        (100 + 20 + 30)) *
                        100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((state.ctf.solvedIds.length + state.phish.solvedIds.length + state.code.solvedIds.length) /
                          (100 + 20 + 30)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">Category Breakdown</h3>
                
                {/* CTF Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">CTF Challenges</span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {state.ctf.solvedIds.length} solved
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (state.ctf.solvedIds.length / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Phish Hunt Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Phish Hunt</span>
                    <span className="text-xs font-semibold text-fuchsia-400">
                      {state.phish.solvedIds.length} solved
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-fuchsia-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (state.phish.solvedIds.length / 20) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Code & Secure Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Code & Secure</span>
                    <span className="text-xs font-semibold text-yellow-400">
                      {state.code.solvedIds.length} solved
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (state.code.solvedIds.length / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quiz Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">AI Cyber Quiz</span>
                    <span className="text-xs font-semibold text-green-400">
                      {state.quiz.correct} correct answers
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (state.quiz.correct / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Firewall Defender removed from UI */}
              </div>
            </div>
          </div>

          {/* Progress Management */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Progress Management</h2>
            <p className="text-sm text-slate-400 mb-4">Export or import your game progress</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Progress
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export Progress (PDF)
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-red-300 mb-4">Account</h2>
            <p className="text-sm text-slate-400 mb-4">Sign out of your account</p>
            <button
              onClick={async () => {
                try {
                  await logout();
                  navigate('/login', { replace: true });
                } catch (error) {
                  console.error('Failed to logout:', error);
                  navigate('/login', { replace: true });
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Palette size={20} />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-200 font-medium">Theme</label>
                    <p className="text-xs text-slate-500">Choose your preferred color theme</p>
                  </div>
                  <div className="flex gap-2">
                    {(['dark', 'light', 'auto'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleSettingChange('theme', theme)}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                          settings.theme === theme
                            ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300 shadow-lg scale-105'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                        title={theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'Auto (System)'}
                      >
                        {theme === 'dark' && <Moon size={16} />}
                        {theme === 'light' && <Sun size={16} />}
                        {theme === 'auto' && <Monitor size={16} />}
                        <span className="text-xs font-medium">
                          {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Auto'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Current Theme:</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {settings.theme === 'dark' ? '🌙 Dark Mode' : settings.theme === 'light' ? '☀️ Light Mode' : '🖥️ Auto (Follows System)'}
                  </p>
                  {settings.theme === 'auto' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Automatically switches based on your system preferences
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Volume2 size={20} />
              Audio
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Sound Effects</label>
                  <p className="text-xs text-slate-500">Enable or disable sound effects</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    settings.soundEnabled
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {settings.soundEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {settings.soundEnabled && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-200 font-medium">Volume</label>
                    <p className="text-xs text-slate-500">Adjust sound volume</p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseFloat(e.target.value))}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-200 font-medium">Enable Notifications</label>
                <p className="text-xs text-slate-500">Receive notifications for achievements and updates</p>
              </div>
              <button
                onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  settings.notificationsEnabled
                    ? 'bg-green-500/20 border-green-400/30 text-green-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                {settings.notificationsEnabled ? <Bell size={16} /> : <Bell size={16} className="opacity-50" />}
                {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Gameplay
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Auto Save</label>
                  <p className="text-xs text-slate-500">Automatically save your progress</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.autoSave
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.autoSave ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Show Hints</label>
                  <p className="text-xs text-slate-500">Display helpful hints during challenges</p>
                </div>
                <button
                  onClick={() => handleSettingChange('showHints', !settings.showHints)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    settings.showHints
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.showHints ? <Eye size={16} /> : <EyeOff size={16} />}
                  {settings.showHints ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Difficulty</label>
                  <p className="text-xs text-slate-500">Default difficulty level</p>
                </div>
                <select
                  value={settings.difficulty}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value as any)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="adaptive">Adaptive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Show on Leaderboard</label>
                  <p className="text-xs text-slate-500">Display your username on the public leaderboard</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'showOnLeaderboard', !settings.privacy.showOnLeaderboard)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.showOnLeaderboard
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.showOnLeaderboard ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Share Progress</label>
                  <p className="text-xs text-slate-500">Allow sharing your progress with others</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'shareProgress', !settings.privacy.shareProgress)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.shareProgress
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.shareProgress ? <Unlock size={16} /> : <Lock size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Analytics</label>
                  <p className="text-xs text-slate-500">Help improve the app by sharing usage data</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'allowAnalytics', !settings.privacy.allowAnalytics)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.allowAnalytics
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.allowAnalytics ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Type size={20} />
              Accessibility
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">High Contrast</label>
                  <p className="text-xs text-slate-500">Increase contrast for better visibility</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('accessibility', 'highContrast', !settings.accessibility.highContrast)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.accessibility.highContrast
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.accessibility.highContrast ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Reduce Motion</label>
                  <p className="text-xs text-slate-500">Minimize animations and transitions</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('accessibility', 'reduceMotion', !settings.accessibility.reduceMotion)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.accessibility.reduceMotion
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.accessibility.reduceMotion ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Font Size</label>
                  <p className="text-xs text-slate-500">Adjust text size for readability</p>
                </div>
                <select
                  value={settings.accessibility.fontSize}
                  onChange={(e) => handleNestedSettingChange('accessibility', 'fontSize', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset & Danger Zone */}
          <div className="space-y-4">
            {/* Reset Progress */}
            <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10">
              <h2 className="text-xl font-semibold text-orange-300 mb-4 flex items-center gap-2">
                <Trash2 size={20} />
                Reset Progress
              </h2>
              <p className="text-sm text-slate-300 mb-4">
                Reset progress for specific challenges or all sections. Other sections will remain unaffected.
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-300 hover:bg-orange-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Manage Progress Reset
              </button>
            </div>

            {/* Reset Settings */}
            <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
              <h2 className="text-xl font-semibold text-red-300 mb-4">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Reset All Settings</label>
                  <p className="text-xs text-slate-500">Restore all settings to their default values</p>
                </div>
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Confirmation Modal */}
      <ResetProgressModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} />

      {/* Old Reset Progress Confirmation Modal - Can be removed */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Reset All Progress?</h3>
            <p className="text-sm text-slate-400 mb-4">
              This will permanently delete all your progress including:
            </p>
              <ul className="text-sm text-slate-400 mb-4 space-y-1 ml-4 list-disc">
              <li>Solved CTF challenges</li>
              <li>Phishing hunt attempts</li>
              <li>Code & Secure solutions</li>
              <li>Quiz answers</li>
              <li>Badges earned</li>
            </ul>
            <p className="text-xs text-slate-500 mb-6">
              ⚠️ This action cannot be undone. You will need to start from the beginning.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/30 border border-red-400/50 text-red-300 hover:bg-red-500/40 transition-colors font-medium"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
