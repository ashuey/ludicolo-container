export default interface Container {
    bound(abstract_: string): boolean;
    resolved(abstract_: string): boolean;
    isShared(abstract_: string): boolean;
    isAlias(name: string): boolean;
    bind(abstract_: string, concrete: ConcreteBuildable, ...dependency: string[]): void;
    singleton(abstract_: string, concrete: ConcreteBuildable, ...dependency: string[]): void;
    instance(abstract_: string, instance: any): any;
    alias(abstract_: string, alias: string): void;
    make<T = any>(abstract_: string, ...parameters: any[]): T;
    resolve(abstract_: string, ...parameters: any[]): any;
    getAlias(abstract_: string): string;
    flush(): void;
}

export type ConcreteClass = { new(...any: any[]): any} ;

export type ConcreteFactory = (...any: any[]) => any;

export type ConcreteBuildable = ConcreteClass | ConcreteFactory;