export * from '@jest/globals';

export const vi = {
  fn: jest.fn.bind(jest),
  spyOn: jest.spyOn.bind(jest),
  useFakeTimers: jest.useFakeTimers.bind(jest),
  useRealTimers: jest.useRealTimers.bind(jest),
  advanceTimersByTime: jest.advanceTimersByTime.bind(jest),
  clearAllMocks: jest.clearAllMocks.bind(jest),
  resetAllMocks: jest.resetAllMocks.bind(jest),
};
