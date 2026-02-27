# Auth System - Quick Testing Guide

## Prerequisites
1. Backend server running
2. Frontend dev server running (`npm run dev`)
3. Email service configured on backend for OTP delivery

## Test Scenarios

### ✅ Test 1: Login with Valid Credentials
**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter valid email and password
3. Click "Login"

**Expected Result:**
- Loading state shows "Logging in..."
- Tokens stored in cookies and localStorage
- Email stored in localStorage
- Redirected to `/dashboard`
- No errors shown

**Verify:**
```javascript
// Open browser console
console.log(localStorage.getItem('accessToken')); // Should show token
console.log(localStorage.getItem('refreshToken')); // Should show token
console.log(localStorage.getItem('email')); // Should show email
document.cookie; // Should include accessToken and refreshToken
```

---

### ❌ Test 2: Login with Invalid Credentials
**Steps:**
1. Navigate to `/login`
2. Enter invalid email/password
3. Click "Login"

**Expected Result:**
- Error message displayed: "Invalid login credentials. Please try again."
- No redirect
- No tokens stored

---

### 🔐 Test 3: Complete Password Reset Flow

#### Step 3a: Request OTP
**Steps:**
1. Navigate to `/forgot-password`
2. Enter valid email address
3. Click "Send Verification Code"

**Expected Result:**
- Loading state shows "Sending..."
- OTP sent to email
- UI switches to OTP verification step
- Email address displayed in subtitle

#### Step 3b: Verify OTP
**Steps:**
1. Check email for OTP code
2. Enter the 6-digit code
3. Click "Verify Code"

**Expected Result:**
- Loading state shows "Verifying..."
- On success, redirected to `/set-password?email=<your-email>`
- Email field pre-filled

**Test Invalid OTP:**
- Enter wrong code
- Error message: "Invalid OTP. Please check and try again."

**Test Resend OTP:**
- Click "Resend Code"
- New OTP sent to email

#### Step 3c: Set New Password
**Steps:**
1. Email should be pre-filled from URL
2. Enter new password
3. Observe password strength indicator
4. Enter same password in confirm field
5. Click "Reset password"

**Expected Result:**
- Password strength indicator updates (Too short → Weak → Fair → Strong)
- Match indicator shows "Passwords match" when they match
- On success, success message shown
- "Log in with new password" button appears

**Test Validation:**
- Different passwords: Error "Passwords do not match"
- Short password (<6 chars): Error "Password must be at least 6 characters"
- Empty email: Error "Please provide your email address"

---

### 🚪 Test 4: Logout
**Steps:**
1. Login successfully
2. Navigate to any protected page
3. Click "Log Out" in sidebar

**Expected Result:**
- Backend logout API called
- All tokens cleared from cookies
- All tokens cleared from localStorage
- Email cleared from localStorage
- Redirected to `/login`

**Verify:**
```javascript
// Open browser console after logout
console.log(localStorage.getItem('accessToken')); // Should be null
console.log(localStorage.getItem('refreshToken')); // Should be null
console.log(localStorage.getItem('email')); // Should be null
document.cookie; // Should not include auth tokens
```

---

### 🔒 Test 5: Protected Routes
**Steps:**
1. Logout or clear all tokens manually
2. Try to navigate directly to `/dashboard`

**Expected Result:**
- Immediately redirected to `/login`
- No dashboard content shown

**Test with Valid Token:**
1. Login successfully
2. Navigate to various protected routes:
   - `/dashboard`
   - `/location/epic`
   - `/submission`
   - `/system/subscription`
   - `/chat`

**Expected Result:**
- All routes accessible
- Content loads properly
- No redirects to login

---

### 🔄 Test 6: Token Refresh (Automatic)
**Steps:**
1. Login successfully
2. Manually expire the access token (or wait for natural expiration)
3. Make an API request (navigate to a page that fetches data)

**Expected Result:**
- Request fails with 401
- Automatic refresh token request sent
- New tokens received and stored
- Original request retried successfully
- No redirect to login
- User doesn't notice anything

**Simulate Token Expiration:**
```javascript
// In browser console
localStorage.setItem('accessToken', 'invalid-token');
// Then navigate to a page that makes API calls
```

---

### ⏰ Test 7: Session Expiration
**Steps:**
1. Login successfully
2. Manually invalidate both tokens
3. Make an API request

**Expected Result:**
- Refresh token request fails
- All tokens cleared
- Redirected to `/login`

**Simulate:**
```javascript
// In browser console
localStorage.setItem('accessToken', 'invalid');
localStorage.setItem('refreshToken', 'invalid');
// Then navigate to a page that makes API calls
```

---

### 🔙 Test 8: Navigation Flow
**Steps:**
1. Start at `/login`
2. Click "Forgot password?"
3. Click "Back to login"
4. Click "Forgot password?" again
5. Enter email and submit
6. On OTP step, click "Back to email"
7. Re-enter email and submit
8. Verify OTP
9. On set password page, click "Back to login"

**Expected Result:**
- All navigation works smoothly
- State resets appropriately
- No errors in console

---

## Common Issues & Solutions

### Issue: "Login failed: Backend returned an invalid or missing token"
**Cause:** Backend response structure doesn't match expected format
**Solution:** Check backend response in Network tab, update token extraction logic in `login.tsx`

### Issue: OTP not received
**Cause:** Email service not configured on backend
**Solution:** Check backend logs, verify email service configuration

### Issue: Redirect loop between login and dashboard
**Cause:** Token validation issue
**Solution:** 
```javascript
// Clear all storage
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Then try login again
```

### Issue: "Cannot find module" errors
**Cause:** Import paths incorrect
**Solution:** Verify all import paths are correct, run `npm install`

### Issue: CORS errors
**Cause:** Backend CORS not configured for frontend URL
**Solution:** Update backend CORS settings to allow `http://localhost:5173`

---

## Browser DevTools Checklist

### Network Tab
- [ ] Login request returns 200 with tokens
- [ ] Forgot password returns 200
- [ ] OTP verify returns 200
- [ ] Set password returns 200
- [ ] Logout returns 200
- [ ] Protected route requests include Authorization header
- [ ] Token refresh happens automatically on 401

### Console Tab
- [ ] No errors during login
- [ ] No errors during password reset
- [ ] No errors during logout
- [ ] Token refresh logs visible (if enabled)

### Application Tab → Local Storage
- [ ] `accessToken` present after login
- [ ] `refreshToken` present after login
- [ ] `email` present after login
- [ ] All cleared after logout

### Application Tab → Cookies
- [ ] `accessToken` cookie present after login
- [ ] `refreshToken` cookie present after login
- [ ] Both cleared after logout

---

## API Response Examples

### Login Success
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Forgot Password Success
```json
{
  "message": "OTP sent to email"
}
```

### OTP Verify Success
```json
{
  "message": "OTP verified successfully"
}
```

### Set Password Success
```json
{
  "message": "Password updated successfully"
}
```

### Logout Success
```json
{
  "message": "Logged out successfully"
}
```

---

## Performance Metrics

### Expected Load Times
- Login: < 1 second
- Forgot password: < 1 second
- OTP verify: < 1 second
- Set password: < 1 second
- Logout: < 500ms
- Token refresh: < 500ms

### Expected User Experience
- No page flickers during token refresh
- Smooth transitions between auth pages
- Clear loading states
- Helpful error messages
- No console errors

---

## Accessibility Checklist
- [ ] All forms keyboard navigable
- [ ] Tab order logical
- [ ] Error messages announced
- [ ] Loading states indicated
- [ ] Focus visible on all interactive elements
- [ ] Labels associated with inputs

---

## Security Checklist
- [ ] Passwords not visible in network requests
- [ ] Tokens not logged to console in production
- [ ] OTP codes not visible in URL
- [ ] Email addresses validated
- [ ] Password strength enforced
- [ ] Session invalidated on backend logout
- [ ] Tokens cleared on logout
- [ ] Automatic logout on token expiration
