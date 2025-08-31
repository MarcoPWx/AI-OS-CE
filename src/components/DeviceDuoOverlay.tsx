import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

const SB_BASE = process.env.EXPO_PUBLIC_STORYBOOK_URL;

type DuoMode = 'app' | 'sb';

function buildAppUrl(platform: 'ios' | 'android') {
  // Embed the app itself; avoid recursion with duoChild=1 and pass a platform skin hint
  const params = new URLSearchParams({ duoChild: '1', duoPlatform: platform }).toString();
  return `/?${params}`;
}

function buildSbUrl(platform: 'ios' | 'android', storyId?: string) {
  const id = storyId || 'ui-quiz-quizscreen--default';
  const base = (SB_BASE || '').replace(/\/$/, '');
  return `${base}/?path=/story/${id}&globals=platform:${platform}`;
}

export default function DeviceDuoOverlay() {
  const [iosSrc, setIosSrc] = React.useState<string>('');
  const [androidSrc, setAndroidSrc] = React.useState<string>('');

  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const story = sp.get('duoStory') || undefined;
      const mode: DuoMode = (sp.get('duoMode') as DuoMode) || 'app'; // default to app embed
      if (mode === 'sb' && SB_BASE) {
        setIosSrc(buildSbUrl('ios', story));
        setAndroidSrc(buildSbUrl('android', story));
      } else {
        // app embed with platform skin hint
        setIosSrc(buildAppUrl('ios'));
        setAndroidSrc(buildAppUrl('android'));
      }
    } catch {
      // Safe fallback: app embed
      setIosSrc(buildAppUrl('ios'));
      setAndroidSrc(buildAppUrl('android'));
    }
  }, []);

  const close = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('duo');
      window.location.replace(url.toString());
    } catch {
      window.history.back();
    }
  };

  const openStorybook = () => {
    if (SB_BASE) window.location.href = SB_BASE;
    else window.location.href = '/storybook/';
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Device Duo — iOS • Android</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={openStorybook} style={[styles.btn, styles.secondary]}>
            <Text style={styles.btnText}>Open Storybook</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={close} style={[styles.btn, styles.primary]}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.grid}>
        <View style={styles.phone}>
          <Text style={styles.label}>iOS</Text>
          <View style={styles.frameWrap}>
            <iframe title="iOS preview" src={iosSrc} style={styles.iframe as any} />
          </View>
        </View>
        <View style={styles.phone}>
          <Text style={styles.label}>Android</Text>
          <View style={styles.frameWrap}>
            <iframe title="Android preview" src={androidSrc} style={styles.iframe as any} />
          </View>
        </View>
      </View>
      <Text style={styles.hint}>
        Tip: default shows the full app in each frame. To target Storybook instead, pass duoMode=sb and optional duoStory.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'fixed' as any,
    inset: 0,
    backgroundColor: 'rgba(2,6,23,0.96)',
    zIndex: 999999,
    padding: 16,
  },
  header: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: '#e5e7eb', fontWeight: '900', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as any,
  phone: { display: 'grid', placeItems: 'center' } as any,
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  frameWrap: {
    borderColor: 'rgba(148,163,184,0.25)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 10,
    width: 380,
    height: 760,
    backgroundColor: 'black',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  iframe: { width: '100%', height: '100%', borderWidth: 0, backgroundColor: 'white', borderRadius: 18 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59,130,246,0.5)' },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: 'rgba(255,255,255,0.06)' },
  btnText: { color: '#e5e7eb', fontWeight: '800' },
  hint: { color: '#94a3b8', fontSize: 11, marginTop: 8 },
});

