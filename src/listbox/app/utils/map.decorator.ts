export function map(data) {

    // tslint:disable-next-line: only-arrow-functions
    return function(target, key = null, descriptor: PropertyDescriptor): PropertyDescriptor {
        if ( !descriptor ) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        return {
            // tslint:disable-next-line: object-literal-shorthand
            set: function(value) {
                const mappedValue = data.hasOwnProperty(value) ? data[value] : value;
                // get all properties, exclude decorated property
                return descriptor.set.call(this, mappedValue);
            },
            enumerable: true,
            configurable: true
        };
    };
}
