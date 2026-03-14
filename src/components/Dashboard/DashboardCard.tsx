import Grow from "../svg/Grow";

export default function DashboardCard({
  title,
  number,
  icon,
  paragraph,
  growth,
  showGrowIcon = false,
}: {
  title: string;
  number: string;
  icon: React.ReactNode;
  paragraph?: string;
  growth?: string;
  showGrowIcon?: boolean;
}) {
  return (
    <>
      <div className="rounded-[8px] border border-[#132D22] p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[16px] font-inter font-normal text-[#F5F5F5] mb-1">
              {title}
            </p>
            <p className="text-[32px] font-semibold text-[#F5F5F5] leading-12">
              {number}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-[#181C1B] flex items-center justify-center text-emerald-400">
            {icon}
          </div>
        </div>
        <div className="mt-1.5 text-[14px] text-[#A5A6A6] flex items-center gap-1.5">
          {showGrowIcon && <Grow />}
          {growth && <span className="text-[#3BAF7A]">{growth} </span>}
          {paragraph}
        </div>
      </div>
    </>
  );
}
