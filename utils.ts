export function notEmpty<TValue>(value: TValue | null | undefined | void): value is TValue {
    return value !== null && value !== undefined;
}

export function hasKey<T>(obj: T, key: keyof any): key is keyof T {
    return key in obj
}

export function deepObjContaining(obj: any): any {
    if (Array.isArray(obj)) {
        return expect.arrayContaining(obj.map(deepObjContaining));
    } else if (obj && typeof obj === 'object' && !obj["$$typeof"]) {
        return expect.objectContaining(Object.keys(obj).reduce((acc, key:string) => {
            acc[key] = deepObjContaining(obj[key]);
            return acc;
        }, {} as any));
    } else {
        return obj;
    }
}


interface TesterConfig<TData, TSetup> {
    run: (data: TData) => Promise<any>,
    //TODO: Add partial inference when available
    setup?: (tests: TData[]) => Promise<TSetup> | TSetup,
    teardown?: (data: TSetup, tests: TData[]) => any,
}

interface Test<TData> {
    run?: (data: TData) => Promise<any>,
    data: TData,
    text: string,
}

export const makeTester = <TData extends object, TSetup=any>(config?: TesterConfig<TData, TSetup>) => {
    const tests: Test<TData>[] = [];
    const self = {
        addTest: (text: string, data: TData, run?: (data: TData) => Promise<any>) => {
            const test = {
                text,
                data,
                run,
            }
            tests.push(test);
            return {
                ...self,
                skip: () => {
                    tests.splice(tests.indexOf(test), 1);
                    return self;
                }
            }
        },
        runTests: () => {
            let setup = Promise.resolve(null as any);
            if (config?.setup) {
                beforeAll(() => setup = Promise.resolve(config.setup!(tests.map(t => t.data))));
            }
            if (config?.teardown) {
                afterAll(() => setup.then(s => config.teardown!(s, tests.map(t => t.data))));
            }
            tests.forEach(test => it(test.text, async () => {
                return (test.run || config?.run)!(test.data);
            }));
        }
    }
    return self;
}
