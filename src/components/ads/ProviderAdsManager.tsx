import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Calendar, Eye, Trash2, Clock, CheckCircle, XCircle,
  Loader2, Heart, Megaphone, AlertTriangle, PartyPopper,
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Ad, createAd, deleteProviderAd, getProviderAds,
} from '@/services/adsService';

interface ProviderAdsManagerProps {
  providerId: string;
  providerUserId: string;
  providerName: string;
  providerAvatar?: string;
  providerType?: string;
  providerCity?: string;
  isVerified: boolean;
  onStatsChange?: (activeCount: number, expiredCount: number) => void;
}

const MAX_ADS = 5;

export function ProviderAdsManager({
  providerId, providerName, providerAvatar, providerType, providerCity, isVerified, onStatsChange,
}: ProviderAdsManagerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [justPublishedId, setJustPublishedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    full_description: '',
    expires_at: '',
  });

  const activeCount = ads.filter(a => a.status === 'approved' && (!a.expires_at || !isPast(new Date(a.expires_at)))).length;

  const expiringAds = ads.filter(ad => {
    if (!ad.expires_at || ad.status !== 'approved') return false;
    const daysLeft = differenceInDays(new Date(ad.expires_at), new Date());
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const expiredAds = ads.filter(ad => {
    if (!ad.expires_at) return false;
    return isPast(new Date(ad.expires_at)) && ad.status === 'approved';
  });

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const data = await getProviderAds(providerId);
      setAds(data);

      const active = data.filter(a => a.status === 'approved' && (!a.expires_at || !isPast(new Date(a.expires_at))));
      const expired = data.filter(a => a.expires_at && isPast(new Date(a.expires_at)) && a.status === 'approved');
      onStatsChange?.(active.length, expired.length);

      const expiring = data.filter(ad => {
        if (!ad.expires_at || ad.status !== 'approved') return false;
        const daysLeft = differenceInDays(new Date(ad.expires_at), new Date());
        return daysLeft >= 0 && daysLeft <= 3;
      });
      if (expiring.length > 0) {
        expiring.forEach(ad => {
          const days = differenceInDays(new Date(ad.expires_at!), new Date());
          toast.warning(
            days === 0
              ? `Votre annonce "${ad.title}" expire aujourd'hui !`
              : `Votre annonce "${ad.title}" expire dans ${days} jour${days > 1 ? 's' : ''}.`,
            { duration: 6000 }
          );
        });
      }
    } catch { setAds([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadAds(); }, [providerId]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.short_description.trim() || !form.full_description.trim()) {
      toast.error('Remplissez tous les champs obligatoires');
      return;
    }
    if (form.short_description.length > 200) {
      toast.error('Description courte: max 200 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAd({
        provider_id: providerId,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        provider_type: providerType,
        provider_city: providerCity,
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        is_verified_provider: isVerified,
        expires_at: form.expires_at || undefined,
      });

      setForm({ title: '', short_description: '', full_description: '', expires_at: '' });
      setIsDialogOpen(false);
      setJustPublishedId(created.id);
      toast.success('Annonce publiée avec succès !', {
        description: 'Elle est maintenant visible sur votre profil public.',
        duration: 5000,
      });
      await loadAds();
    } catch (error: any) {
      if (error.message === 'PROFANITY_DETECTED') {
        toast.error('Contenu inapproprié détecté. Veuillez reformuler.');
      } else if (error.message === 'MAX_ADS_REACHED') {
        toast.error(`Limite atteinte (${MAX_ADS} annonces actives max)`);
      } else {
        toast.error('Erreur lors de la publication');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adId: string) => {
    setDeletingId(adId);
    try {
      await deleteProviderAd(adId);
      if (justPublishedId === adId) setJustPublishedId(null);
      toast.success('Annonce supprimée');
      loadAds();
    } catch { toast.error('Erreur de suppression'); }
    finally { setDeletingId(null); }
  };

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-500', label: 'En attente' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', label: 'Publiée' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejetée' },
    suspended: { icon: AlertTriangle, color: 'text-orange-500', label: 'Suspendue' },
  };

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Mes Annonces</CardTitle>
          <CardDescription>Promouvoir vos services auprès des patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Profil non vérifié</p>
            <p className="text-sm mt-1">Vous devez faire vérifier votre profil avant de publier des annonces.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Mes Annonces
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">
                  {activeCount} active{activeCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Gérez vos annonces publiées sur votre profil</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={activeCount >= MAX_ADS} data-testid="button-new-annonce">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Publier une annonce</DialogTitle>
                <DialogDescription>
                  Votre annonce sera immédiatement visible sur votre profil public.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Titre *</Label>
                  <Input
                    placeholder="Ex: Consultation gratuite pour nouveaux patients"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    data-testid="input-annonce-title"
                  />
                </div>
                <div>
                  <Label>
                    Description courte *{' '}
                    <span className="text-xs text-muted-foreground">
                      ({form.short_description.length}/200)
                    </span>
                  </Label>
                  <Textarea
                    placeholder="Texte de prévisualisation (max 200 car.)"
                    rows={2}
                    maxLength={200}
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    data-testid="input-annonce-short-desc"
                  />
                </div>
                <div>
                  <Label>Description complète *</Label>
                  <Textarea
                    placeholder="Décrivez votre offre en détail..."
                    rows={4}
                    value={form.full_description}
                    onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                    data-testid="input-annonce-full-desc"
                  />
                </div>
                <div>
                  <Label>Date d'expiration (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="input-annonce-expires"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-publish-annonce"
                >
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publication...</>
                    : 'Publier l\'annonce'
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{activeCount}/{MAX_ADS} annonces actives</span>
            {activeCount >= MAX_ADS && <span className="text-amber-500">Limite atteinte</span>}
          </div>
          <Progress value={(activeCount / MAX_ADS) * 100} className="h-1.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {expiringAds.length > 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              {expiringAds.length === 1
                ? `L'annonce "${expiringAds[0].title}" expire bientôt.`
                : `${expiringAds.length} annonces expirent dans moins de 7 jours.`
              }
            </AlertDescription>
          </Alert>
        )}

        {expiredAds.length > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
              {expiredAds.length} annonce{expiredAds.length > 1 ? 's ont' : ' a'} expiré.
              Supprimez-les pour libérer de la place.
            </AlertDescription>
          </Alert>
        )}

        {ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Aucune annonce pour le moment</p>
            <p className="text-sm mt-1">Créez votre première annonce pour attirer plus de patients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => {
              const config = statusConfig[ad.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isJustPublished = justPublishedId === ad.id;

              return (
                <div
                  key={ad.id}
                  className={`border rounded-xl p-4 hover:shadow-sm transition-shadow ${isJustPublished ? 'border-primary/40 bg-primary/5' : ''}`}
                  data-testid={`card-annonce-${ad.id}`}
                >
                  {isJustPublished && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium mb-3 pb-2 border-b border-primary/20">
                      <PartyPopper className="h-3.5 w-3.5" />
                      Annonce publiée avec succès !
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{ad.title}</h4>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {ad.expires_at && (() => {
                          const daysLeft = differenceInDays(new Date(ad.expires_at!), new Date());
                          if (daysLeft < 0) return (
                            <Badge variant="destructive" className="text-xs">Expirée</Badge>
                          );
                          if (daysLeft <= 7) return (
                            <Badge variant="outline" className="text-xs text-amber-500 border-amber-300">
                              {daysLeft === 0 ? 'Expire auj.' : `J-${daysLeft}`}
                            </Badge>
                          );
                          return null;
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ad.short_description}</p>

                      {ad.status === 'rejected' && ad.rejection_reason && (
                        <p className="text-xs text-destructive mt-1">Raison: {ad.rejection_reason}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(ad.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{ad.likes_count}</span>
                        {ad.expires_at && !isPast(new Date(ad.expires_at)) && (
                          <span className="flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            Expire le {format(new Date(ad.expires_at), 'dd MMM', { locale: fr })}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                      data-testid={`button-delete-annonce-${ad.id}`}
                    >
                      {deletingId === ad.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
