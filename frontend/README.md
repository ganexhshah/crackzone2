# CrackZone - Gaming Tournament Platform

A modern esports tournament web application built with React, Vite, and Tailwind CSS.

## Logo Design

The CrackZone logo features:
- **Bold, competitive typography** using the Orbitron font family
- **Yellow and black color scheme** (#FFD700 gold on #0A0A0A black)
- **Lightning bolt integrated into the Z** representing speed, power, and competition
- **Optimized 128×48px horizontal format** perfect for headers and navigation
- **Scalable SVG format** with transparent background
- **High contrast design** readable at small sizes

## Logo Files

- `public/crackzone-logo.svg` - Main horizontal logo (128×48px)
- `public/crackzone-icon.svg` - Square icon version (48×48px)
- `src/components/CrackZoneLogo.jsx` - React component with customizable sizing

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. View logo showcase:
   - Edit `src/main.jsx` and change `App` to `AppShowcase` to see all logo variations

## Logo Usage

### React Component
```jsx
import CrackZoneLogo from './components/CrackZoneLogo'

// Different sizes
<CrackZoneLogo className="w-32 h-12" />  // Standard
<CrackZoneLogo className="w-64 h-24" />  // Large
<CrackZoneLogo className="w-24 h-9" />   // Small
```

### Direct SVG
```html
<img src="/crackzone-logo.svg" alt="CrackZone" class="w-32 h-12" />
<img src="/crackzone-icon.svg" alt="CrackZone" class="w-8 h-8" />
```

## Color Palette

- **Primary Gold**: `#FFD700` (crackzone-yellow)
- **Secondary Orange**: `#FFA500` 
- **Background Black**: `#0A0A0A` (crackzone-black)
- **Surface Gray**: `#1A1A1A` (crackzone-gray)

## Typography

- **Primary Font**: Orbitron (Google Fonts)
- **Fallback**: monospace
- **Weights**: 400 (regular), 700 (bold), 900 (black)

## Build

```bash
npm run build
```

The logo assets will be included in the build output for production use.