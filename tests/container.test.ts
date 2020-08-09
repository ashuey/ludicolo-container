import Container from "../src/Container";
import BindingResolutionError from "../src/BindingResolutionError";

test('closure resolution', () => {
    const container = new Container();

    container.bind('name', () => {
        return 'Ludicolo';
    });

    expect(container.make('name')).toBe('Ludicolo');
});

test('check for bindings', () => {
    const container = new Container();

    container.bind('name', () => {
        return 'Ludicolo';
    })

    expect(container.bound('name')).toBe(true);
    expect(container.bound('pokemon')).toBe(false);
});

test('bind if already registered', () => {
    const container = new Container();

    container.bind('name', () => {
        return 'Ludicolo';
    });

    container.bindIf('name', () => {
        return 'Lotad';
    });

    expect(container.make('name')).toBe('Ludicolo');
});

test('bind if not already registered', () => {
    const container = new Container();

    container.bind('pokemon', () => {
        return 'Ludicolo';
    });

    container.bindIf('name', () => {
        return 'Lotad';
    });

    expect(container.make('name')).toBe('Lotad');
});

test('singleton binding', () => {
    const container = new Container();

    container.singleton('symbol', () => {
        return Symbol();
    })

    const firstCall = container.make('symbol');
    const secondCall = container.make('symbol');

    expect(firstCall).toBe(secondCall);
});

test('non shared instances different', () => {
    const container = new Container();

    container.bind('symbol', () => {
        return Symbol();
    });

    const firstCall = container.make('symbol');
    const secondCall = container.make('symbol');

    expect(firstCall).not.toBe(secondCall);
});

test('shared newable resolution', () => {
    const container = new Container();

    class TestClass {}

    container.singleton(TestClass);

    const firstCall = container.make(TestClass);
    const secondCall = container.make(TestClass);

    expect(firstCall).toBeInstanceOf(TestClass);
    expect(firstCall).toBe(secondCall);
});

test('check if singleton resolved', () => {
    const container = new Container();

    container.singleton('name', () => {
        return 'Ludicolo';
    });

    expect(container.resolved('name')).toBe(false);

    container.make('name');

    expect(container.resolved('name')).toBe(true);
    expect(container.resolved('pokemon')).toBe(false);
});

test('cannot bind string to itself', () => {
    const container = new Container();

    expect(() => {
        container.bind('pokemon');
    }).toThrow();
});

test('set alias', () => {
    const container = new Container();

    container.instance('foo', 'bar');

    container.alias('foo', 'baz');
    container.alias('baz', 'bat');

    expect(container.make('foo')).toBe('bar');
    expect(container.make('baz')).toBe('bar');
    expect(container.make('bat')).toBe('bar');
});

test('can\'t resolve unbound abstract', () => {
    const container = new Container();

    expect(() => {
        container.resolve('name');
    }).toThrow(BindingResolutionError);
});

test('error on self alias', () => {
    const container = new Container();

    container.bind('name', () => {
        return 'Ludicolo';
    });

    container.alias('pokemon', 'pokemon');

    expect(() => {
        container.resolve('pokemon')
    }).toThrow();
})

test('forgetInstance forgets instance', () => {
    const container = new Container();

    container.instance('foo', 'bar');
    container.instance('baz', 'bat');

    expect(container.isShared('foo')).toBe(true);
    expect(container.isShared('baz')).toBe(true);

    container.forgetInstance('foo');

    expect(container.isShared('foo')).toBe(false);
    expect(container.isShared('baz')).toBe(true);
})

test('forget all instances', () => {
    const container = new Container();

    container.instance('foo', Symbol('foo'));
    container.instance('bar', Symbol('bar'));
    container.instance('baz', Symbol('baz'));

    expect(container.isShared('foo')).toBe(true);
    expect(container.isShared('bar')).toBe(true);
    expect(container.isShared('baz')).toBe(true);

    container.forgetInstances();

    expect(container.isShared('foo')).toBe(false);
    expect(container.isShared('bar')).toBe(false);
    expect(container.isShared('baz')).toBe(false);
});

test('flush forgets everything', () => {
    const container = new Container();

    container.bind('foo', () => {
        return Symbol();
    }, true);

    container.alias('foo', 'bar');

    container.make('foo');

    expect(container.resolved('foo')).toBe(true);
    expect(container.isAlias('bar')).toBe(true);
    expect(container.bound('foo')).toBe(true);
    expect(container.isShared('foo')).toBe(true);

    container.flush();

    expect(container.resolved('foo')).toBe(false);
    expect(container.isAlias('bar')).toBe(false);
    expect(container.bound('foo')).toBe(false);
    expect(container.isShared('foo')).toBe(false);
});

test('extend value', () => {
     const container = new Container();

     container.instance('foo', 4);

     expect(container.make('foo')).toBe(4);

     container.extend('foo', value => {
         return value + 7;
     })

    expect(container.make('foo')).toBe(11);
});

test('forget extenders', () => {
    const container = new Container();

    container.bind('foo', () => {
        return 3;
    });

    container.extend('foo', value => {
        return value + 6;
    })

    container.forgetExtenders('foo');

    expect(container.make('foo')).toBe(3);
});

test('symbol as abstract', () => {
    const container = new Container();

    const identifier = Symbol('foo');

    container.bind(identifier, () => {
        return 'bar';
    });

    expect(container.make(identifier)).toBe('bar');
});