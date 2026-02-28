import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Navigation,
  MapPin,
  Star,
  Phone,
  ExternalLink,
  List,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';

interface MapSidebarProps {
  providers: CityHealthProvider[];
  distances: Map<string, number>;
  loading: boolean;
  label?: string;
}

export const MapSidebar = ({
  providers,
  distances,
  loading,
  label,
}: MapSidebarProps) => {
  const { selectedProvider, setSelectedProvider, calculateRoute, isRouting, isRTL, flyTo, sidebarOpen, setSidebarOpen } = useMapContext();
  const { language } = useLanguage();
  const [routingId, setRoutingId] = useState<string | null>(null);

  const t = useMemo(() => ({
    fr: {
      providers: 'prestataires',
      provider: 'prestataire',
      km: 'km',
      noResults: 'Aucun prestataire trouvé',
      noResultsSub: 'Essayez de modifier vos filtres ou votre zone de recherche',
      route: 'Itinéraire',
      call: 'Appeler',
      viewProfile: 'Profil',
      close: 'Masquer la liste',
      open: 'Voir la liste',
      verified: 'Vérifié',
      emergency247: '24/7',
    },
    ar: {
      providers: 'مقدمين',
      provider: 'مقدم',
      km: 'كم',
      noResults: 'لم يتم العثور على مقدمين',
      noResultsSub: 'حاول تعديل الفلاتر أو نطاق البحث',
      route: 'الاتجاهات',
      call: 'اتصل',
      viewProfile: 'الملف',
      close: 'إخفاء القائمة',
      open: 'عرض القائمة',
      verified: 'موثق',
      emergency247: '24/7',
    },
    en: {
      providers: 'providers',
      provider: 'provider',
      km: 'km',
      noResults: 'No providers found',
      noResultsSub: 'Try adjusting your filters or search area',
      route: 'Directions',
      call: 'Call',
      viewProfile: 'Profile',
      close: 'Hide list',
      open: 'Show list',
      verified: 'Verified',
      emergency247: '24/7',
    },
  }), []);

  const tx = t[language as keyof typeof t] || t.fr;

  const handleProviderClick = (provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  };

  const handleRoute = (e: React.MouseEvent, provider: CityHealthProvider) => {
    e.stopPropagation();
    setRoutingId(provider.id);
    calculateRoute(provider);
    setTimeout(() => setRoutingId(null), 3000);
  };

  // Toggle button — shown on the map when sidebar is closed
  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className={cn(
          "absolute top-20 z-[1000] flex items-center gap-2 px-3.5 py-2.5 bg-card/95 backdrop-blur-sm border border-border/60 shadow-xl text-sm font-medium text-foreground hover:bg-accent transition-all duration-200",
          isRTL ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"
        )}
        title={tx.open}
      >
        <List className="h-4 w-4 text-primary" />
        <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col w-80 flex-shrink-0 h-full bg-card z-10 overflow-hidden",
        isRTL ? "border-l border-border/60" : "border-r border-border/60"
      )}
    >
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <List className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <p className="text-sm font-semibold leading-tight truncate">
                <span className="text-primary font-bold">{providers.length}</span>{' '}
                <span className="text-foreground">{providers.length === 1 ? tx.provider : tx.providers}</span>
                {label && <span className="text-muted-foreground"> · {label}</span>}
              </p>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0 rounded-lg hover:bg-muted"
          onClick={() => setSidebarOpen(false)}
          title={tx.close}
        >
          <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </Button>
      </div>

      {/* ── Content ── */}
      <ScrollArea className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl border border-border/40 bg-muted/20">
                <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-7 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tx.noResults}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{tx.noResultsSub}</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 space-y-1.5">
            {providers.map((provider) => {
              const distance = distances.get(provider.id);
              const isSelected = selectedProvider?.id === provider.id;
              const typeLabel =
                PROVIDER_TYPE_LABELS[provider.type]?.[language as 'fr' | 'ar' | 'en'] || provider.type;
              const isComputingRoute = routingId === provider.id || (isRouting && isSelected);

              return (
                <button
                  key={provider.id}
                  className={cn(
                    'w-full flex gap-3 p-3.5 rounded-xl text-left transition-all duration-200',
                    'hover:bg-accent/50 hover:shadow-sm',
                    isSelected
                      ? 'bg-primary/5 border-l-[3px] border-l-primary border border-primary/20 shadow-sm'
                      : 'border border-transparent hover:border-border/40'
                  )}
                  onClick={() => handleProviderClick(provider)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {provider.image && provider.image !== '/placeholder.svg' ? (
                      <div className="w-13 h-13 rounded-xl overflow-hidden ring-2 ring-border/30">
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <ProviderAvatar
                        image={null}
                        name={provider.name}
                        type={provider.type}
                        className="h-13 w-13 rounded-xl ring-2 ring-border/30"
                        iconSize={24}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Name + verified */}
                    <div className="flex items-start gap-1.5">
                      <h4 className="font-semibold text-sm leading-snug truncate flex-1 text-foreground">
                        {provider.name}
                      </h4>
                      {isProviderVerified(provider) && (
                        <VerifiedBadge type={(provider as any).planType === 'premium' ? 'premium' : 'verified'} size="sm" showTooltip={false} />
                      )}
                    </div>

                    {/* Type + 24/7 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] h-5 px-2 font-normal rounded-md">
                        {typeLabel}
                      </Badge>
                      {provider.emergency && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-2 rounded-md">
                          {tx.emergency247}
                        </Badge>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{provider.address}</span>
                    </div>

                    {/* Distance + rating */}
                    <div className="flex items-center gap-3 text-xs">
                      {distance !== undefined && (
                        <span className="text-muted-foreground font-medium">
                          {distance.toFixed(1)} {tx.km}
                        </span>
                      )}
                      {provider.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-8 text-xs gap-1.5 rounded-lg shadow-sm"
                        onClick={(e) => handleRoute(e, provider)}
                        disabled={isComputingRoute}
                      >
                        {isComputingRoute ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Navigation className="h-3 w-3" />
                        )}
                        {tx.route}
                      </Button>

                      {provider.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 flex-shrink-0 rounded-lg"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={`tel:${provider.phone}`}>
                            <Phone className="h-3 w-3" />
                          </a>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 flex-shrink-0 rounded-lg"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/provider/${provider.id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
