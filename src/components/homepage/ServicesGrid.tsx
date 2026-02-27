import {
  Search, MapPin, HeartPulse, Bot, Star, Megaphone,
  FileText, Gift, Droplets, Phone, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Service card data ─── */
interface ServiceCard {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
}

const row1Services: ServiceCard[] = [
  { title: 'Don Gratuit', description: 'Offrez ou trouvez de l\'aide communautaire gratuite', route: '/citizen/provide', icon: Gift },
  { title: 'Don de Sang', description: 'Sauvez des vies en donnant votre sang', route: '/blood-donation', icon: Droplets },
  { title: 'Recherche', description: 'Trouvez le bon médecin ou spécialiste', route: '/search', icon: Search },
  { title: 'Carte Interactive', description: 'Explorez les établissements autour de vous', route: '/map/providers', icon: MapPin },
  { title: 'Urgences', description: 'Accès rapide aux services d\'urgence 24/7', route: '/emergency', icon: HeartPulse },
  { title: 'Assistante IA', description: 'Évaluez vos symptômes avec l\'IA', route: '/medical-assistant', icon: Bot },
];

const row2Services: ServiceCard[] = [
  { title: 'Annonces', description: 'Découvrez les offres des professionnels', route: '/annonces', icon: Megaphone },
  { title: 'Avis & Idées', description: 'Partagez vos retours et suggestions', route: '/community', icon: Star },
  { title: 'Documents', description: 'Guides et documentation complète', route: '/docs', icon: FileText },
  { title: 'Contact', description: 'Besoin d\'aide ? Contactez-nous', route: '/contact', icon: Phone },
];

/* ─── Single card component ─── */
const ServiceCardItem = ({ service }: { service: ServiceCard }) => {
  const navigate = useNavigate();
  const IconComp = service.icon;

  const handleClick = () => navigate(service.route);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group flex-shrink-0 w-[220px] rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-[0.97] mx-2.5"
      tabIndex={0}
      aria-label={`Aller à ${service.title}`}
    >
      {/* Icon area */}
      <div className="h-[90px] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
          <IconComp className="h-6 w-6 text-primary" strokeWidth={1.8} />
        </div>
      </div>
      {/* Label + description */}
      <div className="px-3.5 py-3 border-t border-border/40 text-left space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground leading-tight">{service.title}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{service.description}</p>
      </div>
    </button>
  );
};

/* ─── Marquee row ─── */
const MarqueeRow = ({ services, reverse = false }: { services: ServiceCard[]; reverse?: boolean }) => {
  const items = [...services, ...services, ...services, ...services];

  return (
    <div className="overflow-hidden w-full group/marquee">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {items.map((service, i) => (
          <ServiceCardItem key={`${service.route}-${i}`} service={service} />
        ))}
      </div>
    </div>
  );
};

/* ─── Heading variants ─── */
const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─── Component ─── */
export const ServicesGrid = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Nos Services
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Tous les outils santé dont vous avez besoin — recherche, urgences, don, IA et plus — réunis en un seul endroit.
          </p>
        </motion.div>

        {/* Row 1 */}
        <div className="mb-6">
          <MarqueeRow services={row1Services} />
        </div>

        {/* Row 2 — reverse */}
        <div>
          <MarqueeRow services={row2Services} reverse />
        </div>
      </div>
    </section>
  );
};
