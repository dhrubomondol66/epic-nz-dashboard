import MainDashboard from "../components/Dashboard/MainDashboard";
import SIdebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";

export default function Dashboard() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)] h-full overflow-y-auto custom-scrollbar">
          <SIdebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-10 bg-[#070A09]">
            <Topbar />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <MainDashboard />
          </div>
        </div>
      </div>
    </>
  );
}
