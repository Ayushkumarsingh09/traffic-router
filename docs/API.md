# API Reference

Base URL: `http://localhost:3000`

## Authentication

### POST `/api/auth/login`

Login and create a session.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "csrfToken": "..."
}
```

### DELETE `/api/auth/login`

Logout and destroy session.

### GET `/api/auth/me`

Get current authenticated admin user.

---

## Traffic Routing

### GET `/api/route`

Process incoming traffic and return routing decision (redirects client).

### POST `/api/traffic/log`

Log traffic and return classification + routing decision as JSON.

**Response:**
```json
{
  "profile": {
    "deviceType": "DESKTOP",
    "browser": "Chrome",
    "isFacebookInApp": false,
    "country": "US"
  },
  "route": {
    "action": "REDIRECT",
    "destinationUrl": "https://www.google.com",
    "reason": "Matched rule ..."
  },
  "visitId": "..."
}
```

---

## Rules CRUD

Requires authenticated session. Mutations require `x-csrf-token` header.

### GET `/api/rules`

List all routing rules.

### POST `/api/rules`

Create a rule.

**Body:**
```json
{
  "name": "Mobile Users",
  "priority": 20,
  "isActive": true,
  "action": "SHOW",
  "destinationId": "...",
  "conditions": [
    { "field": "DEVICE_TYPE", "operator": "EQUALS", "value": "MOBILE" }
  ]
}
```

### GET `/api/rules/:id`

Get a single rule.

### PUT `/api/rules/:id`

Update a rule.

### DELETE `/api/rules/:id`

Delete a rule.

---

## Destinations CRUD

### GET `/api/destinations`
### POST `/api/destinations`
### GET `/api/destinations/:id`
### PUT `/api/destinations/:id`
### DELETE `/api/destinations/:id`

**Destination body:**
```json
{
  "name": "Primary Landing",
  "slug": "primary",
  "url": "http://localhost:3000/landing/primary",
  "type": "INTERNAL",
  "isActive": true
}
```

---

## Destination Pools

### GET `/api/pools`
### POST `/api/pools`

**Pool body:**
```json
{
  "name": "Random Redirect Pool",
  "members": [
    { "destinationId": "...", "weight": 40 },
    { "destinationId": "...", "weight": 30 }
  ]
}
```

---

## Analytics

### GET `/api/analytics?days=30&limit=50`

Returns summary metrics and recent traffic logs.

---

## Conversions

### POST `/api/conversions`

Track a conversion event.

**Body:**
```json
{
  "visitId": "...",
  "eventName": "conversion",
  "destinationId": "...",
  "value": 1
}
```

---

## Rule Fields

`DEVICE_TYPE`, `BROWSER`, `OS`, `REFERRER`, `COUNTRY`, `LANGUAGE`, `USER_AGENT`, `IS_FACEBOOK_INAPP`, `IS_MOBILE`

## Rule Operators

`EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `IN`, `NOT_IN`, `REGEX`
