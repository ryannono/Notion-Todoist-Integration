import { Runtype } from '../runtype';
export interface Symbol extends Runtype<symbol> {
    tag: 'symbol';
    /**
      Validates that a value is a symbol with a specific key or without any key.
      @param {string | undefined} key - Specify what key the symbol is for. If you want to ensure the validated symbol is *not* keyed, pass `undefined`.
     */
    <K extends string | undefined>(key: K): SymbolFor<K>;
}
export interface SymbolFor<K extends string | undefined> extends Runtype<symbol> {
    tag: 'symbol';
    key: K;
}
/**
 * Validates that a value is a symbol, regardless of whether it is keyed or not.
 */
export declare const Symbol: Symbol;
