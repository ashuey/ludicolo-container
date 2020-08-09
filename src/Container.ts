import ContainerInterface from "./Interfaces/Container"
import { Closure, Concrete, Newable, ServiceIdentifier } from "./Types/types";
import BindingResolutionError from "./BindingResolutionError";

interface Binding {
    concrete: Concrete;
    shared: boolean;
}

export default class Container implements ContainerInterface {
    protected bindings = new Map<ServiceIdentifier, Binding>();

    protected instances = new Map<ServiceIdentifier, any>();

    protected aliases = new Map<ServiceIdentifier, ServiceIdentifier>();

    protected extenders = new Map<ServiceIdentifier, Closure<any>[]>();

    public bound(abstract_: ServiceIdentifier): boolean {
        return this.bindings.has(abstract_) ||
            this.instances.has(abstract_) ||
            this.isAlias(abstract_);
    }

    public resolved(abstract_: ServiceIdentifier): boolean {
        abstract_ = this.getAlias(abstract_);

        return this.instances.has(abstract_);
    }

    public isShared(abstract_: ServiceIdentifier): boolean {
        return this.instances.has(abstract_) ||
            this.bindings.has(abstract_) &&
            this.bindings.get(abstract_).shared;
    }

    public isAlias(abstract_: ServiceIdentifier): boolean {
        return this.aliases.has(abstract_);
    }

    public bind(abstract_: ServiceIdentifier, concrete: Concrete<this> = null, shared: boolean = false): void {
        this.dropStaleInstances(abstract_);

        if (concrete === null) {
            if (!this.isNewable(abstract_)) {
                throw new Error(`${String(abstract_)} cannot be bound to itself, as is not instantiable.`);
            }

            concrete = abstract_;
        }

        this.bindings.set(abstract_, {
            concrete,
            shared
        });
    }

    public bindIf(abstract_: ServiceIdentifier, concrete: Concrete<this> = null, shared: boolean = false): void {
        if (!this.bound(abstract_)) {
            this.bind(abstract_, concrete, shared);
        }
    }

    public singleton(abstract_: ServiceIdentifier, concrete: Concrete<this> = null): void {
        this.bind(abstract_, concrete, true);
    }

    public extend<T = any>(abstract_: ServiceIdentifier, closure: Closure<T>): void {
        abstract_ = this.getAlias(abstract_);

        if (this.instances.has(abstract_)) {
            this.instances.set(abstract_, closure(this.instances.get(abstract_), this));
        } else {
            if (!this.extenders.has(abstract_)) {
                this.extenders.set(abstract_, []);
            }

            this.extenders.get(abstract_).push(closure);
        }
    }

    public instance<T>(abstract_: ServiceIdentifier, instance: T): T {
        this.aliases.delete(abstract_);

        this.instances.set(abstract_, instance);

        return instance;
    }

    public alias(abstract_: ServiceIdentifier, alias: ServiceIdentifier): void {
        this.aliases.set(alias, abstract_);
    }

    public make<T = any>(abstract_: ServiceIdentifier, ...parameters: any[]): T {
        return this.resolve(abstract_, ...parameters);
    }

    public resolve<T = any>(abstract_: ServiceIdentifier, ...parameters: any[]): T {
        abstract_ = this.getAlias(abstract_);

        if (this.instances.has(abstract_)) {
            return this.instances.get(abstract_);
        }

        if (!(this.bindings.has(abstract_))) {
            throw new BindingResolutionError(`Target ${String(abstract_)} is not instantiable.`)
        }

        const binding = this.bindings.get(abstract_);

        const object_ = this.build<T>(binding.concrete, parameters);

        if (this.isShared(abstract_)) {
            this.instances.set(abstract_, object_);
        }

        return object_;
    }

    protected build<T>(concrete: Concrete<this>, parameters: any[]): T {
        if (this.isNewable(concrete)) {
            return new concrete(...parameters);
        }

        return concrete(this, ...parameters);
    }

    public getAlias(abstract_: ServiceIdentifier): ServiceIdentifier {
        if (!this.aliases.has(abstract_)) {
            return abstract_;
        }

        if (this.aliases.get(abstract_) === abstract_) {
            throw new Error(`${String(abstract_)} is aliased to itself.`)
        }

        return this.getAlias(this.aliases.get(abstract_));
    }

    public forgetExtenders(abstract_: ServiceIdentifier): void {
        abstract_ = this.getAlias(abstract_);

        this.extenders.delete(abstract_);
    }

    protected dropStaleInstances(abstract_: ServiceIdentifier) {
        this.instances.delete(abstract_);
        this.aliases.delete(abstract_);
    }

    public forgetInstance(abstract_: ServiceIdentifier): void {
        this.instances.delete(abstract_);
    }

    public forgetInstances(): void {
        this.instances.clear();
    }

    public flush(): void {
        this.bindings.clear();
        this.instances.clear();
        this.aliases.clear();
    }

    protected isNewable(f: any): f is Newable {
        return typeof f === 'function' && /^\s*class\s+/.test(f.toString());
    }
}
