import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useSupabaseQuery<T>(
  table: string,
  query?: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let queryBuilder = supabase.from(table).select(query || '*');
        
        const { data, error } = await queryBuilder;
        
        if (error) throw error;
        
        setData(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

export function useSupabaseInsert<T>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
}

export function useSupabaseUpdate<T>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useSupabaseDelete(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecord, loading, error };
}

export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  useEffect(() => {
    let subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter]);
}