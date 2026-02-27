import { useState, useEffect } from 'react';
import Sidebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { Search, RefreshCw, Upload, Filter } from 'lucide-react';
import { axiosInstance } from '../lib/axios';

interface ActivityLog {
    _id: string;
    actorId: {
        _id?: string;
        fullName: string;
        email?: string;
    } | string; // Can be populated object or just string ID
    actorRole: string;
    action: string;
    entityType: string;
    entityId?: {
        _id?: string;
        fullName?: string;
        email?: string;
    } | string; // Optional, can be populated object or string ID
    message: string;
    status: string;
    ip: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export default function ActivityLog() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axiosInstance.get('/activity-logs');
            const data = response.data.data || [];
            setLogs(data);
            setFilteredLogs(data);
            setTotalEntries(data.length);
        } catch (error: any) {
            console.error('Failed to fetch activity logs:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url
            });
            setLogs([]);
            setFilteredLogs([]);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = logs.filter(log => {
                const actorName = log.actorId
                    ? (typeof log.actorId === 'object' ? (log.actorId.fullName || '') : log.actorId)
                    : '';
                return (
                    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.entityType.toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
            setFilteredLogs(filtered);
        } else {
            setFilteredLogs(logs);
        }
    }, [searchQuery, logs]);

    const getActionColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('PUBLISHED') || act.includes('APPROVED') || act.includes('LOGIN')) return 'text-green-400';
        if (act.includes('REJECTED') || act.includes('LOGOUT')) return 'text-red-400';
        if (act.includes('UPDATED')) return 'text-blue-400';
        if (act.includes('IMPORT')) return 'text-cyan-400';
        if (act.includes('ROTATED')) return 'text-yellow-400';
        return 'text-neutral-400';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#070A09]">
            <div className="w-[250px] flex-shrink-0 border-r border-[rgba(59,175,122,0.2)] h-full overflow-y-auto">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-10 bg-[#070A09]">
                    <Topbar />
                </div>
                <div className="flex-1 overflow-y-auto">

                    <div className="p-6">
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-[32px] font-inter font-semibold text-white mb-2">
                                    Activity Logs
                                </h1>
                                <p className="text-[16px] font-inter text-neutral-400">
                                    Monitor All System Activities And Changes
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={fetchLogs}
                                    className="bg-[#181C1B] hover:bg-[#1f2422] text-white px-4 py-2.5 rounded-[12px] font-inter font-medium text-[14px] flex items-center gap-2 transition border border-[rgba(59,175,122,0.2)]"
                                >
                                    <RefreshCw size={18} />
                                    Refresh
                                </button>

                                <button className="bg-[#3BB774] hover:bg-[#34a06d] text-white px-4 py-2.5 rounded-[12px] font-inter font-medium text-[14px] flex items-center gap-2 transition">
                                    <Upload size={18} />
                                    Bulk Import
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search Logs"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0D1a1f] border-none rounded-[12px] pl-10 pr-4 py-3 text-white font-inter text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3BB774]/50"
                                />
                            </div>

                            <button className="bg-transparent border border-[rgba(59,175,122,0.2)] hover:bg-[#181C1B] text-white px-4 py-3 rounded-[12px] font-inter font-medium text-[14px] flex items-center gap-2 transition">
                                <Filter size={18} />
                                Filter
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-[#0D1a1f] border border-[rgba(59,175,122,0.2)] rounded-[16px] overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[rgba(59,175,122,0.2)]">
                                        <th className="text-left px-6 py-4 text-neutral-400 font-inter text-[14px] font-medium">Timestamp</th>
                                        <th className="text-left px-6 py-4 text-neutral-400 font-inter text-[14px] font-medium">Action</th>
                                        <th className="text-left px-6 py-4 text-neutral-400 font-inter text-[14px] font-medium">User</th>
                                        <th className="text-left px-6 py-4 text-neutral-400 font-inter text-[14px] font-medium">Target</th>
                                        <th className="text-left px-6 py-4 text-neutral-400 font-inter text-[14px] font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id} className="border-b border-[rgba(59,175,122,0.1)] hover:bg-[#0f1d22]">
                                            <td className="px-6 py-4 text-white font-inter text-[14px]">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-inter text-[14px] font-medium ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-inter text-[14px]">
                                                        {log.actorId
                                                            ? (typeof log.actorId === 'object' ? (log.actorId.fullName || 'Unknown User') : log.actorId)
                                                            : 'Unknown User'
                                                        }
                                                    </span>
                                                    <span className="text-neutral-500 font-inter text-[12px]">{log.actorRole || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-inter text-[14px]">
                                                {log.entityId
                                                    ? (typeof log.entityId === 'object' ? (log.entityId.fullName || log.entityType) : log.entityId)
                                                    : log.entityType
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-inter font-medium ${log.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-6 py-3 border-t border-[rgba(59,175,122,0.2)] bg-[#0a1419]">
                                <p className="text-neutral-400 font-inter text-[13px]">
                                    Showing 10 Of {totalEntries} Entries
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}