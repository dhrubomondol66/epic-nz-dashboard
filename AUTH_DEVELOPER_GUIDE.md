# Auth System - Developer Quick Reference

## 🚀 Quick Start

### Using Auth Hooks in Components

```typescript
import { 
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useSetPasswordMutation,
  useLogoutMutation 
} from "../../redux/features/auth";

// In your component
const [login, { isLoading, error }] = useLoginMutation();
const [logout] = useLogoutMutation();
```

### Login Example
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login({ email, password }).unwrap();
    // Tokens automatically stored
    navigate("/dashboard");
  } catch (error: any) {
    console.error("Login failed:", error);
    setError(error?.data?.message || "Login failed");
  }
};
```

### Logout Example
```typescript
import { clearTokens } from "../../lib/axios";
import { useLogoutMutation } from "../../redux/features/auth";

const [logout] = useLogoutMutation();

const handleLogout = async () => {
  try {
    await logout().unwrap();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearTokens();
    window.location.href = "/login";
  }
};
```

### Password Reset Example
```typescript
// Step 1: Send OTP
const [forgotPassword] = useForgotPasswordMutation();
await forgotPassword({ email }).unwrap();

// Step 2: Verify OTP
const [verifyOtp] = useVerifyOtpMutation();
await verifyOtp({ email, otp }).unwrap();

// Step 3: Set new password
const [setPassword] = useSetPasswordMutation();
await setPassword({ 
  email, 
  password, 
  confirm_password 
}).unwrap();
```

---

## 🔐 Token Management

### Check if User is Authenticated
```typescript
import Cookies from "js-cookie";

const isAuthenticated = () => {
  const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
  return token && token !== "undefined";
};
```

### Get Current User Email
```typescript
const userEmail = localStorage.getItem("email");
```

### Clear All Auth Data
```typescript
import { clearTokens } from "../../lib/axios";

clearTokens(); // Clears tokens and email from cookies and localStorage
```

### Manual Token Storage (if needed)
```typescript
import Cookies from "js-cookie";

// Store tokens
Cookies.set("accessToken", token, { expires: 1, path: "/" });
localStorage.setItem("accessToken", token);

// Store email
localStorage.setItem("email", userEmail);
```

---

## 🛡️ Protected Routes

### Creating a Protected Route
```typescript
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function RequireAuth() {
  const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
  
  if (!token || token === "undefined") {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

// In App.tsx
<Route element={<RequireAuth />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>
```

### Programmatic Navigation After Auth
```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// After successful login
navigate("/dashboard", { replace: true });

// After logout
navigate("/login", { replace: true });
// OR
window.location.href = "/login"; // Full page reload
```

---

## 📡 API Requests with Auth

### Axios Instance (Auto-includes Auth Header)
```typescript
import { axiosInstance } from "../lib/axios";

// GET request
const response = await axiosInstance.get("/api/users");

// POST request
const response = await axiosInstance.post("/api/data", { 
  key: "value" 
});

// The Authorization header is automatically added by the interceptor
```

### RTK Query Endpoint with Auth
```typescript
import { baseApi } from "../baseApi";

const myApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "user/profile",
        method: "GET",
      }),
      // Auth header automatically added
    }),
  }),
});
```

---

## 🔄 Token Refresh

### Automatic Refresh (Already Configured)
The axios interceptor automatically:
1. Detects 401 errors
2. Attempts to refresh the token
3. Retries the original request
4. Redirects to login if refresh fails

### Manual Refresh (if needed)
```typescript
import { axiosInstance } from "../lib/axios";

const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  
  if (!refresh) {
    throw new Error("No refresh token");
  }
  
  const response = await axiosInstance.post("/auth/refresh-token", {
    refreshToken: refresh
  });
  
  const { accessToken, refreshToken: newRefresh } = response.data.data;
  
  // Store new tokens
  Cookies.set("accessToken", accessToken, { expires: 1, path: "/" });
  localStorage.setItem("accessToken", accessToken);
  
  if (newRefresh) {
    Cookies.set("refreshToken", newRefresh, { expires: 7, path: "/" });
    localStorage.setItem("refreshToken", newRefresh);
  }
};
```

---

## 🎨 UI Components

### Password Strength Indicator
```typescript
const passwordStrength = (pwd: string) => {
  if (pwd.length === 0) return { label: "", color: "bg-gray-200", width: "w-0" };
  if (pwd.length < 6) return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
  if (pwd.length < 8) return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
  if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
    return { label: "Fair", color: "bg-yellow-400", width: "w-3/4" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
};

const strength = passwordStrength(password);

// In JSX
<div className={`h-1.5 ${strength.color} ${strength.width}`} />
<p className="text-xs">{strength.label}</p>
```

### Password Match Indicator
```typescript
{confirmPassword.length > 0 && (
  <p className={`text-xs ${
    password === confirmPassword 
      ? "text-emerald-500" 
      : "text-red-400"
  }`}>
    {password === confirmPassword 
      ? "Passwords match" 
      : "Passwords do not match"}
  </p>
)}
```

### Loading Button
```typescript
<button
  type="submit"
  disabled={loading}
  className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
>
  {loading ? "Loading..." : "Submit"}
</button>
```

### Error Display
```typescript
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
    <p className="text-red-600 text-sm">{error}</p>
  </div>
)}
```

---

## 🐛 Debugging

### Check Auth State
```typescript
// In browser console
console.log({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  email: localStorage.getItem('email'),
  cookies: document.cookie
});
```

### Enable Axios Logging
The axios interceptor already logs token usage:
```
Axios Interceptor: Sending token eyJhbGciOi...
```

### Clear All Auth Data (Reset)
```typescript
// In browser console
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Test Token Expiration
```typescript
// In browser console
localStorage.setItem('accessToken', 'invalid-token');
// Then make an API request to trigger refresh
```

---

## 📋 API Endpoints Reference

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken }` |
| `/admin/forget-password` | POST | `{ email }` | `{ message }` |
| `/otp/forgot-password-verify-otp` | POST | `{ email, otp }` | `{ message }` |
| `/auth/set-password` | POST | `{ email, password, confirm_password }` | `{ message }` |
| `/auth/logout` | POST | - | `{ message }` |
| `/auth/refresh-token` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` |

---

## ⚙️ Configuration

### Token Expiration
```typescript
// In lib/axios.ts
Cookies.set("accessToken", token, { expires: 1 }); // 1 day
Cookies.set("refreshToken", token, { expires: 7 }); // 7 days
```

### API Base URL
```typescript
// In src/config.ts or .env
export default {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
};
```

### Public Endpoints (No Auth Required)
```typescript
// In lib/axios.ts
const isPublicAuthEndpoint = (url: string) => {
  return (
    url.includes("auth/login") ||
    url.includes("admin/forget-password") ||
    url.includes("otp/forgot-password-verify-otp") ||
    url.includes("auth/set-password") ||
    url.includes("auth/refresh-token")
  );
};
```

---

## 🎯 Common Patterns

### Conditional Rendering Based on Auth
```typescript
import Cookies from "js-cookie";

const isLoggedIn = Cookies.get("accessToken") || localStorage.getItem("accessToken");

return (
  <div>
    {isLoggedIn ? (
      <Dashboard />
    ) : (
      <Login />
    )}
  </div>
);
```

### Redirect After Login
```typescript
// Store intended destination before login
sessionStorage.setItem("redirectAfterLogin", "/profile");

// After successful login
const redirect = sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
sessionStorage.removeItem("redirectAfterLogin");
navigate(redirect);
```

### Remember Email
```typescript
// On login page load
const [email, setEmail] = useState(() => 
  localStorage.getItem("email") || ""
);

// After successful login
localStorage.setItem("email", email);
```

### Logout from Anywhere
```typescript
// Create a custom hook
import { useLogoutMutation } from "../redux/features/auth";
import { clearTokens } from "../lib/axios";

export const useLogout = () => {
  const [logoutMutation] = useLogoutMutation();
  
  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      window.location.href = "/login";
    }
  };
  
  return logout;
};

// Use in any component
const logout = useLogout();
<button onClick={logout}>Logout</button>
```

---

## 🔍 Type Definitions

```typescript
// Auth mutation types
type LoginRequest = { email: string; password: string };
type LoginResponse = { accessToken: string; refreshToken: string };

type ForgotPasswordRequest = { email: string };
type VerifyOtpRequest = { email: string; otp: string };
type SetPasswordRequest = { 
  email: string; 
  password: string; 
  confirm_password: string 
};

// Hook return types
const [login, { isLoading, error, data }] = useLoginMutation();
// isLoading: boolean
// error: FetchBaseQueryError | SerializedError | undefined
// data: LoginResponse | undefined
```

---

## 📝 Best Practices

1. **Always use try-catch** with auth mutations
2. **Show loading states** during async operations
3. **Display user-friendly error messages**
4. **Clear sensitive data** on logout
5. **Use replace: true** for auth redirects to prevent back button issues
6. **Validate inputs** before submitting
7. **Handle network errors** gracefully
8. **Test token expiration** scenarios
9. **Keep tokens secure** (don't log in production)
10. **Use TypeScript** for type safety

---

## 🚨 Security Reminders

- ✅ Never log tokens in production
- ✅ Always clear tokens on logout
- ✅ Use HTTPS in production
- ✅ Validate all inputs
- ✅ Handle errors gracefully
- ✅ Implement rate limiting on backend
- ✅ Use strong password requirements
- ✅ Implement OTP expiration on backend
- ✅ Invalidate sessions on backend logout
- ✅ Use HTTP-only cookies for tokens (recommended)
