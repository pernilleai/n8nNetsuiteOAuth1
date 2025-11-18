module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>'],
	testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	collectCoverageFrom: [
		'credentials/**/*.ts',
		'nodes/**/*.ts',
		'!**/*.d.ts',
		'!**/dist/**',
		'!**/node_modules/**',
	],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
};
