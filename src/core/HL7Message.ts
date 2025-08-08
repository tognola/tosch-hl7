import { Segment } from './Segment';
import { SegmentWithIndexAccess } from './types';

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
        }

        if (!componentIndex) {
            // Solo campo
            segment[fieldIndex] = value;
            return;
        }
        if (!subcomponentIndex) {
            // Campo y componente
            if (!segment[fieldIndex]) segment[fieldIndex] = '';
            segment[fieldIndex][componentIndex] = value;
            return;
        }
        // Campo, componente y subcomponente
        if (!segment[fieldIndex]) segment[fieldIndex] = '';
        if (!segment[fieldIndex][componentIndex]) segment[fieldIndex][componentIndex] = '';
        segment[fieldIndex][componentIndex][subcomponentIndex] = value;
    }
    private segments: Segment[];
    private parsedSegments: { [key: string]: Segment | Segment[] };

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

                    return segmentData || undefined;
                }
                // Para cualquier otra propiedad, usar el comportamiento normal
                return target[prop as keyof HL7Message];
            }
        });
    }

    /**
     * Asigna los segmentos como propiedades directas del objeto
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
     * Parsea los segmentos en un objeto estructurado
     * @returns Objeto con segmentos organizados por tipo
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
     * Método principal para obtener valores usando path notation
     * @param path Formato: 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT' (ej: 'PID-5.1.2')
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
            return segment.getField(fieldIndex);
        }

        // Si no se especifica subcomponente, devolver el componente completo
        if (subcomponentIndex === undefined) {
            return segment.getComponent(fieldIndex, componentIndex);
        }

        // Devolver el subcomponente específico
        return segment.getSubcomponent(fieldIndex, componentIndex, subcomponentIndex);
    }

    /**
     * Obtiene todos los segmentos que coincidan con el nombre
     * @param name Nombre del segmento (ej: 'PID', 'OBX')
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
     * Obtiene todos los segmentos del mensaje
     */
    getSegments(): Segment[] {
        return this.segments;
    }

    /**
     * Obtiene la estructura parseada de segmentos
     * @returns Objeto con segmentos organizados por tipo
     */
    getParsedSegments(): { [key: string]: Segment | Segment[] } {
        return this.parsedSegments;
    }

    /**
     * Obtiene un segmento específico por nombre
     * Si hay múltiples segmentos del mismo tipo, devuelve el primero
     * @param name Nombre del segmento
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
     * Verifica si existe un segmento específico
     * @param name Nombre del segmento
     */
    hasSegment(name: string): boolean {
        return name in this.parsedSegments;
    }

    /**
     * Parsea un path en formato 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT'
     * @param path El path a parsear
     * @returns Objeto con segmentName, fieldIndex, componentIndex y subcomponentIndex
     */
    private parsePath(path: string): {
        segmentName: string;
        fieldIndex: number;
        componentIndex?: number;
        subcomponentIndex?: number
    } | null {
        // Formato esperado: 'PID-5.1.2' o 'PID-5.1' o 'PID-5' o 'PV1-2.1'
        const pathRegex = /^([A-Z]{2,3}[0-9]?)-(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
        const match = path.match(pathRegex);

        if (!match || !match[1] || !match[2]) {
            console.warn(`Invalid path format: ${path}. Expected format: 'SEGMENT-FIELD.COMPONENT.SUBCOMPONENT' (e.g., 'PID-5.1.2')`);
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


    /** * Convierte el mensaje HL7 a un string con formato
     * @returns El mensaje HL7 como string
     */
    toString(): string {
        return this.segments.map(segment => segment.toString()).join('\r\n');
    }
}
