import { useState } from 'react';
import { Check, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type BillingPeriod = 'monthly' | 'annual';

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    monthlyPrice: 'Gratuit',
    annualPrice: 'Gratuit',
    period: { monthly: '', annual: '' },
    subtitle: 'Pour démarrer votre présence en ligne',
    features: [
      'Profil public standard',
      'Localisation sur la carte interactive',
      'Accès au réseau "Urgence Sang"',
      'Badge "Vérifié" standard',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
    tier: 'basic' as const,
  },
  {
    name: 'Standard',
    icon: Star,
    monthlyPrice: '0 DA',
    annualPrice: '0 DA',
    period: { monthly: '/ mois', annual: '/ an' },
    subtitle: 'Idéal pour développer votre activité',
    features: [
      'Tout le forfait Basic inclus',
      'Prise de rendez-vous en ligne',
      'Mode "Pharmacie de Garde"',
      'Affichage des avis patients',
      'Galerie photos de l\'établissement',
    ],
    cta: 'Choisir le Standard',
    popular: true,
    tier: 'standard' as const,
  },
  {
    name: 'Premium',
    icon: Crown,
    monthlyPrice: '0 DA',
    annualPrice: '0 DA',
    period: { monthly: '/ mois', annual: '/ an' },
    subtitle: 'Visibilité maximale & outils avancés',
    features: [
      'Tout le forfait Standard inclus',
      'Badge exclusif "Premium Vérifié"',
      'Apparition en tête des résultats',
      'Recommandation par l\'Assistant IA',
      'Statistiques avancées du dashboard',
    ],
    cta: 'Devenir Premium',
    popular: false,
    tier: 'premium' as const,
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 text-xs font-medium px-3 py-1 border-primary/20 text-primary">
            Tarification transparente
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Des forfaits adaptés à vos besoins
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            Tous les forfaits sont <span className="font-semibold text-foreground">entièrement gratuits la première année</span>. 
            Aucune carte bancaire requise.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center bg-muted rounded-full p-1 gap-0.5">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
                billing === 'monthly'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billing === 'monthly' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Mensuel</span>
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
                billing === 'annual'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billing === 'annual' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                Annuel
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  -20%
                </span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isPremium = plan.tier === 'premium';
            const isPopular = plan.popular;
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const period = plan.period[billing];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative"
              >
                {/* Popular label */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                    <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-4 py-1 rounded-full shadow-md shadow-primary/25">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'h-full rounded-2xl p-[1px] transition-all duration-300',
                    isPopular
                      ? 'bg-gradient-to-b from-primary/60 via-primary/20 to-primary/5 shadow-xl shadow-primary/10'
                      : isPremium
                        ? 'bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent'
                        : 'bg-border hover:bg-primary/20'
                  )}
                >
                  <div className={cn(
                    'h-full rounded-[15px] bg-card flex flex-col p-6',
                    isPopular && 'pt-8'
                  )}>
                    {/* Plan header */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          isPremium
                            ? 'bg-amber-500/10'
                            : isPopular
                              ? 'bg-primary/10'
                              : 'bg-muted'
                        )}>
                          <Icon className={cn(
                            'h-4.5 w-4.5',
                            isPremium
                              ? 'text-amber-500'
                              : isPopular
                                ? 'text-primary'
                                : 'text-muted-foreground'
                          )} />
                        </div>
                        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{plan.subtitle}</p>
                    </div>

                    {/* Price with animation */}
                    <div className="mb-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={billing}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-baseline gap-1"
                        >
                          <span className="text-4xl font-extrabold tracking-tight text-foreground">{price}</span>
                          {period && (
                            <span className="text-sm text-muted-foreground font-medium">{period}</span>
                          )}
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" />
                          Gratuit la 1ère année
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border mb-5" />

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div className={cn(
                            'w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                            isPremium
                              ? 'bg-amber-500/10'
                              : 'bg-primary/10'
                          )}>
                            <Check className={cn(
                              'h-2.5 w-2.5',
                              isPremium ? 'text-amber-500' : 'text-primary'
                            )} />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className={cn(
                        'w-full h-11 font-semibold text-sm gap-2 rounded-xl transition-all',
                        isPopular && 'shadow-md shadow-primary/20',
                        isPremium && 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                      )}
                      variant={isPopular ? 'default' : isPremium ? 'default' : 'outline'}
                      onClick={() => navigate('/provider/register')}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-10"
        >
          Aucun engagement • Annulation à tout moment • Support inclus dans tous les forfaits
        </motion.p>
      </div>
    </section>
  );
};
