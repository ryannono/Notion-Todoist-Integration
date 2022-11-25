import { Runtype, RuntypeBase, Static } from '../runtype';
import { Optional } from './optional';
declare type DictionaryKeyType = string | number | symbol;
declare type StringLiteralFor<K extends DictionaryKeyType> = K extends string ? 'string' : K extends number ? 'number' : K extends symbol ? 'symbol' : never;
declare type DictionaryKeyRuntype = RuntypeBase<string | number | symbol>;
export interface Dictionary<V extends RuntypeBase, K extends DictionaryKeyType> extends Runtype<V extends Optional<any> ? {
    [_ in K]?: Static<V>;
} : {
    [_ in K]: Static<V>;
}> {
    tag: 'dictionary';
    key: StringLiteralFor<K>;
    value: V;
}
export interface StringDictionary<V extends RuntypeBase> extends Runtype<V extends Optional<any> ? {
    [_ in string]?: Static<V>;
} : {
    [_ in string]: Static<V>;
}> {
    tag: 'dictionary';
    key: 'string';
    value: V;
}
export interface NumberDictionary<V extends RuntypeBase> extends Runtype<V extends Optional<any> ? {
    [_ in number]?: Static<V>;
} : {
    [_ in number]: Static<V>;
}> {
    tag: 'dictionary';
    key: 'number';
    value: V;
}
/**
 * Construct a runtype for arbitrary dictionaries.
 * @param value - A `Runtype` for value.
 * @param [key] - A `Runtype` for key.
 */
export declare function Dictionary<V extends RuntypeBase, K extends DictionaryKeyRuntype>(value: V, key?: K): Dictionary<V, Static<K>>;
/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export declare function Dictionary<V extends RuntypeBase>(value: V, key: 'string'): StringDictionary<V>;
/**
 * Construct a runtype for arbitrary dictionaries.
 * @deprecated When you want to specify `key`, pass a `Runtype` for it.
 * @param value - A `Runtype` for value.
 * @param [key] - A string representing a type for key.
 */
export declare function Dictionary<V extends RuntypeBase>(value: V, key: 'number'): NumberDictionary<V>;
export {};
