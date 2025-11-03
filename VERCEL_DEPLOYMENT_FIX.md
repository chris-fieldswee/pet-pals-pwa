# Fix Vercel Deployment MIME Type Errors

## The Problem
CSS and JS files are being served as HTML (`text/html` MIME type) instead of their proper types, causing:
- `Refused to apply style from '...css' because its MIME type ('text/html') is not a supported stylesheet MIME type`
- `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

## Root Cause
The rewrite rule in `vercel.json` was catching ALL requests (including asset files) and serving `index.html` for everything.

## The Fix

Updated `vercel.json` to:
1. **Exclude files with extensions** from the rewrite rule
2. **Add proper Content-Type headers** for assets
3. **Set correct output directory** for Vercel

## Updated Configuration

The rewrite rule now only matches:
- Routes without file extensions (e.g., `/dashboard`, `/pet/123`)
- Special PWA files (`manifest.json`, `sw.js`)

Static files (`.css`, `.js`, `.png`, etc.) are automatically served by Vercel without rewriting.

## Verification

After deploying:

1. **Check asset URLs directly:**
   - `https://livepet-app.vercel.app/assets/index-[hash].css` should return CSS
   - `https://livepet-app.vercel.app/assets/index-[hash].js` should return JavaScript

2. **Check browser console:**
   - Should see no MIME type errors
   - Assets should load correctly

3. **Test navigation:**
   - Client-side routing should still work
   - Direct URL access should work (e.g., `/pet/123`)

## Alternative: Manual Vercel Settings

If the issue persists, configure in Vercel Dashboard:

1. Go to your project → Settings → Build & Development Settings
2. **Output Directory:** `dist`
3. **Build Command:** `npm run build`
4. **Install Command:** `npm install`

## Notes

- Vercel automatically serves static files from the output directory
- The rewrite rule should only catch non-file routes
- Content-Type headers ensure proper MIME types even if something goes wrong

