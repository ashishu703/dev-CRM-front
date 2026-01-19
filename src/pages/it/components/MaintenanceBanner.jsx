import React from 'react';

export default function MaintenanceBanner() {
  return (
    <div className="w-full max-w-6xl flex items-center justify-center">
      <svg viewBox="0 0 1200 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#E8E0F7", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#F5F3FA", stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="1200" height="600" fill="url(#bgGradient)" />

        {/* Background Gears - Left */}
        <g opacity="0.3">
          {/* Top Left Gear */}
          <circle cx="110" cy="90" r="45" fill="none" stroke="#C4B5E0" strokeWidth="8" />
          <circle cx="110" cy="90" r="60" fill="none" stroke="#C4B5E0" strokeWidth="3" />
          <g strokeWidth="6" stroke="#C4B5E0">
            <line x1="110" y1="30" x2="110" y2="10" />
            <line x1="110" y1="150" x2="110" y2="170" />
            <line x1="50" y1="90" x2="30" y2="90" />
            <line x1="170" y1="90" x2="190" y2="90" />
            <line x1="62" y1="42" x2="48" y2="28" />
            <line x1="158" y1="138" x2="172" y2="152" />
            <line x1="158" y1="42" x2="172" y2="28" />
            <line x1="62" y1="138" x2="48" y2="152" />
          </g>
        </g>

        {/* Background Gears - Right */}
        <g opacity="0.3">
          {/* Top Right Gear */}
          <circle cx="1090" cy="110" r="50" fill="none" stroke="#C4B5E0" strokeWidth="8" />
          <circle cx="1090" cy="110" r="65" fill="none" stroke="#C4B5E0" strokeWidth="3" />
          <g strokeWidth="6" stroke="#C4B5E0">
            <line x1="1090" y1="45" x2="1090" y2="20" />
            <line x1="1090" y1="175" x2="1090" y2="200" />
            <line x1="1025" y1="110" x2="1000" y2="110" />
            <line x1="1155" y1="110" x2="1180" y2="110" />
            <line x1="1032" y1="52" x2="1015" y2="35" />
            <line x1="1148" y1="168" x2="1165" y2="185" />
            <line x1="1148" y1="52" x2="1165" y2="35" />
            <line x1="1032" y1="168" x2="1015" y2="185" />
          </g>
        </g>

        {/* Large Gear Behind */}
        <g opacity="0.15">
          <circle cx="600" cy="150" r="120" fill="none" stroke="#B5A3D8" strokeWidth="10" />
          <circle cx="600" cy="150" r="150" fill="none" stroke="#B5A3D8" strokeWidth="4" />
          <g strokeWidth="8" stroke="#B5A3D8">
            <line x1="600" y1="30" x2="600" y2="0" />
            <line x1="600" y1="270" x2="600" y2="300" />
            <line x1="480" y1="150" x2="450" y2="150" />
            <line x1="720" y1="150" x2="750" y2="150" />
            <line x1="505" y1="55" x2="485" y2="35" />
            <line x1="695" y1="245" x2="715" y2="265" />
            <line x1="695" y1="55" x2="715" y2="35" />
            <line x1="505" y1="245" x2="485" y2="265" />
          </g>
        </g>

        {/* Left Phone/Screen */}
        <g>
          {/* Phone body */}
          <rect
            x="40"
            y="200"
            width="160"
            height="280"
            rx="20"
            fill="#E0D5FF"
            stroke="#B5A3D8"
            strokeWidth="2"
            filter="url(#shadow)"
          />

          {/* Phone screen */}
          <rect x="52" y="220" width="136" height="240" rx="12" fill="#F0ECFF" />

          {/* Cloud icon */}
          <path
            d="M 100 250 Q 85 250 80 265 Q 75 275 85 285 L 115 285 Q 125 285 120 275 Q 125 260 105 255 Z"
            fill="#D4C8FF"
          />

          {/* Dots under cloud */}
          <circle cx="95" cy="310" r="4" fill="#D4C8FF" />
          <circle cx="105" cy="310" r="4" fill="#D4C8FF" />
          <circle cx="115" cy="310" r="4" fill="#D4C8FF" />

          {/* Lines (text placeholder) */}
          <rect x="65" y="330" width="110" height="6" rx="3" fill="#D4C8FF" />
          <rect x="65" y="345" width="100" height="6" rx="3" fill="#D4C8FF" />
          <rect x="65" y="360" width="90" height="6" rx="3" fill="#D4C8FF" />

          {/* Small elements */}
          <rect x="65" y="380" width="16" height="16" rx="2" fill="#D4C8FF" />
          <rect x="90" y="380" width="16" height="16" rx="2" fill="#D4C8FF" />
          <rect x="115" y="380" width="16" height="16" rx="2" fill="#D4C8FF" />
        </g>

        {/* Person on left phone */}
        <g>
          {/* Head */}
          <circle cx="85" cy="140" r="18" fill="#E8998D" />
          {/* Hair */}
          <path d="M 70 138 Q 70 120 85 118 Q 100 120 100 138" fill="#D67A6E" />
          {/* Body */}
          <rect x="75" y="160" width="20" height="30" rx="4" fill="#E94B8F" />
          {/* Legs */}
          <line x1="80" y1="190" x2="78" y2="210" strokeWidth="3" stroke="#8B6E8F" />
          <line x1="88" y1="190" x2="90" y2="210" strokeWidth="3" stroke="#8B6E8F" />
        </g>

        {/* Center Maintenance Sign */}
        <g>
          {/* Sign rope */}
          <line x1="600" y1="60" x2="570" y2="120" strokeWidth="2" stroke="#A9A9A9" strokeDasharray="5,5" />
          <line x1="600" y1="60" x2="630" y2="120" strokeWidth="2" stroke="#A9A9A9" strokeDasharray="5,5" />

          {/* Triangle hook */}
          <path d="M 600 50 L 595 65 L 605 65 Z" fill="#A9A9A9" />

          {/* Sign box */}
          <rect
            x="510"
            y="120"
            width="180"
            height="100"
            rx="4"
            fill="#FFD700"
            stroke="#FFC700"
            strokeWidth="3"
            filter="url(#shadow)"
          />

          {/* Sign border */}
          <rect x="518" y="128" width="164" height="84" fill="none" stroke="white" strokeWidth="2" />

          {/* Text - UNDER */}
          <text
            x="600"
            y="155"
            fontSize="32"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            UNDER
          </text>

          {/* Text - MAINTENANCE */}
          <text
            x="600"
            y="185"
            fontSize="28"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            MAINTENANCE
          </text>

          {/* Diagonal stripes */}
          <line x1="530" y1="195" x2="550" y2="195" strokeWidth="2" stroke="white" />
          <line x1="545" y1="195" x2="565" y2="195" strokeWidth="2" stroke="white" />
          <line x1="560" y1="195" x2="580" y2="195" strokeWidth="2" stroke="white" />
          <line x1="575" y1="195" x2="595" y2="195" strokeWidth="2" stroke="white" />
          <line x1="590" y1="195" x2="610" y2="195" strokeWidth="2" stroke="white" />
          <line x1="605" y1="195" x2="625" y2="195" strokeWidth="2" stroke="white" />
          <line x1="620" y1="195" x2="640" y2="195" strokeWidth="2" stroke="white" />
          <line x1="635" y1="195" x2="655" y2="195" strokeWidth="2" stroke="white" />
          <line x1="650" y1="195" x2="670" y2="195" strokeWidth="2" stroke="white" />
        </g>

        {/* Support beam from sign */}
        <line x1="600" y1="220" x2="600" y2="420" strokeWidth="6" stroke="#6B5B95" opacity="0.4" />

        {/* Right Screen */}
        <g>
          {/* Screen body */}
          <rect
            x="950"
            y="200"
            width="200"
            height="300"
            rx="24"
            fill="#D8D0E8"
            stroke="#A9A3C4"
            strokeWidth="2"
            filter="url(#shadow)"
          />

          {/* Screen display */}
          <rect x="968" y="225" width="164" height="250" rx="16" fill="#F0ECFF" />

          {/* Loading indicator */}
          <circle cx="1050" cy="300" r="25" fill="none" stroke="#D4C8FF" strokeWidth="3" />
          <path
            d="M 1050 275 A 25 25 0 0 1 1070 290"
            fill="none"
            stroke="#B5A3D8"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Loading dots */}
          <circle cx="1030" cy="350" r="5" fill="#D4C8FF" opacity="0.7" />
          <circle cx="1050" cy="350" r="5" fill="#D4C8FF" opacity="0.5" />
          <circle cx="1070" cy="350" r="5" fill="#D4C8FF" opacity="0.3" />

          {/* Update text */}
          <text
            x="1050"
            y="390"
            fontSize="14"
            fontWeight="500"
            fill="#B5A3D8"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            UPDATE
          </text>
          <text
            x="1050"
            y="410"
            fontSize="18"
            fontWeight="700"
            fill="#B5A3D8"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            SOFTWARE
          </text>

          {/* Info badge */}
          <circle cx="1120" cy="270" r="24" fill="#FFD700" stroke="#FFC700" strokeWidth="2" filter="url(#shadow)" />
          <text
            x="1120"
            y="280"
            fontSize="20"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            i
          </text>
        </g>

        {/* Person on right screen */}
        <g>
          {/* Head */}
          <circle cx="1020" cy="115" r="20" fill="#E8998D" />
          {/* Hair */}
          <path d="M 1002 112 Q 1002 92 1020 90 Q 1038 92 1038 112" fill="#D67A6E" />
          {/* Body */}
          <rect x="1008" y="137" width="24" height="35" rx="4" fill="#FFD700" />
          {/* Legs */}
          <line x1="1013" y1="172" x2="1010" y2="195" strokeWidth="3" stroke="#8B6E8F" />
          <line x1="1021" y1="172" x2="1024" y2="195" strokeWidth="3" stroke="#8B6E8F" />
        </g>

        {/* Center figure - woman with indicator */}
        <g>
          {/* Head */}
          <circle cx="625" cy="280" r="22" fill="#E8998D" />
          {/* Hair */}
          <ellipse cx="625" cy="270" rx="24" ry="18" fill="#D67A6E" />
          {/* Body */}
          <rect x="612" y="305" width="26" height="40" rx="4" fill="#E94B8F" />
          {/* Legs */}
          <line x1="618" y1="345" x2="615" y2="375" strokeWidth="3" stroke="#8B6E8F" />
          <line x1="632" y1="345" x2="635" y2="375" strokeWidth="3" stroke="#8B6E8F" />

          {/* Voice indicator circles */}
          <circle cx="665" cy="295" r="8" fill="none" stroke="#D4C8FF" strokeWidth="2" />
          <circle cx="680" cy="290" r="12" fill="none" stroke="#D4C8FF" strokeWidth="2" />
          <circle cx="695" cy="295" r="8" fill="none" stroke="#D4C8FF" strokeWidth="2" />
        </g>

        {/* Bottom decorative elements */}

        {/* Left barrier/caution tape */}
        <g>
          <rect
            x="280"
            y="380"
            width="120"
            height="60"
            rx="4"
            fill="#FFB6C1"
            opacity="0.3"
            stroke="#FF69B4"
            strokeWidth="2"
          />
          <line x1="280" y1="390" x2="400" y2="390" strokeWidth="3" stroke="#FF69B4" />
          <line x1="280" y1="405" x2="400" y2="405" strokeWidth="3" stroke="#FF69B4" />
          <line x1="280" y1="420" x2="400" y2="420" strokeWidth="3" stroke="#FF69B4" />
          <line x1="280" y1="435" x2="400" y2="435" strokeWidth="3" stroke="#FF69B4" />
        </g>

        {/* Safety cone */}
        <g>
          <polygon points="420,470 410,340 430,340" fill="#FFD700" />
          <ellipse cx="420" cy="470" rx="15" ry="8" fill="#FFC700" />
          <line x1="410" y1="395" x2="430" y2="395" strokeWidth="2" stroke="#8B6E8F" />
          <line x1="410" y1="430" x2="430" y2="430" strokeWidth="2" stroke="#8B6E8F" />
        </g>

        {/* Construction barrier sections */}
        <g opacity="0.5">
          {/* Left section */}
          <rect x="20" y="450" width="80" height="120" fill="#D8D0E8" stroke="#A9A3C4" strokeWidth="2" />
          <line x1="25" y1="465" x2="95" y2="465" strokeWidth="2" stroke="#A9A3C4" />
          <line x1="25" y1="490" x2="95" y2="490" strokeWidth="2" stroke="#A9A3C4" />
          <line x1="25" y1="515" x2="95" y2="515" strokeWidth="2" stroke="#A9A3C4" />

          {/* Right section */}
          <rect x="1100" y="470" width="80" height="100" fill="#D8D0E8" stroke="#A9A3C4" strokeWidth="2" />
          <line x1="1105" y1="485" x2="1175" y2="485" strokeWidth="2" stroke="#A9A3C4" />
          <line x1="1105" y1="510" x2="1175" y2="510" strokeWidth="2" stroke="#A9A3C4" />
          <line x1="1105" y1="535" x2="1175" y2="535" strokeWidth="2" stroke="#A9A3C4" />
        </g>

        {/* Bottom shadow/ground line */}
        <line x1="0" y1="560" x2="1200" y2="560" strokeWidth="2" stroke="#D4C8FF" opacity="0.3" />
      </svg>
    </div>
  );
}

