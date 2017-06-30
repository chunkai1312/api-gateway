module.exports = {
  testRegex: '(/test/.*\\.spec.js)$',
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/test/setup.js'
  ],
  coveragePathIgnorePatterns: ['/src/config/'],
  coverageReporters: ['text', 'text-summary']
}
