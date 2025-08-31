import React, { useMemo } from 'react';
import { View } from 'react-native';

type LinearGradientProps = {
  colors: string[];
  locations?: number[];
  startPoint?: [number, number];
  endPoint?: [number, number];
  style?: any;
  children?: React.ReactNode;
  onLayout?: any;
};

function formatStops(colors: string[], locations?: number[]) {
  return colors.map((c, i) => {
    if (locations && locations[i] != null) {
      const pct = Math.max(0, Math.min(1, locations[i]!)) * 100;
      return `${c} ${pct}%`;
    }
    return c;
  });
}

export function LinearGradient({ colors, locations, startPoint, endPoint, style, children, ...rest }: LinearGradientProps) {
  // Simple angle approximation using start/end, fallback to 180deg
  const angle = useMemo(() => {
    const start = Array.isArray(startPoint) ? startPoint : [0, 0];
    const end = Array.isArray(endPoint) ? endPoint : [0, 1];
    const py = end[1] - start[1];
    const px = end[0] - start[0];
    return 90 + (Math.atan2(py, px) * 180) / Math.PI;
  }, [startPoint, endPoint]);

  const backgroundImage = useMemo(() => {
    const stops = formatStops(colors, locations).join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }, [colors, locations, angle]);

  return (
    <View {...rest} style={[style, { backgroundImage }]}>
      {children}
    </View>
  );
}

export default LinearGradient;

