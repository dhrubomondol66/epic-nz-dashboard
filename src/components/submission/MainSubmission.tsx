/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import { Calendar, CircleUser, Eye, Mail, X, MapPin, Globe, Phone, ChevronLeft, ChevronRight, Pause, Play, LayoutGrid, ChevronDown, Filter, Trash, Edit, Map } from "lucide-react";
import MapPickerModal from '../common/MapPickerModal';
import CorrectMarkIcon from "../svg/CorrectMarkIcon";
import EpicLocation from "../svg/EpicLocation";
import Hikes from "../svg/Hikes";
import Campgrounds from "../svg/Campgrounds";
import Camps from "../svg/Camps";

const statusFilters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
];

const categoryFilters = [
    { label: "All Locations", value: "all", icon: <LayoutGrid size={18} /> },
    { label: "Epic Location", value: "Epic Location", icon: <EpicLocation /> },
    { label: "Hikes", value: "Hike", icon: <Hikes /> },
    { label: "Campgrounds", value: "Campground", icon: <Campgrounds /> },
    { label: "Freedom Camp", value: "Freedom Camp", icon: <Camps /> },
];

const MainSubmission = () => {
    const [filter, setFilter] = useState("all");
    const [category, setCategory] = useState("all");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState<any>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [searchParams] = useSearchParams();
    const submissionId = searchParams.get('id');
    const [showMapPicker, setShowMapPicker] = useState(false);


    const fetchPendingCount = async () => {
        try {
            const res = await axiosInstance.get(`location/all?status=PENDING`);
            const responseData = res.data.data;
            const finalData = Array.isArray(responseData) ? responseData : responseData?.result;
            if (finalData && Array.isArray(finalData)) {
                setPendingCount(finalData.length);
            }
        } catch (err) {
            console.error("Failed to fetch pending count", err);
        }
    };

    useEffect(() => {
        fetchPendingCount();
    }, []);

    // Automatically open review modal if ID is in URL
    useEffect(() => {
        if (submissionId && submissions.length > 0) {
            const submissionToOpen = submissions.find(s => s._id === submissionId);
            if (submissionToOpen) {
                setSelectedSubmission(submissionToOpen);
                setShowReviewModal(true);
            }
        }
    }, [submissionId, submissions]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(
                    `location/all?status=${filter === "all" ? "" : filter}&category=${category === "all" ? "" : category}`
                );

                const responseData = response.data.data;
                const finalData = Array.isArray(responseData) ? responseData : responseData?.result;

                if (finalData && Array.isArray(finalData)) {
                    setSubmissions(finalData);
                } else {
                    setSubmissions([]);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Failed to fetch submissions");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [filter, category]);

    // Auto-play carousel
    useEffect(() => {
        if (!showReviewModal || !isAutoPlaying) return;

        const images = !selectedSubmission
            ? []
            : Array.isArray(selectedSubmission.imageUrl)
                ? selectedSubmission.imageUrl
                : [selectedSubmission.imageUrl];

        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [showReviewModal, isAutoPlaying, selectedSubmission]);

    const onApprove = async (id: string) => {
        try {
            await axiosInstance.patch(`location/approve/${id}`, { status: "APPROVED" });
            setShowReviewModal(false);
            // Refetch submissions after approval
            const response = await axiosInstance.get(
                `location/all?status=${filter === "all" ? "" : filter}&category=${category === "all" ? "" : category}`
            );
            const responseData = response.data.data;
            const finalData = Array.isArray(responseData) ? responseData : responseData?.result;
            if (finalData && Array.isArray(finalData)) {
                setSubmissions(finalData);
            }
            fetchPendingCount();
        } catch (err) {
            console.error("Failed to approve:", err);
            alert("Failed to approve submission");
        }
    };

    const onReject = async (id: string) => {
        try {
            await axiosInstance.patch(`location/reject/${id}`, { status: "REJECTED" });
            setShowReviewModal(false);
            // Refetch submissions after rejection
            const response = await axiosInstance.get(
                `location/all?status=${filter === "all" ? "" : filter}&category=${category === "all" ? "" : category}`
            );
            const responseData = response.data.data;
            const finalData = Array.isArray(responseData) ? responseData : responseData?.result;
            if (finalData && Array.isArray(finalData)) {
                setSubmissions(finalData);
            }
            fetchPendingCount();
        } catch (err) {
            console.error("Failed to reject:", err);
            alert("Failed to reject submission");
        }
    };

    const onDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this submission?")) return;
        try {
            await axiosInstance.delete(`location/delete/${id}`);
            setShowReviewModal(false);
            // Refetch submissions after deletion
            const response = await axiosInstance.get(
                `location/all?status=${filter === "all" ? "" : filter}&category=${category === "all" ? "" : category}`
            );
            const responseData = response.data.data;
            const finalData = Array.isArray(responseData) ? responseData : responseData?.result;
            if (finalData && Array.isArray(finalData)) {
                setSubmissions(finalData);
            }
            fetchPendingCount();
        } catch (err) {
            console.error("Failed to delete:", err);
            alert("Failed to delete submission");
        }
    };

    const openEditModal = (submission: any) => {
        setSelectedSubmission(submission);
        
        // Comprehensive coordinate extraction
        let lat = "";
        let lng = "";

        if (submission.latitude) lat = String(submission.latitude);
        else if (submission.lat) lat = String(submission.lat);

        if (submission.longitude) lng = String(submission.longitude);
        else if (submission.lng) lng = String(submission.lng);
        else if (submission.long) lng = String(submission.long);

        // Fallback to coordinates or location fields
        if (!lat || !lng) {
            const coords = submission.coordinates || submission.location;
            if (typeof coords === 'string') {
                const parts = coords.includes(',') ? coords.split(',') : coords.split(' ');
                if (parts.length >= 2) {
                    if (!lat) lat = parts[0].trim();
                    if (!lng) lng = parts[1].trim();
                }
            } else if (Array.isArray(coords) && coords.length >= 2) {
                if (!lat) lat = String(coords[0]);
                if (!lng) lng = String(coords[1]);
            } else if (typeof coords === 'object' && coords !== null) {
                if (!lat) lat = String(coords.lat || coords.latitude || "");
                if (!lng) lng = String(coords.lng || coords.long || coords.longitude || "");
            }
        }

        setEditFormData({
            name: submission.name,
            description: submission.description || "",
            address: submission.address || "",
            website: submission.website || "",
            phone: submission.phone || "",
            latitude: lat,
            longitude: lng
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedSubmission(null);
        setEditFormData(null);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission || !editFormData) return;

        try {
            // Prepare payload as JSON for better compatibility with numeric fields
            // Also include Latitude/Longitude separate and together for compatibility
            const payload: any = {
                ...editFormData,
                latitude: editFormData.latitude ? String(editFormData.latitude) : "",
                longitude: editFormData.longitude ? String(editFormData.longitude) : "",
                coordinates: (editFormData.latitude && editFormData.longitude) 
                             ? `${editFormData.latitude}, ${editFormData.longitude}` 
                             : (selectedSubmission.coordinates || "")
            };

            await axiosInstance.patch(`location/update/${selectedSubmission._id}`, payload);
            
            // Update selectedSubmission locally so the UI updates immediately
            const updatedData = { ...selectedSubmission, ...payload };
            setSelectedSubmission(updatedData);
            
            // Update the submissions list locally
            setSubmissions((prev: any[]) => 
                prev.map(s => s._id === selectedSubmission._id ? updatedData : s)
            );
            
            setShowEditModal(false);
            
            // Refetch submissions after update
            const response = await axiosInstance.get(
                `location/all?status=${filter === "all" ? "" : filter}&category=${category === "all" ? "" : category}`
            );
            const responseData = response.data.data;
            const finalData = Array.isArray(responseData) ? responseData : responseData?.result;
            if (finalData && Array.isArray(finalData)) {
                setSubmissions(finalData);
            }
            alert("Location updated successfully!");
        } catch (err) {
            console.error("Failed to update:", err);
            alert("Failed to update location");
        }
    };

    const handleEditChange = (field: string, value: string) => {
        setEditFormData((prev: any) => prev ? { ...prev, [field]: value } : null);
    };

    const handleMapSelect = (lat: number, lng: number) => {
        setEditFormData((prev: any) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
        }));
    };

    const openReviewModal = (submission: any) => {
        setSelectedSubmission(submission);
        setShowReviewModal(true);
        setCurrentImageIndex(0);
        setIsAutoPlaying(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedSubmission(null);
        setCurrentImageIndex(0);
        setIsAutoPlaying(true);
    };

    const getImages = () => {
        if (!selectedSubmission) return [];
        return Array.isArray(selectedSubmission.imageUrl)
            ? selectedSubmission.imageUrl
            : [selectedSubmission.imageUrl];
    };

    const nextImage = () => {
        const images = getImages();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        const images = getImages();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    const toggleAutoPlay = () => {
        setIsAutoPlaying((prev) => !prev);
    };

    const getCoordinateValue = (index: 0 | 1) => {
        if (!selectedSubmission) return "—";

        const sub = selectedSubmission;
        // Check for direct fields
        if (index === 0) {
            const lat = sub.latitude ?? sub.lat;
            if (lat !== undefined && lat !== null && lat !== "") return String(lat);
        } else {
            const lng = sub.longitude ?? sub.lng ?? sub.long;
            if (lng !== undefined && lng !== null && lng !== "") return String(lng);
        }

        // Try parsing coordinates or location fields
        const coords = sub.coordinates || sub.location;
        if (coords) {
            // Handle GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
            if (typeof coords === 'object' && coords !== null && 'type' in coords && Array.isArray((coords as any).coordinates)) {
                // GeoJSON coordinates are [longitude, latitude]
                const geoCoords = (coords as any).coordinates;
                if (geoCoords.length >= 2) {
                    return index === 0 ? String(geoCoords[1]) : String(geoCoords[0]);
                }
            }

            if (typeof coords === 'string') {
                const parts = coords.includes(',') ? coords.split(',') : coords.split(' ');
                if (parts.length >= 2) return parts[index]?.trim() || "—";
            }
            if (Array.isArray(coords) && coords.length >= 2) {
                return String(coords[index]);
            }
            if (typeof coords === 'object' && coords !== null) {
                if (index === 0) return String(coords.lat || coords.latitude || "—");
                if (index === 1) return String(coords.lng || coords.long || coords.longitude || "—");
            }
        }

        return "—";
    };

    const formatDisplayCoords = (s: any) => {
        if (s.latitude && s.longitude) {
            return `${parseFloat(s.latitude).toFixed(3)}, ${parseFloat(s.longitude).toFixed(3)}`;
        }
        
        const coords = s.coordinates || s.location;
        if (!coords) return "No coordinates";

        // Handle GeoJSON
        if (typeof coords === 'object' && coords !== null && 'type' in coords && Array.isArray(coords.coordinates)) {
            const c = coords.coordinates;
            if (c.length >= 2) {
                return `${parseFloat(c[1]).toFixed(3)}, ${parseFloat(c[0]).toFixed(3)}`;
            }
        }

        if (typeof coords === 'string') return coords;
        
        if (Array.isArray(coords) && coords.length >= 2) {
            return `${parseFloat(coords[0]).toFixed(3)}, ${parseFloat(coords[1]).toFixed(3)}`;
        }

        if (typeof coords === 'object' && coords !== null) {
            const lat = coords.lat || coords.latitude;
            const lng = coords.lng || coords.long || coords.longitude;
            if (lat && lng) return `${parseFloat(lat).toFixed(3)}, ${parseFloat(lng).toFixed(3)}`;
        }

        return "Click to view";
    };

    // ✅ FIXED: Cloudinary stores files as "filename.jpg.webp" — the full URL is correct as-is.
    // Previously the function was stripping ".webp" which caused 404 errors.
    const formatImageUrl = (url: string) => {
        if (!url) return "";
        return url;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategoryLabel = categoryFilters.find(f => f.value === category)?.label || "Categories";

    return (
        <div className="min-h-screen bg-[#070A09] p-6 text-neutral-100">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-[32px] font-inter font-semibold mb-2 leading-[150%] flex items-center gap-3">
                        User Submissions
                        {pendingCount > 0 && (
                            <span className="bg-yellow-500/20 text-yellow-500 text-sm font-medium px-3 py-1 rounded-full border border-yellow-500/30 whitespace-nowrap">
                                {pendingCount} Pending
                            </span>
                        )}
                    </h1>
                    <p className="text-[16px] font-inter font-normal text-neutral-400">
                        Review and moderate user-submitted locations
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    {/* Status Filters */}
                    <div className="flex gap-2 rounded-full p-1">
                        {statusFilters.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setFilter(item.value)}
                                className={`rounded-[12px] cursor-pointer py-2 px-3.5 font-inter font-medium text-[16px] transition border ${filter === item.value
                                    ? "bg-[#3BB774] text-white border-[#3BB774]"
                                    : "text-white border-[rgba(59,183,117,0.2)] hover:bg-[#181C1B]"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className={`rounded-[12px] cursor-pointer py-2 px-4 font-inter font-medium text-[16px] transition flex items-center gap-2 border ${category !== "all"
                                ? "bg-[#3BAF7A] text-white border-[#3BAF7A]"
                                : "text-white border-[rgba(59,183,117,0.2)] hover:bg-[#181C1B]"
                                }`}
                        >
                            <Filter size={18} />
                            <span>{selectedCategoryLabel}</span>
                            <ChevronDown size={18} className={`transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCategoryDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0F1412] border border-[rgba(59,175,122,0.2)] shadow-2xl z-20 py-1 overflow-hidden">
                                {categoryFilters.map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            setCategory(item.value);
                                            setIsCategoryDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#181C1B] transition-colors ${category === item.value ? "text-[#3BB774] bg-[#3BB774]/5" : "text-neutral-300"}`}
                                    >
                                        <span className={category === item.value ? "text-[#3BB774]" : "text-neutral-400"}>
                                            {item.icon}
                                        </span>
                                        <span className="font-inter text-[15px] font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {isLoading ? (
                <div className="text-neutral-300 text-center py-10">Loading...</div>
            ) : error ? (
                <div className="text-red-300 text-center py-10">{error}</div>
            ) : null}

            {/* Grid */}
            {!isLoading && !error && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {submissions.map((s) => {
                        const rawCover = Array.isArray(s.imageUrl) ? s.imageUrl[0] : (typeof s.imageUrl === 'string' ? s.imageUrl : '');
                        const cover = formatImageUrl(rawCover);

                        return (
                            <div
                                key={s._id}
                                className="rounded-[12px] border border-[rgba(59,175,122,0.2)] bg-[#090D0C] shadow-lg"
                            >
                                <img
                                    src={cover}
                                    alt={s.name}
                                    className="h-[285px] rounded-[12px_12px_0_0] w-full object-cover"
                                />

                                <div className="space-y-3 px-3 pt-5 pb-5">
                                    <div>
                                        <h3 className="font-semibold font-inter text-[#F5F5F5] text-[16px]">
                                            {s.name}
                                        </h3>
                                        <p className="text-[14px] font-inter font-normal text-neutral-400 line-clamp-2">
                                            {s.description || "—"}
                                        </p>
                                    </div>

                                    <div className="space-y-1 text-[14px] font-inter font-normal text-neutral-400">
                                        <div className="flex items-center gap-2">
                                            <CircleUser width={16} height={16} />
                                            <p>{s.userId?.fullName || s.userId?.full_name || "Unknown"}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail width={16} height={16} />
                                            <p>{s.userId?.email || "—"}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar width={16} height={16} />
                                            <p>{(s.createdAt || "").slice(0, 10) || "—"}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#3BB774]">
                                            <MapPin width={16} height={16} />
                                            <p className="text-[12px]">
                                                {formatDisplayCoords(s)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="divider w-full h-[1px] bg-[#3BB77433]"></div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2 w-fit">
                                        {s.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => onApprove(s._id)}
                                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#3BAF7A] px-3.5 py-2 text-sm font-medium text-neutral-950"
                                                >
                                                    <div className="flex items-center gap-2 w-fit">
                                                        <CorrectMarkIcon />
                                                        <p className="text-white font-inter font-medium text-[16px]">
                                                            Approve
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => onReject(s._id)}
                                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#FF3838] px-3 py-2 text-sm font-medium text-white"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <X />
                                                        <p className="text-white font-inter font-medium text-[16px]">
                                                            Reject
                                                        </p>
                                                    </div>
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => openReviewModal(s)}
                                            className="flex-1 cursor-pointer rounded-[16px] bg-[#181C1B] px-3 py-2 text-sm text-neutral-200 w-fit"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Eye color="#94A3B8" />
                                                <p className="text-white font-inter font-medium text-[16px]">
                                                    Review
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => openEditModal(s)}
                                            className="flex-1 cursor-pointer rounded-[16px] bg-[#181C1B] px-3 py-2 text-sm text-neutral-200 w-fit"
                                        >
                                            <div className="flex items-center">
                                                <Edit color="#94A3B8" />
                                                <p className="text-white font-inter font-medium text-[16px]">
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => onDelete(s._id)}
                                            className="flex-1 cursor-pointer rounded-[16px] bg-[#181C1B] px-3 py-2 text-sm text-neutral-200 w-fit"
                                        >
                                            <div className="flex items-center">
                                                <Trash color="#94A3B8" />
                                                <p className="text-white font-inter font-medium text-[16px] bg-transparent">
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isLoading && !error && submissions.length === 0 && (
                <div className="flex items-center justify-center py-20 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400 text-lg">No {filter !== "all" ? filter : ""} submissions found</p>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[16px] max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-[#090D0C] border-b border-[#3BB77433] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-[24px] font-inter font-semibold text-white">
                                Review Submission
                            </h2>
                            <button
                                onClick={closeReviewModal}
                                className="p-2 hover:bg-[#181C1B] rounded-lg transition"
                            >
                                <X className="text-neutral-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Image Carousel */}
                            <div>
                                <h3 className="text-[18px] font-inter font-semibold text-white mb-3">Images</h3>
                                <div className="relative">
                                    {/* Main Image Display */}
                                    <div className="relative w-full h-[400px] rounded-[12px] overflow-hidden border border-[rgba(59,175,122,0.2)] bg-[#0D1211]">
                                        <img
                                            src={formatImageUrl(getImages()[currentImageIndex])}
                                            alt={`${selectedSubmission.name} ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover transition-opacity duration-500"
                                        />

                                        {/* Image Counter & Play/Pause */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                <p className="text-white font-inter text-[14px] font-medium">
                                                    {currentImageIndex + 1} / {getImages().length}
                                                </p>
                                            </div>

                                            {/* Play/Pause Button */}
                                            {getImages().length > 1 && (
                                                <button
                                                    onClick={toggleAutoPlay}
                                                    className="bg-black/60 backdrop-blur-sm hover:bg-black/80 p-2 rounded-full transition"
                                                    title={isAutoPlaying ? "Pause" : "Play"}
                                                >
                                                    {isAutoPlaying ? (
                                                        <Pause className="text-white" size={16} />
                                                    ) : (
                                                        <Play className="text-white" size={16} />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Navigation Arrows */}
                                        {getImages().length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-black/80 p-3 rounded-full transition"
                                                >
                                                    <ChevronLeft className="text-white" size={24} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-black/80 p-3 rounded-full transition"
                                                >
                                                    <ChevronRight className="text-white" size={24} />
                                                </button>
                                            </>
                                        )}

                                        {/* Progress Indicators */}
                                        {getImages().length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {getImages().map((_: string, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => goToImage(idx)}
                                                        className={`h-1.5 rounded-full transition-all ${currentImageIndex === idx
                                                            ? 'w-8 bg-[#3BB774]'
                                                            : 'w-1.5 bg-white/40 hover:bg-white/60'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail Navigation */}
                                    {getImages().length > 1 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                            {getImages().map((img: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => goToImage(idx)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${currentImageIndex === idx
                                                        ? 'border-[#3BB774]'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img
                                                        src={formatImageUrl(img)}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Details */}
                            <div>
                                <h3 className="text-[18px] font-inter font-semibold text-white mb-3">Location Details</h3>
                                <div className="bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-4 space-y-3">
                                    <div>
                                        <p className="text-neutral-400 text-[14px] font-inter mb-1">Name</p>
                                        <p className="text-white text-[16px] font-inter font-medium">{selectedSubmission.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 text-[14px] font-inter mb-1">Description</p>
                                        <p className="text-white text-[16px] font-inter">{selectedSubmission.description || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 text-[14px] font-inter mb-1">latitude</p>
                                        <p className="text-white text-[16px] font-inter">
                                            {getCoordinateValue(0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 text-[14px] font-inter mb-1">longitude</p>
                                        <p className="text-white text-[16px] font-inter">
                                            {getCoordinateValue(1)}
                                        </p>
                                    </div>
                                    {selectedSubmission.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="text-[#3BB774] mt-1 flex-shrink-0" width={18} height={18} />
                                            <div className="flex-1">
                                                <p className="text-neutral-400 text-[14px] font-inter mb-1">Address</p>
                                                <p className="text-white text-[16px] font-inter">{selectedSubmission.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSubmission.website && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="text-[#3BB774]" width={18} height={18} />
                                            <a
                                                href={selectedSubmission.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#3BB774] text-[16px] font-inter hover:underline"
                                            >
                                                {selectedSubmission.website}
                                            </a>
                                        </div>
                                    )}
                                    {selectedSubmission.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="text-[#3BB774]" width={18} height={18} />
                                            <p className="text-white text-[16px] font-inter">{selectedSubmission.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submitter Info */}
                            <div>
                                <h3 className="text-[18px] font-inter font-semibold text-white mb-3">Submitted By</h3>
                                <div className="bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CircleUser className="text-[#3BB774]" width={18} height={18} />
                                        <p className="text-white text-[16px] font-inter">{selectedSubmission.userId?.fullName || selectedSubmission.userId?.full_name || "Unknown"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="text-[#3BB774]" width={18} height={18} />
                                        <p className="text-white text-[16px] font-inter">{selectedSubmission.userId?.email || "—"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-[#3BB774]" width={18} height={18} />
                                        <p className="text-white text-[16px] font-inter">
                                            {new Date(selectedSubmission.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                                <h3 className="text-[18px] font-inter font-semibold text-white mb-3">Status</h3>
                                <span className={`inline-block px-4 py-2 rounded-full text-[14px] font-inter font-medium ${selectedSubmission.status === 'PENDING'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : selectedSubmission.status === 'APPROVED'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                    {selectedSubmission.status}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        {selectedSubmission.status === "PENDING" && (
                            <div className="sticky bottom-0 bg-[#090D0C] border-t border-[#3BB77433] px-6 py-4 flex gap-3">
                                <button
                                    onClick={() => onApprove(selectedSubmission._id)}
                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#3BAF7A] px-6 py-3 font-medium hover:bg-[#34a06d] transition"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <CorrectMarkIcon />
                                        <p className="text-white font-inter font-medium text-[16px]">
                                            Approve Submission
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => onReject(selectedSubmission._id)}
                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#FF3838] px-6 py-3 font-medium hover:bg-[#e63333] transition"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <X />
                                        <p className="text-white font-inter font-medium text-[16px]">
                                            Reject Submission
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedSubmission && editFormData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[16px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-[#090D0C] border-b border-[#3BB77433] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-[24px] font-inter font-semibold text-white">
                                Edit Location
                            </h2>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-[#181C1B] rounded-lg transition"
                            >
                                <X className="text-neutral-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-neutral-400 text-[14px] font-inter mb-2">Location Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-[14px] font-inter mb-2">Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => handleEditChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-[14px] font-inter mb-2">Address</label>
                                <input
                                    type="text"
                                    value={editFormData.address}
                                    onChange={(e) => handleEditChange('address', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-[14px] font-inter mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={editFormData.latitude}
                                        onChange={(e) => handleEditChange('latitude', e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                        placeholder='-44.123'
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-400 text-[14px] font-inter mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={editFormData.longitude}
                                        onChange={(e) => handleEditChange('longitude', e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                        placeholder='168.123'
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMapPicker(true)}
                                        className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border transition-all font-inter text-sm font-medium cursor-pointer
                                                                            ${editFormData.latitude && editFormData.longitude
                                                ? 'border-[#3BB774]/40 bg-[#3BB774]/5 text-[#3BB774] hover:bg-[#3BB774]/10'
                                                : 'border-dashed border-[#1E2721] bg-[#131A16]/50 text-neutral-400 hover:border-[#3BB774]/40 hover:text-[#3BB774] hover:bg-[#3BB774]/5'
                                            }`}
                                    >
                                        <Map className="w-4 h-4" />
                                        {editFormData.latitude && editFormData.longitude
                                            ? `📍 ${parseFloat(editFormData.latitude).toFixed(4)}, ${parseFloat(editFormData.longitude).toFixed(4)} — Click to change`
                                            : 'Pick location on map'
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* <div>
                                <label className="block text-neutral-400 text-[14px] font-inter mb-2">Website</label>
                                <input
                                    type="url"
                                    value={editFormData.website}
                                    onChange={(e) => handleEditChange('website', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                />
                            </div> */}

                            {/* <div>
                                <label className="block text-neutral-400 text-[14px] font-inter mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => handleEditChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0D1211] border border-[rgba(59,175,122,0.2)] rounded-xl text-white focus:outline-none focus:border-[#3BB774] transition"
                                />
                            </div> */}

                            {/* Modal Footer Actions */}
                            <div className="sticky bottom-0 bg-[#090D0C] border-t border-[#3BB77433] px-6 py-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#181C1B] px-6 py-3 font-medium hover:bg-[#2a2a2a] transition"
                                >
                                    <p className="text-white font-inter font-medium text-[16px]">
                                        Cancel
                                    </p>
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 cursor-pointer rounded-[16px] bg-[#3BAF7A] px-6 py-3 font-medium hover:bg-[#34a06d] transition"
                                >
                                    <p className="text-white font-inter font-medium text-[16px]">
                                        Save Changes
                                    </p>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMapPicker && (
                <MapPickerModal
                    onSelect={handleMapSelect}
                    onClose={() => setShowMapPicker(false)}
                    initialLat={editFormData?.latitude}
                    initialLng={editFormData?.longitude}
                />
            )}
        </div>
    );
};

export default MainSubmission;
