# Design System Strategy: The Alpine Precisionist

This design system is engineered to transform a standard tracking utility into a high-end digital cockpit. The "Creative North Star" is **Alpine Precisionism**—a visual language that balances the aggressive, high-tech energy of professional skiing with the serene, crystalline atmosphere of a midnight descent. We avoid the "generic app" look by embracing asymmetric layouts, tonal depth, and a complete rejection of traditional structural lines.

## 1. Overview & Creative North Star
The goal is to move beyond a "grid of boxes." This system utilizes **Atmospheric Layering**—the idea that the interface isn't a flat screen, but a series of translucent, pressurized surfaces stacked like sheets of ice. By leveraging extreme typographic contrast and intentional white space, we create an editorial experience that feels as much like a premium fashion magazine as it does a performance tool.

## 2. Color Architecture & The "No-Line" Rule
The palette is rooted in the depth of the mountains at night. We use high-contrast cyan to simulate glowing instrumentation against a void.

*   **Primary (`#8aebff`) & Primary Container (`#22d3ee`):** These are your "active" signals. Use them sparingly for critical data points (Max Speed, Altitude) and primary calls to action.
*   **Surface Hierarchy:**
    *   **`surface` (#0b1326):** The base "Midnight" canvas.
    *   **`surface-container-low` (#131b2e):** For secondary sections.
    *   **`surface-container-high` (#222a3d):** For prominent interactive elements.
*   **The "No-Line" Rule:** Under no circumstances should 1px solid borders be used to define sections. Layout boundaries must be established via color shifts. For example, a card should be defined by placing a `surface-container-highest` element onto a `surface` background.
*   **Signature Textures:** For high-impact areas (like a "Start Run" button), use a subtle linear gradient from `primary` to `primary-container` at a 135-degree angle. This adds "soul" and depth that a flat hex code cannot achieve.

## 3. Typography: Editorial Authority
We use **Inter** as our sole typeface, relying on the scale to provide hierarchy.

*   **Display & Headlines:** Use `display-lg` (3.5rem) for hero metrics. Tighten the letter-spacing (-0.02em) to give it a "technical" feel.
*   **Body:** Use `body-md` (0.875rem) with generous line-height for readability.
*   **Labels:** `label-sm` (0.6875rem) should always be in All-Caps with increased tracking (+0.05em) to mimic the labels on high-end hardware.
*   **Visual Tension:** Pair a `display-lg` metric with a `label-sm` descriptor immediately adjacent. The extreme jump in scale creates a sophisticated, bespoke look.

## 4. Elevation & Tonal Depth
In this system, "Elevation" is a measure of light, not physical height.

*   **The Layering Principle:** Stacking is our primary tool. Place a `surface-container-lowest` card inside a `surface-container-low` section to create a "recessed" look. Use `surface-bright` for elements that need to "pop" toward the user.
*   **Ambient Shadows:** Traditional drop shadows are forbidden. When an element must float, use a diffused glow: a shadow with a 40px blur, 0% offset, and 6% opacity, using the `primary` color as the shadow tint. This simulates a light-emitting HUD.
*   **Glassmorphism:** For floating navigation bars or overlays, use `surface` at 70% opacity with a `backdrop-blur` of 24px. This ensures the vibrant colors of a trail map bleed through the UI, creating an integrated, high-tech feel.
*   **Ghost Borders:** If a boundary is strictly required for accessibility, use the `outline-variant` token at 15% opacity. It should be felt, not seen.

## 5. Component Logic

### Buttons & Interaction
*   **Primary:** A solid `primary-container` fill. Corners are strictly `1rem` (16px).
*   **Secondary:** A "Glass" button using `surface-variant` at 40% opacity with a `backdrop-blur`. No border.
*   **Tertiary:** Pure text using `primary` color, `label-md` styling, All-Caps.

### Performance Cards
*   **Rule:** Forbid the use of divider lines. 
*   **Execution:** Use vertical white space (`16` on the scale / 4rem) to separate content blocks. 
*   **Layout:** Use asymmetrical padding—e.g., more padding on the left than the right—to create a sense of forward motion.

### Data Chips
*   Used for trail status (Green, Blue, Black). 
*   **Styling:** Semi-transparent backgrounds with a `primary` text color. Use the `full` (9999px) roundedness scale for chips to contrast against the `lg` (16px) card corners.

### Specialized Components: The "Live Tracker"
*   **The Pulse:** For active GPS tracking, use a `primary` dot with a repeating, expanding ring animation. The ring should use a gradient from `primary` to transparent to mimic radar.

## 6. Do’s and Don’ts

### Do:
*   **Do** use `surface-container-highest` to draw attention to the most important data on a dashboard.
*   **Do** utilize the `12` (3rem) and `16` (4rem) spacing tokens to let the design breathe. High-end design is defined by what you leave out.
*   **Do** use thin-lined icons (1px or 1.5px stroke) to match the technical precision of the typography.

### Don’t:
*   **Don’t** use pure black (#000000). Always use `surface` (#0b1326) to maintain the "Midnight" depth.
*   **Don’t** use standard 1px dividers or "borders" to separate list items. Use a background shift to `surface-container-low` on hover instead.
*   **Don’t** use heavy, multi-stop gradients. Stick to tonal shifts between two adjacent tokens for a refined finish.