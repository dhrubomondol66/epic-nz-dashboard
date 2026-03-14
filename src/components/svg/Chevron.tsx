export default function Chevron({ openSystem }: { openSystem: boolean }) {
  return (
    <div>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d={openSystem ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}
          stroke="#F5F5F5"
          strokeOpacity="0.57"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
