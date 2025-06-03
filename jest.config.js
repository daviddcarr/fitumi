export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1'
  }
};
