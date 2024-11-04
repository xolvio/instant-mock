const path = require('path');

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    'use-sync-external-store/shim': path.resolve(
      __dirname,
      'node_modules/use-sync-external-store/shim/index.js'
    ),
  };
  return config;
};
