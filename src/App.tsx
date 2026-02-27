import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "./components/auth/login";
import Dashboard from "./pages/Dashboard";
import EpicLocation from "./pages/EpicLocation";
import Hikes from "./pages/Hikes";
import Campgrounds from "./pages/Campgrounds";
import Freedom from "./pages/Freedom";
import Submission from "./pages/Submission";
import Subscription from "./pages/Subscription";
import ActivityLog from "./pages/activitylog";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/analytics";
import Chat from "./pages/chat";
import ForgotPassword from "./components/auth/forgotpassword";
import SetPassword from "./components/auth/setpassword";

function RequireAuth() {
  const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
  if (!token || token === "undefined") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/location/epic" element={<EpicLocation />} />
          <Route path="/location/hikes" element={<Hikes />} />
          <Route path="/location/campgrounds" element={<Campgrounds />} />
          <Route path="/location/freedom-camp" element={<Freedom />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/system/subscription" element={<Subscription />} />
          <Route path="/system/notification" element={<Notifications />} />
          <Route path="/system/activity-log" element={<ActivityLog />} />
          <Route path="/advance/analytics" element={<Analytics />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
