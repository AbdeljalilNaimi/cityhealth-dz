import { useMemo, useState } from 'react';
import { 
  MapPin, 
  Star, 
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  List
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';

interface ProviderListProps {
  providers: CityHealthProvider[];
  loading?: boolean;
  distances?: Map<string, number>;
  onProviderClick?: (provider: CityHealthProvider) => void;
}

export const ProviderList = ({ 
  providers, 
  loading, 
  distances,
  onProviderClick 
}: ProviderListProps) => {
  const { selectedProvider, isRTL } = useMapContext();
  const { language } = useLanguage();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  const t = useMemo(() => ({
    fr: {
      noResults: 'Aucun prestataire trouvé',
      km: 'km',
      open: 'Ouvert',
      verified: 'Vérifié',
      providers: 'prestataires'
    },
    ar: {
      noResults: 'لم يتم العثور على مقدمين',
      km: 'كم',
      open: 'مفتوح',
      verified: 'موثق',
      providers: 'مقدمين'
    },
    en: {
      noResults: 'No providers found',
      km: 'km',
      open: 'Open',
      verified: 'Verified',
      providers: 'providers'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;

  // Desktop panel classes - moved to left to avoid overlap with zoom controls
  const desktopPanelClasses = cn(
    "hidden md:block absolute top-[22rem] z-10 w-72 max-h-[calc(100vh-400px)] bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in",
    isRTL ? "right-4" : "left-4"
  );

  // Mobile bottom sheet classes with glassmorphism
  const mobilePanelClasses = "md:hidden absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border rounded-t-xl shadow-lg transition-all duration-300";
  
  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className={desktopPanelClasses}>
          <div className="p-3 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className={mobilePanelClasses}>
          <div className="p-3 space-y-3">
            <Skeleton className="h-4 w-1/3 mx-auto" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      </>
    );
  }
  
  if (providers.length === 0) {
    return (
      <>
        <div className={desktopPanelClasses}>
          <div className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{tx.noResults}</p>
          </div>
        </div>
        <div className={mobilePanelClasses}>
          <div className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">{tx.noResults}</p>
          </div>
        </div>
      </>
    );
  }

  const providerItems = (maxHeight: string) => (
    <ScrollArea className={maxHeight}>
      <div className="p-2 space-y-2">
        {providers.map(provider => {
          const distance = distances?.get(provider.id);
          const isSelected = selectedProvider?.id === provider.id;
          const typeLabel = PROVIDER_TYPE_LABELS[provider.type]?.[language === 'en' ? 'fr' : language as 'fr' | 'ar'] || provider.type;
          
          return (
            <button
              key={provider.id}
              className={cn(
                "w-full flex gap-3 p-2 rounded-lg text-left transition-colors",
                "hover:bg-muted/80",
                isSelected && "bg-primary/10 ring-1 ring-primary"
              )}
              onClick={() => onProviderClick?.(provider)}
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                {provider.image && provider.image !== '/placeholder.svg' ? (
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-medium text-sm truncate">{provider.name}</h4>
                  {isProviderVerified(provider) && (
                    <VerifiedBadge type={provider.planType === 'premium' ? 'premium' : 'verified'} size="sm" showTooltip={false} />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground truncate">
                  {typeLabel}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  {distance !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {distance.toFixed(1)} {tx.km}
                    </span>
                  )}
                  
                  {provider.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs">{provider.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {provider.emergency && (
                    <Badge variant="destructive" className="text-[10px] px-1 py-0">
                      24/7
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
  
  return (
    <>
      {/* Desktop: right-side panel */}
      <div className={desktopPanelClasses}>
        <div className="px-3 py-2 border-b bg-muted/50">
          <span className="text-sm font-medium">
            {providers.length} {tx.providers}
          </span>
        </div>
        {providerItems("h-[calc(100vh-280px)]")}
      </div>

      {/* Mobile: collapsible bottom sheet */}
      <div className={mobilePanelClasses}>
        {/* Drag handle + header */}
        <button
          className="w-full flex flex-col items-center pt-2 pb-1 px-4"
          onClick={() => setMobileExpanded(!mobileExpanded)}
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40 mb-2" />
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <List className="h-4 w-4" />
              {providers.length} {tx.providers}
            </span>
            {mobileExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        
        {/* Expandable content with animation */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          mobileExpanded ? "max-h-[40vh] opacity-100" : "max-h-0 opacity-0"
        )}>
          {providerItems("max-h-[calc(40vh-48px)]")}
        </div>
      </div>
    </>
  );
};
