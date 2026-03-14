/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Loader2, Map } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapPickerModalProps {
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
    initialLat?: string | number;
    initialLng?: string | number;
}

export default function MapPickerModal({
    onSelect,
    onClose,
    initialLat,
    initialLng,
}: MapPickerModalProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng
            ? { lat: typeof initialLat === 'string' ? parseFloat(initialLat) : initialLat, 
                lng: typeof initialLng === 'string' ? parseFloat(initialLng) : initialLng }
            : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const mapboxgl = (window as any).mapboxgl;
        if (!mapboxgl) {
            console.error('Mapbox GL JS not loaded');
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const initialCenter = coords
            ? [coords.lng, coords.lat]
            : [170.5, -45.0]; // New Zealand default

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: initialCenter,
            zoom: coords ? 10 : 5,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // If initial coords, add marker
        if (coords) {
            const marker = new mapboxgl.Marker({ color: '#3BB774', draggable: true })
                .setLngLat([coords.lng, coords.lat])
                .addTo(map);

            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                setCoords({ lat: parseFloat(lngLat.lat.toFixed(6)), lng: parseFloat(lngLat.lng.toFixed(6)) });
            });

            markerRef.current = marker;
        }

        // Click handler
        map.on('click', (e: any) => {
            const { lat, lng } = e.lngLat;
            const roundedLat = parseFloat(lat.toFixed(6));
            const roundedLng = parseFloat(lng.toFixed(6));
            setCoords({ lat: roundedLat, lng: roundedLng });

            if (markerRef.current) {
                markerRef.current.setLngLat([roundedLng, roundedLat]);
            } else {
                const marker = new mapboxgl.Marker({ color: '#3BB774', draggable: true })
                    .setLngLat([roundedLng, roundedLat])
                    .addTo(map);

                marker.on('dragend', () => {
                    const lngLat = marker.getLngLat();
                    setCoords({ lat: parseFloat(lngLat.lat.toFixed(6)), lng: parseFloat(lngLat.lng.toFixed(6)) });
                });

                markerRef.current = marker;
            }
        });

        return () => {
            map.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Search geocoding
    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
            );
            const data = await res.json();
            setSearchResults(data.features || []);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearch(val), 400);
    };

    const selectSearchResult = (feature: any) => {
        const [lng, lat] = feature.center;
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));
        setCoords({ lat: roundedLat, lng: roundedLng });
        setSearchQuery(feature.place_name);
        setSearchResults([]);

        const map = mapRef.current;
        const mapboxgl = (window as any).mapboxgl;
        if (!map || !mapboxgl) return;

        map.flyTo({ center: [roundedLng, roundedLat], zoom: 13 });

        if (markerRef.current) {
            markerRef.current.setLngLat([roundedLng, roundedLat]);
        } else {
            const marker = new mapboxgl.Marker({ color: '#3BB774', draggable: true })
                .setLngLat([roundedLng, roundedLat])
                .addTo(map);

            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                setCoords({ lat: parseFloat(lngLat.lat.toFixed(6)), lng: parseFloat(lngLat.lng.toFixed(6)) });
            });

            markerRef.current = marker;
        }
    };

    const handleConfirm = () => {
        if (coords) {
            onSelect(coords.lat, coords.lng);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#0B0F0D] border border-[#1E2B23] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-black/60 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2B23]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3BB774]/10 rounded-lg flex items-center justify-center">
                            <Map className="w-4 h-4 text-[#3BB774]" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold font-inter text-[15px]">Pick Location</h2>
                            <p className="text-neutral-500 font-inter text-[12px]">Click on the map or search for a place</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInput}
                        placeholder="Search for a place..."
                        className="w-full bg-[#131A16] border border-[#1E2721] rounded-xl px-4 py-3 text-[#FAFAFA] font-inter text-sm focus:border-[#3BB774] focus:outline-none transition-all pr-10"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3BB774] animate-spin" />
                    )}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-6 right-6 mt-1 bg-[#0F1712] border border-[#1E2721] rounded-xl overflow-hidden shadow-xl z-20">
                            {searchResults.map((feature) => (
                                <button
                                    key={feature.id}
                                    type="button"
                                    onClick={() => selectSearchResult(feature)}
                                    className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-[#1A2420] hover:text-white transition-colors font-inter border-b border-[#1E2721] last:border-b-0 flex items-center gap-2"
                                >
                                    <MapPin className="w-3 h-3 text-[#3BB774] flex-shrink-0" />
                                    <span className="truncate">{feature.place_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="px-6 pt-4 pb-4">
                    <div
                        ref={mapContainerRef}
                        className="w-full rounded-xl overflow-hidden border border-[#1E2721]"
                        style={{ height: '380px' }}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {coords ? (
                            <div className="flex items-center gap-2 bg-[#131A16] border border-[#1E2721] rounded-xl px-4 py-2">
                                <MapPin className="w-4 h-4 text-[#3BB774]" />
                                <span className="font-inter text-sm text-neutral-300">
                                    {coords.lat}, {coords.lng}
                                </span>
                            </div>
                        ) : (
                            <p className="text-neutral-500 font-inter text-sm">No location selected</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-[#1E2721] text-neutral-400 font-inter text-sm hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!coords}
                            className="px-5 py-2.5 rounded-xl bg-[#3BB774] hover:bg-[#2d8f5c] disabled:bg-neutral-700 disabled:opacity-50 text-white font-inter text-sm font-semibold transition-all flex items-center gap-2"
                        >
                            <MapPin className="w-4 h-4" />
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
