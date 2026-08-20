# Public Website API Integration

Base URL:

```text
http://localhost:3001/api
```

Use the production backend URL after deployment. Public read endpoints and contact/appointment submissions do not require an access token. Enquiries and appointments are write-only publicly; their records are never exposed by public list endpoints. Admin edits and deletes still require a JWT.

## Store status

Use this endpoint on every public-site load when the store status controls the page.

```http
GET /web-settings/status
```

Example response:

```json
{
  "success": true,
  "data": {
    "closed": false,
    "reason": "We are closed today. Please call us for urgent help."
  }
}
```

When `data.closed` is `true`, show the closed-store design and message. The project image is available at:

```text
/uploads/closed.png
```

If the frontend is hosted separately, use the backend origin:

```text
https://api.example.com/uploads/closed.png
```

Example JavaScript:

```js
const API_URL = 'https://api.example.com/api';

async function loadStoreStatus() {
  const response = await fetch(`${API_URL}/web-settings/status`);
  const result = await response.json();
  return result.data;
}

const status = await loadStoreStatus();

if (status.closed) {
  document.querySelector('#closed-message').textContent = status.reason;
  document.querySelector('#closed-state').hidden = false;
  document.querySelector('#normal-site').hidden = true;
}
```

## Weekly business hours

```http
GET /web-settings/hours
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "day": "MONDAY",
      "is_closed": false,
      "open_time": "09:00",
      "close_time": "18:00",
      "sort_order": 1
    },
    {
      "id": 7,
      "day": "SUNDAY",
      "is_closed": true,
      "open_time": null,
      "close_time": null,
      "sort_order": 7
    }
  ]
}
```

Example display helper:

```js
function formatHours(hour) {
  if (hour.is_closed) return 'Closed';
  return `${hour.open_time} - ${hour.close_time}`;
}
```

## Contact enquiries

The public site can submit contact forms without a JWT:

```http
POST /web/enquiries
Content-Type: application/json
```

Request body:

```json
{
  "name": "Praveen",
  "phone": "8438030401",
  "email": "customer@example.com",
  "service": "Foot assessment",
  "preferred_date": "2026-08-25",
  "preferred_time": "10:00",
  "message": "Please call before confirming."
}
```

`status` is optional and defaults to `new` in the database.

Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Praveen",
    "status": "new"
  }
}
```

Required fields: `name`, `phone`, `email`, and `service`.

## Customer appointments

The public site can submit appointments without a JWT. Admin edits and deletes remain protected.

```http
POST /web/appointments
Content-Type: application/json
```

Request body:

```json
{
  "customer_name": "Praveen",
  "phone": "8438030401",
  "service": "Foot assessment",
  "preferred_date": "2026-08-25",
  "preferred_time": "10:00",
  "message": "Morning appointment preferred."
}
```

Required fields: `customer_name`, `phone`, `service`, `preferred_date`, and `preferred_time`.

## Published testimonials

Public sites should load only published testimonials. The API currently returns all records, so filter the response client-side until a public-only endpoint is added:

```http
GET /web/testimonials?limit=200
```

Example:

```js
const response = await fetch(`${API_URL}/web/testimonials?limit=200`);
const result = await response.json();
const testimonials = result.data.filter(item => item.is_published === true || item.is_published === 1 || item.is_published === '1');
```

## Active services

Use active services to populate website enquiry and appointment dropdowns:

```http
GET /web/services?limit=200
```

Example:

```js
const response = await fetch(`${API_URL}/web/services?limit=200`);
const result = await response.json();
const services = result.data.filter(item => item.is_active === true || item.is_active === 1 || item.is_active === '1');
```

The submitted value should be the service string:

```json
{
  "service": "Foot assessment"
}
```

## Gallery media

```http
GET /web/gallery?limit=200
```

Recommended public filter:

```js
const media = result.data.filter(item => item.is_active === true || item.is_active === 1 || item.is_active === '1');
```

For image records, `src` contains the saved media path. Prefix it with the backend origin when it is a relative path:

```js
function mediaUrl(src) {
  return src.startsWith('http') ? src : `https://api.example.com${src}`;
}
```

## Error handling

All responses use this shape for errors:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation message"
}
```

Recommended public-site behavior:

- Show a friendly fallback if status or hours cannot be loaded.
- Do not block the whole site if testimonials or gallery media fail.
- Validate form fields before sending requests.
- Never expose admin access tokens in public-site code.

## CORS

Add the public website origin to the backend `CORS_ORIGINS` environment variable:

```env
CORS_ORIGINS=https://www.example.com,https://admin.example.com
```

Restart the backend after changing environment variables.
