'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#1e293b' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: 15, marginBottom: 20 },
  schoolInfo: { fontSize: 10, color: '#64748b' },
  schoolName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  docTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, textTransform: 'uppercase', color: '#334155' },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 5, marginBottom: 8, color: '#334155' },
  row: { flexDirection: 'row', marginBottom: 6 },
  col: { flex: 1 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  value: { fontSize: 11, color: '#0f172a', borderBottom: '1px dotted #cbd5e1', paddingBottom: 2 },
  text: { fontSize: 10, lineHeight: 1.6, textAlign: 'justify', marginBottom: 10, color: '#475569' },
  bold: { fontWeight: 'bold', color: '#0f172a' },
  signatureSection: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  signatureBox: { alignItems: 'center' },
  signatureLine: { borderTop: '1px solid #0f172a', width: 180, paddingTop: 5, textAlign: 'center', fontSize: 10, color: '#0f172a' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 10 }
});

const AuthDocument = ({ trip, participant }: any) => {
  const isFree = trip.costPerStudent === 0;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.schoolName}>CENTRO EDUCATIVO</Text>
            <Text style={styles.schoolInfo}>Departamento de Logística y Transporte</Text>
            <Text style={styles.schoolInfo}>Formulario Oficial de Permisos</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.schoolInfo}>Fecha Emisión: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.schoolInfo}>Ref: VIAJE-{trip.id}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>CARTA DE AUTORIZACIÓN Y CONSENTIMIENTO INFORMADO</Text>
        
        {/* Información del Estudiante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DATOS DEL ESTUDIANTE Y ACOMPAÑANTES</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nombre del Alumno(a):</Text>
              <Text style={styles.value}>{participant.firstName} {participant.lastName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Adultos Acompañantes Autorizados:</Text>
              <Text style={styles.value}>{participant.accompanyingAdults > 0 ? participant.accompanyingAdults : 'Ninguno (Viaja solo con personal del centro)'}</Text>
            </View>
          </View>
        </View>

        {/* Información de la Excursión */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DETALLES DE LA ACTIVIDAD</Text>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Actividad/Destino:</Text><Text style={styles.value}>{trip.name} - {trip.destination}</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Fecha Programada:</Text><Text style={styles.value}>{new Date(trip.date).toLocaleDateString()}</Text></View>
            <View style={styles.col}><Text style={styles.label}>Horario:</Text><Text style={styles.value}>{trip.departureTime} hasta {trip.returnTime}</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Costo por Alumno:</Text><Text style={styles.value}>{isFree ? 'GRATUITO (Cubierto por la institución)' : `$${trip.costPerStudent.toFixed(2)}`}</Text></View>
            <View style={styles.col}><Text style={styles.label}>Costo por Adulto Extra:</Text><Text style={styles.value}>{trip.costPerAdult === 0 ? 'N/A' : `$${trip.costPerAdult.toFixed(2)}`}</Text></View>
          </View>
        </View>

        {/* Términos y Declaraciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. DECLARACIONES LEGALES Y MÉDICAS</Text>
          <Text style={styles.text}>
            Por medio del presente documento, en mi calidad de padre, madre o tutor legal del menor arriba mencionado, <Text style={styles.bold}>OTORGO MI PLENO CONSENTIMIENTO</Text> para que participe en la excursión descrita. 
          </Text>
          <Text style={styles.text}>
            Entiendo y acepto que el viaje será supervisado en todo momento por el personal asignado del centro educativo. Asimismo, instruiré a mi representado(a) a seguir estrictamente las normas de comportamiento y seguridad establecidas por los maestros y guías.
          </Text>
          <Text style={styles.text}>
            En caso de <Text style={styles.bold}>emergencia médica</Text>, y si no fuera posible localizarme inmediatamente, autorizo a los representantes de la institución a tomar las medidas oportunas y necesarias para salvaguardar la salud e integridad física del estudiante, incluyendo el traslado a un centro médico si fuese requerido.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Firma del Padre / Madre / Tutor Legal</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>Nombre, firma y aclaración</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Firma Coordinación de Viajes</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>Sello Institucional</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Este documento es estrictamente confidencial y forma parte del expediente interno del alumno.
        </Text>
      </Page>
    </Document>
  );
};

export default function PDFDownloadButton({ trip, participant }: { trip: any, participant: any }) {
  return (
    <PDFDownloadLink 
      document={<AuthDocument trip={trip} participant={participant} />} 
      fileName={`Permiso_${participant.firstName}_${participant.lastName}.pdf`}
    >
      <Button variant="outline" size="sm" className="h-8 gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
        <Download className="h-3.5 w-3.5" /> Descargar Permiso Oficial
      </Button>
    </PDFDownloadLink>
  );
}
