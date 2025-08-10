import { HL7Message } from './core/HL7Message';

console.log('=== Testing PID[2][1] setter issue ===');

const sampleHL7 = 'PID|1|123456789||DOE^JOHN^M||19800101|M';
const message = new HL7Message(sampleHL7);

console.log('Original PID[2]:', message.PID?.[2]?.toString());
console.log('Original PID[2][1]:', message.PID?.[2]?.[1]?.toString());

console.log('\n=== Setting PID[2][1] to "NEW_VALUE" ===');
if (message.PID?.[2]) {
    message.PID[2][1] = "NEW_VALUE";
}

console.log('After setting PID[2][1]:');
console.log('PID[2]:', message.PID?.[2]?.toString());
console.log('PID[2][1]:', message.PID?.[2]?.[1]?.toString());

console.log('\n=== Full segment after change ===');
console.log('PID segment:', message.PID?.toString());

console.log('\n=== Testing path notation ===');
console.log('get("PID-2"):', message.get('PID-2'));
console.log('get("PID-3"):', message.get('PID-3'));
console.log('get("PID-5.1"):', message.get('PID-5.1'));
console.log('get("PID-5.2"):', message.get('PID-5.2'));

message.set('PID-2', 'MODIFIED_FIELD');
console.log('=== Testing PID[4][1] setter issue (field with components) ===');

console.log('Original PID[4]:', message.PID?.[4]?.toString());
console.log('Original PID[4][1]:', message.PID?.[4]?.[1]?.toString());
console.log('Original PID[4][2]:', message.PID?.[4]?.[2]?.toString());

console.log('\n=== Setting PID[4][1] to "SMITH" ===');
if (message.PID?.[4]) {
    message.PID[4][1] = "SMITH";
}

console.log('After setting PID[4][1] to "SMITH":');
console.log('PID[4]:', message.PID?.[4]?.toString());
console.log('PID[4][1]:', message.PID?.[4]?.[1]?.toString());
console.log('PID[4][2]:', message.PID?.[4]?.[2]?.toString());

console.log('\n=== Testing component setting with simple field ===');
console.log('Original PID[2]:', message.PID?.[2]?.toString());
if (message.PID?.[2]) {
    message.PID[2][1] = "FIRST_COMPONENT";
    message.PID[2][2] = "SECOND_COMPONENT";
}
console.log('After setting PID[2][1] and PID[2][2]:');
console.log('PID[2]:', message.PID?.[2]?.toString());
console.log('PID[2][1]:', message.PID?.[2]?.[1]?.toString());
console.log('PID[2][2]:', message.PID?.[2]?.[2]?.toString());

console.log('\n=== Full segment after all changes ===');
console.log('PID segment:', message.PID?.toString());
