import { UserProfile, defaultProfile } from '../types/profile';
import { getSupabase } from '../lib/supabase';

const PROFILE_STORAGE_KEY = 'cybersec_arena_profile_v1';
const USER_ID_CACHE_KEY = 'cybersec_arena_user_id_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ProfileService {
  private cachedUserId: string | null = null;
  private userIdCacheTime: number = 0;

  private async getCurrentUserId(): Promise<string | null> {
    // Check cache first
    const now = Date.now();
    if (this.cachedUserId && (now - this.userIdCacheTime) < CACHE_DURATION) {
      return this.cachedUserId;
    }

    try {
      const supabase = await getSupabase();
      if (!supabase) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        this.cachedUserId = user.id;
        this.userIdCacheTime = now;
      }
      return user?.id || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async getProfile(): Promise<UserProfile> {
    // Load from localStorage first for instant display
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    let cachedProfile: UserProfile | null = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        cachedProfile = { ...defaultProfile, ...parsed };
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // Return cached profile immediately if available
    if (cachedProfile) {
      // Sync with database in background (non-blocking)
      this.syncProfileFromDatabase().catch(() => {
        // Silently fail, we already have cached data
      });
      return cachedProfile;
    }

    // No cache, try database
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return defaultProfile;
      }

      const supabase = await getSupabase();
      if (!supabase) {
        return defaultProfile;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, name, email, avatar_url, bio, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return defaultProfile;
      }

      const profile: UserProfile = {
        id: data.id,
        username: data.username || defaultProfile.username,
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar_url || '',
        bio: data.bio || '',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      // Cache the profile
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return defaultProfile;
    }
  }

  // Sync profile from database in background
  private async syncProfileFromDatabase(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      const supabase = await getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, name, email, avatar_url, bio, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error || !data) return;

      const profile: UserProfile = {
        id: data.id,
        username: data.username || defaultProfile.username,
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar_url || '',
        bio: data.bio || '',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      // Update cache if database has newer data
      const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (cached) {
        const cachedProfile = JSON.parse(cached);
        const cachedTime = new Date(cachedProfile.updatedAt || 0).getTime();
        const dbTime = new Date(profile.updatedAt).getTime();
        if (dbTime > cachedTime) {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        }
      } else {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (error) {
      // Silently fail - we have cached data
    }
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        // Fallback to localStorage if not authenticated
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        const current = stored ? JSON.parse(stored) : defaultProfile;
        const updated: UserProfile = {
          ...defaultProfile,
          ...current,
          ...profile,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }

      // Save to database
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      // Get current profile data first
      const currentProfile = await this.getProfile();

      const updateData: any = {};
      if (profile.name !== undefined) updateData.name = profile.name;
      if (profile.username !== undefined) updateData.username = profile.username;
      if (profile.avatar !== undefined) updateData.avatar_url = profile.avatar;
      if (profile.bio !== undefined) updateData.bio = profile.bio;

      // Try to update first, if it fails (profile doesn't exist), insert
      let data;
      let error;

      const { data: updateResult, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select('id, username, name, email, avatar_url, bio, created_at, updated_at')
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser();
        const insertData = {
          id: userId,
          username: profile.username || currentProfile.username || `user_${userId.substring(0, 8)}`,
          name: profile.name || currentProfile.name || '',
          email: user?.email || '',
          avatar_url: profile.avatar || currentProfile.avatar || '',
          bio: profile.bio || currentProfile.bio || '',
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('user_profiles')
          .insert(insertData)
          .select('id, username, name, email, avatar_url, bio, created_at, updated_at')
          .single();

        data = insertResult;
        error = insertError;
      } else {
        data = updateResult;
        error = updateError;
      }

      if (error) {
        console.error('Failed to save profile to database:', error);
        throw error;
      }

      if (data) {
        const savedProfile: UserProfile = {
          id: data.id,
          username: data.username || defaultProfile.username,
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar_url || '',
          bio: data.bio || '',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };
        
        // Update cache immediately for fast subsequent loads
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(savedProfile));
        return savedProfile;
      }

      // Fallback: update cache with current data
      const updated: UserProfile = {
        ...defaultProfile,
        ...currentProfile,
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }

  async updateName(name: string): Promise<UserProfile> {
    return this.saveProfile({ name });
  }

  async updateUsername(username: string): Promise<UserProfile> {
    // Validate username
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Check if username is already taken
    const userId = await this.getCurrentUserId();
    if (userId) {
      const supabase = await getSupabase();
      if (supabase) {
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .neq('id', userId)
          .single();

        if (existing) {
          throw new Error('Username already taken');
        }
      }
    }

    return this.saveProfile({ username: username.toLowerCase() });
  }

  async updateAvatar(avatar: string): Promise<UserProfile> {
    return this.saveProfile({ avatar });
  }

  async updateBio(bio: string): Promise<UserProfile> {
    return this.saveProfile({ bio });
  }

  async deleteProfile(): Promise<void> {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }

  // Generate avatar from username/name
  generateAvatarInitials(name: string, username: string): string {
    const displayName = name || username;
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return initials || 'U';
  }

  // Generate a colored avatar based on username
  generateAvatarSVG(name: string, username: string): string {
    const initials = this.generateAvatarInitials(name, username);
    const colors = [
      '#08f7fe', '#f608f7', '#00ff88', '#ff6b00', '#ffd700',
      '#ff1493', '#00ced1', '#9370db', '#ff6347', '#20b2aa',
    ];
    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];

    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}" opacity="0.2"/>
        <circle cx="100" cy="100" r="80" fill="${color}" opacity="0.3"/>
        <text x="100" y="100" font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
              fill="${color}" text-anchor="middle" dominant-baseline="central">${initials}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

export default new ProfileService();

