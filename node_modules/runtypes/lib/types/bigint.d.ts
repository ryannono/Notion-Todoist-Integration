import { Runtype } from '../runtype';
export interface BigInt extends Runtype<bigint> {
    tag: 'bigint';
}
/**
 * Validates that a value is a bigint.
 */
export declare const BigInt: BigInt;
