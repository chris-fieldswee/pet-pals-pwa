/**
 * Example Backend API for Secure Strava OAuth
 * 
 * This should be hosted on your backend server (not exposed to frontend)
 * Use this file as a reference for implementing secure token exchange
 */

const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Exchange Strava authorization code for access token
 * POST /api/auth/strava/exchange
 */
app.post('/api/auth/strava/exchange', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing code or userId' });
    }

    // Exchange code for token (this is secure because it runs on your server)
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Store in database
    await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        service: 'strava',
        access_token: access_token,
        refresh_token: refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        scope: response.data.scope,
      });

    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging Strava token:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Publish activity to Strava on behalf of user
 * POST /api/strava/publish
 */
app.post('/api/strava/publish', async (req, res) => {
  try {
    const { userId, activity } = req.body;

    // Get user's Strava integration
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'strava')
      .single();

    if (!integration) {
      return res.status(404).json({ error: 'Strava not connected' });
    }

    // Check if token needs refresh
    if (new Date(integration.token_expires_at) < new Date()) {
      // Refresh token (implement similar to exchange)
      // ...
    }

    // Publish to Strava
    const response = await axios.post(
      'https://www.strava.com/api/v3/activities',
      {
        name: activity.name,
        type: activity.type,
        start_date_local: activity.startDate,
        elapsed_time: activity.duration,
        distance: activity.distance,
        description: activity.description,
      },
      {
        headers: {
          Authorization: `Bearer ${integration.access_token}`,
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error publishing to Strava:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;



