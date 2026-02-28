import { useEffect } from 'react';
import { AntigravityHero } from '@/components/AntigravityHero';
import Footer from '@/components/Footer';
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection';
import { ServicesGrid } from '@/components/homepage/ServicesGrid';
import { FeaturedProviders } from '@/components/homepage/FeaturedProviders';
import { TestimonialsSlider } from '@/components/homepage/TestimonialsSlider';
import { ProviderCTA } from '@/components/homepage/ProviderCTA';
import { ProviderRegistrationSection } from '@/components/homepage/ProviderRegistrationSection';
import { EmergencyBanner } from '@/components/homepage/EmergencyBanner';
import { AnimatedMapSection } from '@/components/homepage/AnimatedMapSection';
import { useLanguage } from '@/hooks/useLanguage';

const AntigravityIndex = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `CityHealth - ${t('homepage.findYourDoctor')} - ${t('homepage.locationBadge')}`;
  }, [language, t]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AntigravityHero />

      <div id="urgences">
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

      <div id="annonces">
        <div id="publicite">
          <ProviderCTA />
        </div>
      </div>

      <div id="inscription-provider">
        <ProviderRegistrationSection />
      </div>

      <Footer />
    </div>
  );
};

export default AntigravityIndex;
