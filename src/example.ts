import { HL7Message } from '../src';

// Ejemplo de mensaje HL7
const sampleHL7 = `MSH|^~\\&|SYSTEM|HOSPITAL|LAB|HOSPITAL|20240101120000||ADT^A01|12345|P|2.4
PID|1||123456789^^^HOSPITAL^MR||DOE^JOHN^MIDDLE||19800101|M|||123 MAIN ST^^ANYTOWN^ST^12345^USA||(555)123-4567|||S||987654321|||U
PV1|1|I|ICU^101^1|||ATTENDING^DOCTOR^A|||SUR||||19|VIP|ATTENDING^DOCTOR^A`;

// Crear instancia del mensaje HL7 - ¡Ya no necesita conversión!
const message = new HL7Message(sampleHL7);

console.log('=== Ejemplo de uso de la librería HL7 ===\n');

// Ejemplos de uso del método get()
console.log('1. Obtener el nombre del paciente (PID-5):');
console.log('   Nombre completo:', message.get('PID-5'));
console.log('   Apellido:', message.get('PID-5.1'));
console.log('   Nombre:', message.get('PID-5.2'));
console.log('   Segundo nombre:', message.get('PID-5.3'));

console.log('\n2. Obtener información del mensaje (MSH):');
console.log('   Aplicación emisora:', message.get('MSH-3'));
console.log('   Fecha/hora del mensaje:', message.get('MSH-7'));
console.log('   Tipo de mensaje:', message.get('MSH-9'));
console.log('   ID del mensaje:', message.get('MSH-10'));

console.log('\n3. Obtener información demográfica (PID):');
console.log('   ID del paciente:', message.get('PID-3'));
console.log('   Fecha de nacimiento:', message.get('PID-7'));
console.log('   Sexo:', message.get('PID-8'));
console.log('   Dirección completa:', message.get('PID-11'));
console.log('   Calle:', message.get('PID-11.1'));
console.log('   Ciudad:', message.get('PID-11.3'));
console.log('   Estado:', message.get('PID-11.4'));
console.log('   Código postal:', message.get('PID-11.5'));

// NUEVA FUNCIONALIDAD: Acceso con operador []
console.log('\n=== NUEVA FUNCIONALIDAD: Acceso con operador [] ===');

console.log('\n4. Acceso directo a segmentos y campos con []:');
console.log('   Nombre del segmento PID:', message.PID?.getName());
console.log('   Campo 5 del PID (nombre completo):', message.PID?.[5]?.toString());
console.log('   Campo 7 del PID (fecha nacimiento):', message.PID?.[7]?.toString());
console.log('   Campo 8 del PID (sexo):', message.PID?.[8]?.toString());

console.log('\n   Información del mensaje MSH:');
console.log('   Campo 3 (aplicación emisora):', message.MSH?.[3]?.toString());
console.log('   Campo 7 (fecha/hora):', message.MSH?.[7]?.toString());
console.log('   Campo 9 (tipo mensaje):', message.MSH?.[9]?.toString());

console.log('\n   Información de visita PV1:');
console.log('   Campo 2 (clase paciente):', message.PV1?.[2]?.toString());
console.log('   Campo 3 (ubicación):', message.PV1?.[3]?.toString());

// Ejemplo de uso del método getAllSegments()
console.log('\n5. Obtener todos los segmentos PID:');
const pidSegments = message.getAllSegments('PID');
console.log(`   Número de segmentos PID encontrados: ${pidSegments.length}`);

console.log('\n6. Obtener todos los segmentos del mensaje:');
const allSegments = message.getSegments();
allSegments.forEach((segment, index) => {
    console.log(`   Segmento ${index + 1}: ${segment.getName()}`);
});

// === NUEVA FUNCIONALIDAD: Modificación y creación de campos ===
console.log('\n=== Modificación y creación de campos ===');

// Modificar campo completo usando []
if (message.PID) {
    message.PID[5] = 'SMITH^JANE^A';
    console.log('   Campo 5 del PID modificado:', message.PID[5]?.toString());
}

// Modificar componente usando [] - Sin optional chaining en campos anidados
if (message.PID && message.PID[5]) {
    message.PID[5][2] = 'ALICE';
    console.log('   Componente 2 del campo 5 (nombre) modificado:', message.PID[5][2]?.toString());
}

// Modificar subcomponente usando [] - Sin optional chaining en campos anidados
if (message.PID && message.PID[5] && message.PID[5][2]) {
    message.PID[5][2][1] = 'ALICE-SUB';
    console.log('   Subcomponente 1 del componente 2 del campo 5 modificado:', message.PID[5][2][1]?.toString());
}

// Crear campo si no existe usando []
if (message.PID) {
    message.PID[20] = 'NEWFIELD';
    console.log('   Campo 20 del PID creado:', message.PID[20]?.toString());
}

// Usar set para modificar campo, componente y subcomponente
message.set('PID-6', 'NEWFIELD6');
console.log('   Campo 6 del PID modificado con set:', message.PID?.[6]?.toString());
message.set('PID-6.1', 'COMPONENT1');
console.log('   Componente 1 del campo 6 modificado con set:', message.PID?.[6][1]?.toString());
message.set('PID-6.1.2', 'SUBCOMP2');
console.log('   Subcomponente 2 del componente 1 del campo 6 modificado con set:', message.PID?.[6][1][2]?.toString());

console.log('\n=== Fin del ejemplo ===');
