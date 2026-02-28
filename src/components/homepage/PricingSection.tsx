import { Check, Crown, Star, Zap, MapPin, Droplets, ShieldCheck, Calendar, Pill, MessageSquare, Image as ImageIcon, Search, Brain, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    price: 'Gratuit',
    subtitle: 'Pour démarrer votre présence en ligne',
    features: [
      { text: 'Profil public standard', icon: MapPin },
      { text: 'Localisation sur la carte interactive', icon: MapPin },
      { text: 'Accès au réseau "Urgence Sang"', icon: Droplets },
      { text: 'Badge "Vérifié" standard', icon: ShieldCheck },
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Standard',
    icon: Star,
    price: '0 DA',
    subtitle: 'Idéal pour développer votre activité',
    features: [
      { text: 'Tout le forfait Basic', icon: Check },
      { text: 'Prise de rendez-vous en ligne', icon: Calendar },
      { text: 'Mode "Pharmacie de Garde"', icon: Pill },
      { text: 'Affichage des avis patients', icon: MessageSquare },
      { text: 'Galerie photos de l\'établissement', icon: ImageIcon },
    ],
    cta: 'Choisir le Standard',
    popular: true,
  },
  {
    name: 'Premium',
    icon: Crown,
    price: '0 DA',
    subtitle: 'Visibilité maximale & outils avancés',
    features: [
      { text: 'Tout le forfait Standard', icon: Check },
      { text: 'Badge exclusif "Premium Vérifié"', icon: Crown },
      { text: 'Apparition en tête des résultats', icon: Search },
      { text: 'Recommandation par l\'Assistant IA Triage', icon: Brain },
      { text: 'Statistiques avancées du tableau de bord', icon: BarChart3 },
    ],
    cta: 'Devenir Premium',
    popular: false,
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full mb-3">
            Tarification
          </span>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Des forfaits adaptés à vos besoins
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Tous les forfaits sont entièrement gratuits la première année. Aucune carte bancaire requise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card
                  className={cn(
                    'relative h-full flex flex-col transition-shadow duration-300',
                    plan.popular
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'hover:shadow-md'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground text-xs px-3">
                        Le plus populaire
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'p-1.5 rounded-md',
                        plan.popular ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          plan.popular ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      {plan.price !== 'Gratuit' && (
                        <span className="text-sm text-muted-foreground">/ mois</span>
                      )}
                    </div>
                    <Badge variant="outline" className="w-fit mt-2 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                      Gratuit la 1ère année
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((f) => {
                        const FeatureIcon = f.icon;
                        return (
                          <li key={f.text} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FeatureIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            {f.text}
                          </li>
                        );
                      })}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => navigate('/provider/register')}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
