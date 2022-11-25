import { Runtype } from '../runtype';
export interface Constructor<V> {
    new (...args: any[]): V;
}
export interface InstanceOf<V> extends Runtype<V> {
    tag: 'instanceof';
    ctor: Constructor<V>;
}
export declare function InstanceOf<V>(ctor: Constructor<V>): InstanceOf<V>;
