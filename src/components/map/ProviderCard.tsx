import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Phone, 
  Navigation, 
  ExternalLink, 
  Star,
  MapPin,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CityHealthProvider, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { isProviderVerified } from '@/utils/verificationUtils';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';

interface ProviderCardProps {
  provider: CityHealthProvider;
  distance?: number | null;
  onClose?: () => void;
}

// Check if provider was registered within the last 7 days
const isNewProvider = (createdAt?: string | Date): boolean => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return createdDate > sevenDaysAgo;
};

export const ProviderCard = ({ provider, distance, onClose }: ProviderCardProps) => {
  const { calculateRoute, isRouting, isRTL } = useMapContext();
  const { language } = useLanguage();
  
  const t = useMemo(() => ({
    fr: {
      directions: 'Itinéraire',
      call: 'Appeler',
      viewProfile: 'Voir le profil',
      verified: 'Vérifié',
      open: 'Ouvert',
      closed: 'Fermé',
      km: 'km'
    },
    ar: {
      directions: 'الاتجاهات',
      call: 'اتصل',
      viewProfile: 'عرض الملف',
      verified: 'موثق',
      open: 'مفتوح',
      closed: 'مغلق',
      km: 'كم'
    },
    en: {
      directions: 'Directions',
      call: 'Call',
      viewProfile: 'View profile',
      verified: 'Verified',
      open: 'Open',
      closed: 'Closed',
      km: 'km'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
  const typeLabel = PROVIDER_TYPE_LABELS[provider.type]?.[language === 'en' ? 'fr' : language as 'fr' | 'ar'] || provider.type;
  
  const isNew = isNewProvider((provider as any).createdAt);
  
  return (
    <Card className={cn(
      "absolute z-20 w-[calc(100%-2rem)] sm:w-80 shadow-xl border border-border animate-fade-in",
      "top-4",
      isRTL ? "right-4" : "right-4",
      "md:right-4 md:left-auto"
    )}>
      <CardContent className="p-4">
        {/* New badge */}
        {isNew && (
          <Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600 text-white text-xs animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            Nouveau
          </Badge>
        )}
        {/* Close button */}
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Provider image */}
        {provider.image && provider.image !== '/placeholder.svg' ? (
          <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
            <img 
              src={provider.image} 
              alt={provider.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <ProviderAvatar image={null} name={provider.name} type={provider.type} className="h-10 w-10" iconSize={20} />
            <span className="text-sm font-medium text-foreground truncate">{provider.name}</span>
          </div>
        )}
        
        {/* Provider info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight pr-8">{provider.name}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {typeLabel}
            </Badge>
            
            {isProviderVerified(provider) && (
              <VerifiedBadge type="verified" size="sm" showTooltip={false} />
            )}
            
            {provider.emergency && (
              <Badge variant="destructive" className="text-xs">
                24/7
              </Badge>
            )}
          </div>
          
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{provider.address}</span>
          </div>
          
          {/* Distance & Rating */}
          <div className="flex items-center gap-4 text-sm">
            {distance !== null && distance !== undefined && (
              <span className="text-muted-foreground">
                {distance.toFixed(1)} {tx.km}
              </span>
            )}
            
            {provider.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {provider.phone && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`tel:${provider.phone}`, '_self')}
              >
                <Phone className="h-4 w-4 mr-1.5" />
                {tx.call}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={() => calculateRoute(provider)}
              disabled={isRouting}
            >
              {isRouting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-1.5" />
              )}
              {tx.directions}
            </Button>
          </div>
          
          {/* View profile link */}
          <Link 
            to={`/provider/${provider.id}`}
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-1"
          >
            {tx.viewProfile}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
