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
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
    textTransform: "capitalize",
  },
  valueText: {
    fontSize: 12,
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
  },
  altoValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center", // <-- text-center
  },
  basicoValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center", // <-- text-center
  },
  bajoValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center", // <-- text-center
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#F0F0F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 12,
    textAlign: "center", // <-- text-center
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
    textAlign: "center", // <-- text-center
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

// Interfaz para los datos del reporte por área
interface ReporteEstudianteProps {
  estudiante: {
    nombre: string;
    grado: string;
    periodo: string;
    año: string;
  };
  director: Maestro;
  promedioGeneral: number;
  areas: Area[];
  promedio: number;
}

// Función para manejar valores undefined/null
const safeValue = (value: any, defaultValue: any = "") => {
  return value !== undefined && value !== null ? value : defaultValue;
};

// Función para obtener el estilo según el desempeño
const getDesempenoStyle = (desempeño: string) => {
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
  const { estudiante, director, areas, promedioGeneral } = datos;

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
            padding: 10,
          }}
        >
          <Image
            source={"/LOGO.png"}
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

          {/* Mapear todas las áreas */}
          {areas.map(
            (
              areaData: {
                area: Area;
                promedio: number;
              },
              index,
            ) => {
              const { area, promedio } = areaData;
              const desempeño = getDesempenoTexto(promedio);
              const isLast = index === areas.length - 1;

              return (
                <View
                  key={area.id}
                  style={[
                    isLast ? styles.tableRowLast : styles.tableRow,
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
                    <Text style={styles.valueText} />
                  </View>
                </View>
              );
            },
          )}
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

export const procesarDatosEstudiante = (
  calificacionesArray: Calificacion[],
  estudiante: Estudiante,
  periodo: number = 1,
) => {
  console.log("Array de calificaciones recibido:", calificacionesArray);
  console.log("Estudiante recibido:", estudiante);

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
    año: new Date().getFullYear().toString(),
    celular_padres: estudiante.celular_padres || "N/A",
    pension_activa: estudiante.pension_activa || false,
  };

  // ✅ Procesar calificaciones (puede estar vacío)
  let areas: Area[] = [];
  let promedioGeneral = 0;

  if (
    calificacionesArray &&
    Array.isArray(calificacionesArray) &&
    calificacionesArray.length > 0
  ) {
    // Procesar todas las áreas con sus calificaciones
    areas = calificacionesArray.map((calificacion) => {
      const actividades =
        calificacion.notas?.map((nota: any) => ({
          nombre: nota.nombre || "Sin nombre",
          nota: nota.valor || 0,
          porcentaje: nota.porcentaje || 0,
        })) || [];

      // Calcular la nota final del área
      let notaFinal = 0;

      if (actividades.length > 0) {
        notaFinal = actividades.reduce(
          (sum: number, act: any) => sum + (act.nota * act.porcentaje) / 100,
          0,
        );
      } else {
        // Si no hay actividades, usar la nota final directa
        notaFinal = calificacion.notaFinal || 0;
      }

      return {
        area: calificacion.area || { id: "unknown", nombre: "Área sin nombre" },
        actividades,
        promedio: notaFinal,
        notaFinalOriginal: calificacion.notaFinal || 0,
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

  console.log("Resultado final procesado:", resultado);

  return resultado;
};

// ✅ Función actualizada para generar el PDF
export const handleGenerateEstudiantePDF = async (
  infoEstudiante: Estudiante,
  calificaciones: Calificacion[],
  director: Maestro | null,
  periodo: number = 1,
): Promise<void> => {
  try {
    console.log("Datos recibidos:");
    console.log("- Estudiante:", infoEstudiante);
    console.log("- Calificaciones:", calificaciones);
    console.log("- Director:", director);
    console.log("- Período:", periodo);

    // ✅ Validar que al menos tengamos estudiante
    if (!infoEstudiante) {
      alert("No se encontró información del estudiante");

      return;
    }

    // ✅ Procesar los datos (funciona con o sin calificaciones)
    const datosReporte = procesarDatosEstudiante(
      calificaciones,
      infoEstudiante,
      periodo,
    );

    if (!datosReporte) {
      alert("Error al procesar los datos del estudiante");

      return;
    }

    // ✅ Validar director (opcional, usar datos por defecto si no existe)
    const directorData = director || {
      id: "default",
      nombre_completo: "Director no asignado",
      email: "sin-email@ejemplo.com",
    };

    // ✅ Generar el PDF
    const blob = await pdf(
      <ReporteEstudiantePDF
        datos={{ ...datosReporte, director: directorData }}
      />,
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
    console.error("Error al generar el reporte:", error);
  }
};

export default ReporteEstudiantePDF;
