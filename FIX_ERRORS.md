# Fix Errors and Warnings

## Critical Error: health_profile_shares Table Not Found (404)

**Error:** `Failed to load resource: the server responded with a status of 404`

**Cause:** The `health_profile_shares` table hasn't been created yet. You need to run the database migration.

### Solution: Run the Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor**

2. **Run the Migration**
   - Open the file: `supabase/migrations/create_health_sharing_feature.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click **Run**

3. **Verify It Worked**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name = 'health_profile_shares';
   ```
   Should return 1 row.

4. **Refresh Your App**
   - The share feature should now work!

---

## Fixed Issues

### ✅ React Router Future Flags
**Status:** Fixed in `App.tsx`

Added future flags to opt-in to React Router v7 behavior:
```tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

---

## Remaining Warnings (Non-Critical)

### Duplicate ID Warnings
**Warning:** `Found 2 elements with non-unique id #email` and `#password`

**Cause:** Likely due to React StrictMode rendering components twice in development.

**Impact:** Low - only affects development, not production.

**Note:** If this persists, check if:
- React.StrictMode is enabled (common in development)
- Multiple instances of the component are being rendered
- Component is mounting/unmounting rapidly

### Dialog Accessibility Warnings
**Warning:** `DialogContent requires a DialogTitle`

**Impact:** Accessibility - screen readers may have issues.

**Note:** Your dialogs (`ShareHealthProfileModal`, `AddHealthRecordModal`) already have `DialogTitle` and `DialogDescription`, so these warnings might be from other dialogs or false positives.

To fix for any dialogs missing titles:
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Title Here</DialogTitle>
    <DialogDescription>Description here</DialogDescription>
  </DialogHeader>
  {/* rest of content */}
</DialogContent>
```

### Extension Errors
**Error:** `A listener indicated an asynchronous response by returning true`

**Impact:** None - these are browser extension errors, not your app.

**Solution:** Ignore - these come from browser extensions (like React DevTools, etc.)

---

## Quick Fix Checklist

1. ✅ **Run migration** - `create_health_sharing_feature.sql`
2. ✅ **React Router flags** - Already fixed
3. ⚠️ **Duplicate IDs** - Non-critical, development-only
4. ⚠️ **Dialog warnings** - Check individual dialogs if needed
5. ❌ **Extension errors** - Ignore (not your code)

## Priority

**HIGH:** Run the database migration (fixes 404 error)
**LOW:** Other warnings are non-blocking

