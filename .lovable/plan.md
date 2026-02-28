

# Fix Featured Providers Cards, Map Sidebar Scroll, and Restore Bottom Section

## Summary
Three UI fixes on the homepage and interactive map:

1. **Remove the "Disponible/Bientot" availability badge** from the Featured Providers cards -- the badge in the top-right corner of each card is cluttering the design and breaking the layout
2. **Improve the Map Sidebar scrollbar** so users can smoothly scroll through all providers (remove the artificial height cap)
3. **Confirm ProviderCTA section is visible** at the bottom of the homepage (it's already in the code -- if user is referring to it being hidden or cut off, ensure it renders correctly)

---

## Changes

### 1. FeaturedProviders -- Remove availability badge (src/components/homepage/FeaturedProviders.tsx)

**Remove the entire availability indicator block** (lines 175-188) that renders "Disponible" or "Bientot" in the top-right corner of each card. This frees up space and keeps the card design clean.

Also remove the unused `isAvailable`, `nextAvailable`, and `Clock` import since they are no longer needed.

### 2. Map Sidebar -- Fix scroll height (src/components/map/MapSidebar.tsx)

The `ScrollArea` on line 152 has `style={{ maxHeight: 'calc(4 * 160px)' }}` which caps visibility to ~4 cards. Change this to `flex-1 overflow-hidden` so the sidebar uses all available vertical space and the scroll area fills the remaining height naturally. The parent already has `h-full` and `flex flex-col`, so using `flex-1` on the ScrollArea will let it fill the space correctly.

### 3. ProviderCTA -- Verify it renders at the bottom

The ProviderCTA is already rendered in `AntigravityIndex.tsx` at line 50 (between TestimonialsSlider and Footer). No code change needed -- it should be visible when scrolling to the bottom. If the user was referring to the section being visually broken or cut off, the existing code looks correct.

## Files Modified
- `src/components/homepage/FeaturedProviders.tsx` -- remove availability badge from cards
- `src/components/map/MapSidebar.tsx` -- fix scroll area to use full available height

