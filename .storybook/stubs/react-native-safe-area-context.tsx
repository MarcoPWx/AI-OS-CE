// .storybook/stubs/react-native-safe-area-context.tsx
import React from 'react';

export const SafeAreaView: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  children,
  style,
}) => <div style={style}>{children}</div>;

export default { SafeAreaView };
