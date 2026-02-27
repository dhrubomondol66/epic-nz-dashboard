# Finding the Correct Backend Endpoint

## Issue
The forgot password endpoint is returning 404, which means the backend doesn't have that route.

## Current Attempt
Changed from `admin/forget-password` to `auth/forgot-password`

## How to Find the Correct Endpoint

### Method 1: Check Backend API Documentation
1. Look for backend API documentation (Swagger, Postman collection, README)
2. Search for "forgot password" or "reset password" endpoints

### Method 2: Check Backend Source Code
If you have access to the backend code:
```bash
# Search for forgot password routes
grep -r "forgot" backend/
grep -r "forget" backend/
grep -r "reset-password" backend/
grep -r "otp" backend/
```

### Method 3: Common Endpoint Variations to Try

Try these variations in order (update `auth.ts`):

1. **`auth/forgot-password`** (current - most common)
2. **`auth/forget-password`** (typo variant)
3. **`admin/forgot-password`**
4. **`admin/forget-password`**
5. **`otp/send`** or **`otp/request`**
6. **`password/forgot`** or **`password/reset`**
7. **`user/forgot-password`**

### Method 4: Ask Backend Developer
Contact the backend developer and ask for:
- The exact endpoint for requesting password reset
- Expected request body format
- Expected response format

### Method 5: Check Network Tab in Working Version
If there's a working version of the app:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger forgot password
4. Check the request URL

## Quick Test Script

You can test endpoints directly using curl or Postman:

```bash
# Test forgot password endpoint
curl -X POST https://elflike-snoopy-ernie.ngrok-free.dev/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"email":"test@example.com"}'
```

Try different endpoint variations:
- `/api/v1/auth/forgot-password`
- `/api/v1/auth/forget-password`
- `/api/v1/admin/forgot-password`
- `/api/v1/otp/send`

## Update the Endpoint

Once you find the correct endpoint, update it in:

### File: `src/redux/features/auth.ts`
```typescript
forgotPassword: builder.mutation<void, { email: string }>({
    query: (data) => ({
        url: "CORRECT_ENDPOINT_HERE",  // ← Update this
        method: "POST",
        data,
    }),
}),
```

### File: `src/lib/axios.ts`
Add the correct endpoint to the public endpoints list:
```typescript
const isPublicAuthEndpoint = (url: string) => {
    const u = url || "";
    return (
        // ... other endpoints
        u.includes("CORRECT_ENDPOINT_HERE") ||  // ← Add this
        // ... other endpoints
    );
};
```

## Common Backend Patterns

### Pattern 1: Separate OTP Endpoint
Some backends have separate endpoints:
- `POST /otp/send` - Send OTP to email
- `POST /otp/verify` - Verify OTP code
- `POST /auth/reset-password` - Reset password with verified OTP

### Pattern 2: Combined Auth Endpoint
- `POST /auth/forgot-password` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/set-password` - Set new password

### Pattern 3: Admin Namespace
- `POST /admin/forgot-password` - Admin-specific reset
- `POST /user/forgot-password` - User-specific reset

## If Backend Endpoint Doesn't Exist

If the backend doesn't have a forgot password endpoint, you'll need to:

1. **Contact Backend Team** to implement it
2. **Provide API Specification:**
   ```
   POST /auth/forgot-password
   Body: { "email": "user@example.com" }
   Response: { "message": "OTP sent to email" }
   
   POST /otp/verify
   Body: { "email": "user@example.com", "otp": "123456" }
   Response: { "message": "OTP verified" }
   
   POST /auth/set-password
   Body: { "email": "user@example.com", "password": "newpass", "confirm_password": "newpass" }
   Response: { "message": "Password updated" }
   ```

## Current Backend URL
From `.env` file:
```
REACT_APP_API_URL=https://elflike-snoopy-ernie.ngrok-free.dev/api/v1/
```

Full endpoint will be:
```
https://elflike-snoopy-ernie.ngrok-free.dev/api/v1/auth/forgot-password
```

## Next Steps

1. **Test the current endpoint** (`auth/forgot-password`) - try submitting the form again
2. **If still 404**, try the variations listed above
3. **Check backend logs** if you have access
4. **Contact backend developer** for the correct endpoint
5. **Update this file** with the working endpoint for future reference
