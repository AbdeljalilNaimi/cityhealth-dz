

# Health Content Hub -- Research & Scientific Publications

## Overview

A new module enabling providers to publish medical research and articles, creating a professional medical publication platform within CityHealth. The implementation follows the existing Ads module pattern (database tables, service layer, UI components) but with an academic/editorial design direction.

## Database Schema (Lovable Cloud)

### New Tables

**1. `research_articles`** -- Main publications table
- `id` (uuid, PK)
- `provider_id` (text, NOT NULL) -- Firebase UID of the author
- `provider_name` (text, NOT NULL)
- `provider_avatar` (text)
- `provider_type` (text) -- specialty
- `provider_city` (text)
- `title` (text, NOT NULL)
- `abstract` (text, NOT NULL)
- `content` (text, NOT NULL) -- Rich text / HTML
- `category` (text, NOT NULL) -- e.g. cardiology, pediatrics, etc.
- `tags` (text[], default '{}')
- `doi` (text, nullable) -- Optional DOI reference
- `pdf_url` (text, nullable) -- Optional attached PDF
- `status` (text, default 'pending') -- pending | approved | rejected | suspended
- `is_featured` (boolean, default false)
- `is_verified_provider` (boolean, default false)
- `views_count` (integer, default 0)
- `reactions_count` (integer, default 0)
- `saves_count` (integer, default 0)
- `rejection_reason` (text, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**2. `article_reactions`** -- Provider-only reactions
- `id` (uuid, PK)
- `article_id` (uuid, FK to research_articles)
- `user_id` (text, NOT NULL) -- Only providers can react
- `reaction_type` (text, default 'like') -- For future expansion (insightful, important, etc.)
- `created_at` (timestamptz, default now())
- Unique constraint on (article_id, user_id)

**3. `article_saves`** -- Any authenticated user can save
- `id` (uuid, PK)
- `article_id` (uuid, FK to research_articles)
- `user_id` (text, NOT NULL)
- `created_at` (timestamptz, default now())
- Unique constraint on (article_id, user_id)

**4. `article_views`** -- Track views per article
- `id` (uuid, PK)
- `article_id` (uuid, FK to research_articles)
- `viewer_id` (text, nullable) -- nullable for anonymous views
- `created_at` (timestamptz, default now())

### RLS Policies
- All tables: public SELECT (read access for feed)
- INSERT/DELETE on reactions: open (provider-only check enforced at app level, consistent with existing ads pattern)
- INSERT/DELETE on saves: open
- INSERT on views: open
- INSERT/UPDATE/DELETE on articles: open (provider ownership enforced at app level, matching ads pattern)

### Database Functions & Triggers
- `update_article_reactions_count()` -- trigger on article_reactions INSERT/DELETE to update reactions_count
- `update_article_saves_count()` -- trigger on article_saves INSERT/DELETE to update saves_count

## File Structure

### Service Layer
- **`src/services/researchService.ts`** -- CRUD, queries, engagement (reactions, saves, views), admin moderation. Mirrors `adsService.ts` pattern.

### Pages
- **`src/pages/ResearchHubPage.tsx`** -- Main hub with search, filters, featured section, article feed
- **`src/pages/ArticleDetailPage.tsx`** -- Full article reading page with side panel (desktop), reading progress indicator

### Components
- **`src/components/research/ArticleCard.tsx`** -- Card for the feed (title, abstract preview, author block, date, reaction count, save, views)
- **`src/components/research/ArticleDetailView.tsx`** -- Full article body renderer with structured formatting
- **`src/components/research/ArticleEditor.tsx`** -- Rich text editor for creating/editing articles (uses existing TipTap dependency)
- **`src/components/research/FeaturedResearch.tsx`** -- Featured articles carousel/section at top of hub
- **`src/components/research/ArticleFilters.tsx`** -- Category filter, sort options, search bar
- **`src/components/research/ProviderArticlesManager.tsx`** -- Provider dashboard tab: list articles, create/edit/delete, view analytics
- **`src/components/research/ArticleSidePanel.tsx`** -- Desktop side panel with react/save/share actions + reading progress

### Integration Points

**Provider Dashboard** (`ProviderDashboard.tsx`):
- Add a new tab "Publications" with the `ProviderArticlesManager` component
- Add a `BookOpen` icon tab trigger alongside existing tabs (Ads, Giving, etc.)

**Citizen Dashboard** (`PatientDashboard.tsx`):
- Add a "Saved Articles" section linking to saved research articles

**Navigation** (`AntigravityHeader.tsx`):
- Add "Recherche Medicale" link to the main navigation

**Routing** (`App.tsx`):
- `/research` -- ResearchHubPage
- `/research/:articleId` -- ArticleDetailPage

## Key Implementation Details

### Rich Text Editor
The project already has `@tiptap/react` and `@tiptap/starter-kit` installed. The article editor will use TipTap with extensions for headings (H1-H3), lists, blockquotes (for citations), and basic formatting. This reuses the existing `RichTextEditor` component pattern from provider registration.

### Content Rendering
Article content stored as HTML from TipTap. Rendered using `dangerouslySetInnerHTML` with DOMPurify sanitization (already installed as a dependency). Prose-optimized CSS for academic reading width (~700px centered).

### PDF Attachment
Upload to the existing `pdfs` storage bucket. Display as a downloadable section at the bottom of the article.

### Access Control (App-Level)
- **Publish/Edit/Delete**: Check `profile.userType === 'provider'` before showing editor
- **React**: Check `profile.userType === 'provider'` before allowing reactions
- **Save**: Any authenticated user
- **Read**: Public (no auth required)
- **Admin moderation**: Check `profile.userType === 'admin'` for approve/reject/feature/remove

### Reading Progress Indicator
A thin progress bar at the top of the article detail page that fills as the user scrolls through the content. Implemented with a scroll event listener.

### Categories
Reuse existing provider specialty categories from `providerCategoryConfig.ts` plus general medical research categories (Public Health, Clinical Research, Pharmacology, etc.).

## Implementation Order

1. Create database tables, functions, and triggers via migration
2. Create `researchService.ts` (CRUD, queries, engagement, admin)
3. Create UI components (ArticleCard, ArticleEditor, ArticleFilters, FeaturedResearch, ArticleSidePanel, ArticleDetailView, ProviderArticlesManager)
4. Create ResearchHubPage and ArticleDetailPage
5. Add routes to App.tsx
6. Integrate into Provider Dashboard (new "Publications" tab)
7. Add navigation link in header
8. Add "Saved Articles" to Citizen Dashboard

