import React, { useState, useEffect } from 'react';
import { PieceType, PieceColor } from '../types';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  theme?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = '', theme = 'neo' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const isWhite = color === 'w';

  // Reset imgFailed state if type or color changes
  useEffect(() => {
    setImgFailed(false);
  }, [type, color, theme]);

  if (!imgFailed) {
    const pieceCode = `${color}${type}`;
    // Chess.com Neo or Classic theme pieces
    const url = `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${pieceCode}.png`;
    return (
      <img
        src={url}
        alt={pieceCode}
        className={`w-full h-full select-none object-contain ${className}`}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Dynamic colors based on white vs black piece configurations
  const fill = isWhite ? 'fill-neutral-50' : 'fill-neutral-800';
  const stroke = isWhite ? 'stroke-neutral-800' : 'stroke-neutral-200';
  const accentFill = isWhite ? 'fill-neutral-800/10' : 'fill-white/10';

  // We wrap paths in a 45x45 viewBox structure
  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path
              d="M22.5 9C24.3778 9 25.875 10.4972 25.875 12.375C25.875 13.916 24.8491 15.2158 23.4735 15.6517C24.7176 17.5097 26.3125 19.875 27.5625 22.5C29.625 26.8125 29.8125 29.25 29.8125 31.5H15.1875c0-2.25 0.1875-4.6875 2.25-9 1.25-2.625 2.8449-4.9903 4.089-6.8483C20.1509 15.2158 19.125 13.916 19.125 12.375C19.125 10.4972 20.6222 9 22.5 9z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="22.5" cy="12.37" r="2.5" className={`${accentFill}`} />
            <path d="M17.5 31.5h10M16 34.5h13a1 1 0 011 1v1.5H15V35.5a1 1 0 011-1z" className={`${fill} ${stroke}`} strokeWidth="1.8" />
          </g>
          <defs>
            <filter id="shadow" x="0%" y="0%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodOpacity="0.25" />
            </filter>
          </defs>
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path
              d="M14 11h3v3h4v-3h4v3h4v-3h3v5.5H13V11zm2 8.5h13l1.5 8h-16l1.5-8z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Castle body connecting tower and base */}
            <path
              d="M15.5 28.5V16.5h14v12M13 31.5h19v3H13v-3zm-1 3.5h21a1 1 0 011 1v1.5H11v-1.5a1 1 0 011-1z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <rect x="20" y="21" width="5" height="4" rx="0.5" className={`${accentFill} ${stroke}`} strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            {/* The horse shape, beautifully curved and balanced */}
            <path
              d="M33 34.5c0-1.5-1.5-4-1.5-5.5s1-3.5 1-6.5c0-4.5-2.5-8-6.5-10.5C22 9.5 17 11.5 14 15.5c-1 1.33-1 2.5-0.5 3s1.5.5 1.5 1.5c0 2-4.5 3.5-4.5 7.5 0 2 1.5 3 2.5 3 1.5 0 2-1 2-2.5 0-3 3-5 5.5-5a1 1 0 011 1v2c0 2 1 3.5 2.5 4.5l-2.5 4h18z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Knight's eye */}
            <circle cx="18.5" cy="16.5" r="1.2" className={isWhite ? 'fill-neutral-800' : 'fill-neutral-200'} />
            {/* Mane line */}
            <path d="M26.5 12c.5 1 1 2.5 1 4.5s-.5 4.5-1 6" stroke={isWhite ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 34.5h21v3H12v-3z" className={`${fill} ${stroke}`} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            {/* Sphere at the top tip */}
            <circle cx="22.5" cy="6.5" r="2" className={`${fill} ${stroke}`} strokeWidth="1.8" />
            
            {/* Bishop elegant oval body shape */}
            <path
              d="M16 22c0-3.58 2.91-7.5 6.5-10.5 3.59 3 6.5 6.92 6.5 10.5 0 4.14-2.91 7.5-6.5 7.5s-6.5-3.36-6.5-7.5z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Traditional cross hatch slash on the bishop's mitre */}
            <path d="M20 18l5 5M25 18l-5 5" stroke={isWhite ? '#262626' : '#fafafa'} strokeWidth="1.8" strokeLinecap="round" />

            <path
              d="M17.5 29.5c1-1 2-1 5-1s4 0 5 1m-11.5 2h13v3h-13v-3zm-1 3.5h15a1 1 0 011 1v1.5H10v-1.5a1 1 0 011-1z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path
              d="M11.5 12.5l2.5 13.5h17l2.5-13.5-5.5 5.5-5.5-9.5-5.5 9.5-5.5-5.5z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            
            {/* Ornaments for the custom crown peaks */}
            <circle cx="11.5" cy="11.5" r="1.5" className={`${fill} stroke-neutral-800`} strokeWidth="1" />
            <circle cx="17" cy="17.5" r="1.5" className={`${fill} stroke-neutral-800`} strokeWidth="1" />
            <circle cx="22.5" cy="8.5" r="1.5" className={`${fill} stroke-neutral-800`} strokeWidth="1" />
            <circle cx="28" cy="17.5" r="1.5" className={`${fill} stroke-neutral-800`} strokeWidth="1" />
            <circle cx="33.5" cy="11.5" r="1.5" className={`${fill} stroke-neutral-800`} strokeWidth="1" />

            {/* Inner waist band decoration */}
            <path d="M15.5 22.5h14" stroke={isWhite ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'} strokeWidth="2.5" strokeLinecap="round" />

            <path
              d="M13.5 28.5c1-1.5 2.5-1.5 9-1.5s8 0 9 1.5m-19 3h20v2.5h-20v-2.5zm-1.5 3h23a1 1 0 011 1v1.5H11v-1.5a1 1 0 011-1z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={`w-full h-full ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            {/* The Cross at the top of the crown */}
            <path d="M22.5 5v5.5M19.5 7.5h6" stroke={isWhite ? '#171717' : '#f5f5f5'} strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Crown base structural arches */}
            <path
              d="M15.5 15c1-2.5 3.5-4.5 7-4.5s6 2 7 4.5l-3.5 1.5L22.5 12l-3.5 4.5L15.5 15z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* King's high crown guard walls */}
            <path
              d="M14.5 14l2.5 12h11l2.5-12c-1.5 1-4 1.5-8 1.5s-6.5-.5-8-1.5z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Decorative royal girdle accent */}
            <path d="M18.5 22.5h8" stroke={isWhite ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'} strokeWidth="2" strokeLinecap="round" />

            <path
              d="M13.5 28.5c1-1.5 2-1.5 9-1.5s8 0 9 1.5m-19 3h20v2.5h-20v-2.5zm-1.5 3.5h23a1 1 0 011 1v1.5H11v-1.5a1 1 0 011-1z"
              className={`${fill} ${stroke}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
