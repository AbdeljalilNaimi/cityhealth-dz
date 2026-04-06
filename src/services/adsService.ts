import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { containsProfanity } from '@/utils/profanityFilter';

type AdsInsert = Database['public']['Tables']['ads']['Insert'];

export interface Ad {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar: string | null;
  provider_type: string | null;
  provider_city: string | null;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  type: 'annonce' | 'publication';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  is_verified_provider: boolean;
  views_count: number;
  likes_count: number;
  saves_count: number;
  rejection_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Publication-specific fields
  category: string | null;
  doi: string | null;
  pdf_url: string | null;
  keywords: string | null;
}

export interface AdFilters {
  search?: string;
  specialty?: string;
  city?: string;
  sort?: 'newest' | 'popular' | 'featured';
  limit?: number;
  offset?: number;
}

interface CreateAdInput {
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_type?: string;
  provider_city?: string;
  title: string;
  short_description: string;
  full_description: string;
  image_url?: string;
  is_verified_provider?: boolean;
  expires_at?: string;
}

export interface CreatePublicationInput {
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_type?: string;
  provider_city?: string;
  title: string;
  short_description: string;
  full_description: string;
  image_url?: string;
  pdf_url?: string;
  doi?: string;
  category: string;
  keywords?: string;
  is_verified_provider?: boolean;
  expires_at?: string;
}

// ====== CRUD ======

export async function createAd(input: CreateAdInput): Promise<Ad> {
  // Profanity check
  const text = `${input.title} ${input.short_description} ${input.full_description}`;
  if (containsProfanity(text)) {
    throw new Error('PROFANITY_DETECTED');
  }

  // Check active annonces limit (max 5)
  const { count } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', input.provider_id)
    .in('status', ['pending', 'approved']);

  if ((count ?? 0) >= 5) {
    throw new Error('MAX_ADS_REACHED');
  }

  const { data, error } = await supabase
    .from('ads')
    .insert({
      ...input,
      image_url: input.image_url || '',
      type: 'annonce',
      status: 'approved',
      is_featured: false,
      views_count: 0,
      likes_count: 0,
      saves_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
}

export async function updateAd(id: string, updates: Partial<CreateAdInput>): Promise<void> {
  if (updates.title || updates.short_description || updates.full_description) {
    const text = `${updates.title || ''} ${updates.short_description || ''} ${updates.full_description || ''}`;
    if (containsProfanity(text)) {
      throw new Error('PROFANITY_DETECTED');
    }
  }

  const { error } = await supabase
    .from('ads')
    .update({ ...updates, status: 'pending' }) // Re-submit for moderation
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProviderAd(id: string): Promise<void> {
  const { error } = await supabase.from('ads').delete().eq('id', id);
  if (error) throw error;
}

export async function createPublication(input: CreatePublicationInput): Promise<Ad> {
  const text = `${input.title} ${input.short_description} ${input.full_description}`;
  if (containsProfanity(text)) {
    throw new Error('PROFANITY_DETECTED');
  }

  if (!input.category) {
    throw new Error('CATEGORY_REQUIRED');
  }

  const insertData: AdsInsert = {
    provider_id: input.provider_id,
    provider_name: input.provider_name,
    provider_avatar: input.provider_avatar ?? null,
    provider_type: input.provider_type ?? null,
    provider_city: input.provider_city ?? null,
    is_verified_provider: input.is_verified_provider ?? false,
    title: input.title,
    short_description: input.short_description,
    full_description: input.full_description,
    image_url: input.image_url ?? '',
    status: 'pending',
    is_featured: false,
    views_count: 0,
    likes_count: 0,
    saves_count: 0,
    expires_at: input.expires_at ?? null,
  };

  const { data, error } = await supabase
    .from('ads')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
}

export async function getProviderPublications(providerId: string): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('provider_id', providerId)
    .eq('type', 'publication')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ad[];
}

// ====== QUERIES ======

export async function getApprovedAds(filters: AdFilters = {}): Promise<Ad[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from('ads')
    .select('*')
    .eq('type', 'publication')
    .eq('status', 'approved')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
  }
  if (filters.specialty) {
    query = query.eq('provider_type', filters.specialty);
  }
  if (filters.city) {
    query = query.eq('provider_city', filters.city);
  }

  // Sort
  if (filters.sort === 'popular') {
    query = query.order('likes_count', { ascending: false });
  } else if (filters.sort === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Ad[];
}

export async function getProviderAds(providerId: string): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('provider_id', providerId)
    .eq('type', 'annonce')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ad[];
}

export async function getActiveProviderAds(providerId: string): Promise<Ad[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('provider_id', providerId)
    .eq('type', 'annonce')
    .eq('status', 'approved')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ad[];
}

export async function getAllAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ad[];
}

// ====== ENGAGEMENT ======

export async function toggleLike(adId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const { data: existing } = await supabase
    .from('ad_likes')
    .select('id')
    .eq('ad_id', adId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('ad_likes').delete().eq('id', existing.id);
    return false; // unliked
  } else {
    await supabase.from('ad_likes').insert({ ad_id: adId, user_id: userId });
    return true; // liked
  }
}

export async function toggleSave(adId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('ad_saves')
    .select('id')
    .eq('ad_id', adId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('ad_saves').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('ad_saves').insert({ ad_id: adId, user_id: userId });
    return true;
  }
}

export async function reportAd(adId: string, reporterId: string, reason: string, details?: string): Promise<void> {
  const { error } = await supabase
    .from('ad_reports')
    .insert({ ad_id: adId, reporter_id: reporterId, reason, details });
  if (error) throw error;
}

export async function getUserLikes(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('ad_likes')
    .select('ad_id')
    .eq('user_id', userId);
  return (data || []).map(d => d.ad_id);
}

export async function getUserSaves(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('ad_saves')
    .select('ad_id')
    .eq('user_id', userId);
  return (data || []).map(d => d.ad_id);
}

export async function getSavedAds(userId: string): Promise<Ad[]> {
  const { data: saves } = await supabase
    .from('ad_saves')
    .select('ad_id')
    .eq('user_id', userId);

  if (!saves?.length) return [];

  const adIds = saves.map(s => s.ad_id);
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .in('id', adIds)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ad[];
}

export async function incrementViews(adId: string): Promise<void> {
  const { data } = await supabase
    .from('ads')
    .select('views_count')
    .eq('id', adId)
    .single();

  if (data) {
    await supabase
      .from('ads')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', adId);
  }
}

// ====== ADMIN ======

async function createAdNotification(
  adId: string,
  type: 'approved' | 'rejected' | 'suspended',
  message: string,
): Promise<void> {
  const { data: ad } = await supabase
    .from('ads')
    .select('provider_id, title')
    .eq('id', adId)
    .single();
  if (!ad) return;
  await (supabase.from as any)('ad_notifications').insert({
    provider_id: ad.provider_id,
    ad_id: adId,
    ad_title: ad.title,
    type,
    message,
  });
}

// ─── Admin moderation — all routed through SECURITY DEFINER RPCs ───
// The moderator secret is verified server-side; direct anon status
// mutations are blocked by a DB trigger.

const MODERATOR_SECRET = import.meta.env.VITE_MODERATOR_SECRET as string;

export async function adminApprove(adId: string): Promise<void> {
  const { error } = await (supabase.rpc as any)('admin_approve_publication', {
    p_ad_id: adId,
    p_secret: MODERATOR_SECRET,
  });
  if (error) throw error;
}

export async function adminReject(adId: string, reason: string): Promise<void> {
  const { error } = await (supabase.rpc as any)('admin_reject_publication', {
    p_ad_id: adId,
    p_reason: reason || 'Non conforme aux règles de la plateforme',
    p_secret: MODERATOR_SECRET,
  });
  if (error) throw error;
}

export async function adminSuspend(adId: string): Promise<void> {
  const { error } = await (supabase.rpc as any)('admin_suspend_publication', {
    p_ad_id: adId,
    p_secret: MODERATOR_SECRET,
  });
  if (error) throw error;
}

export async function deleteAd(adId: string): Promise<void> {
  const { error } = await (supabase.rpc as any)('admin_delete_publication', {
    p_ad_id: adId,
    p_secret: MODERATOR_SECRET,
  });
  if (error) throw error;
}

export async function adminToggleFeatured(adId: string, featured: boolean): Promise<void> {
  const { error } = await (supabase.rpc as any)('admin_toggle_featured_pub', {
    p_ad_id: adId,
    p_featured: featured,
    p_secret: MODERATOR_SECRET,
  });
  if (error) throw error;
}

export async function getAdReports(): Promise<any[]> {
  const { data, error } = await supabase
    .from('ad_reports')
    .select('*, ads(title, provider_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function resolveReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('ad_reports')
    .update({ status: 'resolved' })
    .eq('id', reportId);
  if (error) throw error;
}

// ====== PROVIDER NOTIFICATIONS ======

export interface AdNotification {
  id: string;
  provider_id: string;
  ad_id: string | null;
  ad_title: string;
  type: 'approved' | 'rejected' | 'suspended' | 'submitted';
  message: string | null;
  read: boolean;
  created_at: string;
}

export async function getProviderAdNotifications(providerId: string): Promise<AdNotification[]> {
  const { data, error } = await (supabase.from as any)('ad_notifications')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as AdNotification[];
}

export async function markAdNotificationRead(notificationId: string): Promise<void> {
  await (supabase.from as any)('ad_notifications')
    .update({ read: true })
    .eq('id', notificationId);
}

export async function markAllAdNotificationsRead(providerId: string): Promise<void> {
  await (supabase.from as any)('ad_notifications')
    .update({ read: true })
    .eq('provider_id', providerId)
    .eq('read', false);
}

// ====== IMAGE & PDF UPLOAD ======

export async function uploadAdImage(file: File, providerId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${providerId}/ads/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('provider-images')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('provider-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadAdPdf(file: File, providerId: string): Promise<string> {
  const path = `${providerId}/publications/${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from('provider-images')
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });

  if (error) throw error;

  const { data } = supabase.storage
    .from('provider-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
