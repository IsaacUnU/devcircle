---
description: Responsive Design Standards for DevCircle
---

# Responsive Design Workflow

Follow these rules to ensure the DevCircle UI looks great on any device (mobile, tablet, desktop).

## 1. Modals (Bottom Sheet on Mobile, Centered on Desktop)
A standard modal should slide up from the bottom and span the full width on mobile devices, with rounded top corners. On desktop, it should be a centered floating card.

**Standardized Modal Structure:**
```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={onClose} />

    {/* Modal Container */}
    <div className="relative w-full sm:max-w-xl bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
        
        {/* Modal Card (Scrollable) */}
        <div className="card p-5 sm:p-6 shadow-2xl glass border-t sm:border border-brand-500/20 overflow-y-auto custom-scrollbar rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80">
            
            {/* Optional Handle bar for mobile (visual cue) */}
            <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mb-6 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                {/* ... title ... */}
            </div>

            {/* Body */}
            {/* ... form ... */}
        </div>
    </div>
</div>
```

## 2. Forms and Grids
- **Inputs**: Ensure text inputs and buttons have enough height for Touch Targets (`py-2` or `min-h-[44px]` on mobile).
- **Grids**: Use `grid-cols-1 sm:grid-cols-2` to stack form fields on mobile and align them horizontally on larger screens.

## 3. General Layout Constraints
- Base containers should have `px-4 sm:px-6 lg:px-8`.
- If a sidebar is present, use `hidden lg:flex` or `hidden md:flex` to hide it on mobile, opting for a bottom nav or hamburger menu instead.
- Prevent horizontal scroll in pages by ensuring all content wrappers use `overflow-x-hidden` or `break-words`.
