import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Shield, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Free',
    price: 'Gratuit',
    requests: '100 req/jour',
    features: ['Recherche de prestataires', 'Accès urgences', 'Catégories publiques'],
    cta: 'Commencer',
    highlight: false,
  },
  {
    name: 'Basic',
    price: '2 000 DA/mois',
    requests: '1 000 req/jour',
    features: ['Tout le plan Free', 'Recherche full-text', 'Pharmacies de garde', 'Support email'],
    cta: 'Choisir Basic',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '8 000 DA/mois',
    requests: '10 000 req/jour',
    features: ['Tout le plan Basic', 'Webhooks temps réel', 'SLA 99.9%', 'Support prioritaire'],
    cta: 'Choisir Pro',
    highlight: false,
  },
];

export default function DeveloperLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Code2 className="h-3.5 w-3.5 mr-1" /> API Publique v1
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Construisez avec<br />
            <span className="text-primary">CityHealth API</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Accédez aux données de santé de Sidi Bel Abbès : prestataires vérifiés, pharmacies de garde, 
            urgences 24/7 — le tout via une API REST simple et sécurisée.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/developers/register')}>
              Obtenir une clé API <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/developers/docs')}>
              Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Pourquoi CityHealth API ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Rapide & Fiable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Réponses en moins de 200ms. Infrastructure robuste avec disponibilité 99.9%.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Clés API hachées SHA-256. Rate limiting intelligent. Données publiques uniquement.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Rocket className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Facile à intégrer</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Format JSON standard. Documentation complète. Exemples curl et JavaScript.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Plans & Tarifs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.highlight ? 'border-primary ring-2 ring-primary/20' : ''}>
                <CardHeader>
                  {plan.highlight && <Badge className="w-fit mb-2">Populaire</Badge>}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-foreground">{plan.price}</div>
                  <CardDescription>{plan.requests}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => navigate('/developers/dashboard')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Prêt à commencer ?</h2>
          <p className="text-muted-foreground mb-6">
            Créez votre compte développeur et obtenez votre clé API en moins de 2 minutes.
          </p>
          <Button size="lg" onClick={() => navigate('/developers/register')}>
            Créer un compte développeur <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
