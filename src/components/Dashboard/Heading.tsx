export default function Heading({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) {
  return (
    <>
      <div>
        <h1 className="text-[32px] font-inter font-semibold leading-[150%]">
          {title}
        </h1>
        <p className="text-[16px] font-inter font-normal leading-[150%] text-[#F5F5F5A1] opacity-63 mt-2">
          {subTitle}
        </p>
      </div>
    </>
  );
}
