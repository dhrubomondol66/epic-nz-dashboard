/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { saveTokens } from "../../lib/axios";
import { useLoginMutation } from "../../redux/features/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [login] = useLoginMutation();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = (await login({ email: email.trim(), password }).unwrap()) as any;

      console.log("Login response:", response);

      let accessToken = response?.data?.accessToken || response?.accessToken || response?.token;
      let refreshToken = response?.data?.refreshToken || response?.refreshToken;

      if (!accessToken && response?.data?.data?.accessToken) {
        accessToken = response.data.data.accessToken;
        refreshToken = response.data.data.refreshToken;
      }

      console.log("Extracted tokens:", { accessToken, refreshToken });

      if (!accessToken || accessToken === "undefined") {
        console.error("Token validation failed:", { accessToken, response });
        setError("Login failed: Backend returned an invalid or missing token.");
        return;
      }

      saveTokens(accessToken, refreshToken, email.trim());

      console.log("Tokens saved, checking immediately:", {
        cookieToken: Cookies.get("accessToken"),
        localStorageToken: localStorage.getItem("accessToken"),
        path: "/dashboard"
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Invalid login credentials. Please try again.";
      setError(message);
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
              placeholder="admin@example.com"
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