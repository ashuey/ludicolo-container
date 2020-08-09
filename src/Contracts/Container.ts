import { Closure, Concrete, ServiceIdentifier } from "../Types/types";


export default interface Container {
    bound(abstract_: ServiceIdentifier): boolean;
    resolved(abstract_: ServiceIdentifier): boolean;
    isShared(abstract_: ServiceIdentifier): boolean;
    isAlias(abstract_: ServiceIdentifier): boolean;
    bind(abstract_: ServiceIdentifier, concrete?: Concrete<this>, shared?: boolean): void;
    bindIf(abstract_: ServiceIdentifier, concrete?: Concrete<this>, shared?: boolean): void;
    singleton(abstract_: ServiceIdentifier, concrete?: Concrete<this>): void;
    extend<T = any>(abstract_: ServiceIdentifier, closure: Closure<T>): void;
    instance<T>(abstract_: ServiceIdentifier, instance: T): T;
    alias(abstract_: ServiceIdentifier, alias: ServiceIdentifier): void;
    make<T = any>(abstract_: ServiceIdentifier, parameters: any[]): T;
    resolve<T = any>(abstract_: ServiceIdentifier, parameters: any[]): T;
    getAlias(abstract_: ServiceIdentifier): ServiceIdentifier;
    forgetExtenders(abstract_: ServiceIdentifier): void;
    forgetInstance(abstract_: ServiceIdentifier): void;
    forgetInstances(): void;
    flush(): void;
}