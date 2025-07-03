import React from "react";
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

// Estilos para el PDF con un diseño elegante tipo tabla
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: "#FFF",
    fontSize: 12,
  },
  header: {
    fontWeight: "bold",
    fontSize: 13,
    maxWidth: 300,
    marginBottom: 2,
    color: "#fff",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 10,
    fontWeight: "medium",
    textAlign: "center",
    color: "#fff",
  },
  comprobante: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "semibold",
    color: "#fff",
    textAlign: "center",
  },
  period: {
    textAlign: "center",
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  // Table styles
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

  // Estilos para cada columna con proporciones específicas
  tableColHeader1: {
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader2: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader3: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader4: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    fontWeight: "bold",
  },

  // Estilos para las filas de datos
  tableCol1: {
    width: "40%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol2: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol3: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    textAlign: "center",
  },
  tableCol4: {
    width: "20%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    height: "100%",
  },

  // Text styles
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
    padding: 4,
  },

  // Value styles with color para calificaciones
  superiorValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5715",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  altoValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  basicoValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  bajoValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#F0F0F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#9E9E9E",
  },

  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4472C4",
    marginBottom: 15,
    textAlign: "center",
    backgroundColor: "#4472C415",
    padding: 8,
  },

  // ✅ NUEVOS ESTILOS PARA INDICADORES
  indicadoresSection: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  indicadoresHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4472C4",
    marginBottom: 4,
    textAlign: "left",
  },
  indicadorItem: {
    fontSize: 10,
    color: "#333",
    marginBottom: 2,
    paddingLeft: 8,
    textAlign: "left",
  },
  indicadorBullet: {
    fontSize: 10,
    color: "#4472C4",
    marginRight: 4,
  },
  noIndicadores: {
    fontSize: 8,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 4,
  },

  // Actividades table styles
  activityTable: {
    display: "flex",
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginBottom: 10,
  },
  activityHeader: {
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  activityCol1: {
    width: "50%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 8,
    textAlign: "center",
  },
  activityCol2: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 8,
    textAlign: "center",
  },
  activityCol3: {
    width: "25%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    textAlign: "center",
  },
  signature: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    width: 200,
    margin: "auto",
    marginBottom: 10,
  },
});

// ✅ Interface actualizada para incluir indicadores simples
interface AreaConPromedio {
  area: Area;
  promedio: number;
  indicadores: IndicadorSimple[]; // Cambio a IndicadorSimple
}

// Interfaz para los datos del reporte por área
interface ReporteEstudianteProps {
  estudiante: {
    nombre: string;
    grado: string;
    periodo: string;
    año: string;
    puesto: string;
  };
  director: Maestro;
  areas: AreaConPromedio[];
  promedio: number;
}

// Función para manejar valores undefined/null
const safeValue = (value: any, defaultValue: any = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

const getDesempenoStyle = (promedio: number) => {
  // Determinar el desempeño basado en el promedio numérico
  let desempeño: string;

  if (promedio >= 4.6) {
    desempeño = "Superior";
  } else if (promedio >= 4.0) {
    desempeño = "Alto";
  } else if (promedio >= 3.0) {
    desempeño = "Básico";
  } else {
    desempeño = "Bajo";
  }

  // Retornar el estilo basado en el desempeño
  switch (desempeño) {
    case "Superior":
      return styles.superiorValue;
    case "Alto":
      return styles.altoValue;
    case "Básico":
      return styles.basicoValue;
    case "Bajo":
      return styles.bajoValue;
    default:
      return styles.grayValue;
  }
};

export const ReporteEstudiantePDF = ({
  datos,
}: {
  datos: ReporteEstudianteProps;
}) => {
  const { estudiante, director, areas } = datos;

  if (!datos) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No hay datos disponibles para generar el PDF</Text>
        </Page>
      </Document>
    );
  }

  const getDesempenoTexto = (promedio: number) => {
    if (promedio >= 4.5) return "Superior";
    if (promedio >= 4.0) return "Alto";
    if (promedio >= 3.0) return "Básico";

    return "Bajo";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#4e70be",
            padding: 15,
          }}
        >
          <Image
            src={"/LOGO-WHITE.png"}
            style={{
              width: 100,
              height: 100,
              position: "absolute",
              objectFit: "contain",
            }}
          />
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
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

        {/* Datos del estudiante */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.flex]}>
            <View style={{ flex: 3 }}>
              <Text style={styles.labelText}>
                Nombre y Apellidos del Estudiante
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText}>Periodo</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText}>Puesto</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText}>Grado</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelText}>Año</Text>
            </View>
          </View>

          <View style={[styles.tableRowLast, styles.flex]}>
            <View style={{ flex: 3 }}>
              <Text style={styles.valueText}>
                {safeValue(estudiante.nombre.toLowerCase())}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.valueText}>
                {safeValue(estudiante.periodo)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.valueText}>
                {safeValue(estudiante.puesto)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.valueText}>
                {safeValue(estudiante.grado)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.valueText}>{safeValue(estudiante.año)}</Text>
            </View>
          </View>
        </View>

        <View>
          {/* Titulo del informe */}
          <Text
            style={{
              ...styles.sectionHeader,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 0,
            }}
          >
            INFORME DE DESEMPEÑO ACADEMICO
          </Text>
        </View>

        {/* Tabla de Asignaturas */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColHeader1}>
              <Text
                style={[styles.labelText, { color: "#4472C4", fontSize: 10 }]}
              >
                ASIGNATURA
              </Text>
            </View>
            <View style={styles.tableColHeader2}>
              <Text
                style={[styles.labelText, { color: "#4472C4", fontSize: 10 }]}
              >
                NOTA
              </Text>
            </View>
            <View style={styles.tableColHeader3}>
              <Text
                style={[styles.labelText, { color: "#4472C4", fontSize: 10 }]}
              >
                DESEMPEÑO
              </Text>
            </View>
            <View style={styles.tableColHeader4}>
              <Text
                style={[styles.labelText, { color: "#4472C4", fontSize: 10 }]}
              >
                FALLAS
              </Text>
            </View>
          </View>

          {/* ✅ Mapear todas las áreas con indicadores */}
          {areas.map((areaData: AreaConPromedio, index) => {
            const { area, promedio, indicadores } = areaData;
            const desempeño = getDesempenoTexto(promedio);
            const isLast = index === areas.length - 1;

            return (
              <View key={`area-${area.id}`}>
                {/* Fila de la asignatura */}
                <View
                  style={[
                    isLast && indicadores.length === 0
                      ? styles.tableRowLast
                      : styles.tableRow,
                    styles.flex,
                  ]}
                >
                  <View style={{ flex: 2 }}>
                    <Text style={styles.labelText}>
                      {area.nombre.toLowerCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={getDesempenoStyle(promedio)}>
                      {promedio.toFixed(1)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={getDesempenoStyle(promedio)}>{desempeño}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.valueText}>0</Text>
                  </View>
                </View>

                {/* ✅ NUEVA SECCIÓN: Indicadores del área */}
                {indicadores.length > 0 && (
                  <View
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: "#f8f9fa",
                        borderBottomWidth: isLast ? 0 : 1,
                      },
                    ]}
                  >
                    <View style={{ width: "100%", padding: 8 }}>
                      <Text style={styles.indicadoresHeader}>
                        Indicadores de Logros ({indicadores.length}):
                      </Text>
                      {indicadores.map((indicador, indIndex) => (
                        <View
                          key={`indicador-${indicador.id}`}
                          style={{ flexDirection: "row", marginBottom: 2 }}
                        >
                          <Text style={styles.indicadorBullet}>•</Text>
                          <Text style={styles.indicadorItem}>
                            {indicador.nombre}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Agregar borde final si es la última área y no tiene indicadores */}
                {isLast && indicadores.length === 0 && (
                  <View style={{ borderBottomWidth: 0 }} />
                )}
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text
              style={{
                color: "#000",
                marginBottom: 5,
              }}
            >
              {director.nombre_completo}
            </Text>
          </View>
          <Text>
            Reporte generado el{" "}
            {new Date().toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ✅ Función actualizada para procesar datos con estructura GraphQL
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

  // ✅ Preparar datos del estudiante (siempre disponibles)
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
    // ✅ RESOLVER DUPLICIDAD: Agrupar calificaciones por area_id
    const areaMap = new Map<
      string,
      {
        area: any;
        calificaciones: Calificacion[];
        sumaNotas: number;
        cantidadNotas: number;
      }
    >();

    // Agrupar todas las calificaciones por área
    calificacionesArray.forEach((calificacion) => {
      const areaId = calificacion.area?.id?.toString();

      if (!areaId) return;

      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, {
          area: calificacion.area,
          calificaciones: [],
          sumaNotas: 0,
          cantidadNotas: 0,
        });
      }

      const areaData = areaMap.get(areaId)!;

      areaData.calificaciones.push(calificacion);

      // Sumar notas para promedio
      if (calificacion.notaFinal && calificacion.notaFinal > 0) {
        areaData.sumaNotas += calificacion.notaFinal;
        areaData.cantidadNotas++;
      }
    });

    // ✅ Convertir el Map a array de áreas procesadas
    areas = Array.from(areaMap.values()).map((areaData) => {
      const { area, sumaNotas, cantidadNotas } = areaData;

      // Calcular promedio del área
      const promedioArea = cantidadNotas > 0 ? sumaNotas / cantidadNotas : 0;

      // ✅ Buscar indicadores para esta área usando porArea
      let indicadoresArea: IndicadorSimple[] = [];

      if (indicadoresData && indicadoresData.porArea) {
        const areaIndicadores = indicadoresData.porArea.find(
          (porArea) => porArea.area_id.toString() === area.id?.toString(),
        );

        if (areaIndicadores) {
          // Filtrar por período si es necesario
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

  console.log("📊 Datos procesados:", {
    totalAreas: areas.length,
    areasConIndicadores: areas.filter((a) => a.indicadores.length > 0).length,
    totalIndicadores: areas.reduce((sum, a) => sum + a.indicadores.length, 0),
    indicadoresDataRecibida: indicadoresData?.total || 0,
  });

  return resultado;
};

// ✅ Función actualizada para generar el PDF con estructura GraphQL
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

    console.log("🚀 Generando PDF con:", {
      estudiante: infoEstudiante.nombre_completo,
      calificaciones: calificaciones.length,
      indicadores: indicadoresData?.total || 0,
      periodo,
    });

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

    // ✅ Crear el objeto completo que cumple con ReporteEstudianteProps
    const datosCompletos: ReporteEstudianteProps = {
      estudiante: {
        nombre: datosReporte.estudiante.nombre,
        grado: datosReporte.estudiante.grado,
        periodo: String(datosReporte.estudiante.periodo),
        puesto: String(datosReporte.estudiante.puesto),
        año: datosReporte.estudiante.año,
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

    console.log("✅ PDF generado exitosamente");
  } catch (error: any) {
    const message =
      error.message ||
      "Ocurrió un error al generar el PDF. Por favor, inténtelo de nuevo.";

    alert(message);
    console.error("❌ Error al generar el reporte:", error);
  }
};

export default ReporteEstudiantePDF;
