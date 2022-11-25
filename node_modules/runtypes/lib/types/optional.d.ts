import { Runtype, RuntypeBase, Static } from '../runtype';
export interface Optional<R extends RuntypeBase> extends Runtype<Static<R> | undefined> {
    tag: 'optional';
    underlying: R;
}
/**
 * Validates optional value.
 */
export declare function Optional<R extends RuntypeBase>(runtype: R): Optional<R>;
