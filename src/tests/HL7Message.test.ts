import { describe, it, expect } from '@jest/globals';
import { HL7Message } from '../core/HL7Message';

describe('HL7Message', () => {
    const sampleHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
PID|1|123456789||DOE^JOHN^M||19800101|M|||123 MAIN ST^^ANYTOWN^NY^12345||(555)123-4567|||S||987654321
PV1|1|I|ICU^101^A|||DOCTOR^ATTENDING|||SUR|||A|||DOCTOR^ATTENDING|INP|INSURANCE||19|||||||||||||||||V
OBX|1|NM|HEIGHT||180|cm|||||F
OBX|2|NM|WEIGHT||75|kg|||||F`;

    describe('Constructor and Basic Parsing', () => {
        it('should parse a valid HL7 message', () => {
            const message = new HL7Message(sampleHL7);
            expect(message).toBeInstanceOf(HL7Message);
        });

        it('should handle empty lines in HL7 message', () => {
            const hl7WithEmptyLines = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3

PID|1|123456789||DOE^JOHN^M||19800101|M`;
            const message = new HL7Message(hl7WithEmptyLines);
            expect(message.MSH).toBeDefined();
            expect(message.PID).toBeDefined();
        });

        it('should handle single segment message', () => {
            const singleSegment = 'MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3';
            const message = new HL7Message(singleSegment);
            expect(message.MSH).toBeDefined();
            expect(message.PID).toBeNull();
        });
    });

    describe('Segment Access', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should access segments directly by property', () => {
            expect(message.MSH).toBeDefined();
            expect(message.PID).toBeDefined();
            expect(message.PV1).toBeDefined();
            expect(message.OBX).toBeDefined();
        });

        it('should access segments by bracket notation', () => {
            expect(message['MSH']).toBeDefined();
            expect(message['PID']).toBeDefined();
            expect(message['PV1']).toBeDefined();
            expect(message['OBX']).toBeDefined();
        });

        it('should return null for non-existent segments', () => {
            expect(message.EVN).toBeNull();
            expect(message['NK1']).toBeNull();
        });
    });

    describe('getSegment Method', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should get single segments', () => {
            const msh = message.getSegment('MSH');
            expect(msh).toBeDefined();
            expect(msh?.getName()).toBe('MSH');

            const pid = message.getSegment('PID');
            expect(pid).toBeDefined();
            expect(pid?.getName()).toBe('PID');
        });

        it('should return first segment when multiple exist', () => {
            const obx = message.getSegment('OBX');
            expect(obx).toBeDefined();
            expect(obx?.getName()).toBe('OBX');
            // Should return the first OBX segment
            expect(obx?.getField(1)).toBe('1');
        });

        it('should return undefined for non-existent segments', () => {
            const evn = message.getSegment('EVN');
            expect(evn).toBeUndefined();
        });
    });

    describe('getAllSegments Method', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should get all segments of a type', () => {
            const obxSegments = message.getAllSegments('OBX');
            expect(obxSegments).toHaveLength(2);
            expect(obxSegments[0]?.getName()).toBe('OBX');
            expect(obxSegments[1]?.getName()).toBe('OBX');
        });

        it('should return single segment in array', () => {
            const mshSegments = message.getAllSegments('MSH');
            expect(mshSegments).toHaveLength(1);
            expect(mshSegments[0]?.getName()).toBe('MSH');
        });

        it('should return empty array for non-existent segments', () => {
            const evnSegments = message.getAllSegments('EVN');
            expect(evnSegments).toHaveLength(0);
        });
    });

    describe('hasSegment Method', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should return true for existing segments', () => {
            expect(message.hasSegment('MSH')).toBe(true);
            expect(message.hasSegment('PID')).toBe(true);
            expect(message.hasSegment('PV1')).toBe(true);
            expect(message.hasSegment('OBX')).toBe(true);
        });

        it('should return false for non-existent segments', () => {
            expect(message.hasSegment('EVN')).toBe(false);
            expect(message.hasSegment('NK1')).toBe(false);
            expect(message.hasSegment('AL1')).toBe(false);
        });
    });

    describe('get Method (Path Notation)', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should get field values using path notation', () => {
            expect(message.get('MSH-2')).toBe('SENDER');
            expect(message.get('MSH-3')).toBe('SENDFAC');
            expect(message.get('PID-2')).toBe('123456789');
            expect(message.get('PID-6')).toBe('19800101');
        });

        it('should get component values using path notation', () => {
            expect(message.get('PID-4.1')).toBe('DOE');
            expect(message.get('PID-4.2')).toBe('JOHN');
            expect(message.get('PID-4.3')).toBe('M');
        });

        it('should get subcomponent values using path notation', () => {
            expect(message.get('PID-10.1')).toBe('123 MAIN ST');
            expect(message.get('PID-10.3')).toBe('ANYTOWN');
            expect(message.get('PID-10.4')).toBe('NY');
            expect(message.get('PID-10.5')).toBe('12345');
        });

        it('should return empty string for non-existent fields', () => {
            expect(message.get('PID-99')).toBe('');
            expect(message.get('EVN-1')).toBe('');
            expect(message.get('PID-5.99')).toBe('');
            expect(message.get('PID-11.1.99')).toBe('');
        });

        it('should handle invalid path formats', () => {
            expect(message.get('INVALID')).toBe('');
            expect(message.get('PID')).toBe('');
            expect(message.get('PID-')).toBe('');
            expect(message.get('PID-A')).toBe('');
        });
    });

    describe('set Method (Path Notation)', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should set field values using path notation', () => {
            message.set('PID-2', 'NEWID123');
            expect(message.get('PID-2')).toBe('NEWID123');
        });

        it('should set component values using path notation', () => {
            message.set('PID-4.1', 'SMITH');
            expect(message.get('PID-4.1')).toBe('SMITH');
            expect(message.get('PID-4.2')).toBe('JOHN'); // Other components should remain
        });

        it('should set subcomponent values using path notation', () => {
            message.set('PID-10.3', 'NEWTOWN');
            expect(message.get('PID-10.3')).toBe('NEWTOWN');
        });

        it('should create new segments when setting non-existent segments', () => {
            expect(message.hasSegment('NK1')).toBe(false);
            message.set('NK1-2', 'CONTACT_NAME');
            expect(message.hasSegment('NK1')).toBe(true);
            expect(message.get('NK1-2')).toBe('CONTACT_NAME');
        });

        it('should create fields when setting non-existent fields', () => {
            message.set('PID-99', 'NEW_FIELD');
            expect(message.get('PID-99')).toBe('NEW_FIELD');
        });

        it('should handle invalid path formats gracefully', () => {
            message.set('INVALID', 'value');
            message.set('PID', 'value');
            message.set('PID-', 'value');
            // Should not throw errors and not affect the message
            expect(message.get('PID-2')).toBe('123456789'); // Original value should remain
        });
    });

    describe('toString Method', () => {
        it('should convert message back to HL7 string format', () => {
            const message = new HL7Message(sampleHL7);
            const result = message.toString();

            expect(result).toContain('MSH|');
            expect(result).toContain('PID|');
            expect(result).toContain('PV1|');
            expect(result).toContain('OBX|');
            expect(result).toContain('\r\n');
        });

        it('should preserve segment order', () => {
            const message = new HL7Message(sampleHL7);
            const result = message.toString();
            const lines = result.split('\r\n');

            expect(lines[0]).toMatch(/^MSH\|/);
            expect(lines[1]).toMatch(/^PID\|/);
            expect(lines[2]).toMatch(/^PV1\|/);
            expect(lines[3]).toMatch(/^OBX\|/);
            expect(lines[4]).toMatch(/^OBX\|/);
        });

        it('should handle single segment message', () => {
            const singleSegment = 'MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3';
            const message = new HL7Message(singleSegment);
            const result = message.toString();

            expect(result).toBe(singleSegment);
        });
    });

    describe('Field Access with Bracket Notation', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should access fields using bracket notation on segments', () => {
            expect(message.PID?.[1].toString()).toBe('1');
            expect(message.PID?.[4].toString()).toBe('DOE^JOHN^M');
            expect(message.MSH?.[2].toString()).toBe('SENDER');
        });

        it('should access components using bracket notation', () => {
            expect(message.PID?.[4][1].toString()).toBe('DOE');
            expect(message.PID?.[4][2].toString()).toBe('JOHN');
            expect(message.PID?.[4][3].toString()).toBe('M');
        });

        it('should access subcomponents using bracket notation', () => {
            expect(message.PID?.[10][1][1].toString()).toBe('123 MAIN ST');
            expect(message.PID?.[10][3][1].toString()).toBe('ANYTOWN');
            expect(message.PID?.[10][4][1].toString()).toBe('NY');
        });

        it('should return null for non-existent fields', () => {
            expect(message.PID?.[99]).toBeNull();
            expect(message.PID?.[4][99]).toBeNull();
            expect(message.PID?.[10][1][99]).toBeNull();
        });
    });

    describe('getParsedSegments Method', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should return parsed segments structure', () => {
            const parsed = message.getParsedSegments();

            expect(parsed.MSH).toBeDefined();
            expect(parsed.PID).toBeDefined();
            expect(parsed.PV1).toBeDefined();
            expect(parsed.OBX).toBeDefined();

            // OBX should be an array since there are multiple
            expect(Array.isArray(parsed.OBX)).toBe(true);
            expect((parsed.OBX as any[]).length).toBe(2);
        });
    });

    describe('getSegments Method', () => {
        let message: HL7Message;

        beforeEach(() => {
            message = new HL7Message(sampleHL7);
        });

        it('should return all segments in order', () => {
            const segments = message.getSegments();

            expect(segments).toHaveLength(5);
            expect(segments[0]?.getName()).toBe('MSH');
            expect(segments[1]?.getName()).toBe('PID');
            expect(segments[2]?.getName()).toBe('PV1');
            expect(segments[3]?.getName()).toBe('OBX');
            expect(segments[4]?.getName()).toBe('OBX');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty HL7 message', () => {
            const message = new HL7Message('');
            expect(message.getSegments()).toHaveLength(0);
            expect(message.get('MSH-1')).toBe('');
        });

        it('should handle message with only whitespace', () => {
            const message = new HL7Message('   \n   \r\n   ');
            expect(message.getSegments()).toHaveLength(0);
        });

        it('should handle malformed segments gracefully', () => {
            const malformed = 'MSH|^~\\&|SENDER\nINVALID_SEGMENT\nPID|1|123';
            const message = new HL7Message(malformed);

            expect(message.MSH).toBeDefined();
            expect(message.PID).toBeDefined();
            // Should not throw errors
        });

        /*it('should handle segments with missing fields', () => {
             const minimal = 'MSH|\nPID|';
             const message = new HL7Message(minimal);
 
             expect(message.MSH).toBeDefined();
             expect(message.PID).toBeDefined();
             expect(message.get('MSH-2')).toBe('');
             expect(message.get('PID-1')).toBe('PID');
         });*/
    });
});
