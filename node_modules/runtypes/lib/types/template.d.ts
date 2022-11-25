import { Runtype, RuntypeBase, Static } from '../runtype';
import { LiteralBase } from './literal';
declare type TemplateLiteralType<A extends readonly LiteralBase[], B extends readonly RuntypeBase<LiteralBase>[]> = A extends readonly [infer carA, ...infer cdrA] ? carA extends LiteralBase ? B extends readonly [infer carB, ...infer cdrB] ? carB extends RuntypeBase<LiteralBase> ? cdrA extends readonly LiteralBase[] ? cdrB extends readonly RuntypeBase<LiteralBase>[] ? `${carA}${Static<carB>}${TemplateLiteralType<cdrA, cdrB>}` : `${carA}${Static<carB>}` : `${carA}${Static<carB>}` : `${carA}` : `${carA}` : '' : '';
export interface Template<A extends readonly [string, ...string[]], B extends readonly RuntypeBase<LiteralBase>[]> extends Runtype<A extends TemplateStringsArray ? string : TemplateLiteralType<A, B>> {
    tag: 'template';
    strings: A;
    runtypes: B;
}
declare type ExtractStrings<A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[], prefix extends string = ''> = A extends readonly [infer carA, ...infer cdrA] ? cdrA extends readonly any[] ? carA extends RuntypeBase<LiteralBase> ? [prefix, ...ExtractStrings<cdrA>] : carA extends LiteralBase ? [...ExtractStrings<cdrA, `${prefix}${carA}`>] : never : never : [prefix];
declare type ExtractRuntypes<A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[]> = A extends readonly [infer carA, ...infer cdrA] ? cdrA extends readonly any[] ? carA extends RuntypeBase<LiteralBase> ? [carA, ...ExtractRuntypes<cdrA>] : carA extends LiteralBase ? [...ExtractRuntypes<cdrA>] : never : never : [];
/**
 * Validates that a value is a string that conforms to the template.
 *
 * You can use the familiar syntax to create a `Template` runtype:
 *
 * ```ts
 * const T = Template`foo${Literal('bar')}baz`;
 * ```
 *
 * But then the type inference won't work:
 *
 * ```ts
 * type T = Static<typeof T>; // inferred as string
 * ```
 *
 * Because TS doesn't provide the exact string literal type information (`["foo", "baz"]` in this case) to the underlying function. See the issue [microsoft/TypeScript#33304](https://github.com/microsoft/TypeScript/issues/33304), especially this comment [microsoft/TypeScript#33304 (comment)](https://github.com/microsoft/TypeScript/issues/33304#issuecomment-697977783) we hope to be implemented.
 *
 * If you want the type inference rather than the tagged syntax, you have to manually write a function call:
 *
 * ```ts
 * const T = Template(['foo', 'baz'] as const, Literal('bar'));
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * As a convenient solution for this, it also supports another style of passing arguments:
 *
 * ```ts
 * const T = Template('foo', Literal('bar'), 'baz');
 * type T = Static<typeof T>; // inferred as "foobarbaz"
 * ```
 *
 * You can pass various things to the `Template` constructor, as long as they are assignable to `string | number | bigint | boolean | null | undefined` and the corresponding `Runtype`s:
 *
 * ```ts
 * // Equivalent runtypes
 * Template(Literal('42'));
 * Template(42);
 * Template(Template('42'));
 * Template(4, '2');
 * Template(Literal(4), '2');
 * Template(String.withConstraint(s => s === '42'));
 * Template(
 *   Intersect(
 *     Number.withConstraint(n => n === 42),
 *     String.withConstraint(s => s.length === 2),
 *     // `Number`s in `Template` accept alternative representations like `"0x2A"`,
 *     // thus we have to constraint the length of string, to accept only `"42"`
 *   ),
 * );
 * ```
 *
 * Trivial items such as bare literals, `Literal`s, and single-element `Union`s and `Intersect`s are all coerced into strings at the creation time of the runtype. Additionally, `Union`s of such runtypes are converted into `RegExp` patterns like `(?:foo|bar|...)`, so we can assume `Union` of `Literal`s is a fully supported runtype in `Template`.
 *
 * ### Caveats
 *
 * A `Template` internally constructs a `RegExp` to parse strings. This can lead to a problem if it contains multiple non-literal runtypes:
 *
 * ```ts
 * const UpperCaseString = Constraint(String, s => s === s.toUpperCase(), {
 *   name: 'UpperCaseString',
 * });
 * const LowerCaseString = Constraint(String, s => s === s.toLowerCase(), {
 *   name: 'LowerCaseString',
 * });
 * Template(UpperCaseString, LowerCaseString);
 * ```
 *
 * The only thing we can do for parsing such strings correctly is brute-forcing every single possible combination until it fulfills all the constraints, which must be hardly done. Actually `Template` treats `String` runtypes as the simplest `RegExp` pattern `.*` and the “greedy” strategy is always used, that is, the above runtype won't work expectedly because the entire pattern is just `^(.*)(.*)$` and the first `.*` always wins. You have to avoid using `Constraint` this way, and instead manually parse it using a single `Constraint` which covers the entire string.
 */
export declare function Template<A extends TemplateStringsArray, B extends readonly RuntypeBase<LiteralBase>[]>(strings: A, ...runtypes: B): Template<A & [string, ...string[]], B>;
export declare function Template<A extends readonly [string, ...string[]], B extends readonly RuntypeBase<LiteralBase>[]>(strings: A, ...runtypes: B): Template<A, B>;
export declare function Template<A extends readonly (LiteralBase | RuntypeBase<LiteralBase>)[]>(...args: A): Template<ExtractStrings<A>, ExtractRuntypes<A>>;
export {};
