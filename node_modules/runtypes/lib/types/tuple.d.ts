import { Runtype, RuntypeBase, Static } from '../runtype';
export interface Tuple<A extends readonly RuntypeBase[]> extends Runtype<{
    [K in keyof A]: A[K] extends RuntypeBase ? Static<A[K]> : unknown;
}> {
    tag: 'tuple';
    components: A;
}
/**
 * Construct a tuple runtype from runtypes for each of its elements.
 */
export declare function Tuple<T extends readonly RuntypeBase[]>(...components: T): Tuple<T>;
