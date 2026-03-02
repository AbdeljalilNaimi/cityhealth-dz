import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Key, Gauge, Server, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qedotqjxndtmskcgrajt.supabase.co';
const API_BASE = `${SUPABASE_URL}/functions/v1/public-api`;

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border my-4" dir="ltr">
      {title && <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">{title}</div>}
      <pre className="bg-foreground/5 p-4 overflow-x-auto text-sm font-mono text-foreground">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function DeveloperDocsPage() {
  const [activeSection, setActiveSection] = useState('auth');
  const navigate = useNavigate();
  const { language } = useLanguage();

  const sections = [
    { id: 'auth', label: language === 'ar' ? 'المصادقة' : language === 'en' ? 'Authentication' : 'Authentification', icon: Key },
    { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
    { id: 'endpoints', label: 'Endpoints', icon: Server },
    { id: 'errors', label: language === 'ar' ? 'رموز الخطأ' : language === 'en' ? 'Error Codes' : 'Codes d\'erreur', icon: AlertTriangle },
  ];

  const t = {
    back: language === 'ar' ? 'رجوع' : language === 'en' ? 'Back' : 'Retour',
    apiDocs: language === 'ar' ? 'وثائق API' : language === 'en' ? 'API Documentation' : 'Documentation API',
    // Auth section
    authTitle: language === 'ar' ? 'المصادقة' : language === 'en' ? 'Authentication' : 'Authentification',
    authDesc: language === 'ar'
      ? 'تتطلب جميع طلبات API (باستثناء /v1/categories) مفتاح API يُرسل عبر الترويسة x-api-key.'
      : language === 'en'
      ? 'All API requests (except /v1/categories) require an API key sent via the x-api-key header.'
      : 'Toutes les requêtes API (sauf /v1/categories) nécessitent une clé API envoyée via le header x-api-key.',
    security: language === 'ar' ? 'الأمان' : language === 'en' ? 'Security' : 'Sécurité',
    securityItems: language === 'ar'
      ? ['المفاتيح مشفرة بـ SHA-256 على الخادم', 'لا تشارك مفتاح API الخاص بك أبداً', 'استخدم متغيرات البيئة لتخزين مفتاحك']
      : language === 'en'
      ? ['Keys are hashed with SHA-256 server-side', 'Never share your API key', 'Use environment variables to store your key']
      : ['Les clés sont hachées en SHA-256 côté serveur', 'Ne partagez jamais votre clé API', 'Utilisez des variables d\'environnement pour stocker votre clé'],
    // Rate limits section
    rateLimitsTitle: 'Rate Limits',
    rateLimitsDesc: language === 'ar'
      ? 'لكل خطة حد أقصى للطلبات اليومية.'
      : language === 'en'
      ? 'Each plan has a daily request limit.'
      : 'Chaque plan a une limite de requêtes quotidiennes.',
    reqPerDay: language === 'ar' ? 'طلب / يوم' : language === 'en' ? 'requests / day' : 'requêtes / jour',
    responseHeaders: language === 'ar' ? 'ترويسات الاستجابة' : language === 'en' ? 'Response Headers' : 'Headers de réponse',
    exception: language === 'ar'
      ? 'استثناء: نقطة النهاية /v1/emergency لا تُحتسب ضمن الحدود.'
      : language === 'en'
      ? 'Exception: The /v1/emergency endpoint does not count against limits.'
      : 'Exception : L\'endpoint /v1/emergency ne compte pas dans les limites.',
    // Endpoints section
    endpointsTitle: 'Endpoints',
    categoriesDesc: language === 'ar' ? 'قائمة فئات مقدمي الخدمات. لا يتطلب مفتاح.' : language === 'en' ? 'List of provider categories. No key required.' : 'Liste des catégories de prestataires. Pas de clé requise.',
    response: language === 'ar' ? 'الاستجابة' : language === 'en' ? 'Response' : 'Réponse',
    providersDesc: language === 'ar' ? 'البحث عن مقدمي الخدمات مع فلاتر.' : language === 'en' ? 'Search providers with filters.' : 'Recherche de prestataires avec filtres.',
    providerByIdDesc: language === 'ar' ? 'تفاصيل مقدم خدمة حسب المعرف.' : language === 'en' ? 'Provider details by ID.' : 'Détails d\'un prestataire par ID.',
    emergencyDesc: language === 'ar' ? 'مقدمو خدمات 24/7 معتمدون. لا حد للطلبات.' : language === 'en' ? 'Verified 24/7 providers. No rate limit.' : 'Prestataires 24/7 vérifiés. Pas de rate limit.',
    pharmaciesDesc: language === 'ar' ? 'صيدليات معتمدة مع معلومات المناوبة.' : language === 'en' ? 'Verified pharmacies with on-duty info.' : 'Pharmacies vérifiées avec info de garde.',
    searchDesc: language === 'ar' ? 'بحث نصي كامل. المعامل ?q= مطلوب.' : language === 'en' ? 'Full-text search. Parameter ?q= required.' : 'Recherche full-text. Paramètre ?q= obligatoire.',
    textSearch: language === 'ar' ? 'بحث نصي' : language === 'en' ? 'Text search' : 'Recherche textuelle',
    filterByType: language === 'ar' ? 'تصفية حسب النوع' : language === 'en' ? 'Filter by type' : 'Filtrer par type',
    filterByCity: language === 'ar' ? 'تصفية حسب المدينة' : language === 'en' ? 'Filter by city' : 'Filtrer par ville',
    verifiedDefault: language === 'ar' ? 'true (افتراضي) أو false' : language === 'en' ? 'true (default) or false' : 'true (défaut) ou false',
    maxResults: language === 'ar' ? 'أقصى النتائج (افتراضي 20، أقصى 100)' : language === 'en' ? 'Max results (default 20, max 100)' : 'Max résultats (défaut 20, max 100)',
    pagination: language === 'ar' ? 'ترقيم الصفحات' : language === 'en' ? 'Pagination' : 'Pagination',
    noKeyRequired: language === 'ar' ? 'لا يتطلب مفتاح.' : language === 'en' ? 'No key required.' : 'Pas de clé requise.',
    noRateLimit: language === 'ar' ? 'لا حد للطلبات.' : language === 'en' ? 'No rate limit.' : 'Pas de rate limit.',
    // Errors section
    errorsTitle: language === 'ar' ? 'رموز الخطأ' : language === 'en' ? 'Error Codes' : 'Codes d\'erreur',
    errorFormat: language === 'ar' ? 'تنسيق الخطأ' : language === 'en' ? 'Error format' : 'Format d\'erreur',
    errors: {
      401: language === 'ar' ? 'مفتاح API مفقود أو غير صالح أو معطّل' : language === 'en' ? 'Missing, invalid, or disabled API key' : 'Clé API manquante, invalide ou désactivée',
      429: language === 'ar' ? 'تم تجاوز الحد اليومي للطلبات' : language === 'en' ? 'Daily request limit exceeded' : 'Limite quotidienne de requêtes dépassée',
      404: language === 'ar' ? 'نقطة نهاية أو مورد غير موجود' : language === 'en' ? 'Endpoint or resource not found' : 'Endpoint ou ressource introuvable',
      400: language === 'ar' ? 'معاملات طلب غير صالحة' : language === 'en' ? 'Invalid request parameters' : 'Paramètres de requête invalides',
      500: language === 'ar' ? 'خطأ داخلي في الخادم' : language === 'en' ? 'Internal server error' : 'Erreur serveur interne',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border min-h-screen p-6 hidden md:block sticky top-0">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/developers')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t.back}
          </Button>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Book className="h-4 w-4" /> {t.apiDocs}
          </h2>
          <nav className="space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors',
                    activeSection === s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" /> {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-w-3xl">
          {/* Mobile nav */}
          <div className="flex gap-2 mb-6 md:hidden overflow-x-auto">
            {sections.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={activeSection === s.id ? 'default' : 'outline'}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {activeSection === 'auth' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{t.authTitle}</h1>
              <p className="text-muted-foreground mb-6">
                {t.authDesc}
              </p>
              <CodeBlock title="curl">{`curl -H "x-api-key: ch_live_votreclé" \\
  ${API_BASE}/v1/providers`}</CodeBlock>
              <CodeBlock title="JavaScript (fetch)">{`const response = await fetch(
  '${API_BASE}/v1/providers',
  {
    headers: {
      'x-api-key': 'ch_live_votreclé'
    }
  }
);
const data = await response.json();
console.log(data);`}</CodeBlock>
              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">{t.security}</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {t.securityItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {activeSection === 'rate-limits' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{t.rateLimitsTitle}</h1>
              <p className="text-muted-foreground mb-6">{t.rateLimitsDesc}</p>
              <div className="grid gap-4 mb-6">
                {[
                  { name: 'Free', count: '100' },
                  { name: 'Basic', count: '1 000' },
                  { name: 'Pro', count: '10 000' },
                ].map((plan) => (
                  <div key={plan.name} className="border border-border rounded-lg p-4">
                    <div className="font-semibold text-foreground">{plan.name}</div>
                    <div className="text-muted-foreground">{plan.count} {t.reqPerDay}</div>
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t.responseHeaders}</h3>
              <CodeBlock>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87`}</CodeBlock>
              <p className="text-muted-foreground">
                <strong>{language === 'ar' ? 'استثناء:' : language === 'en' ? 'Exception:' : 'Exception :'}</strong> {t.exception}
              </p>
            </div>
          )}

          {activeSection === 'endpoints' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{t.endpointsTitle}</h1>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">GET /v1/categories</h3>
              <p className="text-muted-foreground mb-2">{t.categoriesDesc}</p>
              <CodeBlock title={t.response}>{`{
  "success": true,
  "data": [
    { "id": "hospital", "label": "Hôpital", "label_ar": "مستشفى" },
    { "id": "pharmacy", "label": "Pharmacie", "label_ar": "صيدلية" }
  ]
}`}</CodeBlock>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/providers</h3>
              <p className="text-muted-foreground mb-2">{t.providersDesc}</p>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <div><code>?q=</code> — {t.textSearch}</div>
                <div><code>?type=</code> — {t.filterByType} (hospital, pharmacy, etc.)</div>
                <div><code>?city=</code> — {t.filterByCity}</div>
                <div><code>?verified_only=</code> — {t.verifiedDefault}</div>
                <div><code>?limit=</code> — {t.maxResults}</div>
                <div><code>?offset=</code> — {t.pagination}</div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/providers/:id</h3>
              <p className="text-muted-foreground mb-2">{t.providerByIdDesc}</p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/emergency</h3>
              <p className="text-muted-foreground mb-2">{t.emergencyDesc}</p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/pharmacies</h3>
              <p className="text-muted-foreground mb-2">{t.pharmaciesDesc}</p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/search</h3>
              <p className="text-muted-foreground mb-2">{t.searchDesc}</p>
            </div>
          )}

          {activeSection === 'errors' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{t.errorsTitle}</h1>
              <div className="space-y-4">
                {([401, 429, 404, 400, 500] as const).map((code) => (
                  <div key={code} className="border border-border rounded-lg p-4">
                    <code className="text-destructive font-bold">{code}</code>
                    <span className="ml-2 text-muted-foreground">{t.errors[code]}</span>
                  </div>
                ))}
              </div>
              <CodeBlock title={t.errorFormat}>{`{
  "success": false,
  "error": {
    "code": 429,
    "message": "Daily rate limit exceeded."
  }
}`}</CodeBlock>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
