import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMapContext } from '@/contexts/MapContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider, ProviderType } from '@/data/providers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const ProvidersMapChild = () => {
  const [searchParams] = useSearchParams();
  const {
    mapRef, isReady,
    registerMarkerLayer, removeMarkerLayer,
    selectedProvider, setSelectedProvider,
    flyTo, fitBounds, geolocation,
    setSidebarProviders, setSidebarDistances,
    setSidebarLoading, setSidebarLabel,
  } = useMapContext();

  const { data: providers = [], isLoading, isError } = useVerifiedProviders();

  // Read filters from URL (set by sidebar)
  const typesParam = searchParams.get('types');
  const openOnly = searchParams.get('open') === '1';
  const searchQuery = searchParams.get('q') || '';
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const selectedTypes = useMemo(() => {
    if (!typesParam) return new Set<ProviderType>();
    return new Set(typesParam.split(',') as ProviderType[]);
  }, [typesParam]);

  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Filter providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
          !(p.specialty || '').toLowerCase().includes(q) &&
          !p.address.toLowerCase().includes(q) &&
          !p.type.toLowerCase().includes(q)) return false;
      }
      if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
      if (openOnly && !p.isOpen) return false;
      return true;
    });
  }, [providers, selectedTypes, openOnly, debouncedSearch]);

  // Compute distances
  const distances = useMemo(() => {
    const map = new Map<string, number>();
    filteredProviders.forEach(p => {
      const dist = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (dist !== null) map.set(p.id, dist);
    });
    return map;
  }, [filteredProviders, geolocation]);

  // Sort by distance
  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      const distA = distances.get(a.id) ?? 999;
      const distB = distances.get(b.id) ?? 999;
      return distA - distB;
    });
  }, [filteredProviders, distances]);

  // Feed sidebar
  useEffect(() => {
    setSidebarLabel('');
    setSidebarLoading(isLoading);
    setSidebarProviders(sortedProviders);
    setSidebarDistances(distances);
  }, [sortedProviders, distances, isLoading, setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel]);

  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    try {
      setSelectedProvider(provider);
      if (provider.lat != null && provider.lng != null) {
        flyTo(provider.lat, provider.lng, 16);
      }
    } catch (error) {
      console.error('Error selecting provider:', error);
    }
  }, [setSelectedProvider, flyTo]);

  // Marker management
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });
      registerMarkerLayer('providers', markerGroupRef.current);
    }
    const markerGroup = markerGroupRef.current;
    const existingMarkers = markersMapRef.current;
    const currentIds = new Set(filteredProviders.map(p => p.id));

    existingMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        markerGroup.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });

    filteredProviders.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      if (existingMarkers.has(provider.id)) {
        existingMarkers.get(provider.id)!.setIcon(createMarkerIcon(provider.type, isSelected, provider.emergency));
      } else {
        const marker = L.marker([provider.lat, provider.lng], {
          icon: createMarkerIcon(provider.type, isSelected, provider.emergency)
        });
        marker.on('click', () => handleProviderClick(provider));
        markerGroup.addLayer(marker);
        existingMarkers.set(provider.id, marker);
      }
    });
  }, [isReady, mapRef, filteredProviders, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);

  useEffect(() => {
    return () => {
      if (markerGroupRef.current) {
        removeMarkerLayer('providers');
        markerGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [removeMarkerLayer]);

  if (isError) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="absolute inset-x-4 top-4 z-30 flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur-sm"
      >
        <span className="font-semibold">Impossible de charger les prestataires.</span>
        <span className="text-destructive/80">Vérifiez votre connexion et réessayez.</span>
      </div>
    );
  }

  return (
    <>
      {selectedProvider && (
        <ProviderCard
          provider={selectedProvider}
          distance={distances.get(selectedProvider.id)}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </>
  );
};

export default ProvidersMapChild;
