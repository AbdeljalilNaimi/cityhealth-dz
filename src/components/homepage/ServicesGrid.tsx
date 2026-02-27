import { Link } from 'react-router-dom';
import {
  Search, MapPin, HeartPulse, Pill, FlaskConical, Building2,
  Ambulance, UserRound, Home, Star, Megaphone, Stethoscope,
  ArrowRight, Activity, Navigation, Clock, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── Primary feature card data ─── */
interface PrimaryService {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  accentColor: string; // tailwind ring/border color token
  mockup: React.ReactNode;
}

/* Wireframe mockup illustrations built from Lucide + divs */
const SearchMockup = () => (
  <div className="flex flex-col items-center gap-3 px-6 pt-4">
    {/* Search bar wireframe */}
    <div className="w-full h-9 rounded-lg bg-background border border-border flex items-center px-3 gap-2">
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="h-2 w-24 rounded bg-muted" />
    </div>
    {/* Result lines */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="w-full flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 rounded bg-muted" style={{ width: `${80 - i * 12}%` }} />
          <div className="h-1.5 rounded bg-muted/60" style={{ width: `${60 - i * 8}%` }} />
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
      </div>
    ))}
  </div>
);

const MapMockup = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-6 pt-2">
    {/* Grid lines to simulate map */}
    <div className="absolute inset-4 opacity-[0.08]">
      {[...Array(5)].map((_, i) => (
        <div key={`h-${i}`} className="absolute w-full h-px bg-foreground" style={{ top: `${20 * (i + 1)}%` }} />
      ))}
      {[...Array(5)].map((_, i) => (
        <div key={`v-${i}`} className="absolute h-full w-px bg-foreground" style={{ left: `${20 * (i + 1)}%` }} />
      ))}
    </div>
    {/* Map pins */}
    <MapPin className="absolute text-primary h-6 w-6 drop-shadow-md" style={{ top: '25%', left: '30%' }} />
    <MapPin className="absolute text-primary/70 h-5 w-5" style={{ top: '50%', left: '60%' }} />
    <MapPin className="absolute text-primary/50 h-4 w-4" style={{ top: '35%', left: '70%' }} />
    <Navigation className="absolute text-accent-foreground/30 h-5 w-5 rotate-45" style={{ bottom: '25%', left: '40%' }} />
    {/* Location badge */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1 shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] font-medium text-foreground">Sidi Bel Abbès</span>
    </div>
  </div>
);

const EmergencyMockup = () => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 pt-4">
    {/* Pulsing heart */}
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <HeartPulse className="h-7 w-7 text-destructive" />
      </div>
    </div>
    {/* Status lines */}
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-destructive/60" />
        <div className="h-2 w-20 rounded bg-destructive/15" />
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-600 font-medium">24/7</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-3 w-3 text-muted-foreground/40" />
        <div className="h-2 w-28 rounded bg-muted" />
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 text-muted-foreground/40" />
        <div className="h-2 w-16 rounded bg-muted" />
      </div>
    </div>
  </div>
);

const primaryServices: PrimaryService[] = [
  {
    title: 'Recherche',
    subtitle: 'Trouvez un professionnel de santé',
    href: '/search',
    icon: Search,
    accentColor: 'hover:border-primary/40',
    mockup: <SearchMockup />,
  },
  {
    title: 'Carte Interactive',
    subtitle: 'Explorez les établissements proches',
    href: '/map',
    icon: MapPin,
    accentColor: 'hover:border-primary/40',
    mockup: <MapMockup />,
  },
  {
    title: 'Urgences',
    subtitle: 'Accès rapide aux services d\'urgence',
    href: '/map/emergency',
    icon: HeartPulse,
    accentColor: 'hover:border-destructive/40',
    mockup: <EmergencyMockup />,
  },
];

/* ─── Secondary marquee items ─── */
interface SecondaryService {
  icon: LucideIcon;
  label: string;
  href: string;
}

const secondaryServices: SecondaryService[] = [
  { icon: Pill, label: 'Pharmacies', href: '/search?type=pharmacy' },
  { icon: FlaskConical, label: 'Laboratoires', href: '/search?type=lab' },
  { icon: Building2, label: 'Cliniques', href: '/search?type=clinic' },
  { icon: Ambulance, label: 'Ambulances', href: '/search?type=ambulance' },
  { icon: UserRound, label: 'Infirmiers', href: '/search?type=nurse' },
  { icon: Home, label: 'Soins à domicile', href: '/search?type=home_care' },
  { icon: Star, label: 'Avis & Reviews', href: '/search' },
  { icon: Megaphone, label: 'Annonces', href: '/ads' },
  { icon: Stethoscope, label: 'Généralistes', href: '/search?type=doctor&specialty=general' },
  { icon: UserRound, label: 'Spécialistes', href: '/search?type=doctor&specialty=specialist' },
];

/* ─── Animation variants ─── */
const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ─── Component ─── */
export const ServicesGrid = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* ── Heading Block ── */}
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
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Explorer tous les services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* ── Primary Feature Cards ── */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
        >
          {primaryServices.map((service) => {
            const IconComp = service.icon;
            return (
              <motion.div key={service.title} variants={cardItemVariants}>
                <Link
                  to={service.href}
                  className={`group block rounded-[14px] border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${service.accentColor}`}
                >
                  {/* Mockup area */}
                  <div className="h-[200px] bg-muted/20 relative overflow-hidden">
                    {service.mockup}
                  </div>
                  {/* Bottom strip */}
                  <div className="h-[60px] px-4 flex items-center gap-3 bg-card border-t border-border/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <IconComp className="h-4.5 w-4.5 text-primary" strokeWidth={1.8} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground">{service.title}</span>
                      <p className="text-[11px] text-muted-foreground leading-tight">{service.subtitle}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Secondary Services Marquee ── */}
        <div className="overflow-hidden relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-muted/20 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-muted/20 to-transparent z-10" />
          
          <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
            {/* Duplicate for seamless loop */}
            {[...secondaryServices, ...secondaryServices].map((service, idx) => {
              const IconComp = service.icon;
              return (
                <Link
                  key={`${service.label}-${idx}`}
                  to={service.href}
                  className="flex items-center gap-2 px-4 py-2.5 mx-2 rounded-full border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors shrink-0"
                >
                  <IconComp className="h-4 w-4 text-primary" strokeWidth={1.8} />
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{service.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
