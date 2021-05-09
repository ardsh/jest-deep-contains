
type NestedPartial<T> = {
    [K in keyof T]?: T[K] extends Array<infer R> ? Array<NestedPartial<R>> : NestedPartial<T[K]>
};

type ArrayElement<T> = T extends Array<infer R> ? R | T : T

declare namespace jest {

    interface Expect {
        lengthGreaterThan(value: number): any;
        oneOf(...values: any[]): any;
        asString(value: string | RegExp): any;
        parseJSON(value: any): any;
        expect: <TMethod extends keyof Matchers<any>>(
            method: TMethod,
            ...args: Parameters<Matchers<any>[TMethod]>
        ) => any
    }
    interface Matchers<R, T={}> {
        deepContains(expected: ArrayElement<NestedPartial<T>>): R;
        equals(expected: ArrayElement<T>): R;
    }
}
