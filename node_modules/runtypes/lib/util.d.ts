import { Reflect } from './reflect';
import { Details, Failcode, Failure, Success } from './result';
export declare function hasKey<K extends string | number | symbol>(key: K, object: unknown): object is {
    [_ in K]: unknown;
};
export declare const typeOf: (value: unknown) => string;
export declare const enumerableKeysOf: (object: unknown) => (string | symbol)[];
export declare function SUCCESS<T extends unknown>(value: T): Success<T>;
export declare const FAILURE: ((code: Failcode, message: string, details?: Details | undefined) => Failure) & {
    TYPE_INCORRECT: (self: Reflect, value: unknown) => Failure;
    VALUE_INCORRECT: (name: string, expected: unknown, received: unknown) => Failure;
    KEY_INCORRECT: (self: Reflect, expected: Reflect, value: unknown) => Failure;
    CONTENT_INCORRECT: (self: Reflect, details: Details) => Failure;
    ARGUMENT_INCORRECT: (message: string) => Failure;
    RETURN_INCORRECT: (message: string) => Failure;
    CONSTRAINT_FAILED: (self: Reflect, message?: string | undefined) => Failure;
    PROPERTY_MISSING: (self: Reflect) => Failure;
    PROPERTY_PRESENT: (value: unknown) => Failure;
    NOTHING_EXPECTED: (value: unknown) => Failure;
};
