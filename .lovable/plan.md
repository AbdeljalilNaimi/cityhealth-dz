

## Map Filters Verification — Analysis

### Architecture Review

The filtering system uses a **URL search params pattern**:
1. **MapSidebar** writes filters to URL (`?types=doctor,clinic&q=search&open=1`)
2. **ProvidersMapChild** reads those params and filters providers accordingly
3. Filtered providers feed back to sidebar via `setSidebarProviders`

### Current Filter Capabilities

| Filter | Sidebar UI | ProvidersMapChild Logic | Status |
|--------|-----------|------------------------|--------|
| **Type pills** (doctor, clinic, etc.) | ✅ `toggleType` → `?types=` | ✅ `selectedTypes.has(p.type)` | Working |
| **Search text** | ✅ `?q=` via Input | ✅ name/specialty/address/type match | Working |
| **"All" reset** | ✅ clears `?types` | ✅ `selectedTypes.size === 0` → no filter | Working |
| **Open now** | ❌ No UI toggle in sidebar | ✅ Logic exists (`openOnly && !p.isOpen`) | **Missing UI** |

### Identified Issues

1. **No "Open Now" filter UI** — The `ProvidersMapChild` supports `?open=1` but the sidebar has no toggle button for it. Users can't activate this filter.

2. **Emergency/Blood map children don't support sidebar filters** — `EmergencyMapChild` and `BloodMapChild` don't read `?types` or `?q` from URL. The sidebar still shows search and type pills on those routes, but they have no effect because those children feed their own unfiltered lists to the sidebar.

3. **No filter state on Emergency/Blood** — The sidebar renders the same `TypeFilters` and search input on all map modes, creating a misleading UX where filters appear interactive but do nothing on `/map/emergency` and `/map/blood`.

### Plan

#### 1. Add "Open Now" toggle to MapSidebar
- Add a switch/button next to the type filters that sets `?open=1` in URL params
- Style consistently with existing filter pills

#### 2. Add search filtering to Emergency & Blood map children
- Read `?q` from search params in both `EmergencyMapChild` and `BloodMapChild`
- Apply the same debounced text search (name/specialty/address) before feeding providers to sidebar
- This makes the search input functional on all map modes

#### 3. Hide type filter pills on Emergency/Blood modes
- Pass the current `mode` to `MapSidebar` (derive from URL path)
- Only render `TypeFilters` on `providers` mode since emergency/blood already filter by type
- Keep search input visible on all modes (since we're adding search support)

### Files to Modify

- `src/components/map/MapSidebar.tsx` — Add "Open Now" toggle, conditionally hide type pills by mode
- `src/components/map/children/EmergencyMapChild.tsx` — Add search param filtering
- `src/components/map/children/BloodMapChild.tsx` — Add search param filtering
- `src/components/map/MapMother.tsx` — Pass mode info to sidebar (or sidebar derives from URL)

