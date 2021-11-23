import diff from 'jest-diff';
import { equals } from 'expect/build/jasmineUtils';
import { deepObjContaining } from "./utils";

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

function oneOf(actual, ...expected) {
    const pass = expected.findIndex(item => equals(item, actual)) >= 0;
    return { pass, message: () => `expected ${actual} ${pass ? "not" : ""} to match one of ${JSON.stringify(expected)}`}
};

expect.extend({
    oneOf,
    deepContains(actual, expected) {
        const isContain = Array.isArray(actual) && !Array.isArray(expected);
        try {
            expect(actual)[isContain ? "toContainEqual" : "toEqual"](deepObjContaining(expected));
        } catch (e: any) {
            return {
                // message: () => this.utils.diff(expected, actual) || e.message,
                message: () => diff(isContain ? [expected] : expected, actual) || e.message,
                pass: false,
            }
        }
        return { pass: true, message: () => `Expected ${actual} not to contain ${expected}` }
    },
    equals(actual, expected) {
        const isContain = Array.isArray(actual) && !Array.isArray(expected);
        const pass = isContain ?
            actual.findIndex(item => equals(item, expected)) >= 0 :
            equals(actual, expected);
        return { pass, message: () => pass ?
            `Expected ${this.utils.printReceived(actual)} not to ${
                isContain ? "contain" : "equal"} ${this.utils.printExpected(expected)}` :
            diff(isContain ? [expected] : expected, actual) || actual };
    },
    parseJSON(actual: string, expected: any) {
        const pass = equals(JSON.parse(actual), expected);
        return { pass, message: () => `expected ${actual} to be json string of ${expected}`}
    },
    asString(actual: any, expected: string | RegExp) {
        const toString = actual?.toISOString?.() || actual?.toString();
        const pass = toString && !!(toString.match(expected));
        const message = pass ?
            () => `expected ${actual} not to equal ${expected}` :
            () => `expected ${actual} to equal ${expected}`;
        return { pass, message }
    },
    lengthGreaterThan(actual: any[], length: number=0) {
        const pass = actual?.length > length;
        const message = () => `expected ${actual} to have length greater than ${length}`;
        return { pass, message };
    },
    expect(actual, matcher, ...args) {
        try {
            (<any>expect)(actual)[matcher](...args);
        } catch (e: any) {
            return {
                message: e.message,
                pass: false,
            }
        }
        return { message: () => `expected ${actual} not ${matcher} ${args}`, pass: true };
    }
})

export * from './utils';
