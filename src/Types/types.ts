export type Closure<T> = (container: T, ...any: any[]) => any;

export type Newable = new (...args: any[]) => any;

export interface Abstract {
    prototype: any;
}

export type ServiceIdentifier = (string | symbol | Newable | Abstract);

export type Concrete<T = any> = (Closure<T> | Newable);