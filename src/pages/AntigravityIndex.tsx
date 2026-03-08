import { useEffect, lazy, Suspense } from 'react';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { AnnouncementBannerTop } from '@/components/homepage/AnnouncementBannerTop';
import { useLanguage } from '@/hooks/useLanguage';

// Lazy-load below-the-fold sections to reduce main-thread work
const EmergencyProvidersSection = lazy(() => import('@/components/homepage/EmergencyProvidersSection').then(m => ({ default: m.EmergencyProvidersSection })));
const EmergencyBanner = lazy(() => import('@/components/homepage/EmergencyBanner').then(m => ({ default: m.EmergencyBanner })));
const HowItWorksSection = lazy(() => import('@/components/homepage/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const ServicesGrid = lazy(() => import('@/components/homepage/ServicesGrid').then(m => ({ default: m.ServicesGrid })));
const AnimatedMapSection = lazy(() => import('@/components/homepage/AnimatedMapSection').then(m => ({ default: m.AnimatedMapSection })));
const FeaturedProviders = lazy(() => import('@/components/homepage/FeaturedProviders').then(m => ({ default: m.FeaturedProviders })));
const TestimonialsSlider = lazy(() => import('@/components/homepage/TestimonialsSlider').then(m => ({ default: m.TestimonialsSlider })));
const PricingSection = lazy(() => import('@/components/homepage/PricingSection').then(m => ({ default: m.PricingSection })));
const ProviderCTA = lazy(() => import('@/components/homepage/ProviderCTA').then(m => ({ default: m.ProviderCTA })));
const ProviderRegistrationSection = lazy(() => import('@/components/homepage/ProviderRegistrationSection').then(m => ({ default: m.ProviderRegistrationSection })));

const SectionFallback = () => <div className="min-h-[200px]" />;

const AntigravityIndex = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `CityHealth - ${t('homepage.findYourDoctor')} - ${t('homepage.locationBadge')}`;
  }, [language, t]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementBannerTop />
      <AntigravityHero />

      <Suspense fallback={<SectionFallback />}>
        <div id="urgences">
          <EmergencyProvidersSection />
          <EmergencyBanner />
        </div>

        <div id="assistant-ia">
          <HowItWorksSection />
        </div>

        <ServicesGrid />

        <div id="recherche-medecins">
          <div id="carte-interactive">
            <AnimatedMapSection />
          </div>
        </div>

        <div id="recherche-medicale">
          <FeaturedProviders />
        </div>

        <div id="avis-idees">
          <TestimonialsSlider />
        </div>

        <div id="pricing">
          <PricingSection />
        </div>

        <div id="annonces">
          <div id="publicite">
            <ProviderCTA />
          </div>
        </div>

        <div id="inscription-provider">
          <ProviderRegistrationSection />
        </div>
      </Suspense>

      <Footer />
    </div>
  );
};

export default AntigravityIndex;
