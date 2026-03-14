import Sidebar from "../sidebar/SIdebar";
import Topbar from "../topbar/Topbar";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#070A09]">
            <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)] h-full overflow-y-auto custom-scrollbar">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-10 bg-[#070A09]">
                    <Topbar />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
