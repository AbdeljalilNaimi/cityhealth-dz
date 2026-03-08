

# Amélioration du Design de /blood-donation

## Problèmes actuels
- Hero section basique (juste titre + sous-titre, pas d'impact visuel)
- Pas d'illustration ou d'élément graphique engageant
- La disclaimer d'urgence est trop proéminente et casse le flow visuel
- Les CTA buttons sont génériques, pas assez impactants pour une page de don de sang
- Les emergency cards manquent d'animation et de polish
- La section "No emergencies" est fade
- Les tabs sont fonctionnels mais visuellement plats
- Les facts cards sont monotones (même style pour les 4)
- Pas de séparation visuelle entre les sections
- Le footer de la page est abrupt (pas de CTA final)

## Plan d'implémentation

### 1. Hero Section Premium
- Ajouter un gradient background rouge/rose avec des formes organiques (blob SVG ou pseudo-elements)
- Icône Droplet animée (pulse) au-dessus du titre
- Compteur animé "vies sauvées" ou statistique impactante
- Déplacer les 2 CTA buttons dans le hero avec un style plus premium (rounded-full, shadow, hover scale)

### 2. Emergency Disclaimer Redesign
- Transformer en bandeau compact en haut (sticky ou inline subtil) au lieu d'un Alert plein
- Style plus discret : texte petit + lien "Appeler le 15" en badge cliquable

### 3. Urgences Feed Redesign
- Cards avec animation d'entrée (fade-in stagger)
- Pulse animation sur le badge "Critique"
- Meilleure typographie et spacing
- "No emergencies" : illustration minimaliste + texte plus engageant

### 4. Tabs Section Polish
- TabsList avec style pill/segment control plus moderne
- Cards avec hover effects subtils et border-gradient
- Facts cards : chaque fact avec une couleur d'accent différente et icône plus grande
- Eligibility checker : progress-style layout au lieu de formulaire plat

### 5. CTA Final
- Ajouter une section de fermeture motivante avant le footer ("Chaque goutte compte")

### Fichier modifié
- `src/pages/BloodDonationPage.tsx` — refonte complète du JSX/styling (la logique reste inchangée)

