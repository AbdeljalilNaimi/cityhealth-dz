

## Plan: Add Pricing Section to Homepage

### New file: `src/components/homepage/PricingSection.tsx`

Create a pricing section component with 3 plan cards (Basic, Standard, Premium):
- Clean white background, light borders, subtle shadows
- Each card: plan name, price ("0 DA"), feature list, green "Free for 1 Year" badge, "Get Started Free" button
- Standard card highlighted as "Most Popular" with blue border accent and slightly elevated shadow
- Use existing UI primitives (Card, Badge, Button) and cn utility
- Responsive grid: 1 column on mobile, 3 on desktop

**Feature lists:**
- **Basic**: Provider search, Interactive map, Emergency info, Community access
- **Standard** (Most Popular): All Basic + AI Health Assistant, Appointment booking, Blood donation alerts, Medical document storage
- **Premium**: All Standard + Priority support, Advanced analytics, Research hub access, Custom emergency card

### Edit: `src/pages/AntigravityIndex.tsx`

Insert the PricingSection between TestimonialsSlider and ProviderCTA sections, wrapped in a `<div id="pricing">`.

