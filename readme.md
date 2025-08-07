# HL7 Library

A TypeScript/JavaScript library to work with HL7 messages in a simple and intuitive way.

## Features

- ✅ Automatic HL7 message parsing
- ✅ **Optimized internal structure**: Segments organized as key-value object
- ✅ **Smart handling**: Single object for unique segments, array for multiples
- ✅ Field access using path notation (`PID-5.1`)
- ✅ Direct access using `[]` operator (`message.PID[5]`)
- ✅ **Field modification and creation**: Both `[]` and `set()` methods support writing
- ✅ **Consistent 1-based indexing**: Same numbering for both access methods
- ✅ **Reduced optional chaining**: Fields return `null` instead of requiring `?.` everywhere
- ✅ Segment search by name
- ✅ Support for field components and subcomponents
- ✅ Segment existence verification
- ✅ **TypeScript friendly**: No type casting required

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
console.log(message.PID[5]); // "DOE^JOHN^MIDDLE"
console.log(message.PID[8]); // "M"
console.log(message.MSH[9]); // "ADT^A01"

// For multiple segments, accesses the first one automatically
console.log(message.OBX[5]); // Content of the first observation

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

## Practical Examples

### Extract Patient Information

```typescript
const patientName = message['PID'][5]; // "DOE^JOHN^MIDDLE"
const patientSex = message['PID'][8];  // "M"
const birthDate = message['PID'][7];   // "19800101"
const patientId = message['PID'][3];   // "123456789^^^HOSPITAL^MR"

console.log(`Patient: ${patientName}, Sex: ${patientSex}, Birth: ${birthDate}`);
```

### Message Information

```typescript
const messageType = message['MSH'][9]; // "ADT^A01"
const sendingApp = message['MSH'][3];  // "HOSPITAL"
const timestamp = message['MSH'][7];   // "20240101120000"

console.log(`Message ${messageType} from ${sendingApp} at ${timestamp}`);
```

### Visit Information

```typescript
if (message['PV1']) {
    const patientClass = message['PV1'][2]; // "I" (Inpatient)
    const location = message['PV1'][3];     // "ICU^101^1"
    
    console.log(`Patient ${patientClass} at location ${location}`);
}
```

### Modify and Create Fields/Components/Subcomponents

```typescript
// Modify a field using []
message.PID[5] = 'SMITH^JANE^A';
console.log(message.PID[5]); // "SMITH^JANE^A"

// Modify a component using [] - No need for multiple ?.
message.PID[5][2] = 'ALICE';
console.log(message.PID[5][2]); // "ALICE"

// Modify a subcomponent using [] - Clean syntax
message.PID[5][2][1] = 'ALICE-SUB';
console.log(message.PID[5][2][1]); // "ALICE-SUB"

// Create a field if it does not exist
message.PID[20] = 'NEWFIELD';
console.log(message.PID[20]); // "NEWFIELD"

// Use set() to modify field, component, and subcomponent
message.set('PID-6', 'NEWFIELD6');
console.log(message.PID[6]); // "NEWFIELD6"
message.set('PID-6.1', 'COMPONENT1');
console.log(message.PID[6][1]); // "COMPONENT1"
message.set('PID-6.1.2', 'SUBCOMP2');
console.log(message.PID[6][1][2]); // "SUBCOMP2"

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

| Método | Sintaxis | Ejemplo | Resultado |
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

## License

ISC
