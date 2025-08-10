import { HL7Message } from './HL7Message';

/**
 * A builder class to construct HL7 messages programmatically.
 */
export class HL7Builder {
    private segments: string[] = [];

    /**
     * Adds a new segment to the HL7 message.
     * @param name The name of the segment (e.g., "MSH", "PID").
     * @param fields An object where keys are field indices (1-based) and values are the field values.
     */
    addSegment(name: string, fields: { [key: number]: string }): HL7Builder {
        const maxIndex = Math.max(...Object.keys(fields).map(key => parseInt(key, 10)));
        const fieldArray: string[] = Array(maxIndex).fill(''); // Initialize an array with empty strings
        fieldArray[0] = name; // First element is the segment name
        if (name === 'MSH') {
            fieldArray[1] = '^~\\&'; // Encoding characters
        }



        Object.keys(fields).forEach((key: string) => {
            const index = parseInt(key, 10); // Convert to 0-based index
            fieldArray[index] = fields[index] || '';
        });


        // Join fields with the pipe (|) delimiter and add to segments
        const segment = `${fieldArray.join('|')}`;
        this.segments.push(segment);

        return this; // Enable method chaining
    }

    /**
     * Builds the HL7 message and returns an instance of HL7Message.
     */
    build(): HL7Message {
        const rawMessage = this.segments.join('\r\n');
        return new HL7Message(rawMessage);
    }
}