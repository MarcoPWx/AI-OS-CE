// .storybook/stubs/expo-vector-icons.tsx
import React from 'react';

type IconProps = { name?: string; size?: number; color?: string; style?: React.CSSProperties };

const SimpleIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', style }) => (
  <span
    aria-hidden="true"
    style={{ display: 'inline-block', width: size, height: size, color, ...style }}
  >
    ★
  </span>
);

export const AntDesign = SimpleIcon as any;
export const Entypo = SimpleIcon as any;
export const EvilIcons = SimpleIcon as any;
export const Feather = SimpleIcon as any;
export const FontAwesome = SimpleIcon as any;
export const FontAwesome5 = SimpleIcon as any;
export const FontAwesome6 = SimpleIcon as any;
export const Fontisto = SimpleIcon as any;
export const Foundation = SimpleIcon as any;
export const Ionicons = SimpleIcon as any;
export const MaterialCommunityIcons = SimpleIcon as any;
export const MaterialIcons = SimpleIcon as any;
export const Octicons = SimpleIcon as any;
export const SimpleLineIcons = SimpleIcon as any;
export const Zocial = SimpleIcon as any;

export default {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
};
