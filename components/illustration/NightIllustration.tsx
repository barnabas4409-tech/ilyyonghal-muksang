export default function NightIllustration() {
  return (
    <svg viewBox="0 0 375 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0A2E" />
          <stop offset="60%" stopColor="#1A1A4E" />
          <stop offset="100%" stopColor="#2D2D6B" />
        </linearGradient>
        <linearGradient id="nightGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B14" />
          <stop offset="100%" stopColor="#16140F" />
        </linearGradient>
      </defs>

      <rect width="375" height="200" fill="url(#nightSky)" />

      {/* 별들 */}
      {[
        [50, 30], [90, 15], [130, 40], [170, 20], [210, 35],
        [250, 18], [290, 45], [330, 25], [355, 38],
        [70, 55], [160, 60], [240, 50], [310, 65],
        [40, 80], [120, 75], [200, 85], [280, 72], [350, 82],
        [20, 45], [380, 55],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={Math.random() > 0.5 ? 1.5 : 1}
          fill="white"
          opacity={0.4 + Math.random() * 0.6}
        />
      ))}

      {/* 달 */}
      <circle cx="300" cy="50" r="28" fill="#F5F0DC" opacity="0.9" />
      <circle cx="312" cy="44" r="22" fill="#2D2D6B" opacity="0.95" />

      {/* 은하수 느낌 */}
      <ellipse cx="187" cy="100" rx="120" ry="20" fill="white" opacity="0.03" />

      {/* 땅 */}
      <rect x="0" y="155" width="375" height="45" fill="url(#nightGround)" />

      {/* 나무 실루엣 */}
      <rect x="25" y="118" width="7" height="37" fill="#111" opacity="0.8" />
      <ellipse cx="28" cy="112" rx="20" ry="25" fill="#111" opacity="0.8" />

      <rect x="340" y="122" width="6" height="33" fill="#111" opacity="0.8" />
      <ellipse cx="343" cy="116" rx="17" ry="21" fill="#111" opacity="0.8" />

      {/* 집 창문 빛 */}
      <rect x="170" y="140" width="12" height="10" fill="#FFD700" opacity="0.4" rx="1" />
      <rect x="195" y="140" width="12" height="10" fill="#FFD700" opacity="0.3" rx="1" />
    </svg>
  );
}
