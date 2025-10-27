# Strava Integration Guide

This document explains how to set up and use the Strava integration to automatically publish activities from Livepet to a user's Strava account.

## Prerequisites

1. Create a Strava account at https://www.strava.com
2. Create a Strava application at https://www.strava.com/settings/api
3. Get your Client ID and Client Secret

## Setup

### 1. Environment Variables

Add these to your `.env` file and Vercel environment:

```env
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
```

### 2. Configure Redirect URI

In your Strava application settings, set the redirect URI to:
```
http://localhost:8081/auth/strava/callback  (for local development)
https://your-domain.vercel.app/auth/strava/callback  (for production)
```

### 3. Database Migration

Run the migration to create the `user_integrations` table:

```bash
npx supabase migration up
```

## How It Works

### User Authorization Flow

1. User clicks "Connect" on Strava in User Settings
2. User is redirected to Strava for authorization
3. User authorizes Livepet to access their Strava account
4. Strava redirects back to `/auth/strava/callback` with authorization code
5. Code is exchanged for access token
6. Access token is stored in `user_integrations` table

### Publishing Activities to Strava

When a user completes an activity (walk, run, etc.), you can publish it to Strava using the following function:

```typescript
import { supabase } from "@/integrations/supabase/client";

/**
 * Publish activity to Strava
 */
export const publishToStrava = async (
  userId: string, 
  activityData: {
    name: string;
    type: string; // 'walk', 'run', 'ride', etc.
    startDate: Date;
    elapsedTime: number; // in seconds
    distance: number; // in meters
    description?: string;
  }
) => {
  try {
    // Get user's Strava integration
    const { data: integration, error: fetchError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("service", "strava")
      .single();

    if (fetchError || !integration) {
      throw new Error("Strava not connected");
    }

    // Check if token is expired and refresh if needed
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      // Token expired, refresh it
      await refreshStravaToken(userId, integration.refresh_token);
      // Refetch integration with new token
      const { data: updatedIntegration } = await supabase
        .from("user_integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("service", "strava")
        .single();
      
      integration.access_token = updatedIntegration.access_token;
    }

    // Publish to Strava
    const response = await fetch("https://www.strava.com/api/v3/activities", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: activityData.name,
        type: mapActivityType(activityData.type),
        start_date_local: activityData.startDate.toISOString(),
        elapsed_time: activityData.elapsedTime,
        distance: activityData.distance,
        description: activityData.description || "",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to publish to Strava");
    }

    const result = await response.json();
    console.log("Activity published to Strava:", result);

    return result;
  } catch (error: any) {
    console.error("Error publishing to Strava:", error);
    throw error;
  }
};

/**
 * Refresh Strava access token
 */
const refreshStravaToken = async (userId: string, refreshToken: string) => {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  const data = await response.json();

  // Update token in database
  await supabase
    .from("user_integrations")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq("user_id", userId)
    .eq("service", "strava");

  return data;
};

/**
 * Map Livepet activity type to Strava activity type
 */
const mapActivityType = (type: string): string => {
  const typeMap: Record<string, string> = {
    walk: "Walk",
    run: "Run",
    ride: "Ride",
    hike: "Hike",
    swim: "Swim",
  };
  return typeMap[type] || "Workout";
};
```

## Usage Example

In your activity completion code (e.g., after a walk is finished):

```typescript
// When user completes a walk activity
const handleCompleteWalk = async (walkData: {
  distance: number;
  duration: number;
  petId: string;
}) => {
  // ... save activity to database ...

  // Check if user has Strava connected
  const { data: stravaIntegration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("service", "strava")
    .single();

  if (stravaIntegration) {
    try {
      // Publish to Strava
      await publishToStrava(user.id, {
        name: `${petName}'s Walk`,
        type: "walk",
        startDate: new Date(),
        elapsedTime: walkData.duration,
        distance: walkData.distance * 1000, // convert to meters
        description: `Walk with ${petName} via Livepet`,
      });
      
      toast({
        title: "Published to Strava!",
        description: "Your activity has been shared on Strava",
      });
    } catch (error) {
      console.error("Failed to publish to Strava:", error);
      // Silent fail - don't interrupt the user
    }
  }
};
```

## API Endpoints

### Post Activity to Strava
- **URL**: `https://www.strava.com/api/v3/activities`
- **Method**: POST
- **Headers**:
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Activity name",
    "type": "Run",
    "start_date_local": "2025-10-27T10:00:00Z",
    "elapsed_time": 3600,
    "distance": 5000,
    "description": "Activity description"
  }
  ```

### Refresh Token
- **URL**: `https://www.strava.com/oauth/token`
- **Method**: POST
- **Body**:
  ```json
  {
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "grant_type": "refresh_token",
    "refresh_token": "refresh_token_value"
  }
  ```

## Testing

1. Start your local development server
2. Navigate to User Settings
3. Click "Connect" on Strava
4. Authorize the application
5. Complete an activity
6. Check your Strava account to verify the activity was published

## Security Notes

⚠️ **Important**: In production, the OAuth token exchange should be handled by a backend server to protect your client secret. The current implementation exposes the client secret in the frontend code.

For production, create a backend API endpoint that:
1. Receives the authorization code from the frontend
2. Exchanges it for an access token server-side
3. Stores the token in the database
4. Returns a success response to the frontend

See `backend-api-example.js` for a reference implementation.

