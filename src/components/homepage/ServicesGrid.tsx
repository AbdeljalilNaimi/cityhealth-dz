import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import donGratuitImg from '@/assets/services/don-gratuit.png';
import donDeSangImg from '@/assets/services/don-de-sang.png';
import rechercheImg from '@/assets/services/recherche.png';
import carteInteractiveImg from '@/assets/services/carte-interactive.png';
import urgencesImg from '@/assets/services/urgences.png';
import assistanteIaImg from '@/assets/services/assistante-ia.png';
import annoncesImg from '@/assets/services/annonces.png';
import avisIdeesImg from '@/assets/services/avis-idees.png';
import documentsImg from '@/assets/services/documents.png';
import contactImg from '@/assets/services/contact.png';

/* ─── Service card data ─── */
interface ServiceCard {
  title: string;
  description: string;
  route: string;
  image: string;
}

const row1Services: ServiceCard[] = [
  { title: 'Don Gratuit', description: 'Offrez ou trouvez de l\'aide communautaire gratuite', route: '/citizen/provide', image: donGratuitImg },
  { title: 'Don de Sang', description: 'Sauvez des vies en donnant votre sang', route: '/blood-donation', image: donDeSangImg },
  { title: 'Recherche', description: 'Trouvez le bon médecin ou spécialiste', route: '/search', image: rechercheImg },
  { title: 'Carte Interactive', description: 'Explorez les établissements autour de vous', route: '/map/providers', image: carteInteractiveImg },
  { title: 'Urgences', description: 'Accès rapide aux services d\'urgence 24/7', route: '/emergency', image: urgencesImg },
  { title: 'Assistante IA', description: 'Évaluez vos symptômes avec l\'IA', route: '/medical-assistant', image: assistanteIaImg },
];

const row2Services: ServiceCard[] = [
  { title: 'Annonces', description: 'Découvrez les offres des professionnels', route: '/annonces', image: annoncesImg },
  { title: 'Avis & Idées', description: 'Partagez vos retours et suggestions', route: '/community', image: avisIdeesImg },
  { title: 'Documents', description: 'Guides et documentation complète', route: '/docs', image: documentsImg },
  { title: 'Contact', description: 'Besoin d\'aide ? Contactez-nous', route: '/contact', image: contactImg },
];

/* ─── Single card component ─── */
const ServiceCardItem = ({ service }: { service: ServiceCard }) => {
  const navigate = useNavigate();

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
      className="group flex-shrink-0 w-[200px] rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-[0.97] mx-2.5"
      tabIndex={0}
      aria-label={`Aller à ${service.title}`}
    >
      {/* Image preview area — like reference cards */}
      <div className="h-[140px] bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      {/* Icon + Label — bottom strip */}
      <div className="px-3 py-2.5 border-t border-border/30 flex items-center gap-2 bg-card">
        <span className="font-semibold text-sm text-foreground leading-tight truncate">{service.title}</span>
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
