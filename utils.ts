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


export interface TesterConfig<TData, TSetup={}, TBefore={}> {
    run: (data: TData, context: TSetup & TBefore) => any,
    beforeEach?: (data: TData, context: TSetup) => Promise<TBefore>,
    setup?: (tests: TData[]) => Promise<TSetup> | TSetup,
    teardown?: (ctx: TSetup, tests: TData[]) => any,
}

interface Test<TData> {
    run?: (data: TData, ctx?: any) => any,
    data: TData,
    text: string,
}

export const makeTester = <TSetup, TPData extends object>(conf?: Omit<TesterConfig<any, TSetup>, "run">) => <TData extends object=TPData, TBefore={}>(config?: Partial<Pick<TesterConfig<TData, TSetup, TBefore>, "run" | "beforeEach">>) => {
    let tests: Test<TData>[] = [];
    config = {
        ...conf,
        ...config,
    } as any;
    const self = {
        clearTests: (match?: string | RegExp) => {
            tests = !match ? [] : tests.filter(test => !test.text.match(match));
        },
        addTest: (text: string, data: TData, run?: TesterConfig<TData, TSetup, TBefore>["run"]) => {
            const test = {
                text,
                data,
                run,
            }
            tests.push(test);
            return {
                ...self,
                focus: () => {
                    const index = tests.indexOf(test);
                    tests.splice(0, index);
                    tests.splice(1, 1000);
                },
                skip: () => {
                    tests.splice(tests.indexOf(test), 1);
                    return self;
                }
            }
        },
        runTests: <TPSetup=TSetup, TPBefore=TBefore>(overconf?: Partial<TesterConfig<TData, TPSetup, TPBefore>>) => {
            let setup = Promise.resolve(null as any);
            const setupFunc = overconf?.setup || conf?.setup;
            if (setupFunc) {
                beforeAll(() => setup = Promise.resolve(setupFunc(tests.map(t => t.data))));
            }
            const teardownFunc = overconf?.teardown || conf?.teardown;
            if (teardownFunc) {
                afterAll(() => setup.then(s => teardownFunc(s, tests.map(t => t.data))));
            }
            tests.forEach(test => it(test.text, async () => {
                const beforeSingle = overconf?.beforeEach || config?.beforeEach || conf?.beforeEach;
                let ctx = await beforeSingle?.(test.data, await setup);
                const runFunc = test.run || overconf?.run || config?.run;
                if (typeof runFunc !== 'function') {
                    expect(test).toEqual(expect.objectContaining({
                        run: expect.anything(),
                    }));
                }
                return runFunc!(test.data, { ...await setup, ...ctx });
            }));
        }
    }
    return self;
}
