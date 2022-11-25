import { Result, Union, Intersect, Optional, Constraint, ConstraintCheck, Brand, Null } from './index';
import { Reflect } from './reflect';
declare const RuntypeSymbol: unique symbol;
export declare const isRuntype: (x: any) => x is RuntypeBase<unknown>;
/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface RuntypeBase<A = unknown> {
    /**
     * Verifies that a value conforms to this runtype. When given a value that does
     * not conform to the runtype, throws an exception.
     */
    assert(x: any): asserts x is A;
    /**
     * Verifies that a value conforms to this runtype. If so, returns the same value,
     * statically typed. Otherwise throws an exception.
     */
    check(x: any): A;
    /**
     * Validates that a value conforms to this type, and returns a result indicating
     * success or failure (does not throw).
     */
    validate(x: any): Result<A>;
    /**
     * A type guard for this runtype.
     */
    guard(x: any): x is A;
    /**
     * Convert this to a Reflect, capable of introspecting the structure of the type.
     */
    readonly reflect: Reflect;
    readonly _falseWitness: A;
    readonly [RuntypeSymbol]: true;
}
/**
 * A runtype determines at runtime whether a value conforms to a type specification.
 */
export interface Runtype<A = unknown> extends RuntypeBase<A> {
    /**
     * Union this Runtype with another.
     */
    Or<B extends RuntypeBase>(B: B): Union<[this, B]>;
    /**
     * Intersect this Runtype with another.
     */
    And<B extends RuntypeBase>(B: B): Intersect<[this, B]>;
    /**
     * Optionalize this Runtype.
     */
    optional(): Optional<this>;
    /**
     * Union this Runtype with `Null`.
     */
    nullable(): Union<[this, typeof Null]>;
    /**
     * Use an arbitrary constraint function to validate a runtype, and optionally
     * to change its name and/or its static type.
     *
     * @template T - Optionally override the static type of the resulting runtype
     * @param {(x: Static<this>) => boolean | string} constraint - Custom function
     * that returns `true` if the constraint is satisfied, `false` or a custom
     * error message if not.
     * @param [options]
     * @param {string} [options.name] - allows setting the name of this
     * constrained runtype, which is helpful in reflection or diagnostic
     * use-cases.
     */
    withConstraint<T extends Static<this>, K = unknown>(constraint: ConstraintCheck<this>, options?: {
        name?: string;
        args?: K;
    }): Constraint<this, T, K>;
    /**
     * Helper function to convert an underlying Runtype into another static type
     * via a type guard function.  The static type of the runtype is inferred from
     * the type of the guard function.
     *
     * @template T - Typically inferred from the return type of the type guard
     * function, so usually not needed to specify manually.
     * @param {(x: Static<this>) => x is T} guard - Type guard function (see
     * https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
     *
     * @param [options]
     * @param {string} [options.name] - allows setting the name of this
     * constrained runtype, which is helpful in reflection or diagnostic
     * use-cases.
     */
    withGuard<T extends Static<this>, K = unknown>(guard: (x: Static<this>) => x is T, options?: {
        name?: string;
        args?: K;
    }): Constraint<this, T, K>;
    /**
     * Adds a brand to the type.
     */
    withBrand<B extends string>(brand: B): Brand<B, this>;
}
/**
 * Obtains the static type associated with a Runtype.
 */
export declare type Static<A extends RuntypeBase> = A['_falseWitness'];
export declare function create<A extends RuntypeBase>(validate: (x: any, visited: VisitedState) => Result<Static<A>>, A: any): A;
export declare function innerValidate<A extends RuntypeBase>(targetType: A, value: any, visited: VisitedState): Result<Static<A>>;
export declare type VisitedState = {
    has: (candidate: object, type: RuntypeBase) => boolean;
};
export {};
