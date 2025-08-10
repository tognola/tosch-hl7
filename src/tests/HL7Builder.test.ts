import { describe, it, expect } from '@jest/globals';
import { HL7Builder } from '../core/HL7Builder';
import { HL7Message } from '../core/HL7Message';

describe('HL7Builder', () => {
    it('should build a simple HL7 message', () => {
        const builder = new HL7Builder();
        const message = builder
            .addSegment('MSH', {
                9: 'ACK^A01',
                10: 'MSGID12345',
                11: 'P',
                12: '2.3'
            })
            .addSegment('MSA', {
                2: 'AA',
                3: 'MSG00001'
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
                3: '123456789',
                5: 'DOE^JOHN'
            })
            .build();

        expect(message.toString()).toBe('PID||123456789||DOE^JOHN');
    });
});

