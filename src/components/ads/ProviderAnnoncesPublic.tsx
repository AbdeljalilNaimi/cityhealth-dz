import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Ad, getActiveProviderAds } from '@/services/adsService';

interface ProviderAnnoncesPublicProps {
  providerId: string;
  gradientClass?: string;
  iconColorClass?: string;
}

export function ProviderAnnoncesPublic({
  providerId,
  gradientClass = 'from-primary to-primary/60',
  iconColorClass = 'text-primary',
}: ProviderAnnoncesPublicProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    setIsLoading(true);
    getActiveProviderAds(providerId)
      .then(setAds)
      .catch(() => setAds([]))
      .finally(() => setIsLoading(false));
  }, [providerId]);

  if (isLoading) return null;
  if (ads.length === 0) return null;

  const isNew = (ad: Ad) => differenceInDays(new Date(), new Date(ad.created_at)) <= 7;

  const hasNew = ads.some(ad => differenceInDays(new Date(), new Date(ad.created_at)) <= 7);

  return (
    <Card className="glass-card overflow-hidden animate-fade-in border-primary/20" style={{ animationDelay: '350ms' }}>
      <div className={cn('h-1.5 bg-gradient-to-r', gradientClass)} />
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Megaphone className={cn('h-5 w-5', iconColorClass)} />
            {hasNew && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          Annonces
          <Badge
            variant="secondary"
            className="ml-1 bg-primary/10 text-primary text-xs"
            data-testid="badge-annonces-count"
          >
            {ads.length}
          </Badge>
          {hasNew && (
            <Badge className="text-xs px-1.5 py-0 h-4 bg-emerald-500 text-white gap-1 ml-auto" data-testid="badge-annonces-new">
              <Sparkles className="h-2.5 w-2.5" />
              Nouveau
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {ads.map((ad) => {
          const expanded = expandedId === ad.id;
          const newAd = isNew(ad);
          const expiresIn = ad.expires_at
            ? differenceInDays(new Date(ad.expires_at), new Date())
            : null;

          return (
            <div
              key={ad.id}
              className="border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
              data-testid={`card-annonce-public-${ad.id}`}
            >
              <button
                className="w-full text-left p-4"
                onClick={() => setExpandedId(expanded ? null : ad.id)}
                aria-expanded={expanded}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 shrink-0 rounded-full p-1.5 bg-primary/10', iconColorClass)}>
                    <Megaphone className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-medium text-sm leading-snug">{ad.title}</span>
                      {newAd && (
                        <Badge className="text-xs px-1.5 py-0 h-4 bg-emerald-500 text-white">
                          Nouveau
                        </Badge>
                      )}
                      {expiresIn !== null && expiresIn <= 7 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 text-amber-500 border-amber-300">
                          {expiresIn === 0 ? 'Expire auj.' : `J-${expiresIn}`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ad.short_description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(ad.created_at), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  <div className="shrink-0 text-muted-foreground mt-0.5">
                    {expanded
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                  <p className="text-sm leading-relaxed mt-3 whitespace-pre-wrap">
                    {ad.full_description}
                  </p>
                  {ad.expires_at && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Valable jusqu'au {format(new Date(ad.expires_at), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
