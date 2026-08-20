import { Router } from 'express';
import { google } from 'googleapis';
import { config } from '../../config/index.js';

export const googleRoutes = Router();

function getOAuthClient() {
  return new google.auth.OAuth2(
    config.googleBusiness.clientId,
    config.googleBusiness.clientSecret,
    config.googleBusiness.redirectUri,
  );
}

googleRoutes.get('/', (_req, res) => {
  const client = getOAuthClient();
  const authorizationUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/business.manage'],
  });

  res.redirect(authorizationUrl);
});

googleRoutes.get('/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }

    const { tokens } = await getOAuthClient().getToken(code);
    console.log('Google OAuth tokens received. Store the refresh token securely:', Boolean(tokens.refresh_token));
    res.send('Google Business Profile connected successfully. Check the backend logs for the refresh-token status.');
    console.log("Access token:", tokens.access_token);
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    res.status(500).send('Google connection failed');
  }
});