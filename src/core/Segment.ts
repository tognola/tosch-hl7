// Clase para representar un subcomponente
export class HL7Subcomponent {
    constructor(private value: string) { }

    toString(): string {
        return this.value;
    }

    valueOf(): string {
        return this.value;
    }
}

// Clase para representar un componente con acceso a subcomponentes
export class HL7Component {
    private subcomponents: string[];

    constructor(private value: string) {
        // Dividir por el separador de subcomponentes (&)
        this.subcomponents = value.split('&');

        // Crear un proxy para acceso por índice a subcomponentes (índices basados en 1)
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Convertir índice basado en 1 a basado en 0 para el array
                    const subcomponent = target.subcomponents[index - 1];
                    // Si no existe, devolver null en lugar de string vacío
                    if (subcomponent === undefined) return null;
                    return new HL7Subcomponent(subcomponent || '');
                }
                return target[prop as keyof HL7Component];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Convertir índice basado en 1 a basado en 0 para el array
                    target.subcomponents[index - 1] = value;
                    // Actualizar el valor string
                    target.value = target.subcomponents.join('&');
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<HL7Component>);
    }

    toString(): string {
        return this.value;
    }

    valueOf(): string {
        return this.value;
    }

    getSubcomponents(): string[] {
        return this.subcomponents;
    }

    getSubcomponent(index: number): string {
        // Convertir índice basado en 1 a basado en 0 para el array
        return this.subcomponents[index - 1] || '';
    }
}

// Clase para representar un campo con acceso a componentes
export class HL7Field {
    private components: string[];

    constructor(private value: string) {
        // Dividir por el separador de componentes (^)
        this.components = value.split('^');

        // Crear un proxy para acceso por índice a componentes (índices basados en 1)
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    // Convertir índice basado en 1 a basado en 0 para el array
                    const component = target.components[index - 1];
                    // Si no existe, devolver null en lugar de string vacío
                    if (component === undefined) return null;
                    return new HL7Component(component || '');
                }
                return target[prop as keyof HL7Field];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    target.components[index - 1] = value;
                    target.value = target.components.join('^');
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<HL7Field>);
    }

    toString(): string {
        return this.value;
    }

    valueOf(): string {
        return this.value;
    }

    getComponents(): string[] {
        return this.components;
    }

    getComponent(index: number): string {
        // Convertir índice basado en 1 a basado en 0 para el array
        return this.components[index - 1] || '';
    }
}

export class Segment {
    private fields: string[];
    private name: string;

    constructor(line: string) {
        // Dividir la línea por el separador de campos (|)
        this.fields = line.split('|');
        // El nombre del segmento es el primer campo (índice 0)
        this.name = this.fields[0] || '';

        // Crear un proxy para soportar el acceso por índice con []
        return new Proxy(this, {
            get(target, prop) {
                // Si es un número, devolver el campo correspondiente como HL7Field
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    const fieldValue = target.getField(index);
                    // Si no existe el campo, devolver null
                    if (!fieldValue) return null;
                    return new HL7Field(fieldValue);
                }
                // Para cualquier otra propiedad, usar el comportamiento normal
                return target[prop as keyof Segment];
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    target.fields[index] = value;
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        } as ProxyHandler<Segment>);
    }

    /**
     * Obtiene el nombre del segmento
     */
    getName(): string {
        return this.name;
    }

    /**
     * Obtiene todos los campos del segmento
     */
    getFields(): string[] {
        return this.fields;
    }

    /**
     * Obtiene un campo específico por índice (string plano para compatibilidad)
     */
    getField(index: number): string {
        return this.fields[index] || '';
    }

    /**
     * Obtiene un campo como objeto HL7Field para acceso avanzado
     */
    getFieldObject(index: number): HL7Field {
        const fieldValue = this.getField(index);
        return new HL7Field(fieldValue);
    }

    /**
     * Obtiene un componente específico de un campo
     * @param fieldIndex Índice del campo
     * @param componentIndex Índice del componente dentro del campo (basado en 1)
     */
    getComponent(fieldIndex: number, componentIndex: number): string {
        const field = this.getField(fieldIndex);
        if (!field) return '';

        // Dividir el campo por el separador de componentes (^)
        const components = field.split('^');
        // Convertir índice basado en 1 a basado en 0 para el array
        return components[componentIndex - 1] || '';
    }

    /**
     * Obtiene un subcomponente específico de un componente
     * @param fieldIndex Índice del campo
     * @param componentIndex Índice del componente (basado en 1)
     * @param subcomponentIndex Índice del subcomponente (basado en 1)
     */
    getSubcomponent(fieldIndex: number, componentIndex: number, subcomponentIndex: number): string {
        const component = this.getComponent(fieldIndex, componentIndex);
        if (!component) return '';

        // Dividir el componente por el separador de subcomponentes (&)
        const subcomponents = component.split('&');
        // Convertir índice basado en 1 a basado en 0 para el array
        return subcomponents[subcomponentIndex - 1] || '';
    }
}
