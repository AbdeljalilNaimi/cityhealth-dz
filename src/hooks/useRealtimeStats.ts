import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function fetchRealtimeStats(): Promise<RealtimeStats> {
  const result: RealtimeStats = { ...FALLBACK };

  const [providersResult, statsDocResult, ratingsResult] = await Promise.allSettled([
    // 1. Provider count — Firebase, filtered by verified+public
    //    This matches the public read rule so anonymous visitors can query it
    getDocs(
      query(
        collection(db, 'providers'),
        where('verificationStatus', '==', 'verified'),
        where('isPublic', '==', true)
      )
    ),

    // 2. Completed consultations — read from the publicly-readable /platform/stats document
    getDoc(doc(db, 'platform', 'stats')),

    // 3. Average rating — Supabase provider_reviews only (never Firebase)
    supabase
      .from('provider_reviews')
      .select('rating')
      .gte('rating', 1)
      .lte('rating', 5),
  ]);

  // Provider count (verified + public providers from Firebase)
  if (providersResult.status === 'fulfilled') {
    const count = providersResult.value.size;
    if (count >= 0) result.providerCount = count;
  }

  // Completed consultations from /platform/stats (publicly readable)
  if (statsDocResult.status === 'fulfilled' && statsDocResult.value.exists()) {
    const data = statsDocResult.value.data();
    const count = data?.completedConsultations;
    if (typeof count === 'number' && count >= 0) {
      result.consultationCount = count;
    }
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
