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
