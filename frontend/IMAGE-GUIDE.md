# 🎮 Image Integration Guide

## 📁 Where to Place Your Images

Put your FreeFire and PUBG images in:
```
frontend/public/images/
```

## 🖼️ Supported Image Formats
- `.png` (recommended for logos with transparency)
- `.jpg` / `.jpeg` (for photos/banners)
- `.svg` (for vector graphics)
- `.webp` (modern format, smaller file size)

## 📋 Required Images

### Game Logos (Required)
- `freefire-logo.png` - FreeFire game logo
- `pubg-logo.png` - PUBG Mobile game logo

### Optional Images
- `freefire-banner.jpg` - Background image for FreeFire section
- `pubg-banner.jpg` - Background image for PUBG section
- `hero-bg.jpg` - Main hero section background
- `tournament-bg.jpg` - Tournament section background

## 🎯 Current Usage Locations

### 1. Hero Section Game Cards
**File:** `src/components/HeroSection.jsx`
**Lines:** ~45-50 and ~70-75
```jsx
<img 
  src="/images/freefire-logo.png" 
  alt="FreeFire" 
  className="w-16 h-16 object-contain"
/>
```

### 2. Navigation/Header
**File:** `src/components/Navbar.jsx` 
**Usage:** CrackZone logo (already implemented)

### 3. Footer
**File:** `src/components/Footer.jsx`
**Usage:** Brand logo and social icons

## 🔧 How to Update Image Paths

If your images have different names, update these files:

1. **HeroSection.jsx** - Change `/images/freefire-logo.png` to your filename
2. **Add more images** - Copy the img tag pattern and update src path

## 💡 Pro Tips

1. **Optimize images** before adding:
   - Logos: 64x64px to 128x128px
   - Banners: 1920x1080px or 1200x600px
   - Keep file sizes under 500KB

2. **Fallback system** - The code includes emoji fallbacks if images fail to load

3. **Responsive sizing** - Images automatically scale on mobile devices

## 🚀 Quick Start

1. Copy your images to `frontend/public/images/`
2. Rename them to match the expected names OR
3. Update the src paths in the components
4. Refresh your browser - images will appear automatically!

## 📱 Mobile Optimization

Images are automatically optimized for mobile with:
- `object-contain` - Maintains aspect ratio
- Responsive sizing classes
- Fallback emojis for failed loads