"use client";

type Props = { className?: string; animated?: boolean };

export function NoctaveLogo({ className = "", animated = true }: Props) {
  return (
    <svg
      className={`noctave-logo ${animated ? "noctave-logo--animated" : ""} ${className}`}
      viewBox="0 0 520 96"
      role="img"
      aria-label="Noctave FM"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="noctave-brand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ff2bd6" />
        </linearGradient>
        <linearGradient id="noctave-vinyl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
        <filter id="noctave-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="font-[family-name:var(--font-syne)]" style={{ fontWeight: 800 }}>
        <text x="0" y="68" fontSize="56" fill="url(#noctave-brand)" letterSpacing="-1">
          N
        </text>
      </g>

      <g transform="translate(52, 14)" filter="url(#noctave-glow)">
        <circle cx="34" cy="34" r="34" fill="none" stroke="url(#noctave-vinyl)" strokeWidth="3" opacity="0.9" />
        <circle cx="34" cy="34" r="26" fill="none" stroke="url(#noctave-vinyl)" strokeWidth="1.2" opacity="0.35" />
        <circle cx="34" cy="34" r="18" fill="none" stroke="url(#noctave-vinyl)" strokeWidth="1" opacity="0.25" />
        <circle cx="34" cy="34" r="6" fill="#0a0a12" stroke="url(#noctave-vinyl)" strokeWidth="2" />
        {[10, 18, 26].map((r) => (
          <circle key={r} cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        ))}
        <g opacity="0.85">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`L${i}`}
              x={4 + i * 3.2}
              y={52 - (10 + i * 6)}
              width="2.2"
              height={10 + i * 6}
              rx="1"
              fill="url(#noctave-brand)"
              className="noctave-logo-eq"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`R${i}`}
              x={58 + i * 3.2}
              y={52 - (12 + i * 5)}
              width="2.2"
              height={12 + i * 5}
              rx="1"
              fill="url(#noctave-brand)"
              className="noctave-logo-eq"
              style={{ animationDelay: `${0.2 + i * 0.11}s` }}
            />
          ))}
        </g>
      </g>

      <g className="font-[family-name:var(--font-syne)]" style={{ fontWeight: 800 }}>
        <text x="128" y="68" fontSize="56" fill="url(#noctave-brand)" letterSpacing="-2">
          CTAVE
        </text>
        <text x="392" y="68" fontSize="56" fill="url(#noctave-brand)" letterSpacing="-2">
          FM
        </text>
      </g>
    </svg>
  );
}
