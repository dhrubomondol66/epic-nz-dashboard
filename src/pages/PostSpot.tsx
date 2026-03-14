/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Camera, MapPin, Upload, X, Loader2, Cloud, ShieldCheck, Wifi, Map } from 'lucide-react';
import Heading from '../components/Dashboard/Heading';
import SIdebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { useCreateLocationMutation } from '../redux/features/locationApi';

// Import Mapbox CSS in your index.html or global CSS:
// <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
// <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>



const CATEGORIES = [
    { label: 'Hike', value: 'Hike' },
    { label: 'Epic Photo Spot', value: 'Epic Photo Spot' },
    { label: 'Campground', value: 'Campground' },
    { label: 'Freedom Camping', value: 'Freedom Camping' },
];

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Foggy'];
const ANIMAL_OPTIONS = ['Pet Friendly', 'Service Animals Only', 'Not Pet Friendly'];
const NETWORK_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Bad'];

import MapPickerModal from '../components/common/MapPickerModal';

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PostSpot() {
    const [createLocation, { isLoading }] = useCreateLocationMutation();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Hike',
        latitude: '',
        longitude: '',
        watererType: '',
        animalClearance: '',
        networkQuality: '',
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Mapbox GL JS is now loaded in index.html for reliability
    useEffect(() => {
        if (!(window as any).mapboxgl) {
            console.warn('Mapbox GL JS should be loaded in index.html');
        }
    }, []);

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
        if (images.length + files.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.latitude || !formData.longitude || images.length === 0) {
            setMessage({ type: 'error', text: 'Please fill all required fields and upload at least one image.' });
            return;
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('latitude', formData.latitude);
        submitData.append('longitude', formData.longitude);
        submitData.append('watererType', formData.watererType);
        submitData.append('animalClearance', formData.animalClearance);
        submitData.append('networkQuality', formData.networkQuality);
        submitData.append('status', 'APPROVED');

        images.forEach(image => {
            submitData.append('image', image);
        });

        try {
            await createLocation(submitData).unwrap();
            setMessage({ type: 'success', text: 'Spot posted successfully! Status: Approved.' });
            setFormData({
                name: '',
                description: '',
                category: 'Hike',
                latitude: '',
                longitude: '',
                watererType: '',
                animalClearance: '',
                networkQuality: '',
            });
            setImages([]);
            setPreviews([]);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err?.data?.message || 'Failed to post spot. Please try again.' });
        }
    };

    const inputCls = "w-full bg-[#131A16] border border-[#1E2721] rounded-xl px-4 py-3 text-[#FAFAFA] font-inter focus:border-[#3BB774] focus:outline-none transition-all";
    const labelCls = "block text-[14px] font-inter font-medium text-neutral-400 mb-2";

    const hasCoords = formData.latitude && formData.longitude;

    return (
        <div className="flex h-screen overflow-hidden bg-[#070A09]">
            <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)] h-full overflow-y-auto custom-scrollbar">
                <SIdebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-10 bg-[#070A09]">
                    <Topbar />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar pl-8 pt-11 text-white pb-20 pr-12">
                    <Heading
                        title="Post New Spot"
                        subTitle="Create a new location directly. Admin posts are automatically approved."
                    />

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-[#3BB774]/10 text-[#3BB774] border border-[#3BB774]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-inter text-sm">{message.text}</span>
                            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-5xl" style={{ minWidth: '100%' }}>
                        {/* Basic Info Container */}
                        <div className="bg-[#090D0C]/40 border border-[#12271F] rounded-2xl p-8 backdrop-blur-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Location Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={inputCls}
                                        placeholder="e.g. Roys Peak Lookout"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelCls}>Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`${inputCls} min-h-[120px] resize-none`}
                                        placeholder="Describe this spot..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={inputCls}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                    </select>
                                </div>

                                {/* Coordinates Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Latitude *</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleInputChange}
                                            className={inputCls}
                                            placeholder="-44.123"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Longitude *</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleInputChange}
                                            className={inputCls}
                                            placeholder="168.123"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Map Picker Button — full width below the two rows */}
                                <div className="md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMapPicker(true)}
                                        className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border transition-all font-inter text-sm font-medium cursor-pointer
                                            ${hasCoords
                                                ? 'border-[#3BB774]/40 bg-[#3BB774]/5 text-[#3BB774] hover:bg-[#3BB774]/10'
                                                : 'border-dashed border-[#1E2721] bg-[#131A16]/50 text-neutral-400 hover:border-[#3BB774]/40 hover:text-[#3BB774] hover:bg-[#3BB774]/5'
                                            }`}
                                    >
                                        <Map className="w-4 h-4" />
                                        {hasCoords
                                            ? `📍 ${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)} — Click to change`
                                            : 'Pick location on map'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Details Container */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#090D0C]/40 border border-[#12271F] rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4 text-[#3BB774]">
                                    <Cloud className="w-5 h-5" />
                                    <h3 className="font-inter font-semibold">Weather</h3>
                                </div>
                                <select
                                    name="watererType"
                                    value={formData.watererType}
                                    onChange={handleInputChange}
                                    className={inputCls}
                                >
                                    <option value="">Select Weather</option>
                                    {WEATHER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div className="bg-[#090D0C]/40 border border-[#12271F] rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4 text-[#3BB774]">
                                    <ShieldCheck className="w-5 h-5" />
                                    <h3 className="font-inter font-semibold">Animal Clearance</h3>
                                </div>
                                <select
                                    name="animalClearance"
                                    value={formData.animalClearance}
                                    onChange={handleInputChange}
                                    className={inputCls}
                                >
                                    <option value="">Select Clearance</option>
                                    {ANIMAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div className="bg-[#090D0C]/40 border border-[#12271F] rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4 text-[#3BB774]">
                                    <Wifi className="w-5 h-5" />
                                    <h3 className="font-inter font-semibold">Network Quality</h3>
                                </div>
                                <select
                                    name="networkQuality"
                                    value={formData.networkQuality}
                                    onChange={handleInputChange}
                                    className={inputCls}
                                >
                                    <option value="">Select Network</option>
                                    {NETWORK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Image Upload Container */}
                        <div className="bg-[#090D0C]/40 border border-[#12271F] rounded-2xl p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-[#3BB774]">
                                    <Camera className="w-5 h-5" />
                                    <h3 className="font-inter font-semibold">Photos (up to 5)</h3>
                                </div>
                                <span className="text-xs text-neutral-500 uppercase tracking-widest">{images.length}/5 Images</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-[#1E2721] group">
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white p-1 shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-[#1E2721] bg-[#131A16]/50 hover:bg-[#131A16] hover:border-[#3BB774]/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                                        <Upload className="w-6 h-6 text-neutral-500 group-hover:text-[#3BB774] transition-colors" />
                                        <span className="text-[12px] text-neutral-500 group-hover:text-neutral-300">Upload Image</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-[#3BB774] hover:bg-[#2d8f5c] disabled:bg-neutral-700 disabled:opacity-50 text-white font-inter font-bold py-4 rounded-xl shadow-lg shadow-[#3BB774]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Posting Spot...</span>
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-5 h-5" />
                                        <span>Post Spot Now</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        name: '',
                                        description: '',
                                        category: 'Hike',
                                        latitude: '',
                                        longitude: '',
                                        watererType: '',
                                        animalClearance: '',
                                        networkQuality: '',
                                    });
                                    setImages([]);
                                    setPreviews([]);
                                }}
                                className="px-8 py-4 rounded-xl border border-[#12271F] hover:bg-white/5 transition-all text-neutral-400 font-inter font-semibold cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Map Picker Modal */}
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