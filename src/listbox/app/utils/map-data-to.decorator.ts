type ModelConstructor<T> = new (...args: any[]) => T;

export function mapDataTo<T>(constructor: ModelConstructor<T>) {

    return (target, key = null, descriptor: PropertyDescriptor): PropertyDescriptor => {

        if (!descriptor) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }

        /** helper function to map data to class */
        function mapDataToModel(modelData) {
            if (modelData instanceof constructor) {
                return modelData;
            }
            const model = new constructor();
            const modelProperties: string[] = Object.getOwnPropertyNames(constructor.prototype);
            Object.keys(modelData).forEach((prop) => {
                if (modelProperties.indexOf(prop) > -1) {
                    model[prop] = modelData[prop];
                }
            });
            return model;
        }

        /** helper function to create decorator fn */
        function map(original) {
            return function(data) {
                let value = data;
                if (Array.isArray(value)) {
                    value = value.map((modelData) => mapDataToModel(modelData));
                } else {
                    value = mapDataToModel(value);
                }
                return original.call(this, value);
            }
        }

        /** 
         * handle a method which parameter should be mapped
         */
        if (typeof descriptor.value === "function") {
            return {
                value: map(descriptor.value),
                enumerable: true,
                configurable: true
            }
        } else {
            return {
                set: map(descriptor.set),
                enumerable: true,
                configurable: true
            };
        }
    };
}