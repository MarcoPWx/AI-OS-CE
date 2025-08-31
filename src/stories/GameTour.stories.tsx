import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { GameTour } from '../components/GameTour';

const meta: Meta<typeof GameTour> = {
  title: '00-Mock/Mocked App',
  component: GameTour,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const defaultVisible = ((import.meta as any)?.env?.EXPO_PUBLIC_TOUR_DEFAULT === '1') || false;

export const MockedAppWithTour: StoryObj<typeof GameTour> = {
  render: () => {
    const [visible, setVisible] = useState(defaultVisible);

    useEffect(() => {
      if (defaultVisible) {
        setVisible(true);
      }
    }, []);

    return (
      <View style={{ flex: 1, minHeight: 700, backgroundColor: '#0b1220' }}>
        {/* Mock app header */}
        <View style={{ height: 56, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: 'rgba(59,130,246,0.35)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
          <Text style={{ color: '#93c5fd', fontWeight: '800', fontSize: 16 }}>QuizMentor</Text>
          <Text style={{ color: '#9ca3af' }}>Beta Preview</Text>
          <button onClick={() => setVisible(true)} style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.5)', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: 'white', fontWeight: 700 }}>Start Tour</button>
        </View>

        {/* Mock app content */}
        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#e5e7eb', fontSize: 18, fontWeight: '800' }}>Choose Your Quest</Text>
            <Text style={{ color: '#94a3b8' }}>Pick a language and begin your journey.</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {[ 'TypeScript', 'Python', 'Go', 'Rust', 'React', 'Node' ].map((label) => (
              <View key={label} style={{ width: 160, height: 100, borderRadius: 12, backgroundColor: 'rgba(2,6,23,0.75)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', padding: 12, justifyContent: 'space-between' }}>
                <Text style={{ color: '#93c5fd', fontWeight: '700' }}>{label}</Text>
                <Text style={{ color: '#64748b', fontSize: 12 }}>Begin Quest →</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tour overlay */}
        <GameTour visible={visible} onComplete={() => setVisible(false)} />
      </View>
    );
  },
};

