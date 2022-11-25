import { Runtype, RuntypeBase, Static } from '../runtype';
export interface Intersect<A extends readonly [RuntypeBase, ...RuntypeBase[]]> extends Runtype<{
    [K in keyof A]: A[K] extends RuntypeBase ? (parameter: Static<A[K]>) => any : unknown;
}[number] extends (k: infer I) => void ? I : never> {
    tag: 'intersect';
    intersectees: A;
}
/**
 * Construct an intersection runtype from runtypes for its alternatives.
 */
export declare function Intersect<A extends readonly [RuntypeBase, ...RuntypeBase[]]>(...intersectees: A): Intersect<A>;
