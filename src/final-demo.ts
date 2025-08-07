import { HL7Message } from '../src';

// Mensaje HL7 con componentes y subcomponentes complejos
const sampleHL7 = `MSH|^~\\&|SYSTEM|HOSPITAL|LAB|HOSPITAL|20240101120000||ADT^A01|12345|P|2.4
PID|1||123456789^^^HOSPITAL^MR||DOE^JOHN^MIDDLE^Jr.^Dr.||19800101|M|||123 MAIN ST^APT 2B^ANYTOWN^ST^12345^USA
PV1|1|I|ICU^101^1^WEST&WING|||ATTENDING^DOCTOR^A|||SUR||||19|VIP|ATTENDING^DOCTOR^A
OBX|1|TX|BP^Blood Pressure||120&80^mmHg^Normal&Range`;

const message = new HL7Message(sampleHL7);

console.log('=== Comparación: Path Notation vs Bracket Notation ===\n');

// 1. Acceso a campos completos
console.log('1. Campos completos:');
console.log(`   get('PID-5'):     "${message.get('PID-5')}"`);
console.log(`   PID[5]:           "${message.PID?.[5]}"`);

// 2. Acceso a componentes
console.log('\n2. Componentes individuales:');
console.log(`   get('PID-5.1'):   "${message.get('PID-5.1')}"`);
console.log(`   PID[5][0]:        "${message.PID?.[5]?.[0]}"`);
console.log(`   get('PID-5.2'):   "${message.get('PID-5.2')}"`);
console.log(`   PID[5][1]:        "${message.PID?.[5]?.[1]}"`);

// 3. NUEVO: Acceso a subcomponentes con path notation
console.log('\n3. Subcomponentes (NUEVO en path notation):');
console.log(`   get('PV1-3.4.1'): "${message.get('PV1-3.4.1')}"`);
console.log(`   PV1[3][3][0]:     "${message.PV1?.[3]?.[3]?.[0]}"`);
console.log(`   get('PV1-3.4.2'): "${message.get('PV1-3.4.2')}"`);
console.log(`   PV1[3][3][1]:     "${message.PV1?.[3]?.[3]?.[1]}"`);

console.log('\n   Valores de presión arterial:');
console.log(`   get('OBX-5.1.1'): "${message.get('OBX-5.1.1')}" (sistólica)`);
console.log(`   OBX[5][0][0]:     "${message.OBX?.[5]?.[0]?.[0]}" (sistólica)`);
console.log(`   get('OBX-5.1.2'): "${message.get('OBX-5.1.2')}" (diastólica)`);
console.log(`   OBX[5][0][1]:     "${message.OBX?.[5]?.[0]?.[1]}" (diastólica)`);

// 4. Ejemplos prácticos de uso
console.log('\n4. Ejemplos prácticos:');

// Información del paciente
const apellido = message.get('PID-5.1');
const nombre = message.get('PID-5.2');
const sufijo = message.get('PID-5.4');

console.log(`   Nombre completo: ${apellido}, ${nombre} ${sufijo}`);

// Dirección completa
const calle = message.get('PID-11.1');
const apto = message.get('PID-11.2');
const ciudad = message.get('PID-11.3');
const estado = message.get('PID-11.4');
const zip = message.get('PID-11.5');

console.log(`   Dirección: ${calle} ${apto}, ${ciudad}, ${estado} ${zip}`);

// Valores vitales
const sistolica = message.get('OBX-5.1.1');
const diastolica = message.get('OBX-5.1.2');
const unidad = message.get('OBX-5.2');

console.log(`   Presión arterial: ${sistolica}/${diastolica} ${unidad}`);

// Ubicación del paciente
const ubicacion = message.get('PV1-3.1');
const habitacion = message.get('PV1-3.2');
const edificio = message.get('PV1-3.4.1');
const ala = message.get('PV1-3.4.2');

console.log(`   Ubicación: ${ubicacion} ${habitacion}, Edificio ${edificio}, Ala ${ala}`);

console.log('\n=== ¡Ambas formas son equivalentes y totalmente funcionales! ===');
