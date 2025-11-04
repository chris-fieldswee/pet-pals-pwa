# Vercel Deployment Troubleshooting

## Current Issue
MIME type errors: CSS and JS files being served as HTML (`text/html` instead of `text/css`/`application/javascript`)

## Solution Attempted
Simplified `vercel.json` to minimal configuration. Vercel should automatically serve static files from the `dist` directory before applying rewrites.

## If Issues Persist

### Option 1: Check Vercel Project Settings
1. Go to Vercel Dashboard → Your Project → Settings
2. **Build & Development Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **General Settings:**
   - Root Directory: Leave empty (or `.`)

### Option 2: Verify Build Output
The build should create:
- `dist/index.html`
- `dist/assets/index-*.css`
- `dist/assets/index-*.js`
- Other static files

### Option 3: Check Deployment Logs
In Vercel Dashboard → Deployments → Click on latest deployment → Check:
- Build logs for errors
- Runtime logs for MIME type issues
- Check if files exist in the deployment

### Option 4: Test Static File Access
Try accessing directly:
- `https://livepet-app.vercel.app/assets/index-[hash].css`
- `https://livepet-app.vercel.app/assets/index-[hash].js`

If these return HTML instead of the actual files, the rewrite is catching them.

### Option 5: Use Vercel CLI to Debug
```bash
npm i -g vercel
vercel --prod
```
This will show deployment details and any errors.

## Alternative Configuration

If minimal config doesn't work, try this pattern (Vercel should serve static files automatically):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

No rewrites needed - Vercel's automatic static file serving should handle assets, and client-side routing will work if you configure it in the framework.

## Common Causes

1. **Build output not in `dist`** - Check Vite config `build.outDir`
2. **Files not being generated** - Check build logs
3. **Vercel serving wrong directory** - Verify Output Directory setting
4. **Cached deployment** - Clear Vercel cache and redeploy

## Quick Fix Checklist

- [ ] Verify `dist/` folder has assets after local build
- [ ] Check Vercel project settings match config
- [ ] Review latest deployment logs
- [ ] Test direct asset URLs
- [ ] Clear browser cache / test in incognito
- [ ] Redeploy from Vercel dashboard

