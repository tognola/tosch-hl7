import { HL7Message } from '../src';

// Demostración de que NO se necesita conversión de tipos
const hl7Data = `MSH|^~\\&|SYSTEM|HOSPITAL|LAB|HOSPITAL|20240101120000||ADT^A01|12345|P|2.4
PID|1||123456789^^^HOSPITAL^MR||DOE^JOHN^MIDDLE||19800101|M|||123 MAIN ST^^ANYTOWN^ST^12345^USA
OBX|1|TX|NOTA||Observación número 1
OBX|2|TX|DIAG||Observación número 2`;

// ✅ ANTES: se necesitaba conversión
// const message = new HL7Message(hl7Data) as HL7MessageWithSegmentAccess;

// ✅ AHORA: ¡No se necesita conversión!
const message = new HL7Message(hl7Data);

console.log('🎉 ¡Acceso tipado sin conversiones!\n');

// TypeScript reconoce automáticamente los tipos
console.log('Acceso directo a propiedades:');
console.log(`  message.MSH existe: ${message.MSH ? 'Sí' : 'No'}`);
console.log(`  message.PID existe: ${message.PID ? 'Sí' : 'No'}`);
console.log(`  message.OBX existe: ${message.OBX ? 'Sí' : 'No'}`);

console.log('\nAcceso a campos con tipado automático:');
console.log(`  Datos del paciente: ${JSON.stringify(message.PID)}`);
console.log(`  Nombre del paciente: ${message.PID?.[5]}`);
console.log(`  Sexo del paciente: ${message.PID?.[8]}`);
console.log(`  Tipo de mensaje: ${message.MSH?.[9]}`);

// El intellisense de TypeScript funciona correctamente
console.log('\nMétodos también funcionan:');
console.log(`  Segmento PID: ${message.PID?.getName()}`);
console.log(`  Total OBX: ${message.getAllSegments('OBX').length}`);

console.log('\n✨ Todo funciona con tipado completo sin conversiones!');
