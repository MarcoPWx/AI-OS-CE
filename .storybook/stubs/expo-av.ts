// .storybook/stubs/expo-av.ts
export const Audio = {
  setAudioModeAsync: async (_opts?: any) => {},
  // Minimal placeholder classes/values used in code
  Sound: class {},
  INTERRUPTION_MODE_IOS_DO_NOT_MIX: 0,
  INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 0,
};

export const Video = function Video() {
  return null as any;
};

export default { Audio, Video };
