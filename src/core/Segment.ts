/**
 * Class representing a subcomponent.
 */
export class HL7Subcomponent {
    /**
     * Creates an instance of HL7Subcomponent.
     * @param value The value of the subcomponent.
     */
    constructor(private value: string) { }

    /**
     * Converts the subcomponent to a string.
     */
    toString(): string {
        return this.value;
    }

    /**
     * Returns the primitive value of the subcomponent.
     */
    valueOf(): string {
        return this.value;
    }
}

/**
 * Class representing a component with access to subcomponents.
 */
export class HL7Component {
    private subcomponents: string[];

    /**
     * Creates an instance of HL7Component.
     * @param value The value of the component.
     */
    constructor(private value: string) {
        // Split by the subcomponent separator (&)
        this.subcomponents = value.split('&');

        // Create a proxy for indexed access to subcomponents (1-based indices)
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Convert 1-based index to 0-based for the array
                    const subcomponent = target.subcomponents[index - 1];
                    // Return null if the subcomponent does not exist
                    if (subcomponent === undefined) return null;
                    return new HL7Subcomponent(subcomponent || '');
                }
                return target[prop as keyof HL7Component];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Ensure the array has enough elements
                    while (target.subcomponents.length < index) {
                        target.subcomponents.push('');
                    }
                    target.subcomponents[index - 1] = value;
                    // Update the string value
                    target.value = target.subcomponents.join('&');
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<HL7Component>);
    }

    /**
     * Converts the component to a string.
     */
    toString(): string {
        return this.value;
    }

    /**
     * Returns the primitive value of the component.
     */
    valueOf(): string {
        return this.value;
    }

    /**
     * Retrieves all subcomponents as strings.
     */
    getSubcomponents(): string[] {
        return this.subcomponents;
    }

    /**
     * Retrieves a specific subcomponent by index.
     * @param index The 1-based index of the subcomponent.
     */
    getSubcomponent(index: number): string {
        // Convert 1-based index to 0-based for the array
        return this.subcomponents[index - 1] || '';
    }
}

/**
 * Class representing a field with access to components.
 */
export class HL7Field {
    private components: string[];

    /**
     * Creates an instance of HL7Field.
     * @param value The value of the field.
     */
    constructor(private value: string) {
        // Split by the component separator (^)
        this.components = value.split('^');

        // Create a proxy for indexed access to components (1-based indices)
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Convert 1-based index to 0-based for the array
                    const component = target.components[index - 1];
                    // Return null if the component does not exist
                    if (component === undefined) return null;
                    return new HL7Component(component || '');
                }
                return target[prop as keyof HL7Field];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Ensure the array has enough elements
                    while (target.components.length < index) {
                        target.components.push('');
                    }
                    target.components[index - 1] = value;
                    target.value = target.components.join('^');
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<HL7Field>);
    }

    /**
     * Converts the field to a string.
     */
    toString(): string {
        return this.value;
    }

    /**
     * Returns the primitive value of the field.
     */
    valueOf(): string {
        return this.value;
    }

    /**
     * Retrieves all components as strings.
     */
    getComponents(): string[] {
        return this.components;
    }

    /**
     * Retrieves a specific component by index.
     * @param index The 1-based index of the component.
     */
    getComponent(index: number): string {
        // Convert 1-based index to 0-based for the array
        return this.components[index - 1] || '';
    }
}

/**
 * Class representing a segment with access to fields.
 */
export class Segment {
    private fields: string[];
    private name: string;

    /**
     * Creates an instance of Segment.
     * @param line The raw HL7 segment line.
     */
    constructor(line: string) {
        // Split the line by the field separator (|)
        this.fields = line.split('|');
        // The segment name is the first field (index 0)
        this.name = this.fields[0] || '';

        // Create a proxy to support indexed access with []
        return new Proxy(this, {
            get(target, prop) {
                // If it is a number, return the corresponding field as HL7Field
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    const fieldValue = target.getField(index);
                    // Return null if the field does not exist
                    if (!fieldValue) return null;
                    return new HL7Field(fieldValue);
                }
                // For any other property, use the normal behavior
                return target[prop as keyof Segment];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Ensure the array has enough elements
                    while (target.fields.length <= index) {
                        target.fields.push('');
                    }
                    target.fields[index] = value;
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<Segment>);
    }

    /**
     * Retrieves the name of the segment.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Retrieves all fields of the segment.
     */
    getFields(): string[] {
        return this.fields;
    }

    /**
     * Retrieves a specific field by index (plain string for compatibility).
     * @param index The 1-based index of the field.
     */
    getField(index: number): string {
        return this.fields[index] || '';
    }

    /**
     * Retrieves a field as an HL7Field object for advanced access.
     * @param index The 1-based index of the field.
     */
    getFieldObject(index: number): HL7Field {
        const fieldValue = this.getField(index);
        return new HL7Field(fieldValue);
    }

    /**
     * Retrieves a specific component of a field.
     * @param fieldIndex The 1-based index of the field.
     * @param componentIndex The 1-based index of the component within the field.
     */
    getComponent(fieldIndex: number, componentIndex: number): string {
        const field = this.getField(fieldIndex);
        if (!field) return '';

        // Split the field by the component separator (^)
        const components = field.split('^');
        // Convert 1-based index to 0-based for the array
        return components[componentIndex - 1] || '';
    }

    /**
     * Retrieves a specific subcomponent of a component.
     * @param fieldIndex The 1-based index of the field.
     * @param componentIndex The 1-based index of the component.
     * @param subcomponentIndex The 1-based index of the subcomponent.
     */
    getSubcomponent(fieldIndex: number, componentIndex: number, subcomponentIndex: number): string {
        const component = this.getComponent(fieldIndex, componentIndex);
        if (!component) return '';

        // Split the component by the subcomponent separator (&)
        const subcomponents = component.split('&');
        // Convert 1-based index to 0-based for the array
        return subcomponents[subcomponentIndex - 1] || '';
    }

    /**
     * Converts the segment to a string in HL7 format.
     * @returns The segment as a string.
     */
    toString(): string {
        return this.fields.join('|');
    }
}
