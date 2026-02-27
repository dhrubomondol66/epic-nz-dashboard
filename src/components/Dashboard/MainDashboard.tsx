/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { CloudSun, MailCheck, MapPin, Users, Loader2 } from "lucide-react";
import DashboardCard from "./DashboardCard";
import DashboardChart from "./DashboardChart";
import DashboardApproval from "./DashboardApproval";
import Heading from "./Heading";
import { useGetAllSubscriptionsQuery } from '../../redux/features/subscriptionApi';
import { useGetAllLocationsQuery } from '../../redux/features/locationApi';

export default function MainDashboard() {
  const { data: subscriptions = [], isLoading: loadingSubs } = useGetAllSubscriptionsQuery();
  const { data: locations = [], isLoading: loadingLocs } = useGetAllLocationsQuery('all');

  const isLoading = loadingSubs || loadingLocs;

  const dashboardStats = useMemo(() => {
    // 1. Total Locations
    const totalLocations = locations.length;

    // 2. New Submissions (Pending Locations)
    const newSubmissions = locations.filter(loc => loc.status?.toLowerCase() === 'pending').length;

    // 3. Active Users (Unique Subscribers)
    const uniqueUsers = new Set(subscriptions.map(s =>
      typeof s.userId === 'object' ? s.userId?._id : s.userId
    ));
    const activeUsers = uniqueUsers.size;

    // Growth calculation (similar to analytics.tsx)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const getGrowth = (items: any[]) => {
      const thisMonth = items.filter(item => new Date(item.createdAt) > thirtyDaysAgo).length;
      if (items.length === 0) return "0%";
      const growth = (thisMonth / items.length) * 100;
      return `${growth.toFixed(0)}%`;
    };

    return [
      {
        title: "Total Location",
        number: totalLocations.toLocaleString(),
        icon: <MapPin />,
        paragraph: "from last months",
        growth: getGrowth(locations),
        showGrowIcon: true,
      },
      {
        title: "New Submissions",
        number: newSubmissions.toLocaleString(),
        icon: <MailCheck />,
        growth: "Pending review",
      },
      {
        title: "Active Users",
        number: activeUsers.toLocaleString(),
        icon: <Users />,
        paragraph: "Total subscribers",
        growth: getGrowth(subscriptions),
        showGrowIcon: true,
      },
      {
        title: "Weather API",
        number: "Operational",
        icon: <CloudSun />,
        paragraph: "99.9% Uptime",
      },
    ];
  }, [subscriptions, locations]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#070A09]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#3BB774] animate-spin" />
          <p className="text-neutral-400 font-inter animate-pulse">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-8 pt-11 text-white h-[calc(100vh-60px)] overflow-y-scroll no-scrollbar pb-10">
      {/* heading */}
      <Heading
        title="Dashboard"
        subTitle="Welcome back, admin. Here's what's happening today."
      />

      {/* cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8 pr-12">
        {dashboardStats.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            number={item.number}
            icon={item.icon}
            paragraph={item.paragraph}
            growth={item.growth}
            showGrowIcon={item.showGrowIcon}
          />
        ))}
      </div>

      {/* chart */}
      <div className="pr-12">
        <DashboardChart />
      </div>

      {/* approval */}
      <DashboardApproval />
    </div>
  );
}
