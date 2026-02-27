import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/SIdebar";
import Topbar from "../components/topbar/Topbar";
import { Search } from "lucide-react";
import { axiosInstance } from "../lib/axios";

interface Subscription {
  _id: string;
  userId: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
  plan_type: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  start_date: string;
  end_date: string;
  status: string;
  ai_features_access: boolean;
  ads_free: boolean;
  total_spent: number;
  auto_renew: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    premium: 0,
    mrr: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axiosInstance.get("subscription/all");
      const data = response.data.data?.result || response.data.data || [];
      setSubscriptions(data);
      setFilteredSubscriptions(data);
      calculateStats(data);
    } catch (error: any) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptions([]);
      setFilteredSubscriptions([]);
    }
  };

  const calculateStats = (data: Subscription[]) => {
    const total = data.length;
    const active = data.filter(s => s.status === "ACTIVE").length;
    const premium = data.filter(s => s.plan_type === "PREMIUM").length;
    const mrr = data.reduce((sum, s) => sum + (s.total_spent || 0), 0);
    setStats({ total, active, premium, mrr });
  };

  useEffect(() => {
    let filtered = subscriptions;
    if (searchQuery) {
      filtered = filtered.filter(s => {
        const userIdValue = typeof s.userId === "object" && s.userId !== null
          ? (s.userId.fullName || s.userId.email || s.userId._id || "")
          : (s.userId || "");
        return userIdValue.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    if (selectedPlan !== "All Plans") {
      filtered = filtered.filter(s => s.plan_type === selectedPlan.toUpperCase());
    }
    setFilteredSubscriptions(filtered);
  }, [searchQuery, selectedPlan, subscriptions]);

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
            <div className="mb-6">
              <h1 className="text-[32px] font-inter font-semibold text-white mb-2">Subscriptions</h1>
              <p className="text-[16px] font-inter text-neutral-400">Monitor And Manage User Subscriptions Across All Platforms</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-5">
                <p className="text-neutral-400 text-[14px] mb-2">Total Subscription</p>
                <p className="text-white text-[32px] font-semibold">{stats.total}</p>
              </div>
              <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-5">
                <p className="text-neutral-400 text-[14px] mb-2">Active</p>
                <p className="text-white text-[32px] font-semibold">{stats.active}</p>
              </div>
              <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-5">
                <p className="text-neutral-400 text-[14px] mb-2">Premium Users</p>
                <p className="text-white text-[32px] font-semibold">{stats.premium}</p>
              </div>
              <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] p-5">
                <p className="text-neutral-400 text-[14px] mb-2">Est. MRR</p>
                <p className="text-white text-[32px] font-semibold">${stats.mrr}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="Search By User ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[rgba(59,175,122,0.2)] rounded-[12px] pl-10 pr-4 py-2.5 text-white"
                />
              </div>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] px-4 py-2.5 text-white"
              >
                <option>All Plans</option>
                <option>TRIAL</option>
                <option>PREMIUM</option>
                <option>PRO</option>
                <option>FREE</option>
              </select>
            </div>

            <div className="bg-[#090D0C] border border-[rgba(59,175,122,0.2)] rounded-[12px] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(59,175,122,0.2)] text-neutral-400">
                    <th className="px-6 py-4 font-medium">User ID</th>
                    <th className="px-6 py-4 font-medium">Plan</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Features</th>
                    <th className="px-6 py-4 font-medium">Start Date</th>
                    <th className="px-6 py-4 font-medium">End Date</th>
                    <th className="px-6 py-4 font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b border-[rgba(59,175,122,0.2)] hover:bg-[#0D1211]">
                      <td className="px-6 py-4">
                        <p className="text-white">{typeof sub.userId === "object" ? sub.userId.fullName : sub.userId}</p>
                        <p className="text-neutral-500 text-xs">{sub.stripeCustomerId}</p>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">{sub.plan_type}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">{sub.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {sub.ai_features_access && <span className="bg-cyan-500/20 text-cyan-400 px-1 rounded text-[10px]">AI</span>}
                          {sub.ads_free && <span className="bg-green-500/20 text-green-400 px-1 rounded text-[10px]">Ad-Free</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">{new Date(sub.start_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white text-sm">{new Date(sub.end_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white text-sm">${(sub.total_spent || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
