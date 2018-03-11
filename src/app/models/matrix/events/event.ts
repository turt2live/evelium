export interface MatrixEvent {
    type: string;
    content: any; // for once, any is applicable here
}

export class SimpleEvent<T extends string> implements MatrixEvent {
    constructor(public type: T, public content: any) {
    }
}