import { Segment } from './core/Segment';

console.log('=== Testing HL7 Field Indexing ===');

// Test case: PID|1|ABC
const segment = new Segment('PID|1|ABC') as any;

console.log('\n=== Segment Analysis ===');
console.log('Segment string:', segment.toString());
console.log('Segment name:', segment.getName());
console.log('All fields:', segment.getFields());

console.log('\n=== Field Access Tests ===');
console.log('segment[0]:', segment[0]?.toString()); // Should be 'PID'
console.log('segment[1]:', segment[1]?.toString()); // Should be '1'
console.log('segment[2]:', segment[2]?.toString()); // Should be 'ABC'

console.log('\n=== Direct getField Tests ===');
console.log('getField(0):', segment.getField(0)); // Should be 'PID'
console.log('getField(1):', segment.getField(1)); // Should be '1'
console.log('getField(2):', segment.getField(2)); // Should be 'ABC'

console.log('\n=== Setting Field Values ===');
console.log('Before setting: segment[2] =', segment[2]?.toString());

// Test the setter
segment[2][1] = 'MODIFIED';
console.log('After setting segment[2][1] = "MODIFIED":', segment[2]?.toString());
console.log('Full segment:', segment.toString());

// Test with a more complex field
const pidSegment = new Segment('PID|1|123456789||DOE^JOHN^M||19800101|M') as any;
console.log('\n=== Complex Field Test ===');
console.log('PID segment:', pidSegment.toString());
console.log('PID[5] (name field):', pidSegment[5]?.toString());
console.log('PID[5][1] (last name):', pidSegment[5]?.[1]?.toString());
console.log('PID[5][2] (first name):', pidSegment[5]?.[2]?.toString());

console.log('\n=== Modifying Name Components ===');
pidSegment[5][1] = 'SMITH';
console.log('After setting last name to SMITH:', pidSegment[5]?.toString());
console.log('Full PID segment:', pidSegment.toString());
