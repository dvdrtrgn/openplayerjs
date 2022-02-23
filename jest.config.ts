import type { Config } from '@jest/types';
import path from 'path';

const config: Config.InitialOptions = {
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
    coverageReporters: ['lcov', 'text'],
    moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
    testMatch: ['<rootDir>/tests/**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
export default config;
