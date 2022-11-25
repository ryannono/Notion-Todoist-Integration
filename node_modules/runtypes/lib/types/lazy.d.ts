import { RuntypeBase } from '../runtype';
/**
 * Construct a possibly-recursive Runtype.
 */
export declare function Lazy<A extends RuntypeBase>(delayed: () => A): A;
