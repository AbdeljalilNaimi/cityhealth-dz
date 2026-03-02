import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Shield, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';

const getPlans = (language: string) => [
  {
    name: 'Free',
    price: language === 'ar' ? 'مجاني' : language === 'en' ? 'Free' : 'Gratuit',
    requests: language === 'ar' ? '100 طلب/يوم' : language === 'en' ? '100 req/day' : '100 req/jour',
    features: language === 'ar'
      ? ['البحث عن مقدمي الخدمات', 'الوصول للطوارئ', 'الفئات العامة']
      : language === 'en'
      ? ['Provider search', 'Emergency access', 'Public categories']
      : ['Recherche de prestataires', 'Accès urgences', 'Catégories publiques'],
    cta: language === 'ar' ? 'ابدأ الآن' : language === 'en' ? 'Get Started' : 'Commencer',
    highlight: false,
  },
  {
    name: 'Basic',
    price: language === 'ar' ? '2,000 د.ج/شهر' : language === 'en' ? '2,000 DA/month' : '2 000 DA/mois',
    requests: language === 'ar' ? '1,000 طلب/يوم' : language === 'en' ? '1,000 req/day' : '1 000 req/jour',
    features: language === 'ar'
      ? ['كل ميزات الخطة المجانية', 'بحث نصي كامل', 'صيدليات المناوبة', 'دعم عبر البريد']
      : language === 'en'
      ? ['Everything in Free', 'Full-text search', 'On-duty pharmacies', 'Email support']
      : ['Tout le plan Free', 'Recherche full-text', 'Pharmacies de garde', 'Support email'],
    cta: language === 'ar' ? 'اختر Basic' : language === 'en' ? 'Choose Basic' : 'Choisir Basic',
    highlight: true,
  },
  {
    name: 'Pro',
    price: language === 'ar' ? '8,000 د.ج/شهر' : language === 'en' ? '8,000 DA/month' : '8 000 DA/mois',
    requests: language === 'ar' ? '10,000 طلب/يوم' : language === 'en' ? '10,000 req/day' : '10 000 req/jour',
    features: language === 'ar'
      ? ['كل ميزات الخطة الأساسية', 'Webhooks فوري', 'SLA 99.9%', 'دعم ذو أولوية']
      : language === 'en'
      ? ['Everything in Basic', 'Real-time Webhooks', 'SLA 99.9%', 'Priority support']
      : ['Tout le plan Basic', 'Webhooks temps réel', 'SLA 99.9%', 'Support prioritaire'],
    cta: language === 'ar' ? 'اختر Pro' : language === 'en' ? 'Choose Pro' : 'Choisir Pro',
    highlight: false,
  },
];

export default function DeveloperLandingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const plans = getPlans(language);

  const t = {
    badge: language === 'ar' ? 'واجهة برمجة عامة v1' : language === 'en' ? 'Public API v1' : 'API Publique v1',
    heroTitle1: language === 'ar' ? 'ابنِ مع' : language === 'en' ? 'Build with' : 'Construisez avec',
    heroTitle2: 'CityHealth API',
    heroDesc: language === 'ar'
      ? 'الوصول إلى بيانات الصحة في سيدي بلعباس: مقدمو خدمات معتمدون، صيدليات المناوبة، طوارئ 24/7 — كل ذلك عبر واجهة REST بسيطة وآمنة.'
      : language === 'en'
      ? 'Access health data in Sidi Bel Abbès: verified providers, on-duty pharmacies, 24/7 emergencies — all through a simple and secure REST API.'
      : 'Accédez aux données de santé de Sidi Bel Abbès : prestataires vérifiés, pharmacies de garde, urgences 24/7 — le tout via une API REST simple et sécurisée.',
    getKey: language === 'ar' ? 'احصل على مفتاح API' : language === 'en' ? 'Get an API Key' : 'Obtenir une clé API',
    docs: 'Documentation',
    whyTitle: language === 'ar' ? 'لماذا CityHealth API؟' : language === 'en' ? 'Why CityHealth API?' : 'Pourquoi CityHealth API ?',
    fastTitle: language === 'ar' ? 'سريع وموثوق' : language === 'en' ? 'Fast & Reliable' : 'Rapide & Fiable',
    fastDesc: language === 'ar'
      ? 'استجابة في أقل من 200 مللي ثانية. بنية تحتية قوية بتوفر 99.9%.'
      : language === 'en'
      ? 'Responses under 200ms. Robust infrastructure with 99.9% uptime.'
      : 'Réponses en moins de 200ms. Infrastructure robuste avec disponibilité 99.9%.',
    secureTitle: language === 'ar' ? 'آمن' : language === 'en' ? 'Secure' : 'Sécurisé',
    secureDesc: language === 'ar'
      ? 'مفاتيح API مشفرة بـ SHA-256. تحديد معدل ذكي. بيانات عامة فقط.'
      : language === 'en'
      ? 'SHA-256 hashed API keys. Smart rate limiting. Public data only.'
      : 'Clés API hachées SHA-256. Rate limiting intelligent. Données publiques uniquement.',
    easyTitle: language === 'ar' ? 'سهل الدمج' : language === 'en' ? 'Easy to Integrate' : 'Facile à intégrer',
    easyDesc: language === 'ar'
      ? 'تنسيق JSON قياسي. وثائق كاملة. أمثلة curl و JavaScript.'
      : language === 'en'
      ? 'Standard JSON format. Complete documentation. curl and JavaScript examples.'
      : 'Format JSON standard. Documentation complète. Exemples curl et JavaScript.',
    pricingTitle: language === 'ar' ? 'الخطط والأسعار' : language === 'en' ? 'Plans & Pricing' : 'Plans & Tarifs',
    popular: language === 'ar' ? 'الأكثر شعبية' : language === 'en' ? 'Popular' : 'Populaire',
    readyTitle: language === 'ar' ? 'مستعد للبدء؟' : language === 'en' ? 'Ready to start?' : 'Prêt à commencer ?',
    readyDesc: language === 'ar'
      ? 'أنشئ حساب مطور واحصل على مفتاح API الخاص بك في أقل من دقيقتين.'
      : language === 'en'
      ? 'Create your developer account and get your API key in less than 2 minutes.'
      : 'Créez votre compte développeur et obtenez votre clé API en moins de 2 minutes.',
    createAccount: language === 'ar' ? 'إنشاء حساب مطور' : language === 'en' ? 'Create a developer account' : 'Créer un compte développeur',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm">
            <Code2 className="h-3.5 w-3.5 mr-1" /> {t.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {t.heroTitle1}<br />
            <span className="text-primary">{t.heroTitle2}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.heroDesc}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/developers/register')}>
              {t.getKey} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/developers/docs')}>
              {t.docs}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">{t.whyTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{t.fastTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.fastDesc}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{t.secureTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.secureDesc}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Rocket className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{t.easyTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.easyDesc}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">{t.pricingTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.highlight ? 'border-primary ring-2 ring-primary/20' : ''}>
                <CardHeader>
                  {plan.highlight && <Badge className="w-fit mb-2">{t.popular}</Badge>}
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
          <h2 className="text-2xl font-bold text-foreground mb-4">{t.readyTitle}</h2>
          <p className="text-muted-foreground mb-6">{t.readyDesc}</p>
          <Button size="lg" onClick={() => navigate('/developers/register')}>
            {t.createAccount} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
