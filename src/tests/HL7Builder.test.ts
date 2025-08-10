import { describe, it, expect } from '@jest/globals';
import { HL7Builder } from '../core/HL7Builder';
import { HL7Message } from '../core/HL7Message';

describe('HL7Builder', () => {
    it('should build a simple HL7 message', () => {
        const builder = new HL7Builder();
        const message = builder
            .addSegment('MSH', {
                8: 'ACK^A01',
                9: 'MSGID12345',
                10: 'P',
                11: '2.3'
            })
            .addSegment('MSA', {
                1: 'AA',
                2: 'MSG00001'
            })
            .build();

        expect(message).toBeInstanceOf(HL7Message);
        expect(message.toString()).toBe(
            'MSH|^~\\&|||||||ACK^A01|MSGID12345|P|2.3\r\n' +
            'MSA|AA|MSG00001'
        );
    });

    it('should handle empty fields correctly', () => {
        const builder = new HL7Builder();
        const message = builder
            .addSegment('PID', {
                2: '123456789',
                5: 'DOE^JOHN'
            })
            .build();

        expect(message.toString()).toBe('PID||123456789|||DOE^JOHN');
    });

    it('should correctly parse a message created by the builder (round-trip test)', () => {
        const originalData = {
            patientId: 'PAT123',
            lastName: 'García',
            firstName: 'Elena'
        };

        // 1. Build
        const builtMessage = new HL7Builder()
            .addSegment('MSH', {
                8: 'ACK^A01',
                9: 'MSGID12345',
                10: 'P',
                11: '2.3'
            })
            .addSegment('PID', {
                2: originalData.patientId,
                5: `${originalData.lastName}^${originalData.firstName}`
            })
            .build();

        // 2. Convert to string
        const hl7String = builtMessage.toString();

        // 3. Parse back
        const parsedMessage = new HL7Message(hl7String);

        //console.log('Parsed HL7 Message:', parsedMessage.toString());

        // 4. Verify
        expect(parsedMessage.toString()).toBe(builtMessage.toString());
        expect(parsedMessage.PID?.[2].toString()).toBe(originalData.patientId);
        expect(parsedMessage.get('PID-5.1')).toBe(originalData.lastName);
        expect(parsedMessage.get('PID-5.2')).toBe(originalData.firstName);
    });
});

