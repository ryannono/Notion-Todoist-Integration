import { RuntypeBase, Static } from './runtype';
export interface AsyncContract<A extends readonly RuntypeBase[], R extends RuntypeBase> {
    enforce(f: (...args: {
        [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
    }) => Promise<Static<R>>): (...args: {
        [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
    }) => Promise<Static<R>>;
}
/**
 * Create a function contract.
 */
export declare function AsyncContract<A extends readonly RuntypeBase[], R extends RuntypeBase>(...runtypes: [...A, R]): AsyncContract<A, R>;
