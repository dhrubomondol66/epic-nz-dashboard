import { clearTokens } from "../../lib/axios";
import { useLogoutMutation } from "../../redux/features/auth";
import LogoutIcon from "../svg/LogoutIcon";
import LogoArea from "./LogoArea";
import Navigation from "./Navigation";

export default function Sidebar() {
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await logout().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Clear tokens and redirect
      clearTokens();
      window.location.href = "/login";
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <div>
        <LogoArea />
        <Navigation />
      </div>
      <div className="px-2 py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 py-2 px-3 text-[14px] leading-[18px] tracking-[0] font-inter text-[#E55252]"
        >
          <LogoutIcon />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}