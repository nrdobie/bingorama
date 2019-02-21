module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  roots: ['<rootDir>', `${__dirname}/jest`],
  errorOnDeprecated: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFiles: [],
  setupFilesAfterEnv: [`${__dirname}/jest/setup.ts`],
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/']
}
