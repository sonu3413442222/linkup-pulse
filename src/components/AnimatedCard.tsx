
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  glowEffect?: boolean;
}

const AnimatedCard = ({ children, className, hoverScale = true, glowEffect = true }: AnimatedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      {glowEffect && (
        <div className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000",
          isHovered && "animate-pulse"
        )} />
      )}
      <Card
        className={cn(
          "relative bg-white/90 backdrop-blur-xl border-0 shadow-2xl transition-all duration-500",
          hoverScale && "hover:scale-[1.02] hover:-translate-y-1",
          "hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)]",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 before:to-pink-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Card>
    </div>
  );
};

export default AnimatedCard;
