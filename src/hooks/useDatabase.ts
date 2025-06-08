import { useState, useEffect } from 'react';
import { DatabaseService, Article, Idea, Query, GeneratedCode, Flowchart, Profile, Community, CommunityMember } from '../lib/supabase';

// Custom hook for fetching articles
export function useArticles(limit = 10) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getArticles(limit);
        setArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [limit]);

  return { articles, loading, error, refetch: () => fetchArticles() };
}

// Custom hook for fetching ideas
export function useIdeas(limit = 10) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getIdeas(limit);
        setIdeas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [limit]);

  return { ideas, loading, error, refetch: () => fetchIdeas() };
}

// Custom hook for fetching queries
export function useQueries(limit = 10) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getQueries(limit);
        setQueries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queries');
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, [limit]);

  return { queries, loading, error, refetch: () => fetchQueries() };
}

// Custom hook for fetching generated code
export function useGeneratedCode(limit = 10) {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneratedCode = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getGeneratedCode(limit);
        setGeneratedCode(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch generated code');
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedCode();
  }, [limit]);

  return { generatedCode, loading, error, refetch: () => fetchGeneratedCode() };
}

// Custom hook for fetching flowcharts
export function useFlowcharts(limit = 10) {
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowcharts = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getFlowcharts(limit);
        setFlowcharts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch flowcharts');
      } finally {
        setLoading(false);
      }
    };

    fetchFlowcharts();
  }, [limit]);

  return { flowcharts, loading, error, refetch: () => fetchFlowcharts() };
}

// Custom hook for fetching communities
export function useCommunities(limit = 20) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getCommunities(limit);
        setCommunities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [limit]);

  return { communities, loading, error, refetch: () => fetchCommunities() };
}

// Custom hook for user profile
export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    
    try {
      const updatedProfile = await DatabaseService.updateProfile(userId, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}

// Custom hook for creating content
export function useCreateContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createArticle(article);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create article';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createIdea = async (idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createIdea(idea);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create idea';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createQuery = async (query: Omit<Query, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createQuery(query);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create query';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createGeneratedCode = async (code: Omit<GeneratedCode, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createGeneratedCode(code);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create generated code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createFlowchart = async (flowchart: Omit<Flowchart, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createFlowchart(flowchart);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create flowchart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (community: Omit<Community, 'id' | 'created_at' | 'updated_at' | 'member_count'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.createCommunity(community);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create community';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createArticle,
    createIdea,
    createQuery,
    createGeneratedCode,
    createFlowchart,
    createCommunity
  };
}