import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Soft oval under a character or egg so it sits on the grass instead of floating. */
export function GroundShadow({ width }: { width: number }) {
  const theme = useTheme();
  const height = width * 0.14;

  return (
    <View
      accessible={false}
      style={{
        width,
        height,
        marginTop: -height * 1.1,
        borderRadius: width,
        backgroundColor: theme.groundShadow,
        boxShadow: `0 0 ${height}px ${height * 0.6}px ${theme.groundShadow}`,
        zIndex: -1,
      }}
    />
  );
}
