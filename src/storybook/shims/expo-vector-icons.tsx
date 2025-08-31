import React from 'react';
import { Text } from 'react-native';

type IconProps = { name?: string; size?: number; color?: string; style?: any };

function makeIcon(fallback: string) {
  return function Icon(props: IconProps) {
    return (
      <Text style={[{ color: props.color || '#fff', fontSize: props.size || 16 }, props.style]}>
        {fallback}
      </Text>
    );
  };
}

export const MaterialCommunityIcons = makeIcon('◆');
export const Ionicons = makeIcon('◆');
export const Feather = makeIcon('◆');
export const FontAwesome = makeIcon('◆');
export default {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  FontAwesome,
};

