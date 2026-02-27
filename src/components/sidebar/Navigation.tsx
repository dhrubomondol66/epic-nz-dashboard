/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Chevron from "../svg/Chevron";
import Submition from "../svg/Submition";
import Subscription from "../svg/Subscription";
import ActiveLog from "../svg/ActiveLog";
import Advance from "../svg/Advance";
import Analytics from "../svg/Analytics";
import MessengerIcon from "../svg/Messenger";
import { useGetMyNotificationsQuery } from "../../redux/features/notificationApi";
import { RxDashboard } from "react-icons/rx";
import { IoSettingsOutline } from "react-icons/io5";

export default function Navigation() {
  const [openSystem, setOpenSystem] = useState(true);
  const [openAdvance, setOpenAdvance] = useState(true);
  const { data: notifications } = useGetMyNotificationsQuery(
    { page: 1, limit: 100, isRead: false },
    { pollingInterval: 3000, refetchOnFocus: true, refetchOnReconnect: true }
  );

  // Total unread messages (CHAT_MESSAGE type only)
  const totalUnreadMessages = (notifications?.notifications || []).filter(
    (n: any) => n.type === "CHAT_MESSAGE" && !n.isRead
  ).length;

  // Calculate unread submissions
  const submissionUnreadCount = (notifications?.notifications || []).filter(
    (n: any) => n.type === "LOCATION_SUBMITTED" && !n.isRead
  ).length;

  const itemCls =
    "flex items-center gap-2.5 p-[10px] text-[14px] leading-[18px] tracking-[0] font-inter text-[#FAFAFA]";
  const pillActive = "bg-[#3BAF7A] text-[#FAFAFA] font-medium rounded-[8px]";
  const sectionTitleCls =
    "flex items-center justify-between py-2 px-3 text-[14px] leading-[18px] font-inter text-[rgba(245,245,245,0.57)] w-full";

  return (
    <div>
      <nav className="pl-3 pr-4 flex flex-col gap-5 mt-6">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${itemCls} ${isActive ? pillActive : ""}`
          }
        >
          <RxDashboard />
          <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/submission"
          className={({ isActive }) =>
            `${itemCls} ${isActive ? pillActive : ""} relative`
          }
        >
          <Submition />
          <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
            Submission
          </span>
          {submissionUnreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#070A09]">
              {submissionUnreadCount > 99 ? "99+" : submissionUnreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `${itemCls} ${isActive ? pillActive : ""} relative`
          }
        >
          <MessengerIcon />
          <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
            Messages
          </span>
          {totalUnreadMessages > 0 && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#070A09]">
              {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
            </span>
          )}
        </NavLink>

        <button
          type="button"
          className={sectionTitleCls}
          onClick={() => setOpenSystem((v) => !v)}
        >
          <span className="flex items-center gap-2.5">
            <IoSettingsOutline className="w-[18px] h-[18px] text-[#F5F5F5]" />
            <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
              System
            </span>
          </span>
          <Chevron openSystem={openSystem} />
        </button>

        {openSystem && (
          <div className="pl-6 flex flex-col gap-2.5">
            <NavLink
              to="/system/subscription"
              className={({ isActive }) =>
                `${itemCls} ${isActive ? pillActive : ""}`
              }
            >
              <Subscription />
              <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
                Subscription
              </span>
            </NavLink>
            <NavLink
              to="/system/activity-log"
              className={({ isActive }) =>
                `${itemCls} ${isActive ? pillActive : ""}`
              }
            >
              <ActiveLog />
              <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
                Activity Log
              </span>
            </NavLink>
          </div>
        )}

        <button
          type="button"
          className={sectionTitleCls}
          onClick={() => setOpenAdvance((v) => !v)}
        >
          <span className="flex items-center gap-2.5">
            <Advance />
            <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
              Advance
            </span>
          </span>
          <Chevron openSystem={openAdvance} />
        </button>
        {openAdvance && (
          <div className="pl-6">
            <NavLink
              to="/advance/analytics"
              className={({ isActive }) =>
                `${itemCls} ${isActive ? pillActive : ""}`
              }
            >
              <Analytics />
              <span className="text-[#FAFAFA] font-inter text-[16px] font-normal leading-normal">
                Analytics
              </span>
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}