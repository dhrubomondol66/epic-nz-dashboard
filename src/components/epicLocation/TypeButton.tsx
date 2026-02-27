export default function TypeButton({
  icon,
  type,
  bg,
}: {
  icon?: React.ReactNode;
  type: string;
  bg?: string;
}) {
  const bgClass = bg ?? "bg-[#6E5CAC]";
  return (
    <div className="col-span-2">
      <div
        className={`flex items-center py-1 px-3.5 gap-1 ${bgClass} w-fit rounded-full text-white`}
      >
        {icon}
        <span className="inline-flex items-center text-[14px] font-normal font-inter">
          {type}
        </span>
      </div>
    </div>
  );
}
