import { useState } from "react";
import { Upload } from "lucide-react";
import Heading from "../Dashboard/Heading";
import SearchAndFilter from "./SearchAndFilter";
import LocationManager from "./LocationManager";
import Map from "../freedom/Map";

export default function MainEpicLocation() {
  const [activeView, setActiveView] = useState("table");

  return (
    <>
      <div className="text-white pl-8 pt-12 flex justify-between items-center pr-12">
        <Heading title="Epic Location" subTitle="Manage your epic location" />
        <button className="bg-[#131D34] rounded-[8px] px-4 py-2 flex items-center gap-3 w-fit cursor-pointer">
          <Upload width={18} height={20} />
          <p className="text-[#C3C3C3] text-[16px] font-inter font-normal">
            bulk import
          </p>
        </button>
      </div>
      {/* search filter with map */}
      <div className="mt-6 pl-9 pr-12">
        <SearchAndFilter activeView={activeView} setActiveView={setActiveView} />
      </div>
      
      {/* location content */}
      <div className="mt-6 pl-9 pr-12">
        {activeView === "table" ? (
          <LocationManager />
        ) : (
          <Map height="60vh" />
        )}
      </div>
    </>
  );
}
