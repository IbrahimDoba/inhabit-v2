import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/** Soft gold rays that fade out toward the edges. Fills its parent; spin it from outside. */
export function SunRays({ count = 12 }: { count?: number }) {
  const theme = useTheme();
  const step = 360 / count;

  return (
    <Svg width="100%" height="100%" viewBox="-100 -100 200 200">
      <Defs>
        <RadialGradient id="rayFade" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.burst} stopOpacity={0.9} />
          <Stop offset="0.35" stopColor={theme.gold} stopOpacity={0.45} />
          <Stop offset="1" stopColor={theme.gold} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {Array.from({ length: count }, (_, i) => (
        <Path
          key={i}
          d="M0 0 L-10 -100 L10 -100 Z"
          fill="url(#rayFade)"
          opacity={i % 2 ? 0.6 : 1}
          transform={`rotate(${i * step})`}
        />
      ))}
    </Svg>
  );
}
