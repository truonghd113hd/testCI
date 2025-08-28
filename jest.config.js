module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleDirectories: ['node_modules', 'src'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/worker.ts',
    '!src/firebase-admin.ts',
  ],
};
