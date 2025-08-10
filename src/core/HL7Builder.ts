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
        const fieldArray: string[] = Array(maxIndex - 1).fill(''); // Initialize an array with empty strings
        // Handle special case for MSH segment (field 1 is the field separator)
        if (name === 'MSH') {
            fieldArray[0] = '^~\\&'; // Encoding characters
        }

        const values = Object.values(fields).map((value, index) => ({
            value: value || '',  // Ensure no undefined values
            pos: Number(Object.keys(fields)[index])
        })); // Ensure no undefined values

        values.forEach(({ value, pos }) => {
            const index = pos - 2; // Convert to 0-based index
            if (index < fieldArray.length) {
                fieldArray[index] = value; // Assign value to the correct index
            }
        });


        // Join fields with the pipe (|) delimiter and add to segments
        const segment = `${name}|${fieldArray.join('|')}`;
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