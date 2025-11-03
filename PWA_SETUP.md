# PWA Setup Guide

Your Livepet app is now configured as a Progressive Web App (PWA)! Here's what's been set up:

## ✅ What's Configured

1. **PWA Manifest** (`/public/manifest.json`)
   - App name, icons, theme colors
   - Standalone display mode
   - App shortcuts

2. **Service Worker** (`/public/sw.js`)
   - Offline caching
   - Resource caching for faster loads

3. **Mobile Frame Detection**
   - Automatically hides mobile frame on actual mobile devices
   - Shows full-screen on mobile
   - Shows framed view on desktop

4. **Apple iOS Meta Tags**
   - iOS web app capability
   - Status bar styling
   - App title

## 📱 Mobile Device Detection

The app now automatically detects if it's running on a mobile device and:
- **Mobile devices:** Full-screen layout (no frame)
- **Desktop:** Mobile device frame simulation

Detection is based on:
- User agent string
- Touch capability
- Screen size

## 🖼️ PWA Icons Required

You need to create and add these icon files to `/public`:

### Required Icons:
- `/public/icon-192.png` (192x192 pixels)
- `/public/icon-512.png` (512x512 pixels)

### How to Create Icons:

1. **Using Your Logo:**
   - Export your logo as PNG at 512x512
   - Resize to 192x192 for the smaller icon
   - Save as `icon-512.png` and `icon-192.png` in `/public`

2. **Online Tools:**
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

3. **From SVG:**
   ```bash
   # If you have ImageMagick installed
   convert logo.svg -resize 512x512 icon-512.png
   convert logo.svg -resize 192x192 icon-192.png
   ```

### Icon Requirements:
- PNG format
- Square (1:1 aspect ratio)
- 192x192 and 512x512 pixels
- Should work well as maskable icons

## 🧪 Testing PWA

### Desktop Browser:
1. Build the app: `npm run build`
2. Serve locally: `npm run preview`
3. Open DevTools → Application → Manifest
4. Check "Add to Home Screen" option

### Mobile Device:
1. Deploy to a server (or use ngrok for localhost)
2. Open on mobile device
3. Browser should show "Add to Home Screen" prompt
4. After installing, app opens standalone (no browser UI)

### Service Worker:
1. DevTools → Application → Service Workers
2. Should see "livepet-v1" registered
3. Check "Offline" mode to test caching

## 🚀 Installation

### Android:
1. Open app in Chrome
2. Tap menu (three dots)
3. Select "Add to Home screen" or "Install app"
4. Confirm installation

### iOS:
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Customize name and tap "Add"

## 📝 Manifest Customization

Edit `/public/manifest.json` to customize:
- App name and description
- Theme colors
- Start URL
- Icon paths
- Shortcuts

## ⚙️ Service Worker Updates

The service worker caches:
- Main routes (/, /dashboard, /splash, /welcome)
- Automatically caches other resources on first visit

To update cache version:
1. Change `CACHE_NAME` in `/public/sw.js`
2. Users will get new cache on next visit

## 🔧 Troubleshooting

### Icons Not Showing?
- Check files exist in `/public` folder
- Verify file names match manifest
- Clear browser cache

### Service Worker Not Registering?
- Must be served over HTTPS (or localhost)
- Check browser console for errors
- Verify `/public/sw.js` exists

### Mobile Frame Still Showing on Mobile?
- Check browser user agent
- Verify touch detection
- Try hard refresh (Ctrl/Cmd + Shift + R)

### PWA Not Installable?
- Must be served over HTTPS
- Manifest must be valid
- Service worker must register successfully
- Must have valid icons

## 🎯 Next Steps

1. **Create Icons** - Add `icon-192.png` and `icon-512.png` to `/public`
2. **Test on Device** - Deploy and test installation on real mobile device
3. **Customize** - Update manifest colors, name, description
4. **Offline Support** - Add more routes to service worker cache if needed

Your app is now PWA-ready! 🎉

