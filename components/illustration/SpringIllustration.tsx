export default function SpringIllustration() {
  return (
    <svg viewBox="0 0 375 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="springSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B0E2FF" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="springGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90EE90" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6B8E23" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect width="375" height="200" fill="url(#springSky)" />

      {/* 구름 */}
      <ellipse cx="80" cy="50" rx="40" ry="16" fill="white" opacity="0.7" />
      <ellipse cx="105" cy="44" rx="30" ry="18" fill="white" opacity="0.7" />
      <ellipse cx="60" cy="48" rx="22" ry="14" fill="white" opacity="0.6" />

      <ellipse cx="280" cy="40" rx="45" ry="15" fill="white" opacity="0.65" />
      <ellipse cx="305" cy="35" rx="32" ry="17" fill="white" opacity="0.65" />

      {/* 언덕 */}
      <ellipse cx="187" cy="200" rx="220" ry="80" fill="#90EE90" opacity="0.4" />
      <ellipse cx="50" cy="200" rx="100" ry="60" fill="#7CCD7C" opacity="0.35" />
      <ellipse cx="330" cy="200" rx="90" ry="55" fill="#7CCD7C" opacity="0.35" />

      {/* 땅 */}
      <rect x="0" y="155" width="375" height="45" fill="url(#springGround)" />

      {/* 벚꽃나무 */}
      <rect x="90" y="110" width="8" height="45" fill="#8B7355" opacity="0.7" />
      <ellipse cx="94" cy="100" rx="35" ry="28" fill="#FFB7C5" opacity="0.5" />
      <ellipse cx="80" cy="108" rx="22" ry="18" fill="#FF9BAD" opacity="0.45" />
      <ellipse cx="110" cy="106" rx="20" ry="16" fill="#FFB7C5" opacity="0.45" />

      {/* 꽃잎 날리기 */}
      {[[130, 90], [150, 70], [165, 100], [200, 80], [220, 95]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5" fill="#FFB7C5" opacity="0.6"
          transform={`rotate(${i * 35} ${x} ${y})`} />
      ))}

      {/* 오른쪽 나무 */}
      <rect x="280" y="118" width="7" height="37" fill="#8B7355" opacity="0.7" />
      <ellipse cx="283" cy="108" rx="28" ry="24" fill="#90EE90" opacity="0.5" />

      {/* 새 */}
      <path d="M 200 55 Q 205 50 210 55" stroke="#8B7355" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 215 50 Q 220 45 225 50" stroke="#8B7355" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
