export default function DawnIllustration() {
  return (
    <svg viewBox="0 0 375 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 하늘 그라디언트 */}
      <defs>
        <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB347" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#FF8C69" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFE4B5" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="dawnGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B7355" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6B5B45" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect width="375" height="200" fill="url(#dawnSky)" />

      {/* 태양 */}
      <ellipse cx="187" cy="115" rx="45" ry="12" fill="#FFE4B5" opacity="0.5" />
      <circle cx="187" cy="108" r="22" fill="#FFB347" opacity="0.7" />
      <circle cx="187" cy="108" r="15" fill="#FFD700" opacity="0.8" />

      {/* 빛 줄기 */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <line
          key={i}
          x1="187"
          y1="108"
          x2={187 + Math.cos((angle * Math.PI) / 180) * 50}
          y2={108 + Math.sin((angle * Math.PI) / 180) * 50}
          stroke="#FFD700"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}

      {/* 구름 */}
      <ellipse cx="80" cy="70" rx="35" ry="12" fill="white" opacity="0.5" />
      <ellipse cx="100" cy="65" rx="25" ry="14" fill="white" opacity="0.5" />
      <ellipse cx="290" cy="55" rx="40" ry="11" fill="white" opacity="0.4" />
      <ellipse cx="310" cy="50" rx="28" ry="13" fill="white" opacity="0.4" />

      {/* 땅 */}
      <rect x="0" y="155" width="375" height="45" fill="url(#dawnGround)" />

      {/* 나무 실루엣 */}
      <rect x="30" y="120" width="6" height="35" fill="#5C4A32" opacity="0.6" />
      <ellipse cx="33" cy="115" rx="18" ry="22" fill="#7A6245" opacity="0.5" />

      <rect x="330" y="125" width="5" height="30" fill="#5C4A32" opacity="0.6" />
      <ellipse cx="332" cy="120" rx="15" ry="18" fill="#7A6245" opacity="0.5" />

      {/* 새 */}
      <path d="M 140 80 Q 145 75 150 80" stroke="#8B7355" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M 155 75 Q 160 70 165 75" stroke="#8B7355" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}
