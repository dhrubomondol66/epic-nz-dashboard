import { useState } from "react";
import { X, MapPin, Upload, Loader2, ShieldCheck } from "lucide-react";
import { useUpdateLocationMutation } from "../../redux/features/locationApi";
import MapPickerModal from "./MapPickerModal";

interface EditLocationModalProps {
  location: any;
  onClose: () => void;
}

const CATEGORIES = [
  { label: 'Hike', value: 'Hike' },
  { label: 'Epic Photo Spot', value: 'Epic Photo Spot' },
  { label: 'Campground', value: 'Campground' },
  { label: 'Freedom Camping', value: 'Freedom Camping' },
];

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Foggy'];
const ANIMAL_OPTIONS = ['Pet Friendly', 'Service Animals Only', 'Not Pet Friendly'];
const NETWORK_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Bad'];

export default function EditLocationModal({ location, onClose }: EditLocationModalProps) {
  const [updateLocation, { isLoading }] = useUpdateLocationMutation();
  const [formData, setFormData] = useState({
    name: location.name || "",
    description: location.description || "",
    category: location.category || "Hike",
    latitude: location.latitude || "",
    longitude: location.longitude || "",
    watererType: location.watererType || "",
    animalClearance: location.animalClearance || "",
    networkQuality: location.networkQuality || "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(location.images || []);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // If it's a new image (File object)
    if (index >= (location.images?.length || 0)) {
        const fileIndex = index - (location.images?.length || 0);
        const newImages = [...images];
        newImages.splice(fileIndex, 1);
        setImages(newImages);
    }
    
    const newPreviews = [...previews];
    if (newPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    submitData.append('watererType', formData.watererType);
    submitData.append('animalClearance', formData.animalClearance);
    submitData.append('networkQuality', formData.networkQuality);

    // Filter existing images vs new images
    const existingImages = previews.filter(p => !p.startsWith('blob:'));
    submitData.append('existingImages', JSON.stringify(existingImages));

    images.forEach(image => {
      submitData.append('image', image);
    });

    try {
      await updateLocation({ id: location._id || location.id, data: submitData }).unwrap();
      setMessage({ type: 'success', text: 'Location updated successfully!' });
      setTimeout(onClose, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to update location.' });
    }
  };

  const inputCls = "w-full bg-[#131A16] border border-[#1E2721] rounded-xl px-4 py-3 text-[#FAFAFA] font-inter focus:border-[#3BB774] focus:outline-none transition-all";
  const labelCls = "block text-[14px] font-inter font-medium text-neutral-400 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0B0F0D] border border-[#1E2B23] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B0F0D] flex items-center justify-between px-8 py-6 border-b border-[#1E2B23]">
          <div>
            <h2 className="text-white text-2xl font-bold font-inter">Edit Location</h2>
            <p className="text-neutral-500 font-inter text-sm">Update details for {location.name}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-[#3BB774]/10 text-[#3BB774] border border-[#3BB774]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <ShieldCheck className="w-5 h-5" />
              <span className="font-inter text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className={labelCls}>Location Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputCls} min-h-[120px]`} required />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className={inputCls}>
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Latitude *</label>
                  <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Longitude *</label>
                  <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className={inputCls} required />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMapPicker(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#1E2721] bg-[#131A16]/50 text-neutral-400 hover:border-[#3BB774]/40 hover:text-[#3BB774] transition-all font-inter text-sm"
              >
                <MapPin className="w-4 h-4" />
                Pick from Map
              </button>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelCls}>Weather</label>
                  <select name="watererType" value={formData.watererType} onChange={handleInputChange} className={inputCls}>
                    <option value="">Select Weather</option>
                    {WEATHER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Animal</label>
                    <select name="animalClearance" value={formData.animalClearance} onChange={handleInputChange} className={inputCls}>
                      <option value="">Clearance</option>
                      {ANIMAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Network</label>
                    <select name="networkQuality" value={formData.networkQuality} onChange={handleInputChange} className={inputCls}>
                      <option value="">Quality</option>
                      {NETWORK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Photos (up to 5)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#1E2721] group">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white p-1 hover:bg-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#1E2721] bg-[#131A16]/50 hover:bg-[#131A16] hover:border-[#3BB774]/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                  <Upload className="w-6 h-6 text-neutral-500 group-hover:text-[#3BB774]" />
                  <span className="text-[10px] text-neutral-500">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-xl border border-[#1E2721] text-neutral-400 font-inter font-semibold hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-[2] bg-[#3BB774] hover:bg-[#2d8f5c] disabled:opacity-50 text-white font-inter font-bold py-4 rounded-xl shadow-lg shadow-[#3BB774]/20 transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {isLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {showMapPicker && (
        <MapPickerModal
          onSelect={handleMapSelect}
          onClose={() => setShowMapPicker(false)}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
        />
      )}
    </div>
  );
}
