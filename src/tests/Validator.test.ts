import { describe, it, expect, beforeEach } from '@jest/globals';
import { CustomValidator } from "../core/CustomValidator";
import { HL7Message } from "../core/HL7Message";
import { ValidationRule } from "../core/types";

describe('CustomValidator', () => {
    let sampleHL7: string;
    let message: HL7Message;

    beforeEach(() => {
        sampleHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
PID|1|123456789||DOE^JOHN^M||19800101|M|||123 MAIN ST^^ANYTOWN^NY^12345||(555)123-4567|||S||987654321
PV1|1|I|ICU^101^A|||DOCTOR^ATTENDING|||SUR|||A|||DOCTOR^ATTENDING|INP|INSURANCE||19|||||||||||||||||V
OBX|1|NM|HEIGHT||180|cm|||||F`;
        message = new HL7Message(sampleHL7);
    });

    describe('Constructor', () => {
        it('should create a validator with rules', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1',
                    required: true,
                    dataType: 'ST'
                }
            ];
            const validator = new CustomValidator(rules);
            expect(validator).toBeInstanceOf(CustomValidator);
        });

        it('should create a validator with empty rules', () => {
            const validator = new CustomValidator([]);
            expect(validator).toBeInstanceOf(CustomValidator);
        });
    });

    describe('Required Field Validation', () => {
        it('should pass when required field exists', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1', // ADT (from ADT^A01)
                    required: true
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail when required field is missing', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-99', // Non-existent field
                    required: true
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]!.path).toBe('MSH-99');
            expect(result.errors[0]!.message).toBe('The required field is missing.');
        });

        it('should fail when required field is empty', () => {
            const emptyFieldHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000|||MSG001|P|2.3`;
            const emptyMessage = new HL7Message(emptyFieldHL7);

            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8', // Empty field
                    required: true
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(emptyMessage);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.message).toBe('The required field is missing.');
        });

        it('should pass when optional field is missing', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-99', // Non-existent field
                    required: false
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Maximum Length Validation', () => {
        it('should pass when field length is within limit', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-4', // RECEIVER (8 chars)
                    maxLength: 10
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail when field length exceeds limit', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-4', // RECEIVER (8 chars)
                    maxLength: 5
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.path).toBe('MSH-4');
            expect(result.errors[0]!.message).toBe('The value exceeds the maximum length of 5.');
        });

        it('should pass when field length equals limit', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-4', // RECEIVER (8 chars)
                    maxLength: 8
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Allowed Values Validation', () => {
        it('should pass when field value is in allowed list', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1', // ADT (from ADT^A01)
                    allowedValues: ['ADT', 'ORM', 'ORU']
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail when field value is not in allowed list', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1', // ADT (from ADT^A01)
                    allowedValues: ['ORM', 'ORU'] // ADT not in list
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.path).toBe('MSH-8.1');
            expect(result.errors[0]!.message).toBe('The value "ADT" is not in the list of allowed values.');
        });

        it('should pass when field is missing and allowedValues is set (optional field)', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-99', // Non-existent field
                    required: false,
                    allowedValues: ['VALUE1', 'VALUE2']
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Data Type Validation', () => {
        describe('Date Type (DT)', () => {
            it('should pass for valid date format YYYYMMDD', () => {
                // Para este test, usaremos un HL7 message con fecha en formato que JavaScript reconoce
                const validDateHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
PID|1|123456789||DOE^JOHN^M||1980-01-01|M|||123 MAIN ST^^ANYTOWN^NY^12345||(555)123-4567|||S||987654321`;
                const validDateMessage = new HL7Message(validDateHL7);

                const rules: ValidationRule[] = [
                    {
                        path: 'PID-6', // 1980-01-01
                        dataType: 'DT'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(validDateMessage);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should fail for invalid date format', () => {
                const invalidDateHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
PID|1|123456789||DOE^JOHN^M||INVALID_DATE|M|||123 MAIN ST^^ANYTOWN^NY^12345||(555)123-4567|||S||987654321`;
                const invalidMessage = new HL7Message(invalidDateHL7);

                const rules: ValidationRule[] = [
                    {
                        path: 'PID-6', // INVALID_DATE
                        dataType: 'DT'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(invalidMessage);

                expect(result.isValid).toBe(false);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0]!.path).toBe('PID-6');
                expect(result.errors[0]!.message).toBe('The value "INVALID_DATE" is not a valid date (YYYYMMDD).');
            });
        });

        describe('Numeric Type (NM)', () => {
            it('should pass for valid number', () => {
                const rules: ValidationRule[] = [
                    {
                        path: 'OBX-5', // 180
                        dataType: 'NM'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(message);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should fail for invalid number', () => {
                const invalidNumberHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
OBX|1|NM|HEIGHT||NOT_A_NUMBER|cm|||||F`;
                const invalidMessage = new HL7Message(invalidNumberHL7);

                const rules: ValidationRule[] = [
                    {
                        path: 'OBX-5', // NOT_A_NUMBER
                        dataType: 'NM'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(invalidMessage);

                expect(result.isValid).toBe(false);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0]!.path).toBe('OBX-5');
                expect(result.errors[0]!.message).toBe('The value "NOT_A_NUMBER" is not a valid number.');
            });

            it('should pass for decimal numbers', () => {
                const decimalHL7 = `MSH|^~\\&|SENDER|SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3
OBX|1|NM|HEIGHT||180.5|cm|||||F`;
                const decimalMessage = new HL7Message(decimalHL7);

                const rules: ValidationRule[] = [
                    {
                        path: 'OBX-5', // 180.5
                        dataType: 'NM'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(decimalMessage);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });

        describe('String Type (ST)', () => {
            it('should pass for any string value', () => {
                const rules: ValidationRule[] = [
                    {
                        path: 'MSH-2', // SENDER
                        dataType: 'ST'
                    }
                ];
                const validator = new CustomValidator(rules);
                const result = validator.validate(message);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });
    });

    describe('Multiple Rules Validation', () => {
        it('should validate multiple rules successfully', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1', // ADT (from ADT^A01)
                    required: true,
                    maxLength: 10,
                    allowedValues: ['ADT', 'ORM', 'ORU'],
                    dataType: 'ST'
                },
                {
                    path: 'PID-4.1', // DOE
                    required: true,
                    maxLength: 50,
                    dataType: 'ST'
                },
                {
                    path: 'PV1-1', // 1
                    required: false,
                    dataType: 'NM'
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect multiple validation errors', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-8.1', // ADT
                    allowedValues: ['INVALID'] // ADT not in list
                },
                {
                    path: 'MSH-2', // SENDER (6 chars)
                    maxLength: 3 // Too short
                },
                {
                    path: 'MSH-99',
                    required: true // Missing field
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(3);

            expect(result.errors[0]!.path).toBe('MSH-8.1');
            expect(result.errors[0]!.message).toContain('not in the list of allowed values');

            expect(result.errors[1]!.path).toBe('MSH-2');
            expect(result.errors[1]!.message).toContain('exceeds the maximum length');

            expect(result.errors[2]!.path).toBe('MSH-99');
            expect(result.errors[2]!.message).toContain('required field is missing');
        });

        it('should skip further validation when required field is missing', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-99', // Missing field
                    required: true,
                    maxLength: 5,
                    allowedValues: ['VALUE1']
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.message).toBe('The required field is missing.');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty message', () => {
            const emptyMessage = new HL7Message('');
            const rules: ValidationRule[] = [
                {
                    path: 'MSH-1',
                    required: false
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(emptyMessage);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle whitespace-only field values', () => {
            const whitespaceHL7 = `MSH|^~\\&|   |SENDFAC|RECEIVER|RECFAC|20230810120000||ADT^A01|MSG001|P|2.3`;
            const whitespaceMessage = new HL7Message(whitespaceHL7);

            const rules: ValidationRule[] = [
                {
                    path: 'MSH-2', // "   " (whitespace)
                    required: true
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(whitespaceMessage);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.message).toBe('The required field is missing.');
        });

        it('should validate component access correctly', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'PID-4.2', // JOHN
                    required: true,
                    maxLength: 10
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle non-existent components', () => {
            const rules: ValidationRule[] = [
                {
                    path: 'PID-4.99', // Non-existent component
                    required: true
                }
            ];
            const validator = new CustomValidator(rules);
            const result = validator.validate(message);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]!.message).toBe('The required field is missing.');
        });

        it('should validate with no rules', () => {
            const validator = new CustomValidator([]);
            const result = validator.validate(message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});