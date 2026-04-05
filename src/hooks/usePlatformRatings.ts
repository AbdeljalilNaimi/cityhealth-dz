import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformRating {
  id: string;
  rating: number;
  feedback: string | null;
  action_type: string;
  provider_id: string | null;
  session_id: string;
  created_at: string;
}

export interface PlatformRatingStats {
  averageRating: number;
  totalRatings: number;
}

export function usePlatformRatingStats() {
  return useQuery<PlatformRatingStats>({
    queryKey: ['platform-rating-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('platform_ratings')
          .select('rating')
          .gte('rating', 1)
          .lte('rating', 5);

        if (error) return { averageRating: 4.7, totalRatings: 0 };

        const rows = (data || []) as { rating: number }[];
        if (rows.length === 0) return { averageRating: 4.7, totalRatings: 0 };

        const sum = rows.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
        return {
          averageRating: parseFloat((sum / rows.length).toFixed(1)),
          totalRatings: rows.length,
        };
      } catch {
        return { averageRating: 4.7, totalRatings: 0 };
      }
    },
    staleTime: 60_000,
  });
}

export function useSubmitPlatformRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      rating: number;
      feedback?: string;
      actionType: string;
      providerId?: string;
      sessionId: string;
    }) => {
      const { error } = await (supabase as any).from('platform_ratings').insert({
        rating: input.rating,
        feedback: input.feedback || null,
        action_type: input.actionType,
        provider_id: input.providerId || null,
        session_id: input.sessionId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-rating-stats'] });
    },
  });
}
