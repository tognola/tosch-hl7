
import { HL7Message } from './HL7Message';
import { ValidationRule, ValidationResult, ValidationError } from './types';

export class CustomValidator {
    constructor(private rules: ValidationRule[]) { }

    public validate(message: HL7Message): ValidationResult {
        const errors: ValidationError[] = [];

        // Iterate over each rule provided by the user
        for (const rule of this.rules) {
            const value = message.get(rule.path);

            // 1. Required Field Check (Optionality)
            if (rule.required && (!value || value.trim() === '')) {
                errors.push({ path: rule.path, message: 'The required field is missing.' });
                continue; // If missing, no point in further validations for this field
            }

            // If the field is optional and does not exist, move to the next rule
            if (!value) continue;

            // 2. Maximum Length Check (maxLength)
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push({ path: rule.path, message: `The value exceeds the maximum length of ${rule.maxLength}.` });
            }

            // 3. Allowed Values Check (allowedValues)
            if (rule.allowedValues && !rule.allowedValues.includes(value)) {
                errors.push({ path: rule.path, message: `The value "${value}" is not in the list of allowed values.` });
            }

            // 4. Data Type Check (dataType) - (Simple example)
            if (rule.dataType === 'DT' && isNaN(Date.parse(value))) {
                errors.push({ path: rule.path, message: `The value "${value}" is not a valid date (YYYYMMDD).` });
            }
            if (rule.dataType === 'NM' && isNaN(Number(value))) {
                errors.push({ path: rule.path, message: `The value "${value}" is not a valid number.` });
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}