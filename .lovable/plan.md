

## Plan: Security, Quick Triage Widget, Privacy & README Updates

### 1. Create `.env.example`
New file `cityhealth-extension/.env.example` with three placeholders:
```
VITE_APP_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. Refactor `src/supabaseClient.ts`
- Replace hardcoded URL/key/APP_URL with `import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`
- Export `APP_URL` from env: `import.meta.env.VITE_APP_URL`

### 3. Refactor `src/background.ts`
- Remove hardcoded `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL`
- Import `supabase` and `APP_URL` from `./supabaseClient` (single source of truth)

### 4. Refactor `src/Popup.tsx`
- Remove hardcoded `APP_URL`, import it from `./supabaseClient`
- Redesign main view layout order:
  1. **Prominent search bar** -- larger input with placeholder "Trouver un medecin, pharmacie..." and a styled search button with icon
  2. **Massive Triage CTA** -- full-width gradient button "Lancer l'Assistant Triage IA" with larger padding and bold text
  3. **Blood group badge + emergency card** (existing, kept below)
  4. **Quick links** (Don de sang, Urgences) at bottom
- Add a small privacy footer tooltip/section at the very bottom of the popup

### 5. Add privacy section to `src/OptionsPage.tsx`
- New "Confidentialite & Permissions" card at the bottom of the options page with two bullet points:
  - Notifications: "Uniquement pour les alertes vitales de don de sang."
  - Stockage: "Pour sauvegarder vos preferences en toute securite sur cet appareil."

### 6. Update `README.md`
- Add env setup step in Installation section: "Creez un fichier `.env` base sur `.env.example`..."
- Add image placeholders under Fonctionnalites section
- Update Configuration section to reflect env-based approach instead of editing constants

### Files changed
| File | Action |
|------|--------|
| `cityhealth-extension/.env.example` | Create |
| `cityhealth-extension/src/supabaseClient.ts` | Edit (env vars) |
| `cityhealth-extension/src/background.ts` | Edit (import from supabaseClient) |
| `cityhealth-extension/src/Popup.tsx` | Edit (import APP_URL, redesign layout, add privacy footer) |
| `cityhealth-extension/src/OptionsPage.tsx` | Edit (add privacy section) |
| `cityhealth-extension/README.md` | Edit (env step, image placeholders, config update) |

