import { motion } from 'framer-motion';
import { Box } from '@mui/material';

interface Props {
  color?: string;
  size?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  initialPath: string;
  finalPath: string;
  duration?: number;
  floatX?: number;
  floatY?: number;
}

export default function AbstractShape({
  color = '#00897B33',
  size = 500,
  top, left, right, bottom,
  initialPath,
  finalPath,
  duration = 30,
  floatX = 20,
  floatY = 30,
}: Props) {
  return (
    <Box sx={{ position: 'absolute', top, left, right, bottom, pointerEvents: 'none', zIndex: 0, width: size, height: size }}>
      <motion.div
        animate={{
          x: [0, floatX, -floatX / 2, floatX / 3, 0],
          y: [0, -floatY, floatY / 2, -floatY / 3, 0],
        }}
        transition={{ duration: duration * 0.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width={size} height={size}>
          <path fill={color} fillRule="nonzero">
            <animate
              dur={`${duration}s`}
              repeatCount="indefinite"
              attributeName="d"
              values={`${initialPath};${finalPath};${initialPath}`}
            />
          </path>
        </svg>
      </motion.div>
    </Box>
  );
}
