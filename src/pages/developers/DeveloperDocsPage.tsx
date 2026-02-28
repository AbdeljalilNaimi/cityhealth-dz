import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Key, Gauge, Server, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'auth', label: 'Authentification', icon: Key },
  { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
  { id: 'endpoints', label: 'Endpoints', icon: Server },
  { id: 'errors', label: 'Codes d\'erreur', icon: AlertTriangle },
];

const API_BASE = `https://lerfyjdokajfkyarlhjg.supabase.co/functions/v1/public-api`;

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border my-4">
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border min-h-screen p-6 hidden md:block sticky top-0">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/developers')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Book className="h-4 w-4" /> Documentation API
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
              <h1 className="text-3xl font-bold text-foreground mb-4">Authentification</h1>
              <p className="text-muted-foreground mb-6">
                Toutes les requêtes API (sauf <code>/v1/categories</code>) nécessitent une clé API 
                envoyée via le header <code>x-api-key</code>.
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
              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">Sécurité</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Les clés sont hachées en SHA-256 côté serveur</li>
                <li>Ne partagez jamais votre clé API</li>
                <li>Utilisez des variables d'environnement pour stocker votre clé</li>
              </ul>
            </div>
          )}

          {activeSection === 'rate-limits' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Rate Limits</h1>
              <p className="text-muted-foreground mb-6">Chaque plan a une limite de requêtes quotidiennes.</p>
              <div className="grid gap-4 mb-6">
                <div className="border border-border rounded-lg p-4">
                  <div className="font-semibold text-foreground">Free</div>
                  <div className="text-muted-foreground">100 requêtes / jour</div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="font-semibold text-foreground">Basic</div>
                  <div className="text-muted-foreground">1 000 requêtes / jour</div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="font-semibold text-foreground">Pro</div>
                  <div className="text-muted-foreground">10 000 requêtes / jour</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Headers de réponse</h3>
              <CodeBlock>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87`}</CodeBlock>
              <p className="text-muted-foreground">
                <strong>Exception :</strong> L'endpoint <code>/v1/emergency</code> ne compte pas dans les limites.
              </p>
            </div>
          )}

          {activeSection === 'endpoints' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Endpoints</h1>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">GET /v1/categories</h3>
              <p className="text-muted-foreground mb-2">Liste des catégories de prestataires. <strong>Pas de clé requise.</strong></p>
              <CodeBlock title="Réponse">{`{
  "success": true,
  "data": [
    { "id": "hospital", "label": "Hôpital", "label_ar": "مستشفى" },
    { "id": "pharmacy", "label": "Pharmacie", "label_ar": "صيدلية" }
  ]
}`}</CodeBlock>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/providers</h3>
              <p className="text-muted-foreground mb-2">Recherche de prestataires avec filtres.</p>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <div><code>?q=</code> — Recherche textuelle</div>
                <div><code>?type=</code> — Filtrer par type (hospital, pharmacy, etc.)</div>
                <div><code>?city=</code> — Filtrer par ville</div>
                <div><code>?verified_only=</code> — true (défaut) ou false</div>
                <div><code>?limit=</code> — Max résultats (défaut 20, max 100)</div>
                <div><code>?offset=</code> — Pagination</div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/providers/:id</h3>
              <p className="text-muted-foreground mb-2">Détails d'un prestataire par ID.</p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/emergency</h3>
              <p className="text-muted-foreground mb-2">Prestataires 24/7 vérifiés. <strong>Pas de rate limit.</strong></p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/pharmacies</h3>
              <p className="text-muted-foreground mb-2">Pharmacies vérifiées avec info de garde.</p>

              <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">GET /v1/search</h3>
              <p className="text-muted-foreground mb-2">Recherche full-text. Paramètre <code>?q=</code> obligatoire.</p>
            </div>
          )}

          {activeSection === 'errors' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Codes d'erreur</h1>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <code className="text-destructive font-bold">401</code>
                  <span className="ml-2 text-muted-foreground">Clé API manquante, invalide ou désactivée</span>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <code className="text-destructive font-bold">429</code>
                  <span className="ml-2 text-muted-foreground">Limite quotidienne de requêtes dépassée</span>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <code className="text-destructive font-bold">404</code>
                  <span className="ml-2 text-muted-foreground">Endpoint ou ressource introuvable</span>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <code className="text-destructive font-bold">400</code>
                  <span className="ml-2 text-muted-foreground">Paramètres de requête invalides</span>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <code className="text-destructive font-bold">500</code>
                  <span className="ml-2 text-muted-foreground">Erreur serveur interne</span>
                </div>
              </div>
              <CodeBlock title="Format d'erreur">{`{
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
