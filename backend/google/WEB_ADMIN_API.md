# Web Admin API Reference

Base URL:

```text
http://localhost:3001/api
```

All admin endpoints require the billing app access token:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

Admin write routes require the `ADMIN` role.

## Generic web CRUD

The following resources are available:

| Resource | Database table |
| --- | --- |
| `enquiries` | `web_contact_enquiries` |
| `appointments` | `web_customer_appointments` |
| `testimonials` | `web_customer_testimonials` |
| `gallery` | `web_gallery_media` |
| `services` | `web_services_dropdown` |

### List

```http
GET /web-admin/{resource}?limit=50&offset=0
```

Example:

```http
GET /web-admin/testimonials?limit=25&offset=0
```

Response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0,
    "limit": 25,
    "offset": 0
  }
}
```

### Get one

```http
GET /web-admin/{resource}/{id}
```

### Create

```http
POST /web-admin/{resource}
```

### Update

```http
PATCH /web-admin/{resource}/{id}
```

PATCH accepts only the fields being changed.

### Delete

```http
DELETE /web-admin/{resource}/{id}
```

Successful deletion returns HTTP `204`.

## Testimonial payload

```json
{
  "customer_name": "Ananya",
  "rating": 5,
  "testimonial": "Excellent service and support.",
  "service": "Foot assessment",
  "review_date": "2026-08-20",
  "is_published": true
}
```

`rating` must be an integer from `1` to `5`.

## Service payload

```json
{
  "service_name": "Foot assessment",
  "description": "Initial assessment and consultation.",
  "is_active": true
}
```

The public website should load active services from:

```http
GET /web/services?limit=200
```

## Gallery upload

The frontend crops the image before upload. The backend accepts JPG, PNG, and WEBP files up to 3 MB, then rotates, resizes, and compresses the result as JPEG.

```http
POST /upload/gallery
Content-Type: multipart/form-data
```

Form field:

```text
gallery=<image-file>
```

Response:

```json
{
  "success": true,
  "data": {
    "url": "/uploads/gallery/example.jpg",
    "filename": "example.jpg",
    "size": 240000
  }
}
```

Save the returned `url` into the gallery record's `src` field.

## Store status

### Read status

Public and admin:

```http
GET /web-settings/status
```

### Update status

Admin only:

```http
PATCH /web-settings/status
```

Request:

```json
{
  "closed": true,
  "reason": "We are closed today. Please call us for urgent help."
}
```

The main dashboard uses this endpoint for the admin open/closed toggle.

## Business hours

### Read weekly hours

Public and admin:

```http
GET /web-settings/hours
```

### Update weekly hours

Admin only:

```http
PUT /web-settings/hours
```

Exactly seven day records are required:

```json
{
  "hours": [
    {
      "day": "MONDAY",
      "is_closed": false,
      "open_time": "09:00",
      "close_time": "18:00"
    },
    {
      "day": "THURSDAY",
      "is_closed": false,
      "open_time": "10:00",
      "close_time": "20:00"
    },
    {
      "day": "SUNDAY",
      "is_closed": true,
      "open_time": null,
      "close_time": null
    }
  ]
}
```

Include Monday through Sunday in the actual request. Open days require `HH:mm` values. Closed days may use `null` times.

## Google Business Profile sync

Saving weekly hours always updates the local database first. If all of these backend variables exist, the same full weekly schedule is sent to Google:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_BUSINESS_LOCATION_ID=accounts/ACCOUNT_ID/locations/LOCATION_ID
```

The backend obtains an access token from the refresh token and sends:

```http
PATCH https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?updateMask=regularHours
```

The response includes synchronization state:

```json
{
  "success": true,
  "data": [],
  "google": {
    "configured": true,
    "synced": true,
    "message": "Business hours saved and synchronized with Google Business Profile."
  }
}
```

When Google is not configured, local saving still succeeds:

```json
{
  "google": {
    "configured": false,
    "synced": false,
    "message": "Google Business Profile is not configured; hours were saved locally."
  }
}
```

Never put the Google client secret or refresh token in the frontend.

## Frontend API helper example

```ts
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function adminRequest(path: string, options: RequestInit = {}) {
  const auth = JSON.parse(localStorage.getItem('auth-store') ?? '{}');
  const token = auth.state?.token;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {})
    }
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message ?? 'Request failed');
  return result;
}
```

## Database setup

Run:

```text
database/web_business_settings.sql
```

Fresh backend schema setup also includes the `web_store_status` and `web_business_hours` tables in:

```text
backend/src/infrastructure/db/schema.sql
```
