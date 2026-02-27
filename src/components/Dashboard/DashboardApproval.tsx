import { useMemo } from 'react';
import { Check, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { useGetAllLocationsQuery } from '../../redux/features/locationApi';
import { useGetActivityLogsQuery } from '../../redux/features/activityLogApi';
import { useNavigate } from 'react-router-dom';

export default function DashboardApproval() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading: loadingLocs } = useGetAllLocationsQuery('pending');
  const { data: logs = [], isLoading: loadingLogs } = useGetActivityLogsQuery();

  const isLoading = loadingLocs || loadingLogs;

  // Process activities for the side feed
  const processedActivities = useMemo(() => {
    return logs.slice(0, 5).map(log => {
      let type: 'info' | 'warning' | 'success' = 'info';
      if (log.action.includes('SUBMITTED') || log.action.includes('CREATE')) type = 'success';
      if (log.action.includes('DELETE') || log.action.includes('REJECT')) type = 'warning';

      const time = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: log._id,
        title: log.message || log.action,
        subtitle: log.entityType || 'System',
        time,
        type
      };
    });
  }, [logs]);

  // Format date for the table
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '\n');
  };

  const pendingApprovals = locations.slice(0, 5); // Just show top 5 on dashboard

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#090D0C]/30 rounded-xl border border-[#12271F] mt-8 mr-11">
        <Loader2 className="w-8 h-8 text-[#3BB774] animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-white mt-[30px] pr-11">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Approvals Section */}
        <div className="lg:col-span-2 border border-[#12271F] rounded-[12px] py-6 px-8 bg-[#090D0C]/40 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-[28px] font-inter font-semibold">
              Pending Approvals
            </h1>
            <button
              onClick={() => navigate('/system/submission')}
              className="text-[#3BB774] hover:text-[#2d8f5c] text-sm cursor-pointer font-inter font-semibold transition-colors"
            >
              View All
            </button>
          </div>

          {pendingApprovals.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-[14px] font-inter font-semibold text-neutral-400 mb-6 px-4">
                <div className="col-span-4">Location Name</div>
                <div className="col-span-3">Submitted By</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Approval Items */}
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval._id}
                    className="group border border-[#12271F] hover:border-[#3BB774]/30 bg-[#0D1211]/50 transition-all duration-300 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Location */}
                      <div className="col-span-4 min-w-0">
                        <div className="font-bold text-[16px] font-inter mb-1 truncate group-hover:text-[#3BB774] transition-colors">
                          {approval.name}
                        </div>
                        <div className="text-[12px] font-inter font-normal text-gray-500 truncate">
                          {approval.location || approval.address || 'New Zealand'}
                        </div>
                      </div>

                      {/* Submitter */}
                      <div className="col-span-3 flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${approval.userId?.fullName || approval.userId?.full_name || 'U'}&background=3BB774&color=fff`}
                          alt={approval.userId?.fullName || approval.userId?.full_name}
                          className="w-9 h-9 rounded-full border border-[rgba(59,175,122,0.2)]"
                        />
                        <span className="text-[14px] font-inter font-semibold truncate text-neutral-300">
                          {approval.userId?.fullName || approval.userId?.full_name || 'Anonymous'}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-[14px] font-inter font-normal text-neutral-400 whitespace-pre-line leading-tight">
                        {formatDate(approval.createdAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex items-center justify-end gap-3">
                        <button className="w-8 h-8 rounded-lg bg-[#3BB774]/10 hover:bg-[#3BB774] flex items-center justify-center transition-all cursor-pointer text-[#3BB774] hover:text-white" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 flex items-center justify-center transition-all cursor-pointer text-red-500 hover:text-white" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/system/submission?id=${approval._id}`)}
                          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all cursor-pointer text-gray-400 hover:text-white" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0D1211] border border-[#12271F] flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-white font-inter font-medium text-[16px]">All caught up!</h3>
              <p className="text-neutral-500 text-sm mt-1">No pending location approvals at the moment.</p>
            </div>
          )}
        </div>

        {/* Activity Feed Section */}
        <div className="lg:col-span-1 border border-[#12271F] rounded-[12px] p-6 bg-[#090D0C]/40 backdrop-blur-sm overflow-hidden flex flex-col">
          <h2 className="text-[24px] font-inter font-semibold text-white mb-8">
            Recent Activity
          </h2>

          {processedActivities.length > 0 ? (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {processedActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full z-10 ${activity.type === 'info'
                        ? "bg-[#137FEC]"
                        : activity.type === 'warning'
                          ? "bg-red-500"
                          : "bg-[#3BB774]"
                        }`}
                    ></div>
                    <div className="w-[1px] absolute top-2.5 bottom-0 bg-neutral-800"></div>
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-6">
                    <div className="flex flex-col items-start mb-1">
                      <div className="font-semibold text-[14px] font-inter leading-[20px] mb-1 text-neutral-200">
                        {activity.title}
                      </div>
                      <div className="text-[11px] font-inter font-medium text-neutral-500 uppercase tracking-wider">
                        {activity.subtitle} • {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <AlertCircle className="w-10 h-10 text-neutral-600 mb-2" />
              <p className="text-sm">No recent logs</p>
            </div>
          )}

          <button
            onClick={() => navigate('/system/activity-log')}
            className="w-full mt-4 py-3 rounded-xl border border-[#12271F] hover:bg-[#3BB774]/10 hover:border-[#3BB774]/20 transition-all text-neutral-400 hover:text-[#3BB774] text-xs font-semibold uppercase tracking-widest">
            View Activity Logs
          </button>
        </div>
      </div>
    </div>
  );
}
