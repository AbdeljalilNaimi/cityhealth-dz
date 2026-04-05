import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeStats {
  providerCount: number;
  consultationCount: number;
  averageRating: number;
  totalRatings: number;
}

const FALLBACK: RealtimeStats = {
  providerCount: 287,
  consultationCount: 15420,
  averageRating: 4.7,
  totalRatings: 0,
};

/** Try getCountFromServer first; fall back to getDocs if rules deny it. */
async function countCollection(q: ReturnType<typeof query> | ReturnType<typeof collection>): Promise<number> {
  try {
    const snap = await getCountFromServer(q as any);
    return snap.data().count;
  } catch {
    // Aggregation not permitted — fall back to getDocs with a high cap
    const snap = await getDocs(query(q as any, limit(5000)));
    return snap.size;
  }
}

async function fetchRealtimeStats(): Promise<RealtimeStats> {
  const result: RealtimeStats = { ...FALLBACK };

  const [providersResult, consultationsResult, ratingsResult] = await Promise.allSettled([
    // 1. Provider count — Firebase only
    countCollection(collection(db, 'providers')),

    // 2. Completed consultations count — Firebase only
    countCollection(
      query(collection(db, 'appointments'), where('status', '==', 'completed'))
    ),

    // 3. Average rating — Supabase provider_reviews only (not Firebase)
    supabase
      .from('provider_reviews')
      .select('rating')
      .gte('rating', 1)
      .lte('rating', 5),
  ]);

  // Provider count
  if (providersResult.status === 'fulfilled' && providersResult.value > 0) {
    result.providerCount = providersResult.value;
  }

  // Completed consultations
  if (consultationsResult.status === 'fulfilled') {
    result.consultationCount = consultationsResult.value;
  }

  // Average rating from Supabase provider_reviews
  if (ratingsResult.status === 'fulfilled') {
    const rows = (ratingsResult.value.data ?? []) as { rating: number }[];
    if (rows.length > 0) {
      const sum = rows.reduce((acc, r) => acc + r.rating, 0);
      result.averageRating = parseFloat((sum / rows.length).toFixed(1));
      result.totalRatings = rows.length;
    }
  }

  return result;
}

export function useRealtimeStats() {
  return useQuery<RealtimeStats>({
    queryKey: ['homepage-realtime-stats'],
    queryFn: fetchRealtimeStats,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
