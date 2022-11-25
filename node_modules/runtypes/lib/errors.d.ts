import { Failcode, Failure, Details } from './result';
export declare class ValidationError extends Error {
    name: string;
    code: Failcode;
    details?: Details;
    constructor(failure: Failure);
}
