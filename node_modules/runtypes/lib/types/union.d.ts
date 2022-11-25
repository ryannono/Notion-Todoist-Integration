import { Runtype, RuntypeBase, Static } from '../runtype';
export interface Union<A extends readonly [RuntypeBase, ...RuntypeBase[]]> extends Runtype<{
    [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
}[number]> {
    tag: 'union';
    alternatives: A;
    match: Match<A>;
}
/**
 * Construct a union runtype from runtypes for its alternatives.
 */
export declare function Union<T extends readonly [RuntypeBase, ...RuntypeBase[]]>(...alternatives: T): Union<T>;
export interface Match<A extends readonly [RuntypeBase, ...RuntypeBase[]]> {
    <Z>(...a: {
        [K in keyof A]: A[K] extends RuntypeBase ? Case<A[K], Z> : never;
    }): Matcher<A, Z>;
}
export declare type Case<T extends RuntypeBase, Result> = (v: Static<T>) => Result;
export declare type Matcher<A extends readonly [RuntypeBase, ...RuntypeBase[]], Z> = (x: {
    [K in keyof A]: A[K] extends RuntypeBase<infer Type> ? Type : unknown;
}[number]) => Z;
