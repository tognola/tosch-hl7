import { HL7Message } from './core/HL7Message';

console.log('=== Testing HL7 Field Numbering ===');

// Test with the example you provided: PID|1|ABC
const testHL7 = 'PID|1|ABC';
const message = new HL7Message(testHL7);

console.log('Segment content:', testHL7);
console.log('PID segment fields array:', message.PID?.getFields());

console.log('\n=== Testing field access ===');
console.log('PID[1]:', message.PID?.[1]?.toString() || 'null');
console.log('PID[2]:', message.PID?.[2]?.toString() || 'null');
console.log('PID[3]:', message.PID?.[3]?.toString() || 'null');

console.log('\n=== Testing get method ===');
console.log('get("PID-1"):', message.get('PID-1'));
console.log('get("PID-2"):', message.get('PID-2'));
console.log('get("PID-3"):', message.get('PID-3'));

console.log('\n=== Expected according to user ===');
console.log('PID[3] should be "ABC"');
console.log('get("PID-3") should be "ABC"');
