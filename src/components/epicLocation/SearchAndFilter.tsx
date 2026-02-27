import { useState } from "react";
import { Search, ChevronDown, List } from "lucide-react";
import MapIcon from "../svg/MapIcon";

export default function SearchAndFilter() {
  const [activeView, setActiveView] = useState("table");

  return (
    <div className="w-full flex items-center justify-between gap-10">
      {/* Search Section */}
      <div className="flex-1 w-full relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Locations"
            className="w-full bg-[#131D34] text-[16px] font-inter font-normal text-[#C3C3C3] placeholder-[#C3C3C3] pl-10 pr-4 py-2.5 rounded-lg border-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-11">
        {/* Status Dropdown */}
        <button className="flex items-center gap-2 px-4 py-3 cursor-pointer bg-[#131D34] text-[#C3C3C3] font-inter font-normal rounded-lg">
          <span className="text-sm">All Status</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* View Toggle */}
        <div className="flex items-center gap-4 bg-slate-800 rounded-lg overflow-hidden p-1">
          {/* Table View */}
          <button
            onClick={() => setActiveView("table")}
            className={`flex items-center gap-2 px-4 py-2 transition-colors cursor-pointer ${
              activeView === "table"
                ? "bg-emerald-600 text-white rounded-lg"
                : "text-slate-400 hover:text-white rounded-lg"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-[16px] text-[#F8FAFC] font-normal">
              Table
            </span>
          </button>

          {/* Maps View */}
          <button
            onClick={() => setActiveView("maps")}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors border-none ${
              activeView === "maps"
                ? "bg-emerald-600 text-white rounded-lg"
                : "text-slate-400 hover:text-white rounded-lg"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <MapIcon />
            </div>
            <span className="text-sm font-medium text-white">Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
