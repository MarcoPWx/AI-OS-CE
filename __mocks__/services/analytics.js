const j = global.jest || require('jest-mock');
const analytics = {
  track: j.fn(),
  identify: j.fn(),
};
module.exports = { __esModule: true, default: analytics };

