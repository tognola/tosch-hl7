# HL7 Library

A TypeScript/JavaScript library to work with HL7 messages in a simple and intuitive way.

## Documentation

📖 **[View Complete API Documentation](https://tognola.github.io/tosch-hl7/)**

## Features

- ✅ Automatic HL7 message parsing
- ✅ **Optimized internal structure**: Segments organized as key-value object
- ✅ **Smart handling**: Single object for unique segments, array for multiples
- ✅ Field access using path notation (`PID-5.1`)
- ✅ Direct access using `[]` operator (`message.PID[5]`)
- ✅ **Field modification and creation**: Both `[]` and `set()` methods support writing
- ✅ **Consistent 1-based indexing**: Same numbering for both access methods
- ✅ Segment search by name
- ✅ Support for field components and subcomponents
- ✅ Segment existence verification
- ✅ **Message validation**: CustomValidator with comprehensive HL7 field validation rules
- ✅ **TypeScript friendly**

## Installation

```bash
npm install tosch-hl7
```

## Internal Structure

The library automatically parses HL7 messages into an optimized structure:

- **Unique segments**: Stored as individual objects (`message.MSH`, `message.PID`)
- **Multiple segments of the same type**: Stored as arrays (`message.OBX[]`)
- **Uniform access**: The `[]` operator always returns the first element for compatibility

```typescript
// Example of internal structure:
{
  MSH: Segment,           // Single object
  PID: Segment,           // Single object  
  PV1: Segment,           // Single object
  OBX: [Segment, Segment] // Array of multiple segments
}
```

## Basic Usage

```typescript
import { HL7Message } from 'tosch-hl7';

const hl7Data = `MSH|^~\\&|SYSTEM|HOSPITAL|LAB|HOSPITAL|20240101120000||ADT^A01|12345|P|2.4
PID|1||123456789^^^HOSPITAL^MR||DOE^JOHN^MIDDLE||19800101|M|||123 MAIN ST^^ANYTOWN^ST^12345^USA
PV1|1|I|ICU^101^1|||ATTENDING^DOCTOR^A|||SUR||||19|VIP|ATTENDING^DOCTOR^A
OBX|1|TX|NOTE||First observation
OBX|2|TX|DIAG||Second observation`;

// No type conversion required!
const message = new HL7Message(hl7Data);

// Direct access to segments with full typing
console.log(message.PID[5]); // TypeScript recognizes the type automatically
console.log(message.MSH[9]); // No need for 'as any' or conversions
```

## Access Methods

### 1. Existence Verification

```typescript
// Verify if a segment exists
console.log(message.hasSegment('PID')); // true
console.log(message.hasSegment('NK1')); // false

// Get complete structure
const parsed = message.getParsedSegments();
console.log(parsed); // { MSH: Segment, PID: Segment, PV1: Segment, OBX: [Segment, Segment] }
```

### 2. Direct Segment Access

```typescript
// Access to unique segments
const pidSegment = message.getSegment('PID');
const mshSegment = message.getSegment('MSH');

// Access to multiple segments
const allObx = message.getAllSegments('OBX'); // Array of OBX segments
console.log(`There are ${allObx.length} observations`);
```

```typescript
// Get complete field
console.log(message.get('PID-5')); // "DOE^JOHN^MIDDLE"

// Get specific component
console.log(message.get('PID-5.1')); // "DOE"
console.log(message.get('PID-5.2')); // "JOHN"
console.log(message.get('PID-5.3')); // "MIDDLE"

// Other examples
console.log(message.get('PID-8')); // "M" (sex)
console.log(message.get('MSH-9')); // "ADT^A01" (message type)
```

### 3. `get()` Method - Path Notation

```typescript
// Get complete field
console.log(message.get('PID-5')); // "DOE^JOHN^MIDDLE"

// Get specific component
console.log(message.get('PID-5.1')); // "DOE"
console.log(message.get('PID-5.2')); // "JOHN"
console.log(message.get('PID-5.3')); // "MIDDLE"

// Other examples
console.log(message.get('PID-8')); // "M" (sex)
console.log(message.get('MSH-9')); // "ADT^A01" (message type)

// For multiple segments, gets the first one
console.log(message.get('OBX-5')); // Content of the first observation
```

### 4. `[]` Operator - Direct Access

```typescript
// Access to unique segments
const pidSegment = message.PID;  // Equivalent to message.getSegment('PID')
const mshSegment = message.MSH;  // Equivalent to message.getSegment('MSH')

// Field access
console.log(message.PID[5].toString()); // "DOE^JOHN^MIDDLE"
console.log(message.PID[8].toString()); // "M"
console.log(message.MSH[9].toString()); // "ADT^A01"

// For multiple segments, accesses the first one automatically
console.log(message.OBX[5].toString()); // Content of the first observation

// Check existence with optional chaining
console.log(message.NK1?.[1]); // undefined if NK1 doesn't exist
```

### 5. Multiple Segments Handling

```typescript
// Get all segments of a type
const pidSegments = message.getAllSegments('PID');
console.log(`Found ${pidSegments.length} PID segments`);

// Get all segments from the message
const allSegments = message.getSegments();
allSegments.forEach(segment => {
    console.log(`Segment: ${segment.getName()}`);
});
```

### 6. Get the Complete Message as Text

```typescript
// Convert the entire HL7 message to text in HL7 format
const hl7Text = message.toString();
console.log(hl7Text);
```

The `toString()` method returns the entire HL7 message as a string, with segments separated by `\r\n` (the HL7 standard).

#### Example Output

```
MSH|^~\&|SYSTEM|HOSPITAL|LAB|HOSPITAL|20240101120000||ADT^A01|12345|P|2.4
PID|1||123456789^^^HOSPITAL^MR||DOE^JOHN^MIDDLE||19800101|M|||123 MAIN ST^^ANYTOWN^ST^12345^USA||(555)123-4567|||S||987654321|||U
PV1|1|I|ICU^101^1|||ATTENDING^DOCTOR^A|||SUR||||19|VIP|ATTENDING^DOCTOR^A
```

## Practical Examples

### Extract Patient Information

```typescript
const patientName = message['PID'][5].toString(); // "DOE^JOHN^MIDDLE"
const patientSex = message['PID'][8].toString();  // "M"
const birthDate = message['PID'][7].toString();   // "19800101"
const patientId = message['PID'][3].toString();   // "123456789^^^HOSPITAL^MR"

console.log(`Patient: ${patientName}, Sex: ${patientSex}, Birth: ${birthDate}`);
```

### Message Information

```typescript
const messageType = message['MSH'][9].toString(); // "ADT^A01"
const sendingApp = message['MSH'][3].toString();  // "HOSPITAL"
const timestamp = message['MSH'][7].toString();   // "20240101120000"

console.log(`Message ${messageType} from ${sendingApp} at ${timestamp}`);
```

### Visit Information

```typescript
if (message['PV1']) {
    const patientClass = message['PV1'][2].toString(); // "I" (Inpatient)
    const location = message['PV1'][3].toString();     // "ICU^101^1"
    
    console.log(`Patient ${patientClass} at location ${location}`);
}
```

### Modify and Create Fields/Components/Subcomponents

```typescript
// Modify a field using []
message.PID[5] = 'SMITH^JANE^A';
console.log(message.PID[5].toString()); // "SMITH^JANE^A"

// Modify a component using [] - No need for multiple ?.
message.PID[5][2] = 'ALICE';
console.log(message.PID[5][2].toString()); // "ALICE"

// Modify a subcomponent using [] - Clean syntax
message.PID[5][2][1] = 'ALICE-SUB';
console.log(message.PID[5][2][1].toString()); // "ALICE-SUB"

// Create a field if it does not exist
message.PID[20] = 'NEWFIELD';
console.log(message.PID[20].toString()); // "NEWFIELD"

// Use set() to modify field, component, and subcomponent
message.set('PID-6', 'NEWFIELD6');
console.log(message.PID[6].toString()); // "NEWFIELD6"
message.set('PID-6.1', 'COMPONENT1');
console.log(message.PID[6][1].toString()); // "COMPONENT1"
message.set('PID-6.1.2', 'SUBCOMP2');
console.log(message.PID[6][1][2].toString()); // "SUBCOMP2"

// Non-existent fields return null (not empty objects)
console.log(message.PID[99]); // null
console.log(message.PID[5][99]); // null

// Both reading and writing use the same consistent 1-based indexing
console.log(message.get('PID-5.2')); // Same as message.PID[5][2]
message.set('PID-5.2', 'NEWNAME');   // Same as message.PID[5][2] = 'NEWNAME'
```

### Cleaner Syntax

```typescript
// BEFORE: Too much optional chaining
const value = message.PID?.[5]?.[2]?.[1]?.toString();

// NOW: Only need ? for the segment
const value = message.PID?.[5][2][1]?.toString();

// Even cleaner with validation
if (message.PID) {
    const value = message.PID[5][2][1]?.toString();
}
```

## Methods Comparison

| Method | Sintax | Example | Result |
|--------|----------|---------|-----------|
| `get()` | `get('SEGMENT-FIELD.COMPONENT.SUBCOMPONENT')` | `message.get('PID-5.1.2')` | `"Sub1"` |
| `[]` | `['SEGMENT'][FIELD][COMPONENT][SUBCOMPONENT]` | `message['PID'][5][1][2]` | `"Sub1"` |

**✅ Consistent Indices**: Both methods now use the same 1-based numbering:
- `get('PID-5.1.2')` is **exactly equivalent** to `PID[5][1][2]`
- The first component is `[1]` in both cases
- The first subcomponent is `[1]` in both cases

### Equivalence Examples

```typescript
// These expressions are completely equivalent:
message.get('PID-5.1')     === message.PID[5][1]     // "DOE"
message.get('PID-5.2')     === message.PID[5][2]     // "JOHN"
message.get('OBX-5.1.1')   === message.OBX[5][1][1]  // First subcomponent
message.get('PV1-3.4')     === message.PV1[3][4]     // Fourth component
```

## Supported HL7 Segments

The library supports all standard HL7 segments, including:

- `MSH` - Message Header
- `PID` - Patient Identification
- `PV1` - Patient Visit
- `OBX` - Observation/Result
- `OBR` - Observation Request
- `EVN` - Event Type
- And many more...

## API Reference

### `HL7Message` Class

#### Constructor
```typescript
new HL7Message(rawHL7: string)
```

#### Methods
- `get(path: string): string` - Gets a value using path notation
- `getAllSegments(name: string): Segment[]` - Gets all segments of a type
- `getSegments(): Segment[]` - Gets all segments

#### Operator Access
- `message['SEGMENT']` - Gets the first segment of the specified type

### `Segment` Class

#### Methods
- `getName(): string` - Gets the segment name
- `getField(index: number): string` - Gets a specific field
- `getComponent(fieldIndex: number, componentIndex: number): string` - Gets a specific component

#### Operator Access
- `segment[INDEX]` - Gets the field at the specified index

## HL7Builder Class

The `HL7Builder` class allows you to programmatically construct HL7 messages in a simple and intuitive way. This is especially useful when you need to generate HL7 messages dynamically.

### Features
- Add segments with fields, components, and subcomponents.
- Automatically handles field separators and encoding characters for the `MSH` segment.
- Ensures proper alignment of fields, even when some are empty.
- Outputs a valid HL7 message string.

### Example Usage

```typescript
import { HL7Builder } from 'tosch-hl7';

const builder = new HL7Builder();
const message = builder
    .addSegment('MSH', {
        8: 'ACK^A01',
        9: 'MSGID12345',
        10: 'P',
        11: '2.3'
    })
    .addSegment('PID', {
        2: '123456789',
        5: 'DOE^JOHN'
    })
    .build();

console.log(message.toString());
```

### Output
```
MSH|^~\&|||||||ACK^A01|MSGID12345|P|2.3
PID||123456789|||DOE^JOHN
```

### Methods

#### `addSegment(name: string, fields: { [key: number]: string }): HL7Builder`
Adds a new segment to the HL7 message.
- `name`: The name of the segment (e.g., `MSH`, `PID`).
- `fields`: An object where keys are field indices (1-based) and values are the field values.

#### `build(): HL7Message`
Builds the HL7 message and returns an instance of `HL7Message`.

## CustomValidator Class

The `CustomValidator` class provides comprehensive validation capabilities for HL7 messages, allowing you to define rules to ensure data integrity and compliance with HL7 standards.

### Features

- ✅ **Required field validation**: Ensure mandatory fields are present
- ✅ **Data type validation**: Validate against HL7 data types (ST, NM, DT, TS)
- ✅ **Maximum length validation**: Enforce field length limits
- ✅ **Allowed values validation**: Restrict fields to specific value sets
- ✅ **Regular expression validation**: Custom pattern matching
- ✅ **Multiple rule validation**: Apply multiple rules to the same field
- ✅ **Comprehensive error reporting**: Detailed validation results with specific error messages

### Basic Usage

```typescript
import { CustomValidator, ValidationRule } from 'tosch-hl7';

// Create validation rules
const rules: ValidationRule[] = [
    {
        path: 'MSH-9',
        required: true,
        allowedValues: ['ADT^A01', 'ADT^A04', 'ADT^A08']
    },
    {
        path: 'PID-5.1',
        required: true,
        dataType: 'ST',
        maxLength: 50
    },
    {
        path: 'PID-7',
        dataType: 'DT',
        regex: '^\\d{8}$'
    }
];

// Create validator and validate message
const validator = new CustomValidator(rules);
const result = validator.validate(message);

if (!result.isValid) {
    result.errors.forEach(error => {
        console.log(`Error in ${error.path}: ${error.message}`);
    });
}
```

### Validation Rules

#### ValidationRule Interface

```typescript
interface ValidationRule {
    path: string;           // HL7 field path (e.g., "PID-5.1")
    required?: boolean;     // Field is mandatory
    dataType?: 'ST' | 'NM' | 'DT' | 'TS';  // HL7 data type
    maxLength?: number;     // Maximum field length
    allowedValues?: string[]; // Permitted values
    regex?: string;         // Regular expression pattern
}
```

#### Supported Data Types

- **`ST`** - String: Alphanumeric text
- **`NM`** - Numeric: Numbers (integer or decimal)
- **`DT`** - Date: YYYYMMDD format
- **`TS`** - Timestamp: YYYYMMDDHHMMSS format

### Validation Examples

#### Required Fields

```typescript
const rules: ValidationRule[] = [
    { path: 'MSH-3', required: true },
    { path: 'MSH-4', required: true },
    { path: 'PID-5.1', required: true }
];

const validator = new CustomValidator(rules);
const result = validator.validate(message);
// Will fail if any required field is missing
```

#### Data Type Validation

```typescript
const rules: ValidationRule[] = [
    { path: 'PID-7', dataType: 'DT' },      // Date field
    { path: 'PV1-44', dataType: 'TS' },    // Timestamp field
    { path: 'PID-5.1', dataType: 'ST' },   // String field
    { path: 'PV1-19', dataType: 'NM' }     // Numeric field
];
```

#### Length and Value Constraints

```typescript
const rules: ValidationRule[] = [
    {
        path: 'PID-5.1',
        maxLength: 50,
        dataType: 'ST'
    },
    {
        path: 'MSH-9',
        allowedValues: ['ADT^A01', 'ADT^A04', 'ADT^A08', 'ORM^O01']
    },
    {
        path: 'PID-8',
        allowedValues: ['M', 'F', 'O', 'U']
    }
];
```

#### Regular Expression Validation

```typescript
const rules: ValidationRule[] = [
    {
        path: 'PID-7',
        regex: '^\\d{8}$',  // YYYYMMDD format
        dataType: 'DT'
    },
    {
        path: 'MSH-7',
        regex: '^\\d{14}$'  // YYYYMMDDHHMMSS format
    }
];
```

#### Complex Validation Scenarios

```typescript
const comprehensiveRules: ValidationRule[] = [
    // Message header validation
    {
        path: 'MSH-3',
        required: true,
        maxLength: 20,
        dataType: 'ST'
    },
    {
        path: 'MSH-9',
        required: true,
        allowedValues: ['ADT^A01', 'ADT^A04', 'ADT^A08']
    },
    
    // Patient identification validation
    {
        path: 'PID-3',
        required: true,
        regex: '^\\d+\\^\\^\\^.+\\^MR$'  // Patient ID format
    },
    {
        path: 'PID-5.1',
        required: true,
        dataType: 'ST',
        maxLength: 50
    },
    {
        path: 'PID-7',
        dataType: 'DT',
        regex: '^\\d{8}$'
    },
    {
        path: 'PID-8',
        allowedValues: ['M', 'F', 'O', 'U']
    }
];

const validator = new CustomValidator(comprehensiveRules);
const result = validator.validate(message);

console.log(`Validation result: ${result.isValid ? 'PASSED' : 'FAILED'}`);
if (!result.isValid) {
    console.log(`Found ${result.errors.length} validation errors:`);
    result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.path}: ${error.message}`);
    });
}
```

### ValidationResult Interface

```typescript
interface ValidationResult {
    isValid: boolean;       // Overall validation status
    errors: ValidationError[]; // Array of validation errors
}

interface ValidationError {
    path: string;          // Field path where error occurred
    message: string;       // Descriptive error message
}
```

### Error Messages

The validator provides descriptive error messages for different validation failures:

- **Required field**: `"Field MSH-3 is required"`
- **Invalid data type**: `"Field PID-7 must be a valid date (DT format)"`
- **Maximum length**: `"Field PID-5.1 exceeds maximum length of 50 characters"`
- **Allowed values**: `"Field PID-8 must be one of: M, F, O, U"`
- **Regular expression**: `"Field PID-7 does not match required pattern"`

### Best Practices

1. **Start with required fields**: Validate mandatory fields first
2. **Use appropriate data types**: Match HL7 standard data types
3. **Combine validation rules**: Use multiple constraints for comprehensive validation
4. **Handle validation results**: Always check `isValid` and process errors appropriately
5. **Document validation rules**: Maintain clear documentation of your validation requirements

### API Reference

#### Constructor
```typescript
new CustomValidator(rules: ValidationRule[])
```

#### Methods
```typescript
validate(message: HL7Message): ValidationResult
```

The `validate` method returns a `ValidationResult` object containing:
- `isValid`: Boolean indicating if all validations passed
- `errors`: Array of `ValidationError` objects with path and message details

## License

MIT
