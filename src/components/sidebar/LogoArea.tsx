import logo from "../../assets/images/logo.png";
import MessengerIcon from "../svg/Messenger";
import { NavLink } from "react-router-dom";
import { useGetChatUsersQuery } from "../../redux/features/chat";

export default function LogoArea() {
  const { data: chatData = [] } = useGetChatUsersQuery(undefined, { pollingInterval: 10000 });
  const unreadMsgCount = chatData.reduce((acc, user) => acc + (user.unreadCount || 0), 0);

  return (
    <>
      <div className="py-[13px] px-[11px] border-b border-[rgba(59,175,122,0.2)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <a href="/">
              <div className="w-[130px] h-[29px] object-contain">
                <img src={logo} alt="logo" />
              </div>
            </a>
            <h4 className="text-[rgba(245,245,245,0.49)] font-inter text-[14px] font-normal leading-normal mt-1">
              Outdoor Admin
            </h4>
          </div>

          {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3BB774] to-[#2d8f5c] flex items-center justify-center shadow-lg shadow-[#3BB774]/20 relative">
            <NavLink
              to="/system/chat"
              className={({ isActive }) => `
                p-2 rounded-[8px] transition-colors relative
                ${isActive
                  ? 'bg-[#3BAF7A] text-white'
                  : 'text-[#FAFAFA] hover:bg-[#3BAF7A]/10'
                }
              `}
              title="Messages"
            >
              <MessengerIcon />
              {unreadMsgCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
                </span>
              )}
            </NavLink>
          </div> */}
        </div>
      </div>
    </>
  );
}