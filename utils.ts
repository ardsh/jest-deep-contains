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
