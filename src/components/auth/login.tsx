import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/features/auth";


const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [login] = useLoginMutation();

  const saveTokens = (accessToken?: string, refreshToken?: string, userEmail?: string) => {
    if (accessToken && accessToken !== "undefined") {
      Cookies.set("accessToken", accessToken, { expires: 1, path: "/" });
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken && refreshToken !== "undefined") {
      Cookies.set("refreshToken", refreshToken, { expires: 7, path: "/" });
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (userEmail) {
      localStorage.setItem("email", userEmail);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = (await login({ email, password }).unwrap()) as any;

      // Extract token from either response.data or response directly
      let accessToken = response?.data?.accessToken || response?.accessToken || response?.token;
      let refreshToken = response?.data?.refreshToken || response?.refreshToken;

      // Sometimes data is nested inside another 'data' property
      if (!accessToken && response?.data?.data?.accessToken) {
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
      }

      if (!accessToken || accessToken === "undefined") {
        setError("Login failed: Backend returned an invalid or missing token.");
        return;
      }

      saveTokens(accessToken, refreshToken, email);

      // Redirect user after login
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setError(error?.data?.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              placeholder="luisdomench@Gmail.Com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <a href="/forgot-password" className="text-sm text-gray-400 hover:text-gray-600 transition">
          Forgot password?
        </a>
      </div>
    </div>
  );
};

export default AdminLogin;
