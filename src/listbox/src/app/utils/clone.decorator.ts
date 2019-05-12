export function clone(target, key = null, descriptor: PropertyDescriptor): PropertyDescriptor {
    if ( !descriptor ) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    return {
        set: function (value) {
            const cloned = JSON.parse(JSON.stringify(value));
            return descriptor.set.call(this, cloned);
        },
        enumerable: true,
        configurable: true
    };
}