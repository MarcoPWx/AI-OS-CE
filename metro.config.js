const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific configurations
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Enable hot reload and fast refresh
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Enable CORS for hot reload
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return middleware(req, res, next);
    };
  },
};

// Ensure hot reload works properly
config.watchFolders = [];
config.resetCache = false;

module.exports = config;
