
import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share, Zap, Star, Users } from 'lucide-react';

const FloatingElements = () => {
  const [elements, setElements] = useState<Array<{
    id: number;
    Icon: any;
    x: number;
    y: number;
    delay: number;
  }>>([]);

  const icons = [Heart, MessageCircle, Share, Zap, Star, Users];

  useEffect(() => {
    const newElements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      Icon: icons[i],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {elements.map(({ id, Icon, x, y, delay }) => (
        <div
          key={id}
          className="absolute animate-float opacity-20"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${delay}s`
          }}
        >
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
