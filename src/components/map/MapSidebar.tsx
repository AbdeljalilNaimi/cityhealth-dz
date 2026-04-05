import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useRating } from '@/contexts/RatingContext';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Navigation,
  Star,
  Phone,
  ExternalLink,
  List,
  Loader2,
  AlertTriangle,
  Search,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS, PROVIDER_TYPES } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Switch } from '@/components/ui/switch';

export type MapSidebarMode = 'providers' | 'emergency' | 'blood';

interface MapSidebarProps {
  providers: CityHealthProvider[];
  distances: Map<string, number>;
  loading: boolean;
  label?: string;
  mode?: MapSidebarMode;
}

type Tx = {
  providers: string;
  provider: string;
  km: string;
  noResults: string;
  noResultsSub: string;
  route: string;
  close: string;
  open: string;
  emergency247: string;
  searchPlaceholder: string;
  showMore: string;
  allTypes: string;
  openNow: string;
};

const translations: Record<string, Tx> = {
  fr: {
    providers: 'prestataires', provider: 'prestataire', km: 'km',
    noResults: 'Aucun prestataire trouvé', noResultsSub: 'Essayez de modifier vos filtres',
    route: 'Itinéraire', close: 'Masquer', open: 'Voir la liste',
    emergency247: '24/7', searchPlaceholder: 'Rechercher un prestataire...',
    showMore: 'Voir plus', allTypes: 'Tous', openNow: 'Ouvert',
  },
  ar: {
    providers: 'مقدمين', provider: 'مقدم', km: 'كم',
    noResults: 'لم يتم العثور على مقدمين', noResultsSub: 'حاول تعديل الفلاتر',
    route: 'الاتجاهات', close: 'إخفاء', open: 'عرض القائمة',
    emergency247: '24/7', searchPlaceholder: 'البحث عن مقدم خدمة...',
    showMore: 'عرض المزيد', allTypes: 'الكل', openNow: 'مفتوح',
  },
  en: {
    providers: 'providers', provider: 'provider', km: 'km',
    noResults: 'No providers found', noResultsSub: 'Try adjusting your filters',
    route: 'Directions', close: 'Hide', open: 'Show list',
    emergency247: '24/7', searchPlaceholder: 'Search providers...',
    showMore: 'Show more', allTypes: 'All', openNow: 'Open now',
  },
};

// ─── ProviderItem — hoisted to module level to prevent remount on each parent render ───
interface ProviderItemProps {
  provider: CityHealthProvider;
  distance: number | undefined;
  isSelected: boolean;
  language: string;
  isComputingRoute: boolean;
  tx: Tx;
  onProviderClick: (provider: CityHealthProvider) => void;
  onRoute: (e: React.MouseEvent, provider: CityHealthProvider) => void;
  onCall: (provider: CityHealthProvider) => void;
  setRef: (el: HTMLDivElement | null) => void;
}

const ProviderItem = memo(function ProviderItem({
  provider, distance, isSelected, language, isComputingRoute,
  tx, onProviderClick, onRoute, onCall, setRef,
}: ProviderItemProps) {
  const typeLabel = PROVIDER_TYPE_LABELS[provider.type]?.[language as 'fr' | 'ar' | 'en'] || provider.type;

  return (
    <div
      ref={setRef}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={provider.name}
      data-testid={`provider-item-${provider.id}`}
      className={cn(
        'w-full flex gap-2.5 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer',
        'hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isSelected
          ? 'bg-primary/5 ring-1 ring-primary/30 shadow-sm'
          : 'border border-transparent'
      )}
      onClick={() => onProviderClick(provider)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onProviderClick(provider);
        }
      }}
    >
      <ProviderAvatar
        image={provider.image !== '/placeholder.svg' ? provider.image : null}
        name={provider.name}
        type={provider.type}
        className="h-10 w-10 rounded-xl ring-1 ring-border/20 flex-shrink-0"
        iconSize={18}
      />

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
            <div className="flex items-center gap-0.5" aria-label={`Note: ${provider.rating.toFixed(1)}`}>
              <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              <span className="text-[10px] font-medium">{provider.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm" variant="default"
            className="flex-1 h-6 text-[10px] gap-1 rounded-md shadow-sm px-2"
            onClick={(e) => onRoute(e, provider)}
            disabled={isComputingRoute}
            data-testid={`btn-route-${provider.id}`}
            aria-label={`${tx.route} — ${provider.name}`}
          >
            {isComputingRoute ? <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden="true" /> : <Navigation className="h-2.5 w-2.5" aria-hidden="true" />}
            {tx.route}
          </Button>
          {provider.phone && (
            <Button
              size="sm" variant="outline"
              className="h-6 w-6 p-0 flex-shrink-0 rounded-md"
              asChild
              onClick={(e) => { e.stopPropagation(); onCall(provider); }}
            >
              <a href={`tel:${provider.phone}`} aria-label={`Appeler ${provider.name}`} data-testid={`btn-call-${provider.id}`}>
                <Phone className="h-2.5 w-2.5" aria-hidden="true" />
              </a>
            </Button>
          )}
          <Button
            size="sm" variant="outline"
            className="h-6 w-6 p-0 flex-shrink-0 rounded-md"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/provider/${provider.id}`} aria-label={`Voir le profil de ${provider.name}`} data-testid={`link-profile-${provider.id}`}>
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
});

// ─── TypeFiltersRow — hoisted to module level ───
interface TypeFiltersRowProps {
  isRTL: boolean;
  activeTypes: Set<ProviderType>;
  updateParam: (key: string, value: string | null) => void;
  toggleType: (type: ProviderType) => void;
  language: string;
  allTypesLabel: string;
}

const TypeFiltersRow = memo(function TypeFiltersRow({
  isRTL, activeTypes, updateParam, toggleType, language, allTypesLabel,
}: TypeFiltersRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  return (
    <div className="relative group" role="group" aria-label="Filtrer par type">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all",
            isRTL ? "right-0" : "left-0"
          )}
          aria-label="Défiler à gauche"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} aria-hidden="true" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto gap-1 scrollbar-none pb-0.5",
          canScrollLeft && (isRTL ? "pr-5" : "pl-5"),
          canScrollRight && (isRTL ? "pl-5" : "pr-5")
        )}
        role="list"
      >
        <button
          type="button"
          role="listitem"
          onClick={() => updateParam('types', null)}
          aria-pressed={activeTypes.size === 0}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap flex-shrink-0",
            activeTypes.size === 0
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent"
          )}
        >
          {allTypesLabel}
        </button>
        {PROVIDER_TYPES.map(type => {
          const label = PROVIDER_TYPE_LABELS[type];
          const isActive = activeTypes.has(type);
          return (
            <button
              type="button"
              role="listitem"
              key={type}
              onClick={() => toggleType(type)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap flex-shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent"
              )}
            >
              {language === 'ar' ? label?.ar : language === 'en' ? label?.en : label?.fr}
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all",
            isRTL ? "left-0" : "right-0"
          )}
          aria-label="Défiler à droite"
        >
          <ChevronRight className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

// ─── ProviderListContent — hoisted to module level ───
interface ProviderListContentProps {
  loading: boolean;
  providers: CityHealthProvider[];
  visibleProviders: CityHealthProvider[];
  hasMore: boolean;
  visibleCount: number;
  onLoadMore: () => void;
  maxH: string;
  tx: Tx;
  distances: Map<string, number>;
  selectedProvider: CityHealthProvider | null;
  language: string;
  routingId: string | null;
  isRouting: boolean;
  onProviderClick: (provider: CityHealthProvider) => void;
  onRoute: (e: React.MouseEvent, provider: CityHealthProvider) => void;
  onCall: (provider: CityHealthProvider) => void;
  setProviderRef: (id: string, el: HTMLDivElement | null) => void;
}

const ProviderListContent = memo(function ProviderListContent({
  loading, providers, visibleProviders, hasMore, onLoadMore,
  maxH, tx, distances, selectedProvider, language, routingId, isRouting,
  onProviderClick, onRoute, onCall, setProviderRef,
}: ProviderListContentProps) {
  return (
    <div className={cn(maxH, "overflow-y-auto")} role="list" aria-label="Liste des prestataires">
      {loading ? (
        <div className="p-2 space-y-2" aria-busy="true" aria-label="Chargement des prestataires">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-2.5 p-2.5 rounded-xl">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2.5 py-12 px-5 text-center" role="status">
          <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center" aria-hidden="true">
            <AlertTriangle className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{tx.noResults}</p>
          <p className="text-[11px] text-muted-foreground/60">{tx.noResultsSub}</p>
        </div>
      ) : (
        <div className="p-2 space-y-0.5">
          {visibleProviders.map(provider => (
            <ProviderItem
              key={provider.id}
              provider={provider}
              distance={distances.get(provider.id)}
              isSelected={selectedProvider?.id === provider.id}
              language={language}
              isComputingRoute={routingId === provider.id || (isRouting && selectedProvider?.id === provider.id)}
              tx={tx}
              onProviderClick={onProviderClick}
              onRoute={onRoute}
              onCall={onCall}
              setRef={(el) => setProviderRef(provider.id, el)}
            />
          ))}
          {hasMore && (
            <button
              onClick={onLoadMore}
              data-testid="btn-load-more-providers"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-1 rounded-xl text-[11px] font-medium text-primary hover:bg-accent/40 transition-colors border border-border/30"
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              {tx.showMore}
              <span className="text-muted-foreground">({providers.length - visibleProviders.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

// ─── MobileBottomSheet — redesigned to use children instead of render-prop components ───
interface MobileBottomSheetProps {
  providers: CityHealthProvider[];
  mobileExpanded: boolean;
  setMobileExpanded: (v: boolean) => void;
  tx: Tx;
  children: React.ReactNode;
}

const MobileBottomSheet = ({
  providers, mobileExpanded, setMobileExpanded, tx, children,
}: MobileBottomSheetProps) => (
  <div
    className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-xl border-t border-border/50 rounded-t-2xl shadow-2xl transition-all duration-300",
      mobileExpanded ? "max-h-[70vh]" : "max-h-[3.5rem]"
    )}
    role="region"
    aria-label="Liste des prestataires"
  >
    <button
      className="w-full flex flex-col items-center pt-2 pb-1.5 px-4"
      onClick={() => setMobileExpanded(!mobileExpanded)}
      aria-expanded={mobileExpanded}
      aria-controls="mobile-provider-list"
      data-testid="btn-mobile-sheet-toggle"
    >
      <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" aria-hidden="true" />
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <List className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-primary">{providers.length}</span> {tx.providers}
        </span>
        {mobileExpanded
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          : <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      </div>
    </button>

    <div
      id="mobile-provider-list"
      className={cn(
        "overflow-hidden transition-all duration-300",
        mobileExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  </div>
);

// ─── MapSidebar ───
export const MapSidebar = ({
  providers,
  distances,
  loading,
  label,
  mode = 'providers',
}: MapSidebarProps) => {
  const { selectedProvider, setSelectedProvider, calculateRoute, isRouting, isRTL, flyTo, sidebarOpen, setSidebarOpen } = useMapContext();
  const { language } = useLanguage();
  const { triggerRating } = useRating();
  const [searchParams, setSearchParams] = useSearchParams();
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const providerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const tx: Tx = translations[language] || translations.fr;

  // Scroll to selected provider in the sidebar list when a map marker is clicked
  useEffect(() => {
    if (!selectedProvider) return;

    const providerIndex = providers.findIndex(p => p.id === selectedProvider.id);
    const scrollToEl = () => {
      const el = providerRefs.current.get(selectedProvider.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (providerIndex >= visibleCount) {
      setVisibleCount(providerIndex + 5);
      const id = setTimeout(scrollToEl, 100);
      return () => clearTimeout(id);
    } else {
      scrollToEl();
    }
  }, [selectedProvider?.id, providers, visibleCount]);

  // URL-synced filter state
  const searchQuery = searchParams.get('q') || '';
  const typesParam = searchParams.get('types');
  const openOnly = searchParams.get('open') === '1';
  const activeTypes = useMemo(() => {
    if (!typesParam) return new Set<ProviderType>();
    return new Set(typesParam.split(',') as ProviderType[]);
  }, [typesParam]);

  const showTypeFilters = mode === 'providers';
  const showOpenToggle = mode === 'providers';

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleType = useCallback((type: ProviderType) => {
    const next = new Set(activeTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    updateParam('types', next.size > 0 ? Array.from(next).join(',') : null);
    setVisibleCount(10);
  }, [activeTypes, updateParam]);

  const visibleProviders = useMemo(() => providers.slice(0, visibleCount), [providers, visibleCount]);
  const hasMore = providers.length > visibleCount;

  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    try {
      setSelectedProvider(provider);
      if (provider.lat != null && provider.lng != null) {
        flyTo(provider.lat, provider.lng, 16);
      }
      setMobileExpanded(false);
    } catch (err) {
      console.error('Error selecting provider:', err);
    }
  }, [setSelectedProvider, flyTo]);

  const handleRoute = useCallback((e: React.MouseEvent, provider: CityHealthProvider) => {
    e.stopPropagation();
    setRoutingId(provider.id);
    calculateRoute(provider);
    triggerRating('route', provider.id, provider.name);
    const id = setTimeout(() => setRoutingId(null), 3000);
    return () => clearTimeout(id);
  }, [calculateRoute, triggerRating]);

  const handleCall = useCallback((provider: CityHealthProvider) => {
    triggerRating('call', provider.id, provider.name);
  }, [triggerRating]);

  const setProviderRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) providerRefs.current.set(id, el);
    else providerRefs.current.delete(id);
  }, []);

  const handleLoadMore = useCallback(() => setVisibleCount(prev => prev + 10), []);

  // ─── Shared content rendered in both desktop sidebar and mobile sheet ───
  const filterSection = (showTypeFilters || showOpenToggle) && (
    <div className="px-2.5 py-1.5 border-b border-border/40 space-y-1.5 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
      {showTypeFilters && (
        <TypeFiltersRow
          isRTL={isRTL}
          activeTypes={activeTypes}
          updateParam={updateParam}
          toggleType={toggleType}
          language={language}
          allTypesLabel={tx.allTypes}
        />
      )}
      {showOpenToggle && (
        <div className="flex items-center gap-2">
          <Switch
            id="open-now-filter"
            checked={openOnly}
            onCheckedChange={(checked) => updateParam('open', checked ? '1' : null)}
            data-testid="switch-open-now"
          />
          <label htmlFor="open-now-filter" className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 cursor-pointer select-none">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {tx.openNow}
          </label>
        </div>
      )}
    </div>
  );

  const listSection = (
    <ProviderListContent
      loading={loading}
      providers={providers}
      visibleProviders={visibleProviders}
      hasMore={hasMore}
      visibleCount={visibleCount}
      onLoadMore={handleLoadMore}
      maxH="flex-1"
      tx={tx}
      distances={distances}
      selectedProvider={selectedProvider}
      language={language}
      routingId={routingId}
      isRouting={isRouting}
      onProviderClick={handleProviderClick}
      onRoute={handleRoute}
      onCall={handleCall}
      setProviderRef={setProviderRef}
    />
  );

  const mobileListSection = (
    <ProviderListContent
      loading={loading}
      providers={providers}
      visibleProviders={visibleProviders}
      hasMore={hasMore}
      visibleCount={visibleCount}
      onLoadMore={handleLoadMore}
      maxH="max-h-[calc(70vh-10rem)]"
      tx={tx}
      distances={distances}
      selectedProvider={selectedProvider}
      language={language}
      routingId={routingId}
      isRouting={isRouting}
      onProviderClick={handleProviderClick}
      onRoute={handleRoute}
      onCall={handleCall}
      setProviderRef={setProviderRef}
    />
  );

  const searchSection = (idSuffix: string) => (
    <div className="px-2.5 py-2 border-b border-border/40">
      <div className="relative">
        <Search
          className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none", isRTL ? "right-2.5" : "left-2.5")}
          aria-hidden="true"
        />
        <Input
          id={`search-providers-${idSuffix}`}
          value={searchQuery}
          onChange={(e) => updateParam('q', e.target.value || null)}
          placeholder={tx.searchPlaceholder}
          aria-label={tx.searchPlaceholder}
          className={cn("h-8 text-xs rounded-lg bg-muted/30 border-border/40", isRTL ? "pr-8 pl-7" : "pl-8 pr-7")}
          data-testid={`input-search-${idSuffix}`}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded", isRTL ? "left-1.5" : "right-1.5")}
            onClick={() => updateParam('q', null)}
            aria-label="Effacer la recherche"
            data-testid={`btn-clear-search-${idSuffix}`}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );

  // ─── Sidebar closed: show toggle button + mobile sheet ───
  if (!sidebarOpen) {
    return (
      <>
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "hidden md:flex absolute top-20 z-[1000] items-center gap-2 px-3.5 py-2.5 bg-card/95 backdrop-blur-sm border border-border/60 shadow-xl text-sm font-medium text-foreground hover:bg-accent transition-all duration-200",
            isRTL ? "left-0 rounded-r-xl" : "right-0 rounded-l-xl"
          )}
          aria-label={tx.open}
          data-testid="btn-open-sidebar"
        >
          <List className="h-4 w-4 text-primary" aria-hidden="true" />
          <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} aria-hidden="true" />
        </button>

        <MobileBottomSheet
          providers={providers}
          mobileExpanded={mobileExpanded}
          setMobileExpanded={setMobileExpanded}
          tx={tx}
        >
          {searchSection('mobile')}
          {filterSection}
          {mobileListSection}
        </MobileBottomSheet>
      </>
    );
  }

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <div
        className={cn(
          "hidden md:flex relative z-30 flex-col w-80 flex-shrink-0 h-full bg-card overflow-hidden pointer-events-auto",
          isRTL ? "border-r border-border/60" : "border-l border-border/60"
        )}
        aria-label="Panneau de prestataires"
        role="complementary"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <List className="h-3.5 w-3.5 text-primary" />
            </div>
            {loading ? <Skeleton className="h-3.5 w-24" /> : (
              <p className="text-xs font-semibold truncate">
                <span className="text-primary font-bold">{providers.length}</span>{' '}
                <span className="text-foreground">{providers.length === 1 ? tx.provider : tx.providers}</span>
                {label && <span className="text-muted-foreground"> · {label}</span>}
              </p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-shrink-0 rounded-lg hover:bg-muted"
            onClick={() => setSidebarOpen(false)}
            aria-label={tx.close}
            data-testid="btn-close-sidebar"
          >
            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} aria-hidden="true" />
          </Button>
        </div>

        {searchSection('desktop')}
        {filterSection}
        {listSection}
      </div>

      {/* ─── Mobile Bottom Sheet ─── */}
      <MobileBottomSheet
        providers={providers}
        mobileExpanded={mobileExpanded}
        setMobileExpanded={setMobileExpanded}
        tx={tx}
      >
        {searchSection('mobile')}
        {(showTypeFilters || showOpenToggle) && (
          <div className="px-3 pb-1.5 space-y-1.5 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
            {showTypeFilters && (
              <TypeFiltersRow
                isRTL={isRTL}
                activeTypes={activeTypes}
                updateParam={updateParam}
                toggleType={toggleType}
                language={language}
                allTypesLabel={tx.allTypes}
              />
            )}
            {showOpenToggle && (
              <div className="flex items-center gap-2">
                <Switch
                  id="open-now-filter-mobile"
                  checked={openOnly}
                  onCheckedChange={(checked) => updateParam('open', checked ? '1' : null)}
                  data-testid="switch-open-now-mobile"
                />
                <label htmlFor="open-now-filter-mobile" className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 cursor-pointer select-none">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {tx.openNow}
                </label>
              </div>
            )}
          </div>
        )}
        {mobileListSection}
      </MobileBottomSheet>
    </>
  );
};
