import { Runtype, RuntypeBase, Static } from '../runtype';
import { Optional } from './optional';
declare type FilterOptionalKeys<T> = {
    [K in keyof T]: T[K] extends Optional<any> ? K : never;
}[keyof T];
declare type FilterRequiredKeys<T> = {
    [K in keyof T]: T[K] extends Optional<any> ? never : K;
}[keyof T];
declare type MergedRecord<O extends {
    [_: string]: RuntypeBase;
}> = {
    [K in FilterRequiredKeys<O>]: Static<O[K]>;
} & {
    [K in FilterOptionalKeys<O>]?: Static<O[K]>;
} extends infer P ? {
    [K in keyof P]: P[K];
} : never;
declare type MergedRecordReadonly<O extends {
    [_: string]: RuntypeBase;
}> = {
    [K in FilterRequiredKeys<O>]: Static<O[K]>;
} & {
    [K in FilterOptionalKeys<O>]?: Static<O[K]>;
} extends infer P ? {
    readonly [K in keyof P]: P[K];
} : never;
declare type RecordStaticType<O extends {
    [_: string]: RuntypeBase;
}, Part extends boolean, RO extends boolean> = Part extends true ? RO extends true ? {
    readonly [K in keyof O]?: Static<O[K]>;
} : {
    [K in keyof O]?: Static<O[K]>;
} : RO extends true ? MergedRecordReadonly<O> : MergedRecord<O>;
export interface InternalRecord<O extends {
    [_: string]: RuntypeBase;
}, Part extends boolean, RO extends boolean> extends Runtype<RecordStaticType<O, Part, RO>> {
    tag: 'record';
    fields: O;
    isPartial: Part;
    isReadonly: RO;
    asPartial(): InternalRecord<O, true, RO>;
    asReadonly(): InternalRecord<O, Part, true>;
    pick<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): InternalRecord<Pick<O, K>, Part, RO>;
    omit<K extends keyof O>(...keys: K[] extends (keyof O)[] ? K[] : never[]): InternalRecord<Omit<O, K>, Part, RO>;
    extend<P extends {
        [_: string]: RuntypeBase;
    }>(fields: {
        [K in keyof P]: K extends keyof O ? Static<P[K]> extends Static<O[K]> ? P[K] : RuntypeBase<Static<O[K]>> : P[K];
    }): InternalRecord<{
        [K in keyof (O & P)]: K extends keyof P ? P[K] : K extends keyof O ? O[K] : never;
    }, Part, RO>;
}
export declare type Record<O extends {
    [_: string]: RuntypeBase;
}, RO extends boolean> = InternalRecord<O, false, RO>;
export declare type Partial<O extends {
    [_: string]: RuntypeBase;
}, RO extends boolean> = InternalRecord<O, true, RO>;
/**
 * Construct a record runtype from runtypes for its values.
 */
export declare function InternalRecord<O extends {
    [_: string]: RuntypeBase;
}, Part extends boolean, RO extends boolean>(fields: O, isPartial: Part, isReadonly: RO): InternalRecord<O, Part, RO>;
export declare function Record<O extends {
    [_: string]: RuntypeBase;
}>(fields: O): Record<O, false>;
export declare function Partial<O extends {
    [_: string]: RuntypeBase;
}>(fields: O): Partial<O, false>;
export {};
