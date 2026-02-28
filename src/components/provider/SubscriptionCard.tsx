import { useState } from 'react';
import { Crown, Star, Zap, Search, Brain, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  planType?: 'basic' | 'standard' | 'premium';
}

const planConfig = {
  basic: {
    label: 'Basic',
    icon: Zap,
    badgeClass: 'bg-muted text-muted-foreground',
  },
  standard: {
    label: 'Standard',
    icon: Star,
    badgeClass: 'bg-primary/10 text-primary',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
};

const premiumBenefits = [
  { icon: Crown, text: 'Badge exclusif "Premium Vérifié"' },
  { icon: Search, text: 'Apparition en tête des résultats de recherche' },
  { icon: Brain, text: 'Recommandation par l\'Assistant IA Triage' },
  { icon: BarChart3, text: 'Statistiques avancées du tableau de bord' },
  { icon: ShieldCheck, text: 'Priorité de support technique' },
];

export const SubscriptionCard = ({ planType = 'basic' }: SubscriptionCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const config = planConfig[planType];
  const Icon = config.icon;
  const isPremium = planType === 'premium';

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4" />
            Abonnement & Facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Forfait Actuel</span>
            <Badge className={cn('text-xs px-2.5 py-0.5 border-0', config.badgeClass)}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <Badge variant="outline" className="w-fit border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
            Gratuit la 1ère année
          </Badge>

          {!isPremium && (
            <Button
              className="w-full gap-2"
              variant="default"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Sparkles className="h-4 w-4" />
              Passer au Premium
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Passer au Premium
            </DialogTitle>
            <DialogDescription>
              Débloquez tous les avantages pour maximiser votre visibilité.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3 my-4">
            {premiumBenefits.map((benefit) => {
              const BenefitIcon = benefit.icon;
              return (
                <li key={benefit.text} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <BenefitIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-foreground pt-1">{benefit.text}</span>
                </li>
              );
            })}
          </ul>

          <Badge variant="outline" className="w-fit border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs mb-3">
            Gratuit la 1ère année — 0 DA / mois
          </Badge>

          <Button className="w-full gap-2" onClick={() => setShowModal(false)}>
            <Crown className="h-4 w-4" />
            Confirmer le passage au Premium
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
