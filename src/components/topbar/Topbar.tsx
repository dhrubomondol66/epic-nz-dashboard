/* eslint-disable @typescript-eslint/no-explicit-any */
import profile from "../../assets/images/profile.png";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useGetMyNotificationsQuery } from "../../redux/features/notificationApi";

export default function Topbar() {
  const navigate = useNavigate();
  const { data: notifData } = useGetMyNotificationsQuery(
    { page: 1, limit: 100 }, // Fetch ALL notifications (read + unread) for total count
    {
      pollingInterval: 5000, // Refresh every 5 seconds
      refetchOnFocus: true, // Refetch on focus
      refetchOnReconnect: true, // Refetch on reconnect
      refetchOnMountOrArgChange: true, // Refetch on mount or argument change
    }
  );


  // Count only unread notifications
  const unreadNotifCount = (notifData?.notifications || []).filter((n: any) => !n.isRead).length;

  const handleBellClick = async () => {
    navigate("/system/notification"); // Navigate to notifications page
  };

  const itemCls = "flex items-center gap-2.5 p-[10px] text-[14px] leading-[18px] tracking-[0] font-inter text-[#FAFAFA]";
  const pillActive = "text-[#FAFAFA] font-medium rounded-[8px] hover:bg-[#3BAF7A]/10";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[rgba(59,175,122,0.2)] justify-end pr-12">
      {/* Notification Icon */}
      <NavLink
        to="/system/notification"
        className={({ isActive }) =>
          `${itemCls} ${isActive ? pillActive : ""} relative`
        }
        onClick={async (e) => {
          e.preventDefault(); // Prevent default navigation
          await handleBellClick(); // Mark notifications as read on bell click
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3BB774] to-[#2d8f5c] flex items-center justify-center shadow-lg shadow-[#3BB774]/20 relative">
          <Bell className="text-white" size={22} />
          {unreadNotifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#070A09]"
            >
              {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
            </span>
          )}
        </div>
      </NavLink>

      {/* Profile Icon */}
      <div className="w-9 h-9">
        <a href="#">
          <img src={profile} alt="profile" />
        </a>
      </div>

      <div>
        <h4 className="text-[#F5F5F5] font-inter text-[14px] font-medium leading-[18px] tracking-[0] capitalize">
          Admin
        </h4>
      </div>
    </div>
  );
}