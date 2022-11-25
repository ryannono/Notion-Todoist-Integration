import { Runtype, RuntypeBase, Static } from '../runtype';
export declare const RuntypeName: unique symbol;
export interface RuntypeBrand<B extends string> {
    [RuntypeName]: B;
}
export interface Brand<B extends string, A extends RuntypeBase> extends Runtype<Static<A> & RuntypeBrand<B>> {
    tag: 'brand';
    brand: B;
    entity: A;
}
export declare function Brand<B extends string, A extends RuntypeBase>(brand: B, entity: A): any;
