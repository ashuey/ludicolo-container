import {default as ContainerContract, ConcreteBuildable, ConcreteClass} from "../Contracts/Container/Container"
import BindingResolutionError from "./BindingResolutionError";

export default class Container implements ContainerContract {
    protected static instance: ContainerContract;

    protected bindings: object = {};

    protected instances: object = {};

    protected aliases: object = {};

    alias(abstract_: string, alias: string): void {
        this.aliases[alias] = abstract_;
    }

    bind(abstract_: string, concrete: ConcreteBuildable, ...dependency: string[]): void {
        this.dropStaleInstances(abstract_);

        this.bindings[abstract_] = {
            concrete: concrete,
            shared: false,
            dependencies: dependency
        };
    }

    bound(abstract_: string): boolean {
        abstract_ = this.getAlias(abstract_);

        return abstract_ in this.bindings || abstract_ in this.instances;
    }

    flush(): void {
        this.aliases = {};
        this.bindings = [];
        this.instances = {};
    }

    getAlias(abstract_: string): string {
        if (!(abstract_ in this.aliases)) {
            return abstract_;
        }

        return this.getAlias(abstract_);
    }

    instance(abstract_: string, instance: any): any {
        delete this.aliases[abstract_];

        this.instances[abstract_] = instance;

        return instance;
    }

    isAlias(name: string): boolean {
        return name in this.aliases;
    }

    isShared(abstract_: string): boolean {
        abstract_ = this.getAlias(abstract_);

        return abstract_ in this.instances || (abstract_ in this.bindings && this.bindings[abstract_].shared == true);
    }

    make(abstract_: string, ...parameters: any[]): any {
        return this.resolve(abstract_, parameters);
    }

    resolve(abstract_: string, ...parameters: any[]): any {
        abstract_ = this.getAlias(abstract_);

        if (abstract_ in this.instances) {
            return this.instances[abstract_];
        }

        if (!(abstract_ in this.bindings)) {
            throw new BindingResolutionError(`Target ${abstract_} is not instantiable.`)
        }

        const binding = this.bindings[abstract_];

        const object_ = this.build(binding);

        if (this.isShared(abstract_)) {
            this.instances[abstract_] = object_;
        }

        return object_;
    }

    resolved(abstract_: string): boolean {
        abstract_ = this.getAlias(abstract_);

        return abstract_ in this.instances;
    }

    singleton(abstract_: string, concrete: ConcreteBuildable, ...dependency: string[]): void {
        this.dropStaleInstances(abstract_);

        this.bindings[abstract_] = {
            concrete: concrete,
            shared: true,
            dependencies: dependency
        };
    }

    protected dropStaleInstances(abstract_: string): void {
        delete this.instances[abstract_];
        delete this.aliases[abstract_];
    }

    protected build(binding: Binding, ...parameters: any[]): any {
        const resolved = this.resolveDependencies(binding.dependencies);

        const resolvedParameters = resolved.concat(parameters);

        if (this.isConcreteClass(binding.concrete)) {
            return new binding.concrete(...resolvedParameters);
        }

        return binding.concrete(...resolvedParameters);
    }

    protected resolveDependencies(dependencies: string[]) {
        return dependencies.map(dependency => this.resolve(dependency));
    }

    // noinspection JSMethodCanBeStatic
    protected isConcreteClass(f: ConcreteBuildable): f is ConcreteClass {
        return typeof f === 'function' && /^\s*class\s+/.test(f.toString());
    }

    /**
     * Get the globally available instance of the container
     */
    public static getInstance(): ContainerContract {
        if (!Container.instance) {
            Container.instance = new Container();
        }

        return Container.instance;
    }

    /**
     * Set the globally available instance of the container
     * @param container
     */
    public static setInstance(container: ContainerContract = null) {
        Container.instance = container;
    }
}

interface Binding {
    concrete: ConcreteBuildable;
    shared: boolean;
    dependencies: string[];
}