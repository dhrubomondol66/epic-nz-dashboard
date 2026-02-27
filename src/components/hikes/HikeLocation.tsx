import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import TypeButton from "../epicLocation/TypeButton";

export default function HikeLocation() {
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Lake Pukaki",
      description: "A Breathtaking Glacial...",
      type: "Freedom Camp",
      coordinates: "44.56456 S, 46.4154 E",
      status: "Published",
      updated: "2025-02-10",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
    },
  ]);

  const handleDelete = (id: number) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  return (
    <div className="bg-zinc-950 rounded-lg overflow-hidden border border-[#12271F] px-6">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 pt-3 pb-7 border-b border-[#2D2D2D] text-sm text-white font-medium px-6">
        <div className="col-span-3">Location</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Coordinates</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Updated</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Rows */}
      {locations.map((location) => (
        <div
          key={location.id}
          className="grid grid-cols-12 gap-4 py-6 px-6 border-b  border-[#2D2D2D] items-center"
        >
          {/* Location */}
          <div className="col-span-3 flex items-center gap-3">
            <img
              src={location.image}
              alt={location.name}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <h3 className="font-bold text-[#F5F5F5] text-[16px]">
                {location.name}
              </h3>
              <p className="text-sm font-inter text-zinc-400 mt-1.5">
                {location.description}
              </p>
            </div>
          </div>

          {/* Type */}
          <TypeButton type={location.type} bg="bg-[#60A5FA]" />

          {/* Coordinates */}
          <div className="col-span-2 text-[14px] font-medium text-white">
            {location.coordinates}
          </div>

          {/* Status */}
          <div className="col-span-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-normal bg-[#359367] text-white">
              {location.status}
            </span>
          </div>

          {/* Updated */}
          <div className="col-span-2 text-[14px] font-normal text-white">
            {location.updated}
          </div>

          {/* Actions */}
          <div className="col-span-1 flex items-center gap-5">
            <button className="cursor-pointer">
              <Eye size={20} color="white" />
            </button>
            <button className="cursor-pointer">
              <FiEdit color="white" size={20} />
            </button>
            <button
              onClick={() => handleDelete(location.id)}
              className="cursor-pointer"
            >
              <Trash2 size={20} className="text-[#BE0000]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
