import { Runtype } from '../runtype';
import { Union } from './union';
/**
 * The super type of all literal types.
 */
export declare type LiteralBase = undefined | null | boolean | number | bigint | string;
export interface Literal<A extends LiteralBase> extends Runtype<A> {
    tag: 'literal';
    value: A;
}
/**
 * Be aware of an Array of Symbols `[Symbol()]` which would throw "TypeError: Cannot convert a Symbol value to a string"
 */
export declare function literal(value: unknown): string;
/**
 * Construct a runtype for a type literal.
 */
export declare function Literal<A extends LiteralBase>(valueBase: A): Literal<A>;
/**
 * An alias for Literal(undefined).
 */
export declare const Undefined: Literal<undefined>;
/**
 * An alias for Literal(null).
 */
export declare const Null: Literal<null>;
/**
 * An alias for `Union(Null, Undefined)`.
 */
export declare const Nullish: Union<[Literal<null>, Literal<undefined>]>;
