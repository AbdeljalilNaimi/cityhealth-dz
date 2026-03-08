import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const emergencyProviders = [
  {
    name: { fr: 'CHU Sidi Bel Abbès', ar: 'المستشفى الجامعي سيدي بلعباس', en: 'CHU Sidi Bel Abbès' },
    type: { fr: 'Hôpital Universitaire', ar: 'مستشفى جامعي', en: 'University Hospital' },
    phone: '048 74 52 00',
    address: { fr: 'Boulevard de la Victoire, SBA', ar: 'شارع النصر، سيدي بلعباس', en: 'Boulevard de la Victoire, SBA' },
    available: true,
  },
  {
    name: { fr: 'Clinique El-Djazairia', ar: 'عيادة الجزائرية', en: 'Clinique El-Djazairia' },
    type: { fr: 'Clinique Privée 24/7', ar: 'عيادة خاصة 24/7', en: 'Private Clinic 24/7' },
    phone: '048 54 12 34',
    address: { fr: 'Rue Larbi Ben M\'hidi, SBA', ar: 'شارع العربي بن مهيدي، سيدي بلعباس', en: 'Rue Larbi Ben M\'hidi, SBA' },
    available: true,
  },
  {
    name: { fr: 'Pharmacie de Garde', ar: 'صيدلية المناوبة', en: 'On-Duty Pharmacy' },
    type: { fr: 'Pharmacie Ouverte', ar: 'صيدلية مفتوحة', en: 'Open Pharmacy' },
    phone: '048 55 67 89',
    address: { fr: 'Centre-ville, SBA', ar: 'وسط المدينة، سيدي بلعباس', en: 'City Center, SBA' },
    available: true,
  },
];

const sectionText = {
  fr: { title: 'Urgences Maintenant', subtitle: 'Prestataires disponibles 24h/24 et 7j/7', viewAll: 'Voir toutes les urgences' },
  ar: { title: 'طوارئ الآن', subtitle: 'مقدمو خدمات متاحون على مدار الساعة', viewAll: 'عرض جميع الطوارئ' },
  en: { title: 'Emergency Now', subtitle: 'Providers available 24/7', viewAll: 'View all emergencies' },
};

export const EmergencyProvidersSection = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const texts = sectionText[language];

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
              <Siren className="h-5 w-5 text-destructive" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{texts.title}</h2>
            <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="flex overflow-x-auto gap-4 mb-6 pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {emergencyProviders.map((provider, index) => (
            <motion.div
              key={provider.phone}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-2xl border-2 border-destructive/20 bg-card p-5 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/5 transition-all min-w-[280px] w-[85vw] sm:w-[320px] lg:w-[340px] flex-shrink-0 snap-start"
            >
              {/* Status dot */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-600">24/7</span>
              </div>

              <h3 className="font-semibold text-foreground mb-1 pr-16">{provider.name[language]}</h3>
              <p className="text-xs text-destructive font-medium mb-3">{provider.type[language]}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{provider.address[language]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{language === 'ar' ? '24/24 — 7/7' : language === 'en' ? '24/7' : '24h/24 — 7j/7'}</span>
                </div>
              </div>

              {/* Phone CTA */}
              <a
                href={`tel:${provider.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {provider.phone}
              </a>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/map/emergency')}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Siren className="h-4 w-4 mr-2" />
            {texts.viewAll}
          </Button>
        </div>
      </div>
    </section>
  );
};
