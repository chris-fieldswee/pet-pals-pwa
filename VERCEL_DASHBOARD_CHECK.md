# Vercel Dashboard Settings - Critical Checks

## ⚠️ The Issue Persists
All rewrite patterns have been tried, but CSS/JS files are still being served as HTML. This suggests the problem is in **Vercel Dashboard Settings**, not the `vercel.json` file.

## 🔍 Step-by-Step Dashboard Check

### 1. Navigate to Project Settings
1. Go to https://vercel.com/dashboard
2. Select your project: **livepet-app** (or whatever it's named)
3. Click **Settings** tab

### 2. Check Build & Development Settings

**Path:** Settings → General → Build & Development Settings

**Critical Settings to Verify:**

✅ **Framework Preset:**
- Should be: **Vite** (NOT "Other", NOT "React")
- If it's "Other", change it to **Vite**
- This ensures Vercel uses the correct build pipeline

✅ **Build Command:**
- Should be: `npm run build`
- Should NOT be empty or different

✅ **Output Directory:**
- Should be: `dist`
- Should NOT be empty or `build` or `out`

✅ **Install Command:**
- Should be: `npm install` (or can be empty, Vercel auto-detects)

✅ **Root Directory:**
- Should be: **(empty)** or `./`
- Should NOT be set to a subdirectory

✅ **Node.js Version:**
- Should be: Latest LTS (18.x or 20.x)
- Check what version you're using locally: `node --version`

### 3. Check Deployments

**Path:** Deployments tab → Latest deployment

**Check These:**

1. **Build Logs:**
   - Click on the latest deployment
   - Click "Build Logs"
   - Look for:
     - ✅ `Build completed successfully`
     - ✅ Files listed: `dist/assets/index-*.css`, `dist/assets/index-*.js`
     - ❌ Any errors about missing files
     - ❌ Build failures

2. **Files Tab:**
   - Click "Files" in the deployment
   - Navigate to: `dist/assets/`
   - **VERIFY:** Do you see `index-*.css` and `index-*.js` files?
   - If files are missing → Build issue
   - If files exist → Routing issue

3. **Direct URL Test:**
   - Copy the exact file path from `dist/index.html`
   - Example: `/assets/index-BUP6usLD.js`
   - Test: `https://livepet-app.vercel.app/assets/index-BUP6usLD.js`
   - **What happens?**
     - ✅ Returns JS code → Files exist, routing works
     - ❌ Returns HTML → Routing is broken

### 4. Check Environment Variables

**Path:** Settings → Environment Variables

**Verify:**
- All required Supabase keys are set
- No build-breaking environment variables missing

### 5. Check Functions Settings (if applicable)

**Path:** Settings → Functions

**Verify:**
- No conflicting function configurations
- Edge Functions are properly configured

## 🔧 Action Plan

### If Files Are Missing in Deployment:

1. **Trigger a Fresh Build:**
   - Deployments → ... → Redeploy
   - Or push a new commit

2. **Check Build Output Locally:**
   ```bash
   npm run build
   ls -la dist/assets/
   # Verify files exist
   ```

3. **Compare File Names:**
   - Check `dist/index.html` locally
   - Compare with what's in Vercel deployment
   - File hashes should match

### If Files Exist But Still Getting HTML:

1. **Remove vercel.json Temporarily:**
   - Delete `vercel.json` from repo
   - Push to trigger rebuild
   - Let Vercel auto-detect everything

2. **Reconfigure Framework:**
   - Settings → General → Framework Preset
   - Change to **Vite** (if not already)
   - Save and redeploy

3. **Check for Conflicting Configs:**
   - Look for `.vercelignore` files
   - Check for `netlify.toml` or other deploy configs
   - Remove if present

## 🚨 Nuclear Option: Recreate Project

If nothing works:

1. **Export Environment Variables:**
   - Settings → Environment Variables
   - Copy all values

2. **Delete Project:**
   - Settings → General → Delete Project

3. **Create New Project:**
   - Import same repository
   - Select **Vite** as framework
   - Let Vercel auto-detect settings
   - Add environment variables back
   - Deploy

## 📝 Current vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!assets|manifest|sw\\.js|favicon|icon|robots|.*\\.[a-z0-9]+).*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🎯 Next Steps

1. **Check Vercel Dashboard** using the steps above
2. **Take screenshots** of:
   - Build & Development Settings
   - Latest deployment build logs
   - Files tab showing `dist/assets/`
3. **Test direct asset URLs** in browser
4. **Report findings** so we can adjust the fix

The issue is likely in the dashboard settings, not the code. Framework preset and output directory are the most common culprits.

