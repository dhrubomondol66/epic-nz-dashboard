# Authentication System - Complete Flow Diagram

## 1. Login Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend                    Backend
  │                        │                           │
  │  Enter credentials     │                           │
  ├───────────────────────>│                           │
  │                        │  POST /auth/login         │
  │                        ├──────────────────────────>│
  │                        │                           │
  │                        │  {accessToken, refresh}   │
  │                        │<──────────────────────────┤
  │                        │                           │
  │                        │ Store tokens & email      │
  │                        │ (cookies + localStorage)  │
  │                        │                           │
  │  Redirect to /dashboard│                           │
  │<───────────────────────┤                           │
  │                        │                           │
```

## 2. Password Reset Flow (3 Steps)
```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                           │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Request OTP
─────────────────────
User                    Frontend                    Backend
  │                        │                           │
  │  Enter email           │                           │
  ├───────────────────────>│                           │
  │                        │  POST /admin/forget-pwd   │
  │                        ├──────────────────────────>│
  │                        │                           │
  │                        │  Success                  │
  │                        │<──────────────────────────┤
  │                        │                           │
  │  Show OTP input        │  Send OTP email          │
  │<───────────────────────┤                           │
  │                        │                           │

STEP 2: Verify OTP
──────────────────
User                    Frontend                    Backend
  │                        │                           │
  │  Enter OTP code        │                           │
  ├───────────────────────>│                           │
  │                        │  POST /otp/verify         │
  │                        ├──────────────────────────>│
  │                        │                           │
  │                        │  Success                  │
  │                        │<──────────────────────────┤
  │                        │                           │
  │  Navigate to set-pwd   │                           │
  │  with email param      │                           │
  │<───────────────────────┤                           │
  │                        │                           │

STEP 3: Set New Password
─────────────────────────
User                    Frontend                    Backend
  │                        │                           │
  │  Enter new password    │                           │
  ├───────────────────────>│                           │
  │                        │  POST /auth/set-password  │
  │                        ├──────────────────────────>│
  │                        │                           │
  │                        │  Success                  │
  │                        │<──────────────────────────┤
  │                        │                           │
  │  Show success msg      │                           │
  │  Link to login         │                           │
  │<───────────────────────┤                           │
  │                        │                           │
```

## 3. Logout Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGOUT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend                    Backend
  │                        │                           │
  │  Click logout          │                           │
  ├───────────────────────>│                           │
  │                        │  POST /auth/logout        │
  │                        ├──────────────────────────>│
  │                        │                           │
  │                        │  Invalidate session       │
  │                        │<──────────────────────────┤
  │                        │                           │
  │                        │ Clear tokens & email      │
  │                        │ (cookies + localStorage)  │
  │                        │                           │
  │  Redirect to /login    │                           │
  │<───────────────────────┤                           │
  │                        │                           │
```

## 4. Token Refresh Flow (Automatic)
```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN REFRESH FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   │  API request              │
   ├──────────────────────────>│
   │                           │
   │  401 Unauthorized         │
   │  (token expired)          │
   │<──────────────────────────┤
   │                           │
   │  POST /auth/refresh-token │
   │  {refreshToken}           │
   ├──────────────────────────>│
   │                           │
   │  {newAccessToken,         │
   │   newRefreshToken}        │
   │<──────────────────────────┤
   │                           │
   │  Store new tokens         │
   │  Retry original request   │
   ├──────────────────────────>│
   │                           │
   │  Success                  │
   │<──────────────────────────┤
   │                           │

   If refresh fails:
   ├─> Clear all tokens
   └─> Redirect to /login
```

## 5. Protected Route Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                   PROTECTED ROUTE ACCESS                         │
└─────────────────────────────────────────────────────────────────┘

User                    Frontend
  │                        │
  │  Navigate to           │
  │  /dashboard            │
  ├───────────────────────>│
  │                        │
  │                        │ Check for token
  │                        │ in cookies/localStorage
  │                        │
  │                   ┌────┴────┐
  │                   │ Token?  │
  │                   └────┬────┘
  │                        │
  │         ┌──────────────┴──────────────┐
  │         │                             │
  │      YES│                             │NO
  │         │                             │
  │    Show Dashboard              Redirect to /login
  │<────────┤                             │
  │                                       │
  │                                  Show login page
  │<──────────────────────────────────────┤
  │                                       │
```

## Component Relationships
```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT STRUCTURE                           │
└─────────────────────────────────────────────────────────────────┘

App.tsx
  │
  ├─ Public Routes
  │   ├─ /login ──────────────> Login.tsx
  │   ├─ /forgot-password ────> ForgotPassword.tsx (2 steps)
  │   └─ /set-password ───────> SetPassword.tsx
  │
  └─ Protected Routes (RequireAuth wrapper)
      ├─ /dashboard ─────────> Dashboard.tsx
      ├─ /location/* ────────> Location pages
      ├─ /submission ────────> Submission.tsx
      ├─ /system/* ──────────> System pages
      ├─ /advance/* ─────────> Advanced pages
      └─ /chat ──────────────> Chat.tsx

All protected routes include:
  └─ Sidebar.tsx (with Logout button)
```

## Redux Store Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                      REDUX STRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

store
  │
  └─ baseApi (RTK Query)
      │
      └─ authApi
          ├─ useLoginMutation
          ├─ useForgotPasswordMutation
          ├─ useVerifyOtpMutation
          ├─ useSetPasswordMutation
          └─ useLogoutMutation
```

## Token Storage Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN STORAGE                                 │
└─────────────────────────────────────────────────────────────────┘

Cookies (HTTP-only recommended)
  ├─ accessToken (expires: 1 day)
  └─ refreshToken (expires: 7 days)

localStorage (fallback)
  ├─ accessToken
  ├─ refreshToken
  └─ email (for convenience)

On Logout: All cleared
On Token Refresh: Both updated
```

## Security Measures
```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY FEATURES                             │
└─────────────────────────────────────────────────────────────────┘

✓ OTP verification for password reset
✓ Email-based reset (no tokens in URL)
✓ Automatic token refresh
✓ Backend logout (session invalidation)
✓ Complete token cleanup
✓ Password strength validation
✓ Protected route guards
✓ Automatic redirect on expiration
✓ Request interceptors (add auth headers)
✓ Response interceptors (handle 401)
```
