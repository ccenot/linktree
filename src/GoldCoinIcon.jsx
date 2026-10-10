import React from 'react';

export default function GoldCoinIcon({ size = 18, className = '', style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 256 256" 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        {/* Clip path for the outer yellow bevel ring */}
        <clipPath id="outerRingClip">
          <path 
            d="M 128,14 A 114,114 0 1 0 242,128 A 114,114 0 0 0 128,14 Z
               M 128,42 A 86,86 0 1 1 42,128 A 86,86 0 0 1 128,42 Z" 
            clipRule="evenodd" 
          />
        </clipPath>

        {/* Clip path for the inner circle face */}
        <clipPath id="innerFaceClip">
          <circle cx="128" cy="128" r="68" />
        </clipPath>
      </defs>

      {/* Base Outer Rim/Border (Warm Dark Amber) */}
      <circle cx="128" cy="128" r="118" fill="#DA7413" />

      {/* Outer Broad Ring (Yellow Gold) */}
      <circle cx="128" cy="128" r="114" fill="#FED836" />

      {/* Outer Ring Lighting & Highlights */}
      <g clipPath="url(#outerRingClip)">
        {/* Diagonal light sheen slice across the top-left outer ring */}
        <polygon points="18,124 120,22 136,38 34,140" fill="#FFEE66" />
        {/* Primary Specular Curved Highlight at top-left rim */}
        <path 
          d="M 32,118 C 30,86 48,52 74,34 C 77,32 120,-3 124,20 C 88,24 50,56 42,98 C 40,110 33,122 32,118 Z" 
          fill="#FFFFFF" 
        />
      </g>

      {/* Recessed Groove / Inner Bevel Wall (Deep Warm Amber) */}
      <circle cx="128" cy="128" r="88" fill="#D87514" />

      {/* Center Face Disc (Base Warm Amber Tone) */}
      <circle cx="128" cy="128" r="68" fill="#E49216" />

      {/* Center Face Diagonal Light Cut & Highlights */}
      <g clipPath="url(#innerFaceClip)">
        {/* Diagonal Bright Gold Light Beam across inner face */}
        <polygon points="40,200 130,50 210,130 120,220" fill="#FBAE18" />

        {/* Secondary Specular Crescent Highlight at bottom-right edge */}
        <path 
          d="M 120,188 C 152,186 182,162 192,130 C 196,146 188,174 168,188 C 152,198 132,196 120,188 Z" 
          fill="#FFFFFF" 
        />
      </g>

      {/* Subtle Inner Border Crispness Ring */}
      <circle cx="128" cy="128" r="68" fill="none" stroke="#D87514" strokeWidth="2.5" />
    </svg>
  );
}
