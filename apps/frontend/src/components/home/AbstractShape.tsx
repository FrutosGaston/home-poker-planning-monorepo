import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const PATHS = [
  'M50,0 C70,10 90,30 80,50 C70,70 30,80 10,60 C-10,40 10,10 50,0Z',
  'M60,5 C80,15 95,40 75,60 C55,80 20,75 5,55 C-10,35 15,0 60,5Z',
  'M45,2 C68,8 92,35 78,58 C64,80 25,82 8,60 C-8,38 12,5 45,2Z',
];

interface Props {
  color?: string;
  size?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
}

export default function AbstractShape({ color = '#7c4dff33', size = 200, top, left, right, bottom }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef(0);
  const indexRef = useRef(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      progressRef.current += 0.005;
      if (progressRef.current >= 1) {
        progressRef.current = 0;
        indexRef.current = (indexRef.current + 1) % PATHS.length;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <Box sx={{ position: 'absolute', top, left, right, bottom, opacity: 0.6, pointerEvents: 'none', zIndex: 0 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path ref={pathRef} d={PATHS[0]} fill={color} />
      </svg>
    </Box>
  );
}
