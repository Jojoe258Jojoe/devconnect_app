import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Declare supabase variable at top level
let supabase: any;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseAnonKey === 'your_supabase_anon_key' ||
    !supabaseUrl.startsWith('https://')) {
  console.warn('Supabase environment variables are not properly configured. Using mock client.');
  
  // Create a lightweight mock client
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: { user: { id: 'mock-user', email: 'test@example.com' }, session: { access_token: 'mock-token' } }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-user', email: 'test@example.com' }, session: { access_token: 'mock-token' } }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Fallback to lightweight mock
    supabase = {
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase connection failed' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase connection failed' } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: { message: 'Supabase connection failed' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase connection failed' } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } }),
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            }),
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } }),
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } })
            })
          }),
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'Supabase connection failed' } })
        })
      })
    };
  }
}

// Export at top level
export { supabase };

// Database types (keeping only essential ones for performance)
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  expertise_level?: string;
  location?: string;
  github_username?: string;
  linkedin_profile?: string;
  website_url?: string;
  reputation_score?: number;
  total_contributions?: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  category: string;
  tags?: string[];
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  reading_time?: number;
  is_featured?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  detailed_description?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'draft' | 'published';
  category: string;
  difficulty_level?: string;
  estimated_duration?: string;
  required_skills?: string[];
  votes_count?: number;
  collaborators_count?: number;
  views_count?: number;
  is_seeking_collaborators?: boolean;
  max_collaborators?: number;
  project_url?: string;
  repository_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Query {
  id: string;
  user_id: string;
  title: string;
  query_text: string;
  code_snippet?: string;
  programming_language?: string;
  status?: 'open' | 'answered' | 'closed';
  category: string;
  tags?: string[];
  priority_level?: string;
  views_count?: number;
  answers_count?: number;
  votes_count?: number;
  is_solved?: boolean;
  best_answer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeneratedCode {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  code_snippet: string;
  programming_language: string;
  framework?: string;
  prompt_used?: string;
  tags?: string[];
  performance_metrics?: any;
  execution_time?: number;
  memory_usage?: number;
  lines_of_code?: number;
  complexity_score?: number;
  is_public?: boolean;
  downloads_count?: number;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Flowchart {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  flowchart_data: any;
  thumbnail_url?: string;
  category: string;
  tags?: string[];
  sharing_permission?: 'private' | 'public' | 'collaborators';
  version_number?: number;
  is_template?: boolean;
  views_count?: number;
  likes_count?: number;
  downloads_count?: number;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
}

export interface Community {
  id: string;
  name: string;
  bio?: string;
  description?: string;
  cover_image?: string;
  creator_id: string;
  member_count?: number;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role?: string;
  joined_at?: string;
}

// Optimized database service with caching
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to handle network errors gracefully
const handleNetworkError = (error: any) => {
  if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
    console.warn('Network connection to Supabase failed. Using offline mode.');
    return { data: null, error: { message: 'Network connection failed. Please check your internet connection.' } };
  }
  return { data: null, error };
};

// Optimized database service functions
export const DatabaseService = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const cacheKey = `profile_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        const handled = handleNetworkError(error);
        if (handled.error) throw handled.error;
      }
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        console.warn('Profile fetch failed due to network error');
        return null;
      }
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        const handled = handleNetworkError(error);
        if (handled.error) throw handled.error;
      }
      
      // Update cache
      const cacheKey = `profile_${userId}`;
      setCachedData(cacheKey, data);
      
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Simplified data fetching with caching
  async getArticles(limit = 10): Promise<Article[]> {
    const cacheKey = `articles_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Articles fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Articles fetch failed due to network error');
      return [];
    }
  },

  async getIdeas(limit = 10): Promise<Idea[]> {
    const cacheKey = `ideas_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Ideas fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Ideas fetch failed due to network error');
      return [];
    }
  },

  async getQueries(limit = 10): Promise<Query[]> {
    const cacheKey = `queries_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Queries fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Queries fetch failed due to network error');
      return [];
    }
  },

  async getGeneratedCode(limit = 10): Promise<GeneratedCode[]> {
    const cacheKey = `generated_code_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('generated_code')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Generated code fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Generated code fetch failed due to network error');
      return [];
    }
  },

  async getFlowcharts(limit = 10): Promise<Flowchart[]> {
    const cacheKey = `flowcharts_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('flowcharts')
        .select('*')
        .eq('sharing_permission', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Flowcharts fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Flowcharts fetch failed due to network error');
      return [];
    }
  },

  async getCommunities(limit = 20): Promise<Community[]> {
    const cacheKey = `communities_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Communities fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Communities fetch failed due to network error');
      return [];
    }
  },

  // Simplified create operations
  async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert(article)
        .select()
        .single();
      
      if (error) throw error;
      
      // Clear cache
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async createIdea(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>): Promise<Idea> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert(idea)
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async createQuery(query: Omit<Query, 'id' | 'created_at' | 'updated_at'>): Promise<Query> {
    try {
      const { data, error } = await supabase
        .from('queries')
        .insert(query)
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async createGeneratedCode(code: Omit<GeneratedCode, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedCode> {
    try {
      const { data, error } = await supabase
        .from('generated_code')
        .insert(code)
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async createFlowchart(flowchart: Omit<Flowchart, 'id' | 'created_at' | 'updated_at'>): Promise<Flowchart> {
    try {
      const { data, error } = await supabase
        .from('flowcharts')
        .insert(flowchart)
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async createCommunity(community: Omit<Community, 'id' | 'created_at' | 'updated_at' | 'member_count'>): Promise<Community> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert(community)
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Simplified community operations
  async getMyCommunities(userId: string): Promise<Community[]> {
    const cacheKey = `my_communities_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .inner('community_members', 'communities.id', 'community_members.community_id')
        .eq('community_members.user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('My communities fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('My communities fetch failed due to network error');
      return [];
    }
  },

  async addCommunityMember(communityId: string, userId: string, role = 'member'): Promise<CommunityMember> {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          role
        })
        .select()
        .single();
      
      if (error) throw error;
      
      cache.clear();
      return data;
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  },

  async getCommunityMembers(communityId: string): Promise<(CommunityMember & { profile: Profile })[]> {
    const cacheKey = `community_members_${communityId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });
      
      if (error) {
        console.warn('Community members fetch failed, returning empty array');
        return [];
      }
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error: any) {
      console.warn('Community members fetch failed due to network error');
      return [];
    }
  },

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      cache.clear();
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  }
};