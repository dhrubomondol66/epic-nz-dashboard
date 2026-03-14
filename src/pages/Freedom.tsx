
import MainFreedom from "../components/freedom/MainFreedom";
import SIdebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";

export default function Freedom() {
  return (
    <div>
      <div className="flex">
        <div className="w-[250px] border-r border-[rgba(59,175,122,0.2)]">
          <SIdebar />
        </div>
        <div className="w-[calc(100%-250px)]">
          <Topbar />
          <MainFreedom/>
        </div>
      </div>
    </div>
  );
}