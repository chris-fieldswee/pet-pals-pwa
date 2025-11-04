# Vercel Deployment - MIME Type Error Fix

## The Problem
CSS and JS files are being served as HTML (MIME type `text/html` instead of `text/css`/`application/javascript`).

Error messages:
- `Refused to apply style from '.../assets/index-*.css' because its MIME type ('text/html') is not a supported stylesheet MIME type`
- `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

## Root Cause
The catch-all rewrite rule `/(.*) → /index.html` is intercepting ALL requests, including static asset requests. This causes Vercel to serve `index.html` for CSS/JS files instead of the actual files.

## Current Solution (Applied)

### vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/assets/(.*)",
      "destination": "/assets/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**
1. First rewrite: `/assets/(.*) → /assets/$1` - Explicitly routes asset requests to themselves (ensures they're served directly)
2. Second rewrite: `/(.*) → /index.html` - Catch-all for SPA routing

The order matters! Vercel processes rewrites top-to-bottom, so assets are handled first.

## Verification Steps

### 1. Check Build Output
After deployment, verify files exist:
```bash
# Check locally
ls -la dist/assets/
# Should show: index-*.css and index-*.js files
```

### 2. Test Direct URLs
After deployment, test these URLs directly:
```
https://livepet-app.vercel.app/assets/index-[HASH].css
https://livepet-app.vercel.app/assets/index-[HASH].js
```
Replace `[HASH]` with actual hash from your `dist/index.html`.

**Expected:**
- ✅ Returns CSS/JS content with correct `Content-Type` headers
- ✅ Status code 200

**If still broken:**
- ❌ Returns HTML content
- ❌ Status code 200 (but wrong content)

### 3. Check Vercel Project Settings

**In Vercel Dashboard → Project Settings → General:**

1. **Framework Preset:**
   - Should be: **Vite** (or auto-detected)
   - If "Other", change to "Vite"

2. **Build & Development Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: (leave empty)

3. **Environment Variables:**
   - Ensure all required env vars are set (Supabase keys, etc.)

### 4. Check Deployment Logs

**Vercel Dashboard → Deployments → Latest → Build Logs**

Look for:
- ✅ `Build completed successfully`
- ✅ Files listed in output: `dist/assets/index-*.css`, `dist/assets/index-*.js`
- ❌ Errors about missing files
- ❌ Build failures

### 5. Inspect Network Tab

In browser DevTools → Network tab:
1. Reload the page
2. Find the CSS/JS requests
3. Check:
   - **Status:** Should be `200`
   - **Type:** Should be `css` or `script`
   - **Response Headers:** Should include `Content-Type: text/css` or `Content-Type: application/javascript`
   - **Response Body:** Should be actual CSS/JS code, NOT HTML

## Alternative Solutions (If Above Doesn't Work)

### Option 1: Remove All Rewrites (Let Vercel Auto-Detect)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```
Vercel should auto-detect Vite and handle SPA routing automatically.

### Option 2: Use Negative Lookahead Pattern
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!assets|manifest\\.json|sw\\.js|favicon\\.ico|.*\\.[\\w]+$).*)",
      "destination": "/index.html"
    }
  ]
}
```
This pattern excludes:
- `/assets/*` paths
- Files with extensions (`.css`, `.js`, etc.)
- Specific files (`manifest.json`, `sw.js`, etc.)

### Option 3: Check Build Output Path

Verify `vite.config.ts` doesn't override output:
```ts
export default defineConfig({
  build: {
    outDir: 'dist', // Should match vercel.json outputDirectory
  },
});
```

## If Nothing Works

### Nuclear Option: Reconfigure Project

1. **Disconnect Repository:**
   - Vercel Dashboard → Settings → Git
   - Disconnect repository

2. **Reconnect with Fresh Settings:**
   - Connect repository again
   - Select framework: **Vite**
   - Let Vercel auto-detect settings
   - Deploy

3. **Verify Build Output:**
   - Check deployment → Files tab
   - Navigate to `dist/assets/`
   - Verify CSS/JS files exist

### Manual Deploy Test

```bash
npm install -g vercel
vercel --prod
```

This will:
- Create a fresh deployment
- Auto-detect Vite configuration
- Bypass any cached settings

## Expected Behavior

✅ **Correct:**
- `/assets/index-[hash].css` → Returns CSS with `Content-Type: text/css`
- `/assets/index-[hash].js` → Returns JS with `Content-Type: application/javascript`
- `/dashboard` → Returns `index.html` for client-side routing
- App loads and displays correctly

❌ **Wrong (Current Issue):**
- `/assets/index-[hash].css` → Returns HTML with `Content-Type: text/html`
- `/assets/index-[hash].js` → Returns HTML with `Content-Type: text/html`
- Browser errors about MIME types
- App doesn't load

## Testing Locally

Before deploying, test locally:
```bash
npm run build
npm run preview
# Open http://localhost:4173
# Check if assets load correctly in Network tab
```

If local preview works but Vercel doesn't, it's a Vercel configuration issue.

## Contact Points

If the issue persists after trying all solutions:
1. Check Vercel Status: https://www.vercel-status.com/
2. Vercel Community: https://github.com/vercel/vercel/discussions
3. Review deployment logs for specific error messages
4. Check if there are any Vercel project limits or restrictions

## Additional Notes

- **Vercel automatically serves static files** from the output directory before applying rewrites
- **If rewrites are catching assets**, it usually means:
  - The rewrite pattern is too broad
  - Files don't exist in the deployment
  - Build output path is incorrect
- **Order of rewrites matters** - more specific patterns should come first
