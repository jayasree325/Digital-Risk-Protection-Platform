import React, { useRef, useState, useCallback } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enable3DTilt?: boolean;
  spotlightColor?: string;
  showCornerAccents?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  enable3DTilt = true,
  spotlightColor = 'rgba(0, 255, 163, 0.18)',
  showCornerAccents = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
    setOpacity(1);

    if (enable3DTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.5; // Max 4.5 deg tilt
      const rotateY = ((x - centerX) / centerX) * 4.5;
      setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(2px)`);
    }
  }, [enable3DTilt]);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
    if (enable3DTilt) {
      setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    }
  }, [enable3DTilt]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-[#00FFA3]/15 bg-[#020713]/85 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,5,11,0.6)] hover:border-[#00FFA3]/40 overflow-hidden transition-all duration-300 ease-out ${
        showCornerAccents ? 'retro-corner-bracket' : ''
      } ${className}`}
      style={{
        transform: enable3DTilt ? transformStyle : undefined,
        transformStyle: enable3DTilt ? 'preserve-3d' : undefined,
        willChange: enable3DTilt ? 'transform' : undefined,
      }}
      {...props}
    >
      {/* Magic UI Dynamic Cursor Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Aurora Specular Top Inset Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent" />

      {/* Card Content with 3D child preservation */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
