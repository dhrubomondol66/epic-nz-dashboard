import { useState } from "react";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import TypeButton from "../epicLocation/TypeButton";
import { useGetHikesLocationsQuery } from "../../redux/features/locationApi";
import EditLocationModal from "../common/EditLocationModal";

export default function HikeLocation() {
  const { data: locations, isLoading } = useGetHikesLocationsQuery();
  const [editingLocation, setEditingLocation] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#3BB774] animate-spin" />
      </div>
    );
  }

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
      {locations?.map((location: any) => (
        <div
          key={location._id || location.id}
          className="grid grid-cols-12 gap-4 py-6 px-6 border-b  border-[#2D2D2D] items-center"
        >
          {/* Location */}
          <div className="col-span-3 flex items-center gap-3">
            <img
              src={location.images?.[0] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop"}
              alt={location.name}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <h3 className="font-bold text-[#F5F5F5] text-[16px]">
                {location.name}
              </h3>
              <p className="text-sm font-inter text-zinc-400 mt-1.5 line-clamp-2">
                {location.description}
              </p>
            </div>
          </div>

          {/* Type */}
          <TypeButton type={location.category || "Hike"} bg="bg-[#1D4ED8]" />

          {/* Coordinates */}
          <div className="col-span-2 text-[14px] font-medium text-white">
            {location.latitude && location.longitude 
              ? `${parseFloat(location.latitude).toFixed(4)}, ${parseFloat(location.longitude).toFixed(4)}`
              : "N/A"}
          </div>

          {/* Status */}
          <div className="col-span-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[14px] font-normal text-white ${
              location.status === "APPROVED" || location.status === "Published" ? "bg-[#359367]" : "bg-zinc-700"
            }`}>
              {location.status || "Pending"}
            </span>
          </div>

          {/* Updated */}
          <div className="col-span-2 text-[14px] font-normal text-white">
            {location.updatedAt ? new Date(location.updatedAt).toLocaleDateString() : "2025-02-10"}
          </div>

          {/* Actions */}
          <div className="col-span-1 flex items-center gap-5">
            <button className="cursor-pointer hover:text-[#3BB774] transition-colors">
              <Eye size={20} color="white" />
            </button>
            <button 
              onClick={() => setEditingLocation(location)}
              className="cursor-pointer hover:text-[#3BB774] transition-colors"
            >
              <FiEdit color="white" size={20} />
            </button>
            <button
              className="cursor-pointer hover:scale-110 transition-transform"
            >
              <Trash2 size={20} className="text-[#BE0000]" />
            </button>
          </div>
        </div>
      ))}

      {editingLocation && (
        <EditLocationModal 
          location={editingLocation} 
          onClose={() => setEditingLocation(null)} 
        />
      )}
    </div>
  );
}
