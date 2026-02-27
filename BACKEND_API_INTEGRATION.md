# Backend API Integration Summary

This document outlines how the frontend pages fetch data from the backend API.

## 📋 Pages and Their API Endpoints

### 1. **Notifications Page** (`pages/Notifications.tsx`)
**Endpoint:** `GET /notifications`

**Expected Response Format:**
```json
{
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "trigger": "string",
      "channels": ["email", "push"],
      "status": "active" | "disabled",
      "isActive": boolean
    }
  ]
}
```

**Additional Endpoints:**
- `PATCH /notifications/:id` - Toggle notification status
- `DELETE /notifications/:id` - Delete notification

---

### 2. **Activity Log Page** (`pages/activitylog.tsx`)
**Endpoint:** `GET /activity-logs`

**Expected Response Format:**
```json
{
  "data": [
    {
      "_id": "69892ad8c69838a17142e2ac",
      "actorId": "6965be99931f2075001008bf",
      "actorRole": "ADMIN",
      "action": "USER_LOGIN",
      "entityType": "Auth",
      "message": "User login via credentials",
      "status": "SUCCESS",
      "ip": "103.174.189.65",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-02-09T00:31:20.245Z",
      "updatedAt": "2026-02-09T00:31:20.245Z",
      "__v": 0
    }
  ]
}
```

**Features:**
- Client-side search filtering (action, message, actorId, entityType)
- Refresh functionality
- Displays timestamp, action, user (actorId + role), target (entityType), and status

---

### 3. **Subscription Page** (`pages/Subscription.tsx`)
**Endpoint:** `GET /subscriptions`

**Expected Response Format:**
```json
{
  "data": [
    {
      "_id": "string",
      "email": "string",
      "userId": "string",
      "plan": "Premium" | "Pro" | "Free",
      "provider": "string",
      "status": "Active" | "Inactive",
      "startDate": "string (formatted date)",
      "endDate": "string (formatted date)"
    }
  ]
}
```

**Features:**
- Client-side search by email
- Client-side filter by plan type
- Automatic stats calculation (total, active, premium users, MRR)

---

### 4. **Analytics Page** (`pages/analytics.tsx`)
**Endpoint:** `GET /analytics`

**Expected Response Format:**
```json
{
  "data": {
    "stats": {
      "totalUsers": number,
      "userGrowth": "string (e.g., '+12% From Last Months')",
      "totalLocations": number,
      "locationGrowth": "string",
      "monthlyRevenue": number,
      "revenueGrowth": "string",
      "activeSessions": number
    },
    "charts": {
      "lineChart": [],
      "donutChart": [],
      "barChart": []
    }
  }
}
```

**Note:** Chart data structure depends on your charting library implementation.

---

## 🔐 Authentication

All API requests include authentication via the axios interceptor:

```typescript
// Automatically adds Bearer token from cookies or localStorage
Authorization: Bearer <token>
```

The token is retrieved from:
1. `Cookies.get('accessToken')` (priority)
2. `localStorage.getItem('accessToken')` (fallback)

---

## 🔄 Token Refresh

The axios instance includes automatic token refresh:
- Intercepts 401 errors and JWT expiration
- Calls `POST /auth/refresh-token`
- Retries failed requests with new token

---

## 🌐 Base URL Configuration

The base URL is configured in `src/config.ts`:
```typescript
baseURL: config.baseUrl
```

Make sure your backend API is running and the base URL is correctly set.

---

## ✅ Current Status

| Page | API Integration | Status |
|------|----------------|--------|
| Notifications | ✅ Complete | Fetching, toggling, deleting |
| Activity Log | ✅ Complete | Fetching with search |
| Subscription | ✅ Complete | Fetching with filters |
| Analytics | ✅ Complete | Fetching stats and charts |

---

## 🚀 Testing Recommendations

1. **Verify Backend Endpoints:** Ensure all endpoints return data in the expected format
2. **Test Error Handling:** Check console logs for any fetch errors
3. **Check Network Tab:** Monitor API calls in browser DevTools
4. **Validate Token:** Ensure authentication tokens are being sent correctly

---

## 📝 Notes

- All pages use `axiosInstance` from `src/lib/axios.ts`
- Error handling logs to console (consider adding user-facing error messages)
- Some pages have client-side filtering/search for better UX
- The analytics page expects nested data structure with `stats` and `charts` objects
