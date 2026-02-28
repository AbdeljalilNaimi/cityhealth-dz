import { Check, Crown, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    price: '0 DA',
    features: [
      'Provider search',
      'Interactive map',
      'Emergency info',
      'Community access',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    icon: Star,
    price: '0 DA',
    features: [
      'Everything in Basic',
      'AI Health Assistant',
      'Appointment booking',
      'Blood donation alerts',
      'Medical document storage',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    icon: Crown,
    price: '0 DA',
    features: [
      'Everything in Standard',
      'Priority support',
      'Advanced analytics',
      'Research hub access',
      'Custom emergency card',
    ],
    popular: false,
  },
];

export const PricingSection = () => {
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
            Pricing
          </span>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            All plans are completely free for the first year. No credit card required.
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
                        Most Popular
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </div>
                    <Badge variant="outline" className="w-fit mt-2 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                      Free for 1 Year
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started Free
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
