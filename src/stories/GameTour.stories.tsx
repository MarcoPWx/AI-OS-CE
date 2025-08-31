import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { GameTour } from '../../src/components/GameTour';

const meta: Meta<typeof GameTour> = {
  title: 'Guided Tour/GameTour',
  component: GameTour,
};
export default meta;

const defaultVisible = ((import.meta as any)?.env?.EXPO_PUBLIC_TOUR_DEFAULT === '1') || false;

export const GuidedTour: StoryObj<typeof GameTour> = {
  render: () => {
    const [visible, setVisible] = useState(defaultVisible);

    useEffect(() => {
      if (defaultVisible) {
        setVisible(true);
      }
    }, []);

    return (
      <View style={{ flex: 1, minHeight: 600, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ marginBottom: 12 }}>Click "Start Tour" to open the Game Tour overlay.</Text>
        <button
          onClick={() => setVisible(true)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.5)', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: 'white', fontWeight: 700 }}
        >
          Start Tour
        </button>
        <GameTour visible={visible} onComplete={() => setVisible(false)} />
      </View>
    );
  },
};

