import {
  Search, MapPin, HeartPulse, Bot, Star, BookOpen, Megaphone, TvMinimal,
  Stethoscope, ArrowRight, Activity, Clock, FileText, MessageCircle,
  Navigation, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── Scroll to anchor with sticky header offset ─── */
const scrollToAnchor = (anchorId: string) => {
  const el = document.getElementById(anchorId);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/* ─── Mockup components ─── */
const SearchMockup = () => (
  <div className="flex flex-col items-center gap-3 px-5 pt-5">
    <div className="w-full h-8 rounded-lg bg-background border border-border flex items-center px-3 gap-2">
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="h-2 w-20 rounded bg-muted" />
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-full flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Stethoscope className="h-3 w-3 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-2 rounded bg-muted" style={{ width: `${85 - i * 15}%` }} />
          <div className="h-1.5 rounded bg-muted/60" style={{ width: `${65 - i * 10}%` }} />
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
      </div>
    ))}
  </div>
);

const MapMockup = () => (
  <div className="relative w-full h-full overflow-hidden px-5 pt-3">
    <div className="absolute inset-4 opacity-[0.07]">
      {[...Array(4)].map((_, i) => (
        <div key={`h-${i}`} className="absolute w-full h-px bg-foreground" style={{ top: `${25 * (i + 1)}%` }} />
      ))}
      {[...Array(4)].map((_, i) => (
        <div key={`v-${i}`} className="absolute h-full w-px bg-foreground" style={{ left: `${25 * (i + 1)}%` }} />
      ))}
    </div>
    <MapPin className="absolute text-primary h-5 w-5 drop-shadow-md" style={{ top: '22%', left: '28%' }} />
    <MapPin className="absolute text-primary/70 h-4 w-4" style={{ top: '48%', left: '62%' }} />
    <MapPin className="absolute text-primary/50 h-3.5 w-3.5" style={{ top: '32%', left: '72%' }} />
    <Navigation className="absolute text-accent-foreground/25 h-4 w-4 rotate-45" style={{ bottom: '28%', left: '38%' }} />
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background border border-border rounded-full px-2.5 py-1 shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[9px] font-medium text-foreground">Sidi Bel Abbès</span>
    </div>
  </div>
);

const EmergencyMockup = () => (
  <div className="flex flex-col items-center justify-center gap-3 px-5 pt-4">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <HeartPulse className="h-6 w-6 text-destructive" />
      </div>
    </div>
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-destructive/60" />
        <div className="h-2 w-16 rounded bg-destructive/15" />
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-600 font-medium">24/7</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-3 w-3 text-muted-foreground/40" />
        <div className="h-2 w-24 rounded bg-muted" />
      </div>
    </div>
  </div>
);

const AssistantAIMockup = () => (
  <div className="flex flex-col gap-2.5 px-5 pt-5">
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <User className="h-3 w-3 text-primary" />
      </div>
      <div className="bg-muted/80 rounded-lg rounded-tl-none px-3 py-2 max-w-[75%]">
        <div className="h-2 w-20 rounded bg-muted-foreground/20" />
      </div>
    </div>
    <div className="flex items-start gap-2 flex-row-reverse">
      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Bot className="h-3 w-3 text-primary" />
      </div>
      <div className="bg-primary/10 rounded-lg rounded-tr-none px-3 py-2 max-w-[75%] space-y-1.5">
        <div className="h-2 w-28 rounded bg-primary/20" />
        <div className="h-2 w-20 rounded bg-primary/15" />
      </div>
    </div>
    <div className="flex items-center gap-1.5 ml-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  </div>
);

const ReviewsMockup = () => (
  <div className="flex flex-col items-center gap-3 px-5 pt-5">
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-5 w-5 ${i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-amber-400/30'}`} />
      ))}
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-full flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-2 rounded bg-muted" style={{ width: `${80 - i * 12}%` }} />
          <div className="h-1.5 rounded bg-muted/60" style={{ width: `${60 - i * 8}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const ResearchMockup = () => (
  <div className="flex flex-col items-center gap-2.5 px-5 pt-5">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <BookOpen className="h-5 w-5 text-primary" />
    </div>
    <div className="w-full space-y-1.5">
      <div className="h-2.5 rounded bg-muted w-[90%]" />
      <div className="h-2 rounded bg-muted/70 w-[75%]" />
      <div className="h-2 rounded bg-muted/50 w-[60%]" />
    </div>
    <div className="self-start flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
      <FileText className="h-2.5 w-2.5 text-primary" />
      <span className="text-[8px] font-semibold text-primary">DOI</span>
    </div>
  </div>
);

const AdsMockup = () => (
  <div className="flex flex-col gap-2.5 px-5 pt-5">
    <div className="w-full h-16 rounded-lg bg-muted/60 flex items-center justify-center">
      <Megaphone className="h-6 w-6 text-muted-foreground/40" />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Nouveau</span>
      <div className="h-2 w-20 rounded bg-muted" />
    </div>
    <div className="space-y-1">
      <div className="h-1.5 rounded bg-muted/60 w-[85%]" />
      <div className="h-1.5 rounded bg-muted/40 w-[60%]" />
    </div>
  </div>
);

const PublicityMockup = () => (
  <div className="flex flex-col gap-2.5 px-5 pt-5">
    <div className="w-full h-12 rounded-lg bg-gradient-to-r from-primary/10 to-accent/20 flex items-center justify-center gap-2">
      <TvMinimal className="h-5 w-5 text-primary/60" />
      <div className="h-2 w-16 rounded bg-primary/20" />
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-10 rounded bg-muted/40 flex items-center justify-center">
        <div className="h-1.5 w-8 rounded bg-muted" />
      </div>
      <div className="flex-1 h-10 rounded bg-muted/40 flex items-center justify-center">
        <div className="h-1.5 w-8 rounded bg-muted" />
      </div>
    </div>
    <div className="h-1.5 rounded bg-muted/50 w-[70%]" />
  </div>
);

/* ─── Service card data ─── */
interface ServiceCard {
  title: string;
  anchorId: string;
  icon: LucideIcon;
  mockup: React.ReactNode;
}

const services: ServiceCard[] = [
  { title: 'Recherche Médecins', anchorId: 'recherche-medecins', icon: Search, mockup: <SearchMockup /> },
  { title: 'Carte Interactive', anchorId: 'carte-interactive', icon: MapPin, mockup: <MapMockup /> },
  { title: 'Urgences 24/7', anchorId: 'urgences', icon: HeartPulse, mockup: <EmergencyMockup /> },
  { title: 'Assistant IA Santé', anchorId: 'assistant-ia', icon: Bot, mockup: <AssistantAIMockup /> },
  { title: 'Avis & Idées', anchorId: 'avis-idees', icon: Star, mockup: <ReviewsMockup /> },
  { title: 'Recherche Médicale', anchorId: 'recherche-medicale', icon: BookOpen, mockup: <ResearchMockup /> },
  { title: 'Annonces', anchorId: 'annonces', icon: Megaphone, mockup: <AdsMockup /> },
  { title: 'Publicité', anchorId: 'publicite', icon: TvMinimal, mockup: <PublicityMockup /> },
];

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─── Component ─── */
export const ServicesGrid = () => {
  const { t } = useLanguage();

  const handleCardClick = (anchorId: string) => {
    scrollToAnchor(anchorId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, anchorId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToAnchor(anchorId);
    }
  };

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Accédez à un réseau complet de professionnels de santé, d'établissements et de services médicaux.
          </p>
          <button
            onClick={() => scrollToAnchor('recherche-medecins')}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Explorer tous les services
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Uniform Grid — 8 identical cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {services.map((service) => {
            const IconComp = service.icon;
            return (
              <motion.div key={service.anchorId} variants={cardVariants}>
                <motion.button
                  type="button"
                  onClick={() => handleCardClick(service.anchorId)}
                  onKeyDown={(e) => handleKeyDown(e, service.anchorId)}
                  whileTap={{ scale: 0.97 }}
                  className="group block w-full h-[280px] rounded-[14px] border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-left cursor-pointer"
                  tabIndex={0}
                  aria-label={`Aller à la section ${service.title}`}
                >
                  {/* Mockup area — 75% */}
                  <div className="h-[210px] bg-muted/20 relative overflow-hidden">
                    {service.mockup}
                  </div>
                  {/* Label strip — 25% */}
                  <div className="h-[70px] px-4 flex items-center gap-3 bg-card border-t border-border/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <IconComp className="h-[18px] w-[18px] text-primary" strokeWidth={1.8} />
                    </div>
                    <span className="font-semibold text-sm text-foreground">{service.title}</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
