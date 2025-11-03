# Creating a Favicon for Livepet

## Current Setup
The app now uses the Logo component and has a basic favicon setup in `index.html`.

## To Create Proper Favicon Files

### Option 1: Use an Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload your logo (you can export from Figma/design tool)
3. Configure options:
   - Apple touch icon (180x180)
   - Android Chrome (512x512)
   - Windows tiles
4. Download the generated files
5. Place them in the `public/` directory
6. Replace the favicon link in `index.html`

### Option 2: Manual Creation
Create these sizes and place in `public/`:
- `favicon.ico` (16x16, 32x32, 48x48)
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### Recommended Steps
1. Design your logo in a design tool (Figma, Sketch, etc.)
2. Export as PNG in multiple sizes
3. Generate favicon files
4. Update `index.html` with proper paths:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
```

### Current Logo Component
The Logo component is now available throughout the app:
```tsx
import { Logo } from "@/components/Logo";

// Usage
<Logo size="sm" /> // 48px
<Logo size="md" /> // 80px
<Logo size="lg" /> // 128px

// Variants
<Logo variant="light" />  // Primary color background
<Logo variant="dark" />    // Dark background
<Logo variant="white" />   // White background
```



