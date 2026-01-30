import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { StatsData } from "@/app/services/auditoriaServices";

// Paleta de colores profesional
const COLORS = {
  primary: "#1E3A8A",    // Azul oscuro corporativo
  secondary: "#64748B",  // Gris azulado para subtítulos
  accent: "#F3F4F6",     // Gris muy claro para fondos
  border: "#E5E7EB",     // Gris suave para bordes
  text: "#1F2937",       // Gris oscuro para texto
  white: "#FFFFFF"
};

const styles = StyleSheet.create({
  page: { 
    flexDirection: "column", 
    backgroundColor: COLORS.white, 
    padding: 45, // Un poco más de margen para que respire
    fontFamily: "Helvetica"
  },
  
  // Encabezado
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: "heavy", // Helvetica bold
    textTransform: "uppercase",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  
  // Sección de Resumen
  summaryBox: {
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  summaryLabel: { fontSize: 12, color: COLORS.text },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },

  // Estructura de Secciones
  sectionTitle: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 8,
    color: COLORS.primary,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  
  // Layout de Columnas
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20, // Espacio entre columnas
  },
  halfWidth: {
    width: "48%",
  },
  fullWidth: {
    width: "100%",
    marginTop: 10,
  },

  // Estilos de Tablas
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 5,
    marginTop: 5,
  },
  tableHeaderText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowEven: {
    backgroundColor: "#F9FAFB", // Efecto cebra
  },
  colLabel: { width: "80%", fontSize: 10, color: COLORS.text },
  colValue: { width: "20%", fontSize: 10, textAlign: "right", fontWeight: "bold", color: COLORS.text },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10
  }
});

interface PDFReportProps {
  statsData: StatsData | null;
}

// Componente auxiliar para filas de tabla
const TableRow = ({ label, value, isEven }: { label: string; value: number | string; isEven: boolean }) => (
  <View style={[styles.tableRow, isEven ? styles.tableRowEven : {}]}>
    <Text style={styles.colLabel}>{label}</Text>
    <Text style={styles.colValue}>{value}</Text>
  </View>
);

// Componente auxiliar para encabezado de tabla pequeña
const TableHead = ({ title, col1 = "Concepto", col2 = "Cant." }: { title?: string, col1?: string, col2?: string }) => (
  <View>
    {title && <Text style={styles.sectionTitle}>{title}</Text>}
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, { width: "80%" }]}>{col1}</Text>
      <Text style={[styles.tableHeaderText, { width: "20%", textAlign: "right" }]}>{col2}</Text>
    </View>
  </View>
);

export const PDFReport = ({ statsData }: PDFReportProps) => {
  if (!statsData) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Cargando información...</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de informes de auditoria</Text>
          <Text style={styles.subtitle}>Sistema de seguimiento de compromisos</Text>
          <Text style={styles.subtitle}>Fecha de corte: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Resumen Destacado */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total de informes emitidos</Text>
          <Text style={styles.summaryValue}>{statsData.total_auditorias}</Text>
        </View>

        {/* GRUPO 1: Tablas pequeñas en 2 columnas */}
        <View style={styles.rowContainer}>
          
          {/* Columna Izquierda: Semestres */}
          <View style={styles.halfWidth}>
            <TableHead title="Histórico por periodo" col1="Año - Semestre" />
            {Object.entries(statsData.por_semestre).map(([semestre, count], i) => (
              <TableRow key={i} label={semestre || "Sin fecha"} value={count} isEven={i % 2 === 0} />
            ))}
          </View>

          {/* Columna Derecha: Estado */}
          <View style={styles.halfWidth}>
            <TableHead title="Estado de compromisos" col1="Estado actual" />
            {Object.entries(statsData.por_estado_mejora).map(([estado, count], i) => (
              <TableRow key={i} label={estado || "Sin definir"} value={count} isEven={i % 2 === 0} />
            ))}
          </View>

        </View>

        {/* GRUPO 2: Tablas de Ancho Completo (Para listas largas) */}
        
        {/* Auditores */}
        <View style={styles.fullWidth} wrap={false}> 
          {/* wrap={false} intenta mantener el título pegado a la tabla, pero permite saltos dentro si es necesario */}
          <TableHead title="Gestión por auditor" col1="Nombre del auditor" />
          {Object.entries(statsData.por_auditor).map(([auditor, count], i) => (
            <TableRow key={i} label={auditor || "Sin asignar"} value={count} isEven={i % 2 === 0} />
          ))}
        </View>

        {/* Departamentos (Puede ser muy larga, dejamos que fluya) */}
        <View style={styles.fullWidth}>
          <TableHead title="Distribución por departamento" col1="Área / Departamento" />
          {Object.entries(statsData.por_area).map(([area, count], i) => (
            <TableRow key={i} label={area || "General"} value={count} isEven={i % 2 === 0} />
          ))}
        </View>

        {/* Temas */}
        <View style={styles.fullWidth}>
          <TableHead title="Top temas auditados" col1="Tema / Título" />
          {Object.entries(statsData.por_tema).slice(0, 15).map(([tema, count], i) => (
            <TableRow key={i} label={tema} value={count} isEven={i % 2 === 0} />
          ))}
        </View>

        {/* Footer con número de página */}
        <Text 
          style={styles.footer} 
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} 
          fixed 
        />
        
      </Page>
    </Document>
  );
};