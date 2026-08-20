<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# how to update google maps times like Thursday, 10 am–8 pm. in external angular admin panel.

You can update **Google Maps business hours** from an external Angular admin panel using the **Google Business Profile API**. Angular should call your backend, not Google directly, because OAuth refresh tokens and client secrets must remain private. Google stores weekly hours in the `regularHours.periods` field.[^1_1]

## Required setup

1. Create or select a project in Google Cloud.
2. Enable:
    - **Business Profile API**
    - **Business Profile Business Information API**
3. Configure OAuth 2.0 consent screen.
4. Request the scope:
```text
https://www.googleapis.com/auth/business.manage
```

5. Ask the business owner to authorize your application.
6. Obtain the Google Business Profile `accountId` and `locationId`.

The business profile must generally be verified for changes to appear on Google Search and Maps.[^1_1]

## Hours payload

For example, to set Thursday to **10:00 AM–8:00 PM**, send:

```json
{
  "regularHours": {
    "periods": [
      {
        "openDay": "THURSDAY",
        "openTime": "10:00",
        "closeDay": "THURSDAY",
        "closeTime": "20:00"
      }
    ]
  }
}
```

Google uses 24-hour time, so `10:00` means 10 AM and `20:00` means 8 PM. The period contains both the opening and closing day, which is useful for overnight schedules as well.[^1_1]

## Google API request

```http
PATCH https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?updateMask=regularHours
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "regularHours": {
    "periods": [
      {
        "openDay": "THURSDAY",
        "openTime": "10:00",
        "closeDay": "THURSDAY",
        "closeTime": "20:00"
      }
    ]
  }
}
```

Use `updateMask=regularHours` so the request explicitly updates the business-hours field.[^1_1]

## Important: send all weekly periods

`regularHours` represents the complete weekly schedule. Therefore, if Monday, Tuesday, Wednesday, Friday, Saturday, and Sunday already have hours, first load the current schedule, modify Thursday, and send the complete `periods` array.

Example:

```json
{
  "regularHours": {
    "periods": [
      {
        "openDay": "MONDAY",
        "openTime": "09:00",
        "closeDay": "MONDAY",
        "closeTime": "18:00"
      },
      {
        "openDay": "TUESDAY",
        "openTime": "09:00",
        "closeDay": "TUESDAY",
        "closeTime": "18:00"
      },
      {
        "openDay": "WEDNESDAY",
        "openTime": "09:00",
        "closeDay": "WEDNESDAY",
        "closeTime": "18:00"
      },
      {
        "openDay": "THURSDAY",
        "openTime": "10:00",
        "closeDay": "THURSDAY",
        "closeTime": "20:00"
      },
      {
        "openDay": "FRIDAY",
        "openTime": "09:00",
        "closeDay": "FRIDAY",
        "closeTime": "18:00"
      }
    ]
  }
}
```


## Recommended architecture

```text
Angular Admin Panel
        |
        | POST /api/google-business/hours
        v
Your Backend
        |
        | OAuth access token
        | PATCH Google Business Profile API
        v
Google Business Profile / Maps
```

Do not place the Google OAuth client secret or refresh token in Angular. Store them securely in your backend, such as a Node.js, Spring Boot, Firebase Cloud Function, or Supabase Edge Function service.

## Angular service example

```ts
export interface BusinessPeriod {
  openDay: string;
  openTime: string;
  closeDay: string;
  closeTime: string;
}

export interface UpdateHoursRequest {
  locationId: string;
  periods: BusinessPeriod[];
}
```

```ts
@Injectable({
  providedIn: 'root'
})
export class BusinessHoursService {
  constructor(private http: HttpClient) {}

  updateHours(data: UpdateHoursRequest) {
    return this.http.patch(
      '/api/google-business/hours',
      data
    );
  }
}
```

Component usage:

```ts
saveHours() {
  const periods = this.weekDays
    .filter(day => !day.closed)
    .map(day => ({
      openDay: day.name.toUpperCase(),
      openTime: day.openTime,   // Example: "10:00"
      closeDay: day.name.toUpperCase(),
      closeTime: day.closeTime  // Example: "20:00"
    }));

  this.businessHoursService.updateHours({
    locationId: this.locationId,
    periods
  }).subscribe({
    next: () => {
      console.log('Hours update submitted');
    },
    error: error => {
      console.error('Google hours update failed', error);
    }
  });
}
```


## Backend example with Node.js

```ts
import express from 'express';

const app = express();
app.use(express.json());

app.patch('/api/google-business/hours', async (req, res) => {
  const { locationId, periods } = req.body;

  const accessToken = await getGoogleAccessToken();

  const response = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationId}?updateMask=regularHours`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regularHours: {
          periods
        }
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(result);
  }

  res.json(result);
});
```


## Reading existing hours

Before editing, retrieve the current location:

```http
GET https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?readMask=regularHours
Authorization: Bearer {access_token}
```

The API also provides a Google-updated version through the `googleUpdated` endpoint, which can help you inspect changes suggested or made by Google.[^1_1]

For holiday or one-time changes, use `specialHours` instead of `regularHours`; special hours override the normal weekly schedule.
<span style="display:none">[^1_10][^1_2][^1_3][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations

[^1_2]: https://developers.google.com/my-business/content/location-data

[^1_3]: https://bundle.social/google-business-profile-location-api

[^1_4]: https://developers.google.com/my-business/content/locations

[^1_5]: https://developers.google.com/my-business/reference/rest/v4/accounts.locations

[^1_6]: https://bundle.social/google-business-profile-hours-api

[^1_7]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations

[^1_8]: https://wilcowebservices.com/google-business-profile-api/

[^1_9]: https://developers.google.com/my-business/reference/rest

[^1_10]: https://developers.google.com/my-business


---

# this Business Profile API

•	Business Profile Business Information API
3.	Configure OAuth 2.0 consent screen. services free or cost ?

Yes—**Google Business Profile API and Business Profile Business Information API are free to use**. Google does not charge per API request, including updating business hours.[^2_1]

## Possible costs

Although the APIs are free, you may still pay for related Google Cloud services:

- **Google Cloud project:** Free to create.
- **OAuth 2.0 consent screen:** Free.
- **Google Cloud billing account:** May be requested for some Google Cloud services, but creating OAuth credentials itself is not normally charged.
- **Your backend hosting:** Potential cost if you use Cloud Run, Firebase Functions, AWS, Supabase, or another paid platform.
- **Database and logging:** Depends on your provider and usage.
- **Google Maps Platform APIs:** Different Maps APIs, such as Maps JavaScript API or Geocoding API, may have separate pricing. These are not the same as the Business Profile API.


## Important access requirement

The Business Profile APIs are not automatically available to every new Google Cloud project. You generally need to request API access, and Google reviews the application; Google says requests may be reviewed within 14 days.[^2_2]

After approval, standard quotas apply. For the Business Information API, Google lists limits such as 300 requests per minute and up to 10,000 update-location requests per day; updates are also limited to 10 edits per minute for each Business Profile.[^2_3]

## OAuth consent screen

Configuring the OAuth consent screen is free. Your application asks the business owner to authorize access using the scope:

```text
https://www.googleapis.com/auth/business.manage
```

The owner must grant permission for your application to manage their Business Profile. You should store the refresh token securely on your backend—not in Angular.

## For your Angular admin panel

A typical low-cost setup is:

```text
Angular admin panel
        ↓
Your backend API
        ↓
Google Business Profile API
```

For example:

```text
Angular → POST /api/business-hours
Backend → Google PATCH locations/{locationId}
```

If you only update hours for one or a few businesses, the Google API request cost should be **zero**. Your main expenses would be backend hosting, database usage, and any separate Google Maps Platform services you use.
<span style="display:none">[^2_10][^2_4][^2_5][^2_6][^2_7][^2_8][^2_9]</span>

<div align="center">⁂</div>

[^2_1]: https://developers.google.com/my-business/content/pricing

[^2_2]: https://developers.google.com/my-business/content/faq

[^2_3]: https://developers.google.com/my-business/content/limits

[^2_4]: https://slashpost.ai/blogs/google-business-profile/google-business-profile-api-documentation-2026

[^2_5]: https://dataforseo.com/apis/business-data-api

[^2_6]: https://apis.io/plans/google-business-profile/google-business-profile-plans-pricing/

[^2_7]: https://developers.google.com/my-business/content/limits?hl=hi

[^2_8]: https://dataforseo.com/pricing/business-data/business-data-api

[^2_9]: https://dataforseo.com/apis/business-data-api/google-my-business

[^2_10]: https://localith.ai/blog/google-business-profile-api-guide/


---

# my quiries need free or paid ?

Your queries for updating Google Maps business hours are **free**.

- Google Business Profile API: **Free**
- Business Profile Business Information API: **Free**
- OAuth 2.0 consent screen: **Free**
- Updating Thursday hours, such as `10:00–20:00`: **Free**
- Reading business-location data: **Free**

Google states that the Business Profile API is available to registered users at no charge.[^3_1]

## Free usage limits

The API still has quotas:

- Up to **300 requests per minute** for the Business Information API.
- Up to **10,000 location-update requests per day**.
- Maximum **10 edits per minute for one Business Profile**.[^3_2]


## What could cost money?

You may pay only for surrounding services, not these API queries:

- Backend hosting, such as Firebase Functions, Cloud Run, AWS, or Supabase.
- Database storage.
- Server logs or monitoring.
- Separate Google Maps Platform APIs, such as Maps JavaScript, Places, Routes, or Geocoding APIs.

So, for your Angular admin panel, if you only update business hours through the Business Profile API, **Google API usage cost is ₹0**. You only need to consider your own hosting costs.
<span style="display:none">[^3_10][^3_3][^3_4][^3_5][^3_6][^3_7][^3_8][^3_9]</span>

<div align="center">⁂</div>

[^3_1]: https://developers.google.com/my-business/content/pricing

[^3_2]: https://developers.google.com/my-business/content/limits

[^3_3]: https://developers.google.com/my-business/content/pricing?hl=hi

[^3_4]: https://developers.google.com/my-business/content/limits?hl=es

[^3_5]: https://developers.google.com/my-business/content/pricing?hl=vi

[^3_6]: https://developers.google.com/my-business/content/pricing?hl=it

[^3_7]: https://developers.google.com/my-business/content/pricing?hl=fr

[^3_8]: https://developers.google.com/my-business/content/pricing?hl=th

[^3_9]: https://developers.google.com/my-business/content/pricing?hl=de

[^3_10]: https://developers.google.com/my-business/content/limits?hl=pt-br


---

# give a example code for node js

Below is a complete **Node.js + Express** example for OAuth login and updating Google Business Profile hours. Google’s `locations.patch` endpoint updates the location using an `updateMask`; OAuth offline access provides a refresh token for later API calls.[^4_1][^4_2]

## 1. Install packages

```bash
mkdir google-business-hours
cd google-business-hours

npm init -y
npm install express googleapis dotenv cors
```

Use Node.js 18 or newer.

## 2. Create `.env`

```env
PORT=3000

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Generate this during the OAuth callback and store it securely
GOOGLE_REFRESH_TOKEN=your-refresh-token

SESSION_SECRET=change-this-secret
```

Do not commit `.env` to Git:

```gitignore
.env
```


## 3. Create `server.js`

```js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { google } = require('googleapis');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const GOOGLE_SCOPE =
  'https://www.googleapis.com/auth/business.manage';

// Temporary demo storage.
// In production, store tokens in your database or secret manager.
let refreshToken = process.env.GOOGLE_REFRESH_TOKEN || null;

// OAuth login URL
app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');

  // Store state in a session/database in production.
  res.cookie?.('oauth_state', state);

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [GOOGLE_SCOPE],
    state
  });

  res.redirect(authorizationUrl);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token && !refreshToken) {
      return res.status(400).send(
        'No refresh token received. Revoke the app permission and authorize again.'
      );
    }

    if (tokens.refresh_token) {
      refreshToken = tokens.refresh_token;

      console.log(
        'Save this refresh token securely:',
        refreshToken
      );
    }

    res.send('Google authorization successful. You can close this window.');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Google authorization failed');
  }
});

// Get a valid access token
async function getAccessToken() {
  if (!refreshToken) {
    throw new Error('Google account is not authorized');
  }

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { token } = await oauth2Client.getAccessToken();

  if (!token) {
    throw new Error('Could not obtain Google access token');
  }

  return token;
}

// List Business Profile accounts
app.get('/api/google/accounts', async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
});

// List locations for an account
app.get('/api/google/accounts/:accountId/locations', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { accountId } = req.params;

    const response = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,regularHours`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
});

// Update weekly business hours
app.patch('/api/google/locations/:locationId/hours', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { locationId } = req.params;
    const { periods } = req.body;

    if (!Array.isArray(periods)) {
      return res.status(400).json({
        message: 'periods must be an array'
      });
    }

    const response = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationId}?updateMask=regularHours`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          regularHours: {
            periods
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      message: 'Business hours updated successfully',
      location: data
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
```


## 4. Start the server

```bash
node server.js
```

Open this URL:

```text
http://localhost:3000/auth/google
```

Authorize the Google account that manages the Business Profile. The callback prints the refresh token in the terminal. Save that token in your database or secret manager—not in Angular source code.

## 5. Update Thursday hours

Call your backend endpoint:

```http
PATCH http://localhost:3000/api/google/locations/123456789/hours
Content-Type: application/json
```

Request body:

```json
{
  "periods": [
    {
      "openDay": "THURSDAY",
      "openTime": "10:00",
      "closeDay": "THURSDAY",
      "closeTime": "20:00"
    }
  ]
}
```

This represents:

```text
Thursday: 10:00 AM – 8:00 PM
```


## 6. Angular request

```ts
updateThursdayHours(locationId: string) {
  const periods = [
    {
      openDay: 'THURSDAY',
      openTime: '10:00',
      closeDay: 'THURSDAY',
      closeTime: '20:00'
    }
  ];

  return this.http.patch(
    `http://localhost:3000/api/google/locations/${locationId}/hours`,
    { periods }
  );
}
```


## Important

Send the **full weekly schedule**, not only Thursday, if the other days already contain hours. Otherwise, you may replace the existing schedule with only Thursday’s period. For production, validate day names and time values, protect the backend endpoint with your own admin authentication, and store the refresh token encrypted.
<span style="display:none">[^4_10][^4_3][^4_4][^4_5][^4_6][^4_7][^4_8][^4_9]</span>

<div align="center">⁂</div>

[^4_1]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations/patch

[^4_2]: https://developers.google.com/identity/protocols/oauth2/web-server

[^4_3]: https://developers.google.com/my-business/reference/rest/v4/accounts.locations

[^4_4]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations

[^4_5]: https://developers.google.com/my-business/content/location-data

[^4_6]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations

[^4_7]: https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations/updateAttributes

[^4_8]: https://developers.google.com/my-business/reference/rest/v4/accounts.locations/patch

[^4_9]: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

[^4_10]: https://developers.home.google.com/cloud-to-cloud/project/authorization

