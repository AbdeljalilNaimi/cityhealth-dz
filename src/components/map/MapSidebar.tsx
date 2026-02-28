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
          "absolute top-20 z-[1000] flex items-center gap-2 px-3 py-2 rounded-r-xl bg-background border border-border shadow-lg text-sm font-medium text-foreground hover:bg-muted transition-colors",
          isRTL ? "right-0 rounded-r-none rounded-l-xl" : "left-0"
        )}
        title={tx.open}
      >
        <List className="h-4 w-4" />
        <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col w-80 flex-shrink-0 h-full bg-background border-border shadow-xl z-10 overflow-hidden",
        isRTL ? "border-l" : "border-r"
      )}
    >
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <List className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm font-semibold leading-tight truncate">
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <>
                <span className="text-primary">{providers.length}</span>{' '}
                {providers.length === 1 ? tx.provider : tx.providers}
                {label ? ` · ${label}` : ''}
              </>
            )}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => setSidebarOpen(false)}
          title={tx.close}
        >
          <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </Button>
      </div>

      {/* ── Content ── */}
      <ScrollArea className="flex-1" style={{ maxHeight: 'calc(4 * 160px)' }}>
        {loading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-border">
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{tx.noResults}</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {providers.map((provider) => {
              const distance = distances.get(provider.id);
              const isSelected = selectedProvider?.id === provider.id;
              const typeLabel =
                PROVIDER_TYPE_LABELS[provider.type]?.[
                  language === 'en' ? 'fr' : (language as 'fr' | 'ar')
                ] || provider.type;
              const isComputingRoute = routingId === provider.id || (isRouting && isSelected);

              return (
                <button
                  key={provider.id}
                  className={cn(
                    'w-full flex gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    'hover:bg-muted/50 hover:shadow-sm',
                    isSelected
                      ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30 shadow-sm'
                      : 'border-border bg-card'
                  )}
                  onClick={() => handleProviderClick(provider)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {provider.image && provider.image !== '/placeholder.svg' ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden">
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
                        className="h-14 w-14 rounded-lg"
                        iconSize={24}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Name + verified */}
                    <div className="flex items-start gap-1.5">
                      <h4 className="font-semibold text-sm leading-snug truncate flex-1">
                        {provider.name}
                      </h4>
                      {isProviderVerified(provider) && (
                        <VerifiedBadge type="verified" size="sm" showTooltip={false} />
                      )}
                    </div>

                    {/* Type + 24/7 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                        {typeLabel}
                      </Badge>
                      {provider.emergency && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                          {tx.emergency247}
                        </Badge>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{provider.address}</span>
                    </div>

                    {/* Distance + rating */}
                    <div className="flex items-center gap-3 text-xs">
                      {distance !== undefined && (
                        <span className="text-muted-foreground">
                          {distance.toFixed(1)} {tx.km}
                        </span>
                      )}
                      {provider.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-7 text-xs gap-1"
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
                          className="h-7 w-7 p-0 flex-shrink-0"
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
                        className="h-7 w-7 p-0 flex-shrink-0"
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
