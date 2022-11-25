import { RuntypeBase, Static } from './runtype';
export interface Contract<A extends readonly RuntypeBase[], R extends RuntypeBase> {
    enforce(f: (...args: {
        [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
    }) => Static<R>): (...args: {
        [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
    }) => Static<R>;
}
/**
 * Create a function contract.
 */
export declare function Contract<A extends readonly RuntypeBase[], R extends RuntypeBase>(...runtypes: [...A, R]): Contract<A, R>;
