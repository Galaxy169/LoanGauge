// Semicircular 0-100 gauge. Color shifts by score band, matching the risk levels.
export default function ScoreGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const angle = (clamped / 100) * 180; // 0-180 degrees

  const color =
    clamped >= 90
      ? "#16a34a" // excellent - green
      : clamped >= 75
        ? "#65a30d" // good - lime
        : clamped >= 60
          ? "#ca8a04" // moderate - amber
          : clamped >= 40
            ? "#ea580c" // needs improvement - orange
            : "#dc2626"; // high risk - red

  const radius = 90;
  const cx = 100;
  const cy = 100;
  // needle end point
  const rad = (Math.PI * (180 - angle)) / 180;
  const nx = cx + radius * Math.cos(rad);
  const ny = cy - radius * Math.sin(rad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-64">
        {/* track */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* filled arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 282.7} 282.7`}
        />
        {/* needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#334155"
          strokeWidth="3"
        />
        <circle cx={cx} cy={cy} r="5" fill="#334155" />
      </svg>
      <div className="text-4xl font-bold mt-1" style={{ color }}>
        {clamped}
      </div>
      <div className="text-xs text-slate-400">out of 100</div>
    </div>
  );
}
