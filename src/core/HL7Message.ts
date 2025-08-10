import { Segment } from './Segment';
import { SegmentWithIndexAccess } from './types';

/**
 * Represents an HL7 message, providing methods for parsing, accessing, and modifying its segments and fields.
 */
export class HL7Message {
    /**
     * Sets a value using path notation. Creates the field/component/subcomponent if it does not exist.
     * @param path Format: 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT' (e.g., 'PID-5.1.2')
     * @param value Value to set
     */
    set(path: string, value: string): void {
        const pathParts = this.parsePath(path);
        if (!pathParts) return;

        const { segmentName, fieldIndex, componentIndex, subcomponentIndex } = pathParts;
        let segmentData = this.parsedSegments[segmentName];
        let segment: any;
        if (Array.isArray(segmentData)) {
            segment = segmentData[0];
        } else if (segmentData) {
            segment = segmentData;
        } else {
            // Si el segmento no existe, crearlo
            segment = new Segment(segmentName + '|');
            this.parsedSegments[segmentName] = segment;
            (this as any)[segmentName] = segment;
            // También agregarlo a la lista de segmentos
            this.segments.push(segment);
        }

        if (!componentIndex) {
            // Solo campo
            segment[fieldIndex] = value;
            return;
        }
        if (!subcomponentIndex) {
            // Campo y componente
            if (!segment[fieldIndex]) segment[fieldIndex] = '';
            if (!segment[fieldIndex][componentIndex]) segment[fieldIndex][componentIndex] = '';
            // Asignar el valor al componente
            segment[fieldIndex][componentIndex] = value;
            return;
        }
        // Campo, componente y subcomponente
        if (!segment[fieldIndex]) segment[fieldIndex] = '';
        if (!segment[fieldIndex][componentIndex]) segment[fieldIndex][componentIndex] = '';
        segment[fieldIndex][componentIndex][subcomponentIndex] = value;
    }

    /**
     * Parses a path in the format 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT'.
     * @param path The path to parse
     * @returns An object with segmentName, fieldIndex, componentIndex, and subcomponentIndex
     */
    private parsePath(path: string): {
        segmentName: string;
        fieldIndex: number;
        componentIndex?: number;
        subcomponentIndex?: number;
    } | null {
        // Formato esperado: 'PID-5.1.2' o 'PID-5.1' o 'PID-5' o 'PV1-2.1'
        const pathRegex = /^([A-Z]{2,3}[0-9]?)-(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
        const match = path.match(pathRegex);

        if (!match || !match[1] || !match[2]) {
            //console.warn(`Invalid path format: ${path}. Expected format: 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT' (e.g., 'PID-5.1.2')`);
            return null;
        }

        const segmentName = match[1];
        const fieldIndex = parseInt(match[2], 10);

        const result: {
            segmentName: string;
            fieldIndex: number;
            componentIndex?: number;
            subcomponentIndex?: number
        } = {
            segmentName,
            fieldIndex
        };

        if (match[3]) {
            result.componentIndex = parseInt(match[3], 10);
        }

        if (match[4]) {
            result.subcomponentIndex = parseInt(match[4], 10);
        }

        return result;
    }

    /**
     * Converts the HL7 message to a formatted string.
     * @returns The HL7 message as a string
     */
    toString(): string {
        return this.segments.map(segment => segment.toString()).join('\r\n');
    }

    /**
     * Retrieves a value using path notation.
     * @param path Format: 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT' (e.g., 'PID-5.1.2')
     * @returns The value at the specified path
     */
    get(path: string): string {
        // Parsear el path
        const pathParts = this.parsePath(path);
        if (!pathParts) return '';

        const { segmentName, fieldIndex, componentIndex, subcomponentIndex } = pathParts;

        // Buscar el segmento en el objeto parseado
        const segmentData = this.parsedSegments[segmentName];

        let segment: Segment | undefined;
        if (Array.isArray(segmentData)) {
            // Si es un array, tomar el primer elemento
            segment = segmentData[0];
        } else {
            // Si es un segmento único
            segment = segmentData;
        }

        if (!segment) return '';

        // Si no se especifica componente, devolver el campo completo
        if (componentIndex === undefined) {
            return segment.getField(fieldIndex) || '';
        }

        // Si no se especifica subcomponente, devolver el componente completo
        if (subcomponentIndex === undefined) {
            return segment.getComponent(fieldIndex, componentIndex);
        }

        // Devolver el subcomponente específico
        return segment.getSubcomponent(fieldIndex, componentIndex, subcomponentIndex);
    }

    /**
     * Retrieves all segments matching the specified name.
     * @param name The name of the segment (e.g., 'PID', 'OBX')
     * @returns An array of matching segments
     */
    getAllSegments(name: string): Segment[] {
        const segmentData = this.parsedSegments[name];

        if (Array.isArray(segmentData)) {
            return segmentData;
        } else if (segmentData) {
            return [segmentData];
        } else {
            return [];
        }
    }

    /**
     * Retrieves all segments in the message.
     * @returns An array of all segments
     */
    getSegments(): Segment[] {
        return this.segments;
    }

    /**
     * Retrieves the parsed structure of segments.
     * @returns An object with segments organized by type
     */
    getParsedSegments(): { [key: string]: Segment | Segment[] } {
        return this.parsedSegments;
    }

    /**
     * Retrieves a specific segment by name. If there are multiple segments of the same type, returns the first one.
     * @param name The name of the segment
     * @returns The matching segment, or undefined if not found
     */
    getSegment(name: string): Segment | undefined {
        const segmentData = this.parsedSegments[name];

        if (Array.isArray(segmentData)) {
            return segmentData[0];
        } else {
            return segmentData;
        }
    }

    /**
     * Checks if a specific segment exists.
     * @param name The name of the segment
     * @returns True if the segment exists, false otherwise
     */
    hasSegment(name: string): boolean {
        return name in this.parsedSegments;
    }

    /**
     * Assigns segments as direct properties of the object.
     */
    private assignSegmentProperties(): void {
        Object.keys(this.parsedSegments).forEach(segmentName => {
            const segmentData = this.parsedSegments[segmentName];

            // Si es un array, asignar el primer elemento
            if (Array.isArray(segmentData)) {
                (this as any)[segmentName] = segmentData[0];
            } else {
                // Si es un segmento único, asignarlo directamente
                (this as any)[segmentName] = segmentData;
            }
        });
    }

    /**
     * Parses the segments into a structured object.
     * @returns An object with segments organized by type
     */
    private parseSegmentsToObject(): { [key: string]: Segment | Segment[] } {
        const parsed: { [key: string]: Segment[] } = {};

        // Agrupar segmentos por nombre
        this.segments.forEach(segment => {
            const name = segment.getName();
            if (!parsed[name]) {
                parsed[name] = [];
            }
            parsed[name].push(segment);
        });

        // Convertir arrays de un solo elemento a elemento único
        const result: { [key: string]: Segment | Segment[] } = {};
        Object.keys(parsed).forEach(key => {
            const segments = parsed[key];
            if (segments && segments.length === 1) {
                const segment = segments[0];
                if (segment) {
                    result[key] = segment;
                }
            } else if (segments && segments.length > 1) {
                result[key] = segments;
            }
        });

        return result;
    }

    /**
     * Constructs an HL7Message instance from a raw HL7 string.
     * @param rawHL7 The raw HL7 message string
     */
    constructor(rawHL7: string) {
        // Dividir el string en líneas (segmentos)
        const lines = rawHL7.split(/\r?\n/).filter(line => line.trim() !== '');

        // Crear una instancia de Segment por cada línea
        this.segments = lines.map(line => new Segment(line));

        // Parsear los segmentos en un objeto estructurado
        this.parsedSegments = this.parseSegmentsToObject();

        // Asignar los segmentos como propiedades directas para acceso tipado
        this.assignSegmentProperties();

        // Crear un proxy para soportar el acceso por nombre de segmento con []
        return new Proxy(this, {
            get(target, prop) {
                // Si es un string que parece un nombre de segmento HL7 (2-3 caracteres alfanuméricos mayúsculas)
                if (typeof prop === 'string' && /^[A-Z]{2,3}[0-9]?$/.test(prop)) {
                    const segmentData = target.parsedSegments[prop];

                    // Si es un array, devolver el primer elemento para compatibilidad con el acceso directo
                    if (Array.isArray(segmentData)) {
                        return segmentData[0];
                    }

                    return segmentData || null;
                }
                // Para cualquier otra propiedad, usar el comportamiento normal
                return target[prop as keyof HL7Message];
            }
        });
    }

    /**
     * The list of segments in the message.
     */
    private segments: Segment[];

    /**
     * The parsed structure of segments, organized by segment name.
     */
    private parsedSegments: { [key: string]: Segment | Segment[] };

    /**
     * Direct access to specific segments by name, if they exist.
     */
    MSH?: SegmentWithIndexAccess;
    PID?: SegmentWithIndexAccess;
    PV1?: SegmentWithIndexAccess;
    PV2?: SegmentWithIndexAccess;
    OBX?: SegmentWithIndexAccess;
    OBR?: SegmentWithIndexAccess;
    EVN?: SegmentWithIndexAccess;
    NK1?: SegmentWithIndexAccess;
    AL1?: SegmentWithIndexAccess;
    DG1?: SegmentWithIndexAccess;
    PR1?: SegmentWithIndexAccess;
    IN1?: SegmentWithIndexAccess;
    IN2?: SegmentWithIndexAccess;
    IN3?: SegmentWithIndexAccess;
    NTE?: SegmentWithIndexAccess;
    ROL?: SegmentWithIndexAccess;
    [segmentName: string]: SegmentWithIndexAccess | undefined | any;
}
