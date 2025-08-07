import { Segment } from './Segment';

// Tipos de utilidad para acceso tipado con operador []

// Tipo que representa un subcomponente (solo lectura)
export interface HL7SubcomponentAccess {
    toString(): string;
    valueOf(): string;
}

// Tipo que representa un componente con acceso a subcomponentes (permite escritura)
export interface HL7ComponentAccess extends HL7SubcomponentAccess {
    [index: number]: HL7SubcomponentAccess | null | any; // Puede devolver null si no existe
    getSubcomponents(): string[];
    getSubcomponent(index: number): string;
}

// Tipo que representa un campo con acceso a componentes (permite escritura)
export interface HL7FieldAccess extends HL7SubcomponentAccess {
    [index: number]: HL7ComponentAccess | null | any; // Puede devolver null si no existe
    getComponents(): string[];
    getComponent(index: number): string;
}

// Tipo que extiende Segment para permitir acceso por índice a campos avanzados (permite escritura)
export type SegmentWithIndexAccess = Segment & {
    [index: number]: HL7FieldAccess | null | any; // Puede devolver null si no existe
};
