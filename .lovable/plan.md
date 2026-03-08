

## Fix: Header & Search Filter Bar z-index Conflict on /search

### Problem
The header (`sticky top-0 z-50`) and the SearchInterface filter bar (`sticky top-0 z-50`) both compete for the same stacking level. When header dropdowns (Services, Professionals, language, user menu) open, their content renders **behind** the search bar because:
1. Both are `sticky top-0 z-50` — same z-level
2. The search bar appears later in the DOM, so it paints on top
3. Header dropdown menus (DropdownMenuContent) also use `z-50`, which isn't enough to escape the search bar's stacking context

### Solution

**1. Raise header z-index** — Change header from `z-50` to `z-[60]` in `Header.tsx` so it always sits above the search bar.

**2. Lower search bar z-index** — Change SearchInterface from `z-50` to `z-40` so it never overlaps header dropdowns.

**3. Offset search bar top position** — The search bar should stick below the header, not at `top-0`. Add `top-[65px]` (approximate header height) so they don't overlap visually.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/layout/Header.tsx` (line 273) | `z-50` → `z-[60]` |
| `src/components/search/SearchInterface.tsx` (line 139) | `z-50` → `z-40`, `top-0` → `top-0` (keep, but lower z) |
| `src/components/search/SearchInterface.tsx` (line 171) | Suggestions card `z-50` → `z-[45]` to stay above results but below header |

Three small class changes, no logic changes needed.

