exports.config = {
  specs: [
    './**/*.spec.js'
  ],
  capabilities: {
    browserName: 'phantomjs',
    version: '',
    platform: 'ANY'
  },
  baseUrl: 'http://localhost:3001'
};