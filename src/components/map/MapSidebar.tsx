import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS } from '@/data/providers';
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
  const [typeFilter, setTypeFilter] = useState<ProviderType | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Reset visible count when filter changes
  const toggleTypeFilterWithReset = useCallback((type: ProviderType) => {
    setTypeFilter(prev => prev === type ? null : type);
    setVisibleCount(5);
  }, []);

  // Get unique types from providers
  const availableTypes = useMemo(() => {
    const types = new Set(providers.map(p => p.type));
    return Array.from(types).sort();
  }, [providers]);

  // Filter providers by selected type
  const filteredProviders = useMemo(() => {
    if (!typeFilter) return providers;
    return providers.filter(p => p.type === typeFilter);
  }, [providers, typeFilter]);

  // Visible slice
  const visibleProviders = useMemo(() => {
    return filteredProviders.slice(0, visibleCount);
  }, [filteredProviders, visibleCount]);

  const hasMore = filteredProviders.length > visibleCount;

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
          isRTL ? "left-0 rounded-r-xl" : "right-0 rounded-l-xl"
        )}
        title={tx.open}
      >
        <List className="h-4 w-4 text-primary" />
        <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col w-72 flex-shrink-0 h-full bg-card z-10 overflow-hidden",
        isRTL ? "border-r border-border/60" : "border-l border-border/60"
      )}
    >
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <List className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-3.5 w-24" />
            ) : (
              <p className="text-xs font-semibold leading-tight truncate">
                <span className="text-primary font-bold">{filteredProviders.length}</span>{' '}
                <span className="text-foreground">{filteredProviders.length === 1 ? tx.provider : tx.providers}</span>
                {label && <span className="text-muted-foreground"> · {label}</span>}
              </p>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 flex-shrink-0 rounded-lg hover:bg-muted"
          onClick={() => setSidebarOpen(false)}
          title={tx.close}
        >
          <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </Button>
      </div>

      {/* ── Type Filter Pills ── */}
      {availableTypes.length > 1 && (
        <div className="px-2 py-1.5 border-b border-border/40 flex overflow-x-auto gap-1 scrollbar-none">
          {availableTypes.map(type => {
            const label = PROVIDER_TYPE_LABELS[type];
            const isActive = typeFilter === type;
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilterWithReset(type)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all border whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>{label?.icon}</span>
                <span>{language === 'ar' ? label?.ar : label?.fr}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      <ScrollArea className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-2 space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-2.5 p-2.5 rounded-lg border border-border/30 bg-muted/10">
                <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-16 px-5 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{tx.noResults}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{tx.noResultsSub}</p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {visibleProviders.map((provider) => {
              const distance = distances.get(provider.id);
              const isSelected = selectedProvider?.id === provider.id;
              const typeLabel =
                PROVIDER_TYPE_LABELS[provider.type]?.[language as 'fr' | 'ar' | 'en'] || provider.type;
              const isComputingRoute = routingId === provider.id || (isRouting && isSelected);

              return (
                <button
                  key={provider.id}
                  className={cn(
                    'w-full flex gap-2.5 p-2.5 rounded-lg text-left transition-all duration-150',
                    'hover:bg-accent/40',
                    isSelected
                      ? 'bg-primary/5 border-l-[3px] border-l-primary border border-primary/20'
                      : 'border border-transparent hover:border-border/30'
                  )}
                  onClick={() => handleProviderClick(provider)}
                >
                  {/* Small Avatar */}
                  <div className="flex-shrink-0">
                    {provider.image && provider.image !== '/placeholder.svg' ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-border/20">
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
                        className="h-9 w-9 rounded-lg ring-1 ring-border/20"
                        iconSize={16}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-medium text-xs leading-snug truncate flex-1 text-foreground">
                        {provider.name}
                      </h4>
                      {isProviderVerified(provider) && (
                        <VerifiedBadge type={(provider as any).planType === 'premium' ? 'premium' : 'verified'} size="sm" showTooltip={false} />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal rounded-md">
                        {typeLabel}
                      </Badge>
                      {provider.emergency && (
                        <Badge variant="destructive" className="text-[9px] h-4 px-1.5 rounded-md">
                          {tx.emergency247}
                        </Badge>
                      )}
                      {distance !== undefined && (
                        <span className="text-muted-foreground text-[10px]">
                          {distance.toFixed(1)} {tx.km}
                        </span>
                      )}
                      {provider.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-medium">{provider.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-6 text-[10px] gap-1 rounded-md shadow-sm px-2"
                        onClick={(e) => handleRoute(e, provider)}
                        disabled={isComputingRoute}
                      >
                        {isComputingRoute ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <Navigation className="h-2.5 w-2.5" />
                        )}
                        {tx.route}
                      </Button>

                      {provider.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 flex-shrink-0 rounded-md"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={`tel:${provider.phone}`}>
                            <Phone className="h-2.5 w-2.5" />
                          </a>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 flex-shrink-0 rounded-md"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/provider/${provider.id}`}>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Show More button */}
            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-lg text-[11px] font-medium text-primary hover:bg-accent/40 transition-colors border border-border/30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                {language === 'ar' ? 'عرض المزيد' : language === 'en' ? 'Show more' : 'Voir plus'}
                <span className="text-muted-foreground">({filteredProviders.length - visibleCount})</span>
              </button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
