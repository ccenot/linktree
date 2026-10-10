import React from 'react';

export default function FlyingCoinIcon({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 300" 
      width={size} 
      height={Math.round(size * 0.75)} 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        {/* Warm Gold / Amber Gradient */}
        <linearGradient id="flyingCoinGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Soft Wing Gradient */}
        <linearGradient id="flyingWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* LEFT WING (Descending banking angle) */}
      <g className="left-wing">
        <path 
          d="M 155 170 C 120 175, 45 190, 22 170 C 16 165, 20 152, 35 152 C 65 152, 115 150, 150 160 Z" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 28 171 C 32 188, 48 200, 68 190 C 85 182, 108 178, 140 176" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 50 196 C 56 215, 80 220, 100 205 C 114 195, 130 185, 148 182" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        {/* Amber Leading Edge Accent */}
        <path 
          d="M 22 169 C 26 156, 45 153, 90 152" 
          fill="none" 
          stroke="#f59e0b" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
      </g>

      {/* RIGHT WING (Ascending 45 deg angle) */}
      <g className="right-wing">
        <path 
          d="M 255 140 C 275 90, 318 42, 350 25 C 358 20, 368 28, 362 42 C 350 70, 320 110, 280 148 Z" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 358 35 C 375 48, 380 68, 362 88 C 345 106, 320 125, 290 148" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 360 88 C 372 108, 355 128, 335 132 C 315 136, 298 142, 285 152" 
          fill="url(#flyingWingGrad)" 
          stroke="#0f172a" 
          strokeWidth="6" 
          strokeLinejoin="round" 
        />
        {/* Amber Leading Edge Accent */}
        <path 
          d="M 345 28 C 356 38, 325 80, 275 135" 
          fill="none" 
          stroke="#f59e0b" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
      </g>

      {/* COIN BASE & MILLED RIM */}
      <g className="coin" transform="translate(210, 175)">
        {/* Outer Coin Rim */}
        <circle r="75" fill="url(#flyingCoinGrad)" stroke="#0f172a" strokeWidth="6" />

        {/* Reeded / Milled Edge Ticks */}
        <circle r="69" fill="none" stroke="#78350f" strokeWidth="7" strokeDasharray="3 4.5" opacity="0.9" />

        {/* Inner Coin Face Border */}
        <circle r="63" fill="url(#flyingCoinGrad)" stroke="#0f172a" strokeWidth="5" />

        {/* Dynamic Tilted Dollar Sign (-16 deg) */}
        <g transform="rotate(-16)">
          <rect x="-6" y="-48" width="12" height="96" rx="4" fill="#0f172a" />
          <path 
            d="M 22 -22 C 20 -36, 5 -40, -4 -40 C -22 -40, -28 -26, -26 -13 C -23 2, -6 7, 7 12 C 22 17, 28 24, 26 36 C 23 48, 5 52, -6 52 C -23 52, -28 40, -28 28" 
            fill="none" 
            stroke="#0f172a" 
            strokeWidth="15" 
            strokeLinecap="round" 
          />
        </g>
      </g>
    </svg>
  );
}
