import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useGetAllLocationsQuery } from '../../redux/features/locationApi';
import { Loader2 } from "lucide-react";

interface CustomDotProps {
  cx?: number;
  cy?: number;
}

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#10b981"
      stroke="#10b981"
      strokeWidth={2}
    />
  );
};

export default function DashboardChart() {
  const { data: locations = [], isLoading } = useGetAllLocationsQuery('all');

  const chartData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();

    // Initialize results for the last 7 days
    const last7Days: { fullDate: string; day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last7Days.push({
        fullDate: d.toDateString(),
        day: days[d.getDay()],
        value: 0
      });
    }

    // Fill with actual data
    locations.forEach(loc => {
      const locDate = new Date(loc.createdAt).toDateString();
      const dayIndex = last7Days.findIndex(d => d.fullDate === locDate);
      if (dayIndex !== -1) {
        last7Days[dayIndex].value += 1;
      }
    });

    return last7Days;
  }, [locations]);

  return (
    <div className="w-full h-full p-6 flex items-center justify-center mt-8 border border-[#12271F] rounded-[12px] bg-[#090D0C]/40 backdrop-blur-sm">
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[#F5F5F5] font-inter text-[18px] font-bold">
              Weekly Submission Trends
            </h2>
            <p className="text-[12px] text-[#A5A6A6] mt-1">
              New locations submitted over the last 7 days
            </p>
          </div>
          {isLoading && <Loader2 className="w-5 h-5 text-[#3BB774] animate-spin" />}
        </div>

        <div className="mt-8 h-[250px] min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3BB774" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3BB774" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#12271F" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0F0D',
                  border: '1px solid #12271F',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#3BB774' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={4}
                dot={<CustomDot />}
                activeDot={{ r: 8, fill: "#10b981", stroke: '#070A09', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
