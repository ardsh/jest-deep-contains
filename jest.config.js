module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '(\\.(test|spec))\\.(t|j)sx?$',
    setupFilesAfterEnv: ['./setup.ts'],
    globals: {
        'ts-jest': {
            diagnostics: { warnOnly: true }
        },
    },
};
