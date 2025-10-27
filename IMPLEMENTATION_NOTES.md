# Implementation Notes

## Completed Features

✅ User Settings page with integration management
✅ OAuth callback handlers for Strava and Spotify
✅ Database schema for storing OAuth tokens
✅ UI for connecting/disconnecting services
✅ Navigation links from sidebar to settings

## Next Steps for Production

### 1. Backend API (Required for Security)

Create a backend API endpoint to securely handle OAuth token exchange:

**File**: Create a new backend service (Node.js/Express recommended)

**Environment Variables** (Backend):
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Update Frontend**: Modify `StravaCallback.tsx` and `SpotifyCallback.tsx` to call your backend API instead of directly calling OAuth endpoints.

### 2. Apply Database Migration

Run the migration to create the `user_integrations` table:

```bash
npx supabase migration up
```

Or apply it through Supabase Dashboard:
1. Go to Database → Migrations
2. Upload `supabase/migrations/20251027224401_create_user_integrations_table.sql`
3. Click "Run migration"

### 3. Add Environment Variables

Create a `.env` file in the project root:

```env
# Strava OAuth
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret

# Spotify OAuth
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

For Vercel, add these in the Vercel dashboard under Settings → Environment Variables.

### 4. Configure Strava App

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set the authorization callback domain to:
   - `http://localhost:8081` for local development
   - `https://your-domain.vercel.app` for production
4. Note your Client ID and Client Secret

### 5. Configure Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Create a new application
3. Set the redirect URI to:
   - `http://localhost:8081/auth/spotify/callback` for local development
   - `https://your-domain.vercel.app/auth/spotify/callback` for production
4. Note your Client ID and Client Secret

### 6. Test Locally

1. Start the development server: `npm run dev`
2. Sign in to the application
3. Go to Settings (via pet sidebar)
4. Click "Connect" on Strava
5. Authorize the application
6. Verify the connection is stored in the database

### 7. Implement Activity Publishing

When implementing activity publishing to Strava:

1. Add a helper function to check if user has Strava connected
2. After saving activity to database, check for Strava integration
3. If connected, publish to Strava using the API (see STRAVA_INTEGRATION.md)
4. Handle errors gracefully (silent fail)

Example locations to add Strava publishing:
- After walk completion in `WalkPage.tsx`
- After guided walk completion in `GuidedWalkDetails.tsx`
- In the activity feed after posting an activity

## Security Considerations

### Current Implementation (Development Only)

The current OAuth implementation exchanges tokens in the frontend, which exposes client secrets. This is **NOT secure for production**.

### Production Implementation Required

For production, you MUST:

1. Create a backend API endpoint for token exchange
2. Keep client secrets on the server
3. Implement token refresh mechanism
4. Add rate limiting to prevent abuse
5. Validate user authentication on all endpoints

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Environment variables configured
- [ ] Strava app created and configured
- [ ] Spotify app created and configured
- [ ] Can connect to Strava
- [ ] Can disconnect from Strava
- [ ] Tokens stored in database
- [ ] Can connect to Spotify
- [ ] Can disconnect from Spotify
- [ ] Activities can be published to Strava (once implemented)

## Troubleshooting

### "Client ID not configured" error
- Check that environment variables are set
- Restart development server after adding `.env` file
- In Vercel, ensure variables are added to all environments

### "Failed to exchange token" error
- Verify redirect URI matches exactly in Strava/Spotify app settings
- Check that client secret is correct
- Ensure the authorization code hasn't expired (they expire quickly)

### Database errors
- Run `npx supabase migration up` to apply migrations
- Check RLS policies are properly configured
- Verify user is authenticated before accessing integrations

## Resources

- Strava API Docs: https://developers.strava.com/docs/reference/
- Spotify API Docs: https://developer.spotify.com/documentation/web-api/
- Supabase Auth: https://supabase.com/docs/guides/auth

