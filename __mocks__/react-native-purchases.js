const fn = (ret) => {
  const j = global.jest || require('jest-mock');
  return j.fn().mockResolvedValue(ret);
};

const mockPurchases = {
  setLogLevel: (global.jest || require('jest-mock')).fn().mockResolvedValue(undefined),
  configure: (global.jest || require('jest-mock')).fn().mockResolvedValue(undefined),
  setAttributes: (global.jest || require('jest-mock')).fn().mockResolvedValue(undefined),
  getOfferings: (global.jest || require('jest-mock')).fn().mockResolvedValue({ current: null, all: [] }),
  getCustomerInfo: (global.jest || require('jest-mock')).fn().mockResolvedValue({ entitlements: { active: {} } }),
  addCustomerInfoUpdateListener: (global.jest || require('jest-mock')).fn(),
  purchasePackage: (global.jest || require('jest-mock')).fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
  restorePurchases: (global.jest || require('jest-mock')).fn().mockResolvedValue({ entitlements: { active: {} } }),
  LogLevel: { DEBUG: 4 },
};

module.exports = {
  __esModule: true,
  default: mockPurchases,
};

