const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
  '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', //maps @/config/firebaseAdminConfig to src/config/firebaseAdminConfig.ts idk
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  transformIgnorePatterns: [
    "./node_modules/(?!(@mux|custom-media-element)/)", //force Jest to transform these ESM packages
  ],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/config/**',
    '!next.config.ts',
    '!next-env.d.ts',
    '!src/app/layout.tsx',
    '!functions/src/**'
  ],
  coverageReporters: ['clover', 'json', 'lcov', ['text']],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};