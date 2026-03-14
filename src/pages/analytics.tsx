/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import Sidebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { Users, MapPin, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { useGetAllSubscriptionsQuery } from '../redux/features/subscriptionApi';
import { useGetAllLocationsQuery } from '../redux/features/locationApi';
import { useGetActivityLogsQuery } from '../redux/features/activityLogApi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export default function Analytics() {
    // Enable real-time polling every 10 seconds for a "live" feel
    const { data: subscriptions = [], isLoading: loadingSubs, refetch: refetchSubs } = useGetAllSubscriptionsQuery(undefined, { pollingInterval: 10000 });
    const { data: locations = [], isLoading: loadingLocs, refetch: refetchLocs } = useGetAllLocationsQuery('all', { pollingInterval: 10000 });
    const { data: logs = [], isLoading: loadingLogs, refetch: refetchLogs } = useGetActivityLogsQuery(undefined, { pollingInterval: 10000 });

    const loading = loadingSubs || loadingLocs || loadingLogs;

    // Process all data for stats and charts
    const analyticsData = useMemo(() => {
        // --- 1. Top Level Stats ---
        const uniqueUsers = new Set(subscriptions.map(s =>
            typeof s.userId === 'object' ? s.userId?._id : s.userId
        ));
        const totalRevenue = subscriptions.reduce((sum, s) => sum + Number(s.total_spent || 0), 0);
        const activeSessions = logs.filter(log =>
            log.action === 'USER_LOGIN' ||
            log.action === 'LOGIN' ||
            log.action === 'USER_LOGGED_IN'
        ).length;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        const getGrowth = (items: any[], dateField: string) => {
            const thisMonth = items.filter(item => new Date(item[dateField]) > thirtyDaysAgo).length;
            const lastMonth = items.filter(item => {
                const d = new Date(item[dateField]);
                return d > sixtyDaysAgo && d <= thirtyDaysAgo;
            }).length;
            if (lastMonth === 0) return thisMonth > 0 ? '+100%' : '+0%';
            const growth = ((thisMonth - lastMonth) / lastMonth) * 100;
            return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        };
        const getRevenueGrowth = () => {
            const thisMonthRevenue = subscriptions
                .filter(s => new Date(s.createdAt) > thirtyDaysAgo)
                .reduce((sum, s) => sum + Number(s.total_spent || 0), 0);
            const lastMonthRevenue = subscriptions
                .filter(s => {
                    const d = new Date(s.createdAt);
                    return d > sixtyDaysAgo && d <= thirtyDaysAgo;
                })
                .reduce((sum, s) => sum + Number(s.total_spent || 0), 0);

            if (lastMonthRevenue === 0) return thisMonthRevenue > 0 ? '+100%' : '+0%';
            const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
            return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        };

        const stats = {
            totalUsers: { value: uniqueUsers.size, change: `${getGrowth(subscriptions, 'createdAt')} From Last Month` },
            totalLocations: { value: locations.length, change: `${getGrowth(locations, 'createdAt')} From Last Month` },
            monthlyRevenue: { value: totalRevenue, change: `${getRevenueGrowth()} From Last Month` },
            activeSessions: { value: activeSessions, change: 'Recent Logins' }
        };

        // --- 2. User Acquisition Chart Data (Last 7 Days) ---
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = subscriptions.filter(s => new Date(s.createdAt).toDateString() === date.toDateString()).length;
            return { name: dateStr, users: count };
        });

        // --- 3. Revenue Distribution Data (By Plan Type) ---
        const planGroups = subscriptions.reduce((acc: any, s) => {
            const plan = (s.plan_type || 'UNKNOWN').toUpperCase();
            acc[plan] = (acc[plan] || 0) + Number(s.total_spent || 0);
            return acc;
        }, {});

        const revenuePieData = Object.keys(planGroups).map(key => ({
            name: key,
            value: planGroups[key]
        })).filter(item => item.value > 0);

        // --- 4. Location Activity Data (By Status) ---
        const locationStats = locations.reduce((acc: any, loc) => {
            acc[loc.status] = (acc[loc.status] || 0) + 1;
            return acc;
        }, {});
        const locationBarData = Object.keys(locationStats).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            count: locationStats[key]
        }));

        return { stats, last7Days, revenuePieData, locationBarData };
    }, [subscriptions, locations, logs]);

    const handleRefresh = () => {
        refetchSubs();
        refetchLocs();
        refetchLogs();
    };

    const COLORS = ['#3BB774', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444'];

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
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[32px] font-inter font-semibold text-white">
                                        Analytics Overview
                                    </h1>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
                                    </div>
                                </div>
                                <p className="text-[16px] font-inter text-neutral-400">
                                    Real-time platform performance and user activity monitoring
                                </p>
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className={`p-2.5 rounded-[12px] bg-[#181C1B] border border-[rgba(59,175,122,0.2)] text-white hover:bg-[#1f2422] transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Users', value: analyticsData.stats.totalUsers.value, change: analyticsData.stats.totalUsers.change, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { label: 'Total Location', value: analyticsData.stats.totalLocations.value, change: analyticsData.stats.totalLocations.change, icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'Monthly Revenue', value: analyticsData.stats.monthlyRevenue.value, change: analyticsData.stats.monthlyRevenue.change, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/10', prefix: '$' },
                                { label: 'Active Sessions', value: analyticsData.stats.activeSessions.value, change: analyticsData.stats.activeSessions.change, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[16px] p-5 hover:border-[#3BB774]/40 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-neutral-400 text-[14px] font-inter">{item.label}</p>
                                        <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                                            <item.icon className={item.color} size={20} />
                                        </div>
                                    </div>
                                    <p className="text-white text-[28px] font-inter font-semibold mb-1">
                                        {item.prefix || ''}{item.value.toLocaleString()}
                                    </p>
                                    <p className={`${item.change.startsWith('-') ? 'text-red-400' : 'text-green-400'} text-[12px] font-inter`}>
                                        {item.change}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* User Acquisition */}
                            <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[20px] p-6 shadow-xl">
                                <h3 className="text-white font-inter font-semibold text-[18px] mb-6">User Acquisition (Last 7 Days)</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analyticsData.last7Days}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3BB774" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3BB774" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                                            <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val ? Math.floor(Number(val)).toString() : '0'} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                                                itemStyle={{ color: '#3BB774' }}
                                            />
                                            <Area type="monotone" dataKey="users" stroke="#3BB774" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} isAnimationActive={true} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Revenue Distribution */}
                            <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[20px] p-6 shadow-xl">
                                <h3 className="text-white font-inter font-semibold text-[18px] mb-6">Revenue Distribution</h3>
                                <div className="h-[300px] flex items-center justify-center relative">
                                    {analyticsData.revenuePieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.revenuePieData}
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    isAnimationActive={true}
                                                >
                                                    {analyticsData.revenuePieData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                                                    formatter={(value: any) => typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-neutral-500 font-inter">No revenue data available</p>
                                            <p className="text-neutral-600 text-[12px] mt-1">System will update once payments are processed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location Activity */}
                        <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[20px] p-6 shadow-xl">
                            <h3 className="text-white font-inter font-semibold text-[18px] mb-6">Location Status Distribution</h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData.locationBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                                        <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val ? Math.floor(Number(val)).toString() : '0'} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                                            {analyticsData.locationBarData.map((entry, index) => {
                                                let color = COLORS[index % COLORS.length];
                                                if (entry.name.toLowerCase() === 'approved') color = '#3BB774';
                                                if (entry.name.toLowerCase() === 'rejected') color = '#EF4444';
                                                if (entry.name.toLowerCase() === 'pending') color = '#F59E0B';
                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
