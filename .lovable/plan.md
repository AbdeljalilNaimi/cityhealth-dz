

# Refonte "Nos Services" — Grille Uniforme avec Navigation par Ancres

## Vue d'ensemble

Remplacement complet du composant `ServicesGrid.tsx` par une grille uniforme de 8 cartes identiques (4+4), avec navigation par ancres vers les sections de la page, animations staggered, et responsive strict (4/2/1 colonnes).

## Fichier modifie

**`src/components/homepage/ServicesGrid.tsx`** — Reecriture complete

## Structure des cartes (8 cartes identiques)

### Rangee 1 — Services Primaires
| Carte | Label | Ancre cible | Mockup |
|-------|-------|-------------|--------|
| Recherche Medecins | Recherche Medecins | `#recherche-medecins` | Barre de recherche + lignes de resultats |
| Carte Interactive | Carte Interactive | `#carte-interactive` | Grille map + pins |
| Urgences 24/7 | Urgences 24/7 | `#urgences` | Coeur pulsant + lignes status |
| Assistant IA Sante | Assistant IA Sante | `#assistant-ia` | Bulles de chat + indicateur IA |

### Rangee 2 — Services Secondaires
| Carte | Label | Ancre cible | Mockup |
|-------|-------|-------------|--------|
| Avis & Idees | Avis & Idees | `#avis-idees` | Etoiles + lignes de commentaires |
| Recherche Medicale | Recherche Medicale | `#recherche-medicale` | Document academique stylise |
| Annonces | Annonces | `#annonces` | Carte d'annonce miniature |
| Publicite | Publicite | `#publicite` | Banner pub stylisee |

## Design de chaque carte (toutes identiques)

- **Hauteur fixe** : `h-[280px]` sur toutes les cartes, identique
- **Zone mockup** (75%) : `h-[210px]`, fond `bg-muted/20`, contient l'illustration stylisee
- **Bandeau bas** (25%) : `h-[70px]`, fond `bg-card`, icone a gauche + nom du service
- **Coins** : `rounded-[14px]`
- **Ombre** : `shadow-sm`
- **Hover** : `translateY(-6px)`, `shadow-lg`, bordure accent
- **Click** : animation `scale(0.97)` breve puis scroll vers l'ancre

## Navigation par ancres

- Chaque carte utilise un `<button>` (pas un `<Link>`) qui declenche `scrollIntoView({ behavior: 'smooth', block: 'start' })` avec un offset pour le header sticky
- Implementation via `document.getElementById(anchorId)` + `window.scrollTo` avec calcul de l'offset du header (~80px)
- Les sections cibles existantes sur la page d'accueil recevront des `id` via modification de `AntigravityIndex.tsx` (wrapper divs avec les ids)

## Modification de `AntigravityIndex.tsx`

Ajout de `<div id="...">` wrapper autour des sections existantes pour creer les ancres :
- `#recherche-medecins` sur `AnimatedMapSection` (ou section recherche)
- `#carte-interactive` sur `AnimatedMapSection`
- `#urgences` sur `EmergencyBanner`
- `#assistant-ia` sur une section dediee (ou lien vers `/medical-assistant`)
- `#avis-idees` sur `TestimonialsSlider`
- `#recherche-medicale` sur `FeaturedProviders` (ou lien vers `/research`)
- `#annonces` sur `ProviderCTA`
- `#publicite` sur `ProviderCTA`

Pour les sections sans equivalent direct sur la page (Assistant IA, Recherche Medicale), l'ancre scrollera vers la section la plus proche ou redirigera vers la page dediee en fallback.

## Animations

- **Entree** : framer-motion `whileInView`, stagger de 100ms entre chaque carte
- **Hover** : CSS `transition-all duration-200`, `hover:-translate-y-1.5 hover:shadow-lg`
- **Click** : framer-motion `whileTap={{ scale: 0.97 }}` puis execution du scroll
- **Accessibilite** : `tabIndex={0}`, `onKeyDown` pour Enter/Space, style focus visible (`focus-visible:ring-2`)

## Responsive

- Desktop (>=1024px) : `grid-cols-4`
- Tablet (>=768px) : `grid-cols-2`
- Mobile (<768px) : `grid-cols-1`
- Hauteur de carte identique a tous les breakpoints

## Mockups stylises (4 nouveaux)

### AssistantAIMockup
- Deux bulles de chat (user + AI) avec icone Bot
- Indicateur de saisie anime

### ReviewsMockup
- 5 etoiles avec remplissage partiel
- Lignes de commentaires wireframe

### ResearchMockup
- Icone document/livre
- Lignes de texte academique stylisees
- Badge "DOI" miniature

### AdsMockup
- Carte d'annonce miniature avec image placeholder
- Badge "Nouveau" + lignes de texte

## Plan d'execution

1. Reecrire `ServicesGrid.tsx` avec les 8 cartes uniformes, mockups, animations, et navigation par ancres
2. Modifier `AntigravityIndex.tsx` pour ajouter les `id` d'ancrage aux sections existantes
3. Aucun autre fichier ne change (pas de modification de tailwind config, les animations existantes suffisent)

