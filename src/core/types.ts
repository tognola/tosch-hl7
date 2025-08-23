import { Segment } from './Segment';

/**
 * Represents a subcomponent (read-only).
 */
export interface HL7SubcomponentAccess {
    /** Converts the subcomponent to a string. */
    toString(): string;

    /** Returns the primitive value of the subcomponent. */
    valueOf(): string;
}

/**
 * Represents a component with access to subcomponents (allows writing).
 */
export interface HL7ComponentAccess extends HL7SubcomponentAccess {
    /** Access subcomponents by index. May return null if not present. */
    [index: number]: HL7SubcomponentAccess | null | any;

    /** Retrieves all subcomponents as strings. */
    getSubcomponents(): string[];

    /** Retrieves a specific subcomponent by index. */
    getSubcomponent(index: number): string;
}

/**
 * Represents a field with access to components (allows writing).
 */
export interface HL7FieldAccess extends HL7SubcomponentAccess {
    /** Access components by index. May return null if not present. */
    [index: number]: HL7ComponentAccess | null | any;

    /** Retrieves all components as strings. */
    getComponents(): string[];

    /** Retrieves a specific component by index. */
    getComponent(index: number): string;
}

/**
 * Extends Segment to allow indexed access to advanced fields (allows writing).
 */
export type SegmentWithIndexAccess = Segment & {
    /** Access fields by index. May return null if not present. */
    [index: number]: HL7FieldAccess | null | any;
};

/**
 * Represents a validation rule for a specific HL7 field.
 *
 * @remarks
 * This interface is used to define constraints and validation logic for HL7 message fields,
 * such as required/optional status, data type, length, allowed values, and custom regex patterns.
 *
 * @property path - The path to the HL7 field (e.g., "PID-5.1").
 * @property required - Indicates if the field is required (true) or optional (false), optional by default.
 * @property dataType - The expected HL7 data type (e.g., 'ST', 'NM', 'DT', 'TS').
 * @property maxLength - The maximum allowed length for the field value.
 * @property allowedValues - An array of permitted values, typically from HL7 tables.
 * @property regex - A regular expression pattern the field value must match.
 */
export interface ValidationRule {
    path: string;
    required?: boolean;
    dataType?: 'ST' | 'NM' | 'DT' | 'TS'; // Tipo de dato a validar
    maxLength?: number;
    allowedValues?: string[];
    regex?: string;
}

/**
 * Represents a validation error with a specific path and message.
 *
 * @property path - The location or key in the data structure where the error occurred.
 * @property message - A descriptive message explaining the validation error.
 */
export interface ValidationError {
    path: string;
    message: string;
}

/**
 * Represents the result of a validation operation.
 *
 * @property isValid - Indicates whether the validation was successful.
 * @property errors - An array of validation errors encountered during the validation process.
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}