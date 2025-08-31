// .storybook/stubs/expo-linear-gradient.tsx
import React from 'react';
import { View } from 'react-native';

export const LinearGradient: React.FC<
  React.PropsWithChildren<{ colors?: string[]; style?: any }>
> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

export default LinearGradient;
