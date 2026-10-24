import React, { useMemo } from 'react';

// 5x7 Dot-Matrix Font Definition for LED simulation
const FONT_5X7: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01111, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b01111],
  'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  'G': [0b01111, 0b10000, 0b10000, 0b10011, 0b10001, 0b10001, 0b01111],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'I': [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  'J': [0b00011, 0b00001, 0b00001, 0b00001, 0b10001, 0b10001, 0b01110],
  'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  'N': [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10011, 0b01111],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10011, 0b10101, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  '/': [0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b00000, 0b00000],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  ':': [0b00000, 0b00100, 0b00000, 0b00000, 0b00100, 0b00000, 0b00000],
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00000],
};

interface DotMatrixDisplayProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  glow?: boolean;
  className?: string;
}

export const DotMatrixDisplay: React.FC<DotMatrixDisplayProps> = ({
  text,
  size = 'md',
  color = '#00FFA3',
  glow = true,
  className = '',
}) => {
  const chars = useMemo(() => text.toUpperCase().split(''), [text]);

  const dotSize = {
    sm: 2.2,
    md: 3.2,
    lg: 4.5,
    xl: 6.0,
  }[size];

  const gap = {
    sm: 1.5,
    md: 2.0,
    lg: 2.5,
    xl: 3.2,
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ gap: `${gap * 2.5}px` }}>
      {chars.map((char, charIdx) => {
        const matrix = FONT_5X7[char] || FONT_5X7[' '];
        return (
          <div
            key={charIdx}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(5, ${dotSize}px)`,
              gridTemplateRows: `repeat(7, ${dotSize}px)`,
              gap: `${gap}px`,
            }}
          >
            {matrix.map((rowVal, rowIdx) =>
              [4, 3, 2, 1, 0].map((bitIdx) => {
                const isLit = (rowVal & (1 << bitIdx)) !== 0;
                return (
                  <div
                    key={`${rowIdx}-${bitIdx}`}
                    style={{
                      width: `${dotSize}px`,
                      height: `${dotSize}px`,
                      borderRadius: '50%',
                      backgroundColor: isLit ? color : 'rgba(0, 255, 163, 0.08)',
                      boxShadow: isLit && glow ? `0 0 ${dotSize * 1.8}px ${color}, 0 0 ${dotSize * 3}px ${color}80` : 'none',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};
