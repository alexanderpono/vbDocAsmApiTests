// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    clearMocks: true,
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['api-src/**/*.(ts|tsx)'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
    },
    moduleNameMapper: {},
    verbose: true
};
