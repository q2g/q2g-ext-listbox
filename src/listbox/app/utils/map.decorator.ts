export function map(map) {

    return function (target, key = null, descriptor: PropertyDescriptor): PropertyDescriptor {
        if ( !descriptor ) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        return {
            set: function (value) {
                const mappedValue = map.hasOwnProperty(value) ? map[value] : value;
                // get all properties, exclude decorated property
                return descriptor.set.call(this, mappedValue);
            },
            enumerable: true,
            configurable: true
        };
    }
}
