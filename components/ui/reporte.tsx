import React, { useMemo } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";

import { Area, Calificacion, Estudiante, Maestro } from "@/types";

// ==========================================
// CONFIGURACIÓN DE PÁGINA OFICIO Y MÉTRICAS
// ==========================================
const PAGE_CONFIG = {
  // Dimensiones de página OFICIO en puntos (1 inch = 72 points)
  HEIGHT: 936, // 13 inches * 72 (altura del oficio)
  WIDTH: 612, // 8.5 inches * 72 (ancho del oficio)
  MARGINS: {
    TOP: 10,    // Reducido para compensar márgenes de impresora
    BOTTOM: 10, // Reducido para compensar márgenes de impresora  
    LEFT: 15,   // Reducido para compensar márgenes de impresora
    RIGHT: 15,  // Reducido para compensar márgenes de impresora
  },
  // OPCIÓN ALTERNATIVA: Sin márgenes (descomenta si necesitas)
  // MARGINS: {
  //   TOP: 0,
  //   BOTTOM: 0, 
  //   LEFT: 0,
  //   RIGHT: 0,
  // },
  COMPONENT_HEIGHTS: {
    HEADER: 150, // Header con logo (más espacio por la altura extra)
    STUDENT_INFO: 0,
    SECTION_TITLE: 45, // Título "INFORME DE DESEMPEÑO"
    TABLE_HEADER: 35, // Header de la tabla de asignaturas
    AREA_ROW: 22, // Fila principal de cada área
    INDICATOR_BASE: 20, // Base para indicadores (header + padding)
    INDICATOR_ITEM: 20, // Altura por cada indicador individual
    NO_INDICATORS: 12, // Mensaje "sin indicadores"
    FOOTER: 25, // Footer con firma
    SAFETY_MARGIN: 30, // Margen de seguridad adicional
  },
};

// ==========================================
// CONSTANTES PARA EVALUACIÓN CUALITATIVA
// ==========================================
const GRADOS_CUALITATIVOS = ["PARVULOS", "PREJARDIN", "JARDIN", "TRANSICIÓN"];

const convertirNotaACualitativa = (nota: number): string => {
  if (nota >= 4.6) return "DS"; // Desempeño Superior
  if (nota >= 4.0) return "DA"; // Desempeño Alto
  if (nota >= 3.5) return "DB"; // Desempeño Básico
  if (nota >= 3.0) return "SP"; // Sigue en proceso

  return "SP"; // Para notas menores a 3.0
};

const obtenerNombreCalificacion = (calificacion: string): string => {
  switch (calificacion) {
    case "DS":
      return "Desempeño Superior";
    case "DA":
      return "Desempeño Alto";
    case "DB":
      return "Desempeño Básico";
    case "SP":
      return "Sigue en proceso";
    default:
      return "";
  }
};

const verificarSiEsCualitativo = (nombreGrado: string): boolean => {
  return GRADOS_CUALITATIVOS.includes(nombreGrado?.toUpperCase() || "");
};

// ==========================================
// FUNCIONES DE DISTRIBUCIÓN SIMPLIFICADAS
// ==========================================

// DISTRIBUCIÓN FORZADA ESPECÍFICA para máximo aprovechamiento
const distribuirAreasEnPaginas = (
  areas: AreaConPromedio[],
): Array<{
  areas: AreaConPromedio[];
  esPrimeraPagina: boolean;
}> => {
  if (!areas || areas.length === 0) {
    return [];
  }

  const areasValidas = areas.filter(
    (area) => area.area?.nombre && (area.promedio > 0 || area.indicadores.length > 0),
  );

  if (areasValidas.length === 0) {
    return [];
  }

  // Aplicar ordenamiento con prioridad
  const areasOrdenadas = ordenarAreasConPrioridad(areasValidas);
  
  console.log("🎯 Áreas ordenadas:", areasOrdenadas.map(a => `${a.area.nombre} (${a.indicadores.length} ind)`));

  // DISTRIBUCIÓN ESPECÍFICA OPTIMIZADA
  const totalAreas = areasOrdenadas.length;
  
  if (totalAreas <= 5) {
    // Pocas áreas: una sola página
    return [{
      areas: areasOrdenadas,
      esPrimeraPagina: true,
    }];
  } else if (totalAreas <= 9) {
    // 6-9 áreas: dos páginas balanceadas
    const puntoCorte = Math.ceil(totalAreas * 0.6); // 60% en primera página
    return [
      {
        areas: areasOrdenadas.slice(0, puntoCorte),
        esPrimeraPagina: true,
      },
      {
        areas: areasOrdenadas.slice(puntoCorte),
        esPrimeraPagina: false,
      },
    ];
  } else {
    // 10+ áreas: distribución en 3 páginas CONSERVADORA basada en evidencia real
    // Basado en el análisis: la página 1 solo puede con 6 áreas + header
    // Las otras páginas pueden con más contenido
    
    const primeraCorte = 6;  // CONSERVADOR: lo que realmente cabe en página 1
    const segundaCorte = 10; // Balancear el resto
    
    return [
      {
        areas: areasOrdenadas.slice(0, primeraCorte), // 6 áreas
        esPrimeraPagina: true,
      },
      {
        areas: areasOrdenadas.slice(primeraCorte, segundaCorte), // 4 áreas
        esPrimeraPagina: false,
      },
      {
        areas: areasOrdenadas.slice(segundaCorte), // Resto
        esPrimeraPagina: false,
      },
    ];
  }
};

// Función para ordenar áreas con prioridad (mantenemos solo esta)
const ordenarAreasConPrioridad = (
  areas: AreaConPromedio[],
): AreaConPromedio[] => {
  return areas.sort((a, b) => {
    const nombreA = a.area?.nombre?.toUpperCase() || "";
    const nombreB = b.area?.nombre?.toUpperCase() || "";

    // Definir prioridades (menor número = mayor prioridad)
    const getPrioridad = (nombre: string): number => {
      if (nombre.includes("LENGUAJE") || nombre.includes("LENGUA")) return 1;
      if (
        nombre.includes("MATEMATICAS") ||
        nombre.includes("MATEMÁTICAS") ||
        nombre.includes("MATEMATICA")
      )
        return 2;

      return 3; // Resto de áreas
    };

    const prioridadA = getPrioridad(nombreA);
    const prioridadB = getPrioridad(nombreB);

    // Si tienen diferentes prioridades, ordenar por prioridad
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }

    // Si tienen la misma prioridad, ordenar alfabéticamente
    return nombreA.localeCompare(nombreB);
  });
};

// ==========================================
// COMPONENTES REUTILIZABLES ACTUALIZADOS
// ==========================================

const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    <Image
      src={"/LOGO-WHITE.png"}
      style={{
        width: 80,  // Logo aún más pequeño
        height: 80, // Logo aún más pequeño
        position: "absolute",
        objectFit: "contain",
        left: 8,
      }}
    />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={[styles.header, { textAlign: "center" }]}>
          GIMNASIO PEDAGÓGICO VANCOUVER
        </Text>
        <Text style={[styles.subHeader, { textAlign: "center" }]}>
          {`"CONSTRUYENDO MENTES INNOVADORAS"`}
        </Text>
        <Text style={[styles.subHeader, { textAlign: "center" }]}>
          Resolución Oficial de Aprobación 0275 del 2016 y 0117del 2020
        </Text>
        <Text style={[styles.subHeader, { textAlign: "center" }]}>
          Secretaría de Educación Municipal
        </Text>
        <Text style={[styles.subHeader, { textAlign: "center" }]}>
          Nit: 1121 8314 97-2 Código Dane: 385001004718
        </Text>
      </View>
    </View>
  </View>
);

const StudentInfoComponent = ({
  estudiante,
  esCualitativo,
}: {
  estudiante: any;
  esCualitativo: boolean;
}) => (
  <View style={[styles.table]}>
    <View style={[styles.tableRow, styles.flex]}>
      <View style={{ flex: 4 }}>
        <Text style={styles.labelText}>Nombre y Apellidos del Estudiante</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>Periodo</Text>
      </View>
      {!esCualitativo && (
        <View style={{ flex: 1 }}>
          <Text style={styles.labelText}>Puesto</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>Grado</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.labelText}>Año</Text>
      </View>
    </View>

    <View style={[styles.tableRowLast, styles.flex]}>
      <View style={{ flex: 4 }}>
        <Text style={styles.valueText}>
          {safeValue(estudiante.nombre.toLowerCase())}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.valueText}>{safeValue(estudiante.periodo)}</Text>
      </View>
      {!esCualitativo && (
        <View style={{ flex: 1 }}>
          <Text style={styles.valueText}>{safeValue(estudiante.puesto)}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.valueText}>{safeValue(estudiante.grado)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.valueText}>{safeValue(estudiante.año)}</Text>
      </View>
    </View>
  </View>
);

const TableHeaderComponent = ({
  esCualitativo,
}: {
  esCualitativo: boolean;
}) => (
  <View style={styles.tableHeader}>
    <View style={styles.tableColHeader1}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 12 }]}>
        ASIGNATURA
      </Text>
    </View>
    <View style={styles.tableColHeader2}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 12 }]}>
        {esCualitativo ? "EVALUACIÓN" : "NOTA"}
      </Text>
    </View>
    <View style={styles.tableColHeader3}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 12 }]}>
        DESEMPEÑO
      </Text>
    </View>
    <View style={styles.tableColHeader4}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 12 }]}>
        FALLAS
      </Text>
    </View>
  </View>
);

const AreaRowComponent = ({
  areaData,
  isLast,
  esCualitativo,
}: {
  areaData: AreaConPromedio;
  isLast: boolean;
  esCualitativo: boolean;
}) => {
  const { area, promedio, indicadores } = areaData;

  // Formatear nota según el tipo de evaluación
  const notaFormateada = esCualitativo
    ? promedio > 0
      ? convertirNotaACualitativa(promedio)
      : "N/A"
    : promedio > 0
      ? promedio.toFixed(1)
      : "N/A";

  const desempeño = esCualitativo
    ? promedio > 0
      ? obtenerNombreCalificacion(convertirNotaACualitativa(promedio))
      : "N/A"
    : getDesempenoTexto(promedio);

  return (
    // ⭐ Área como bloque atómico
    <View style={{ width: "100%", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
      {/* Fila principal del área */}
      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
        <View style={styles.tableCol1}>
          <Text
            style={[styles.labelText, { fontSize: 12, fontWeight: "bold" }]}
          >
            {area.nombre.toUpperCase()}
          </Text>
        </View>
        <View style={styles.tableCol2}>
          <Text
            style={
              esCualitativo
                ? getCualitativoStyle(notaFormateada)
                : getDesempenoStyle(promedio)
            }
          >
            {notaFormateada}
          </Text>
        </View>
        <View style={styles.tableCol3}>
          <Text
            style={
              esCualitativo
                ? getCualitativoStyle(notaFormateada)
                : getDesempenoStyle(promedio)
            }
          >
            {desempeño}
          </Text>
        </View>
        <View style={styles.tableCol4}>
          <Text style={styles.valueText}>0</Text>
        </View>
      </View>

      {/* Indicadores - COMPACTOS */}
      {indicadores.length > 0 && (
        <View
          style={{
            backgroundColor: "#f8f9fa",
            width: "100%",
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderLeftWidth: 3,
            borderLeftColor: "#4472C4",
          }}
        >
          <Text style={[styles.indicadoresHeader, { marginBottom: 2 }]}>
            Indicadores de Logros ({indicadores.length}):
          </Text>
          <View style={{ paddingLeft: 6 }}>
            {indicadores.map((indicador, indIndex) => (
              <View
                key={`indicador-${indicador.id}`}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 1,
                }}
              >
                <Text style={[styles.indicadorBullet, { marginTop: 0 }]}>
                  {indIndex + 1}.
                </Text>
                <Text
                  style={[styles.indicadorItem, { flex: 1, marginLeft: 3 }]}
                >
                  {indicador.nombre}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mensaje cuando no hay indicadores */}
      {indicadores.length === 0 && (
        <View
          style={{
            backgroundColor: "#fafafa",
            width: "100%",
            paddingVertical: 8,
            paddingHorizontal: 14,
          }}
        >
          <Text style={styles.noIndicadores}>
            No hay indicadores registrados para esta área en el período
            actual.
          </Text>
        </View>
      )}
    </View>
  );
};

const FooterComponent = ({ director }: { director: Maestro }) => (
  <View style={styles.footer}>
    {/* Contenedor horizontal para las dos firmas */}
    <View style={styles.signaturesContainer}>
      {/* Firma izquierda - Director */}
      <View style={styles.signatureLeft}>
        <View style={styles.signatureLine} />
        <Text
          style={{
            color: "#000",
            marginBottom: 2,
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {director.nombre_completo}
        </Text>
        <Text style={{ color: "#666", marginBottom: 2, fontSize: 12 }}>
          Directora de curso
        </Text>
      </View>
    </View>
  </View>
);

// ==========================================
// COMPONENTE PRINCIPAL CORREGIDO
// ==========================================

export const ReporteEstudiantePDF = ({
  datos,
}: {
  datos: ReporteEstudianteProps;
}) => {
  const { estudiante, director, areas } = datos;

  // Verificar si es cualitativo basándose en el grado del estudiante
  const esCualitativo = useMemo(() => {
    return verificarSiEsCualitativo(estudiante.grado);
  }, [estudiante.grado]);

  // Simplemente ordenar las áreas, sin distribución manual
  const areasOrdenadas = useMemo(() => {
    if (!areas || areas.length === 0) {
      console.log("⚠️ No hay áreas disponibles para el PDF");
      return [];
    }

    const areasValidas = areas.filter(
      (area) =>
        area.area?.nombre && (area.promedio > 0 || area.indicadores.length > 0),
    );

    return ordenarAreasConPrioridad(areasValidas);
  }, [areas]);

  if (!datos) {
    return (
      <Document>
        <Page size={[PAGE_CONFIG.WIDTH, PAGE_CONFIG.HEIGHT]} style={styles.page}>
          <Text>No hay datos disponibles para generar el PDF</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {/* UNA SOLA PÁGINA CON FLUJO AUTOMÁTICO */}
      <Page size={[PAGE_CONFIG.WIDTH, PAGE_CONFIG.HEIGHT]} style={styles.page}>
        {esCualitativo && (
          <View style={styles.backgroundImageContainer}>
            <Image
              src="/backgroundCualitative.png"
              style={styles.backgroundImage}
            />
          </View>
        )}

        {/* Header SOLO en primera página (NO fixed) */}
        <HeaderComponent />
        
        {/* Info del estudiante SOLO en primera página (NO fixed) */}
        <StudentInfoComponent
          esCualitativo={esCualitativo}
          estudiante={estudiante}
        />
        
        <View>
          <Text style={styles.sectionHeader}>
            INFORME DE DESEMPEÑO ACADEMICO
          </Text>
        </View>
        
        {/* SOLO el header de tabla se repite (fixed) */}
        <View fixed>
          <TableHeaderComponent esCualitativo={esCualitativo} />
        </View>

        {/* Contenido que fluye automáticamente */}
        <View style={styles.contentWrapper}>
          {/* Todas las áreas en flujo natural */}
          {areasOrdenadas.length > 0 ? (
            areasOrdenadas.map((areaData, indiceArea) => {
              const isLast = indiceArea === areasOrdenadas.length - 1;

              return (
                <View key={`area-${areaData.area.id}`} wrap={false} style={styles.areaContainer}>
                  <AreaRowComponent
                    areaData={areaData}
                    esCualitativo={esCualitativo}
                    isLast={isLast}
                  />
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <View style={{ width: "100%", padding: 25 }}>
                <Text
                  style={[
                    styles.noIndicadores,
                    { fontSize: 12, color: "#666" },
                  ]}
                >
                  No hay calificaciones registradas para este período.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer SOLO en la última página (NO fixed) */}
        <FooterComponent director={director} />
      </Page>
    </Document>
  );
};

// ==========================================
// ESTILOS ACTUALIZADOS PARA OFICIO
// ==========================================
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_CONFIG.MARGINS.LEFT,
    paddingTop: PAGE_CONFIG.MARGINS.TOP,
    paddingBottom: PAGE_CONFIG.MARGINS.BOTTOM,
    fontSize: 12, // Fuente ligeramente más grande para aprovechar el espacio
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4e70be",
    padding: 8, // Padding aún más reducido para primera página
  },
  header: {
    fontWeight: "bold",
    fontSize: 12, // Fuente más pequeña
    maxWidth: 350,
    marginBottom: 2,
    color: "#fff",
    textAlign: "center",
  },
  backgroundImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.25,
  },
  subHeader: {
    fontSize: 10, // Fuente más pequeña
    fontWeight: "medium",
    textAlign: "center",
    color: "#fff",
  },
  contentWrapper: {
    flex: 1,
  },
  table: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#4472C415",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
    width: "100%",
  },
  tableColHeader1: {
    width: "40%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader2: {
    width: "20%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader3: {
    width: "20%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader4: {
    width: "20%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
  tableCol1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol2: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol3: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol4: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
    textAlign: "center",
    height: "100%",
  },
  labelText: {
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
  },
  valueText: {
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 2, // Padding ultra-compacto para primera página
  },
  superiorValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5715",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  altoValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  basicoValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  bajoValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#F0F0F0",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    textAlign: "center",
  },
  // Nuevos estilos para evaluación cualitativa
  dsValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5715",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  daValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  dbValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  spValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    color: "#9E9E9E",
    marginBottom: 30,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
    margin: "auto", // Centrar el contenedor completo
  },
  signatureLeft: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderColor: "#000",
    width: "80%",
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 11, // Más compacto
    fontWeight: "bold",
    color: "#4472C4",
    textAlign: "center",
    backgroundColor: "#4472C415",
    padding: 3, // Padding reducido
  },
  indicadoresHeader: {
    fontSize: 11, // Más legible que 10
    fontWeight: "bold",
    color: "#4472C4",
    marginBottom: 2,
    textAlign: "left",
  },
  indicadorItem: {
    fontSize: 10, // Más legible que 9, pero aún compacto
    color: "#333",
    marginBottom: 1,
    paddingLeft: 6,
    textAlign: "left",
    lineHeight: 1.3, // Ligeramente más espacio
  },
  indicadorBullet: {
    fontSize: 10, // Más legible
    color: "#4472C4",
    marginRight: 3,
  },
  noIndicadores: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 5,
  },
  signature: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    width: 220,
    margin: "auto",
    marginBottom: 12,
  },
  areaContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 0,
  },
});

// ==========================================
// TIPOS Y FUNCIONES DE UTILIDAD
// ==========================================

type Indicador = {
  id: string;
  nombre: string;
  periodo: number;
  area: Area;
};

type IndicadorSimple = {
  id: string;
  nombre: string;
  periodo: number;
};

type IndicadoresPorArea = {
  area_id: number;
  area_nombre: string;
  indicadores: IndicadorSimple[];
};

type IndicadoresData = {
  total: number;
  lista: Indicador[];
  porArea: IndicadoresPorArea[];
};

interface AreaConPromedio {
  area: Area;
  promedio: number;
  indicadores: IndicadorSimple[];
}

interface ReporteEstudianteProps {
  estudiante: {
    nombre: string;
    grado: string;
    periodo: string;
    año: string;
    puesto: number | null;
  };
  director: Maestro;
  areas: AreaConPromedio[];
  promedio: number;
}

const safeValue = (value: any, defaultValue: any = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

const getDesempenoStyle = (promedio: number) => {
  if (promedio >= 4.6) return styles.superiorValue;
  if (promedio >= 4.0) return styles.altoValue;
  if (promedio >= 3.0) return styles.basicoValue;

  return styles.bajoValue;
};

const getCualitativoStyle = (calificacion: string) => {
  switch (calificacion) {
    case "DS":
      return styles.dsValue;
    case "DA":
      return styles.daValue;
    case "DB":
      return styles.dbValue;
    case "SP":
      return styles.spValue;
    default:
      return styles.grayValue;
  }
};

const getDesempenoTexto = (promedio: number) => {
  if (promedio >= 4.5) return "Superior";
  if (promedio >= 4.0) return "Alto";
  if (promedio >= 3.0) return "Básico";

  return "Bajo";
};

// Mantener las funciones de procesamiento existentes...
export const procesarDatosEstudiante = (
  calificacionesArray: Calificacion[],
  estudiante: Estudiante,
  periodo: number = 1,
  puesto: number | null,
  indicadoresData: IndicadoresData | null,
) => {
  // ✅ Validar estudiante
  if (!estudiante) {
    console.error("Estudiante no definido");

    return null;
  }

  // ✅ Preparar datos del estudiante (siempre disponibles) - SIN PUESTO
  const datosEstudiante = {
    id: estudiante.id,
    nombre: estudiante.nombre_completo || "Sin nombre",
    documento: `${estudiante.tipo_documento || "N/A"}: ${estudiante.numero_identificacion || "N/A"}`,
    grado: estudiante.grado?.nombre || "Sin grado",
    periodo: periodo,
    puesto: puesto,
    año: new Date().getFullYear().toString(),
    celular_padres: estudiante.celular_padres || "N/A",
    pension_activa: estudiante.pension_activa || false,
  };

  // ✅ Procesar calificaciones sin duplicidad
  let areas: AreaConPromedio[] = [];
  let promedioGeneral = 0;

  if (
    calificacionesArray &&
    Array.isArray(calificacionesArray) &&
    calificacionesArray.length > 0
  ) {
    // ✅ RESOLVER DUPLICIDAD: Agrupar calificaciones por area_id (optimizado)
    const areaMap = new Map<
      string,
      {
        area: any;
        calificaciones: Calificacion[];
        sumaNotas: number;
        cantidadNotas: number;
      }
    >();

    // Agrupar todas las calificaciones por área con una sola iteración optimizada
    for (const calificacion of calificacionesArray) {
      const areaId = calificacion.area?.id?.toString();

      if (!areaId) continue;

      let areaData = areaMap.get(areaId);

      if (!areaData) {
        areaData = {
          area: calificacion.area,
          calificaciones: [],
          sumaNotas: 0,
          cantidadNotas: 0,
        };
        areaMap.set(areaId, areaData);
      }

      areaData.calificaciones.push(calificacion);

      // Sumar notas para promedio (optimizado)
      const nota = calificacion.notaFinal;

      if (nota && nota > 0) {
        areaData.sumaNotas += nota;
        areaData.cantidadNotas++;
      }
    }

    // ✅ Convertir el Map a array de áreas procesadas
    areas = Array.from(areaMap.values()).map((areaData) => {
      const { area, sumaNotas, cantidadNotas } = areaData;

      // Calcular promedio del área
      const promedioArea = cantidadNotas > 0 ? sumaNotas / cantidadNotas : 0;

      // ✅ Buscar indicadores para esta área usando porArea (optimizado)
      let indicadoresArea: IndicadorSimple[] = [];

      if (indicadoresData?.porArea) {
        const areaId = area.id?.toString();
        const areaIndicadores = indicadoresData.porArea.find(
          (porArea) => porArea.area_id.toString() === areaId,
        );

        if (areaIndicadores?.indicadores) {
          // Filtrar por período de forma más eficiente
          indicadoresArea = areaIndicadores.indicadores.filter(
            (indicador) => indicador.periodo === periodo,
          );
        }
      }

      return {
        area,
        promedio: promedioArea,
        indicadores: indicadoresArea,
      };
    });

    // Calcular promedio general de todas las áreas
    if (areas.length > 0) {
      promedioGeneral =
        areas.reduce((sum, area) => sum + area.promedio, 0) / areas.length;
    }
  } else {
    console.log(
      "No hay calificaciones disponibles, generando reporte solo con datos del estudiante",
    );
  }

  const resultado = {
    estudiante: datosEstudiante,
    areas,
    promedioGeneral,
  };

  return resultado;
};

// ✅ Función actualizada para generar el PDF con estructura GraphQL - SIN PUESTO
export const handleGenerateEstudiantePDF = async (
  infoEstudiante: Estudiante,
  calificaciones: Calificacion[],
  director: Maestro | null,
  periodo: number = 1,
  puesto: number | null,
  indicadoresData: IndicadoresData | null,
): Promise<void> => {
  try {
    if (!infoEstudiante) {
      alert("No se encontró información del estudiante");

      return;
    }

    const datosReporte = procesarDatosEstudiante(
      calificaciones,
      infoEstudiante,
      periodo,
      puesto,
      indicadoresData,
    );

    if (!datosReporte) {
      alert("Error al procesar los datos del estudiante");

      return;
    }

    // ✅ Crear director completo
    const directorData: Maestro = director || {
      id: 10101,
      nombre_completo: "Director no asignado",
      email: "sin-email@ejemplo.com",
      celular: "Sin teléfono",
      tipo_documento: "CC",
      numero_identificacion: "00000000",
    };

    // ✅ Crear el objeto completo que cumple con ReporteEstudianteProps - SIN PUESTO
    const datosCompletos: ReporteEstudianteProps = {
      estudiante: {
        nombre: datosReporte.estudiante.nombre,
        grado: datosReporte.estudiante.grado,
        periodo: String(datosReporte.estudiante.periodo),
        año: datosReporte.estudiante.año,
        puesto: puesto,
      },
      director: directorData,
      areas: datosReporte.areas,
      promedio: datosReporte.promedioGeneral,
    };

    const blob = await pdf(
      <ReporteEstudiantePDF datos={datosCompletos} />,
    ).toBlob();

    // ✅ Crear el nombre del archivo
    const nombreEstudiante =
      infoEstudiante.nombre_completo?.replace(/\s+/g, "_") || "estudiante";
    const nombreArchivo = `boletin_${nombreEstudiante}_periodo_${periodo}_${new Date().toISOString().slice(0, 10)}.pdf`;

    // ✅ Abrir el PDF en una nueva ventana
    const url = URL.createObjectURL(blob);
    const pdfWindow = window.open(url, "_blank");

    if (!pdfWindow) {
      // Si no se puede abrir, descargar directamente
      const link = document.createElement("a");

      link.href = url;
      link.download = nombreArchivo;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (error: any) {
    const message =
      error.message ||
      "Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.";

    alert(message);
    console.error("❌ Error al generar el reporte:", error);
  }
};

export default ReporteEstudiantePDF;