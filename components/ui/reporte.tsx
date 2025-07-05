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
// CONFIGURACIÓN DE PÁGINA Y MÉTRICAS
// ==========================================
const PAGE_CONFIG = {
  // Dimensiones de página A4 en puntos (1 inch = 72 points)
  HEIGHT: 842, // 11.7 inches * 72
  WIDTH: 595, // 8.3 inches * 72
  MARGINS: {
    TOP: 20,
    BOTTOM: 0, // Espacio para footer
    LEFT: 30,
    RIGHT: 30,
  },
  // Alturas estimadas de componentes (ajustadas más conservadoras)
  COMPONENT_HEIGHTS: {
    HEADER: 140, // Header con logo (aumentado)
    STUDENT_INFO: 0, // Tabla de información del estudiante
    SECTION_TITLE: 40, // Título "INFORME DE DESEMPEÑO"
    TABLE_HEADER: 30, // Header de la tabla de asignaturas
    AREA_ROW: 20, // Fila principal de cada área
    INDICATOR_BASE: 15, // Base para indicadores (header + padding)
    INDICATOR_ITEM: 15, // Altura por cada indicador individual (aumentado)
    NO_INDICATORS: 10, // Mensaje "sin indicadores"
    FOOTER: 20, // Footer con firma
    SAFETY_MARGIN: 27, // Margen de seguridad adicional
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
// FUNCIONES DE CÁLCULO DE ALTURA MEJORADAS
// ==========================================

/**
 * Calcula la altura estimada que ocuparán los indicadores de un área
 */
const calcularAlturaIndicadores = (indicadores: IndicadorSimple[]): number => {
  if (indicadores.length === 0) {
    return PAGE_CONFIG.COMPONENT_HEIGHTS.NO_INDICATORS;
  }

  // Calcular altura más conservadora considerando texto largo
  const alturaBase = PAGE_CONFIG.COMPONENT_HEIGHTS.INDICATOR_BASE;
  const alturaPorIndicador = PAGE_CONFIG.COMPONENT_HEIGHTS.INDICATOR_ITEM;

  // Factor adicional para indicadores con texto muy largo
  const factorTexto = indicadores.some((ind) => ind.nombre.length > 100)
    ? 1.3
    : 1.0;

  return alturaBase + indicadores.length * alturaPorIndicador * factorTexto;
};

/**
 * Calcula la altura total de un área (fila principal + indicadores)
 */
const calcularAlturaArea = (area: AreaConPromedio): number => {
  const alturaFila = PAGE_CONFIG.COMPONENT_HEIGHTS.AREA_ROW;
  const alturaIndicadores = calcularAlturaIndicadores(area.indicadores);

  return (
    alturaFila + alturaIndicadores + PAGE_CONFIG.COMPONENT_HEIGHTS.SAFETY_MARGIN
  );
};

/**
 * Calcula el espacio disponible en una página
 */
const calcularEspacioDisponible = (): number => {
  return (
    PAGE_CONFIG.HEIGHT - PAGE_CONFIG.MARGINS.TOP - PAGE_CONFIG.MARGINS.BOTTOM
  );
};

/**
 * Calcula el espacio usado por los componentes fijos de la primera página
 */
const calcularEspacioFijosPrimeraPagina = (): number => {
  return (
    PAGE_CONFIG.COMPONENT_HEIGHTS.HEADER +
    PAGE_CONFIG.COMPONENT_HEIGHTS.STUDENT_INFO +
    PAGE_CONFIG.COMPONENT_HEIGHTS.SECTION_TITLE +
    PAGE_CONFIG.COMPONENT_HEIGHTS.TABLE_HEADER
  );
};

/**
 * Calcula el espacio usado por los componentes fijos en páginas adicionales
 */
const calcularEspacioFijosPaginasAdicionales = (): number => {
  return PAGE_CONFIG.COMPONENT_HEIGHTS.TABLE_HEADER + 40; // Margen adicional
};

/**
 * NUEVA FUNCIÓN: Distribuir áreas de forma más inteligente
 */
const distribuirAreasEnPaginas = (
  areas: AreaConPromedio[],
): Array<{
  areas: AreaConPromedio[];
  esPrimeraPagina: boolean;
}> => {
  // Validación inicial
  if (!areas || areas.length === 0) {
    console.log("⚠️ No hay áreas para distribuir");

    return [];
  }

  // Filtrar áreas válidas
  const areasValidas = areas.filter(
    (area) =>
      area.area?.nombre && (area.promedio > 0 || area.indicadores.length > 0),
  );

  if (areasValidas.length === 0) {
    console.log("⚠️ No hay áreas válidas");

    return [];
  }

  const paginas: Array<{ areas: AreaConPromedio[]; esPrimeraPagina: boolean }> =
    [];
  const espacioDisponibleTotal = calcularEspacioDisponible();

  let paginaActual: AreaConPromedio[] = [];
  let espacioUsadoActual = calcularEspacioFijosPrimeraPagina();
  let esPrimeraPagina = true;

  for (let i = 0; i < areasValidas.length; i++) {
    const area = areasValidas[i];
    const alturaArea = calcularAlturaArea(area);

    // Calcular espacio disponible para contenido en esta página
    const espacioFijos = esPrimeraPagina
      ? calcularEspacioFijosPrimeraPagina()
      : calcularEspacioFijosPaginasAdicionales();

    const espacioDisponibleParaContenido =
      espacioDisponibleTotal - espacioFijos;
    const espacioUsadoContenido = espacioUsadoActual - espacioFijos;

    // Verificar si el área cabe en la página actual
    if (
      espacioUsadoContenido + alturaArea > espacioDisponibleParaContenido &&
      paginaActual.length > 0
    ) {
      // No cabe, guardar página actual
      paginas.push({
        areas: [...paginaActual],
        esPrimeraPagina: esPrimeraPagina,
      });

      // Iniciar nueva página
      paginaActual = [area];
      espacioUsadoActual =
        calcularEspacioFijosPaginasAdicionales() + alturaArea;
      esPrimeraPagina = false;
    } else {
      // Sí cabe, agregar a página actual
      paginaActual.push(area);
      espacioUsadoActual += alturaArea;
    }
  }

  // Agregar la última página si tiene contenido
  if (paginaActual.length > 0) {
    paginas.push({
      areas: [...paginaActual],
      esPrimeraPagina: esPrimeraPagina,
    });
  }

  // Asegurar que hay al menos una página
  if (paginas.length === 0) {
    paginas.push({
      areas: [],
      esPrimeraPagina: true,
    });
  }

  return paginas;
};

// ==========================================
// COMPONENTES REUTILIZABLES ACTUALIZADOS
// ==========================================

const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    <Image
      src={"/LOGO-WHITE.png"}
      style={{
        width: 100,
        height: 100,
        position: "absolute",
        objectFit: "contain",
        left: 10,
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
  <View style={[styles.table, styles.pageBreakAvoid]}>
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
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 11 }]}>
        ASIGNATURA
      </Text>
    </View>
    <View style={styles.tableColHeader2}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 11 }]}>
        {esCualitativo ? "EVALUACIÓN" : "NOTA"}
      </Text>
    </View>
    <View style={styles.tableColHeader3}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 11 }]}>
        DESEMPEÑO
      </Text>
    </View>
    <View style={styles.tableColHeader4}>
      <Text style={[styles.labelText, { color: "#4472C4", fontSize: 11 }]}>
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
    <View style={{ width: "100%" }}>
      {/* Fila principal del área */}
      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
        <View style={styles.tableCol1}>
          <Text
            style={[styles.labelText, { fontSize: 11, fontWeight: "bold" }]}
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

      {/* Indicadores */}
      {indicadores.length > 0 && (
        <View
          style={[
            styles.tableRow,
            {
              backgroundColor: "#f8f9fa",
              borderBottomWidth: isLast ? 1 : 1,
              borderBottomColor: "#E0E0E0",
            },
          ]}
        >
          <View
            style={{
              width: "100%",
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderLeftWidth: 3,
              borderLeftColor: "#4472C4",
            }}
          >
            <Text style={[styles.indicadoresHeader, { marginBottom: 4 }]}>
              Indicadores de Logros ({indicadores.length}):
            </Text>
            <View style={{ paddingLeft: 8 }}>
              {indicadores.map((indicador, indIndex) => (
                <View
                  key={`indicador-${indicador.id}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={[styles.indicadorBullet, { marginTop: 1 }]}>
                    {indIndex + 1}.
                  </Text>
                  <Text
                    style={[styles.indicadorItem, { flex: 1, marginLeft: 4 }]}
                  >
                    {indicador.nombre}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Mensaje cuando no hay indicadores */}
      {indicadores.length === 0 && (
        <View
          style={[
            styles.tableRow,
            {
              backgroundColor: "#fafafa",
              borderBottomWidth: isLast ? 1 : 1,
              borderBottomColor: "#E0E0E0",
            },
          ]}
        >
          <View
            style={{
              width: "100%",
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <Text style={styles.noIndicadores}>
              No hay indicadores registrados para esta área en el período
              actual.
            </Text>
          </View>
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
            fontSize: 11,
            fontWeight: "bold",
          }}
        >
          {director.nombre_completo}
        </Text>
        <Text style={{ color: "#666", marginBottom: 2, fontSize: 11 }}>
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

  // NUEVA distribución de páginas más simple y confiable
  const distribucionPaginas = useMemo(() => {
    if (!areas || areas.length === 0) {
      console.log("⚠️ No hay áreas disponibles para el PDF");

      return [];
    }

    const distribucion = distribuirAreasEnPaginas(areas);

    // Filtrar páginas vacías por seguridad
    const paginasConContenido = distribucion.filter(
      (pagina) => pagina.esPrimeraPagina || pagina.areas.length > 0,
    );

    return paginasConContenido;
  }, [areas]);

  if (!datos) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No hay datos disponibles para generar el PDF</Text>
        </Page>
      </Document>
    );
  }

  // Si no hay distribución válida, crear página básica
  if (distribucionPaginas.length === 0) {
    return (
      <Document>
        <Page wrap size="A4" style={styles.page}>
          {esCualitativo && (
            <View style={styles.backgroundImageContainer}>
              <Image
                src="/backgroundCualitative.png"
                style={styles.backgroundImage}
              />
            </View>
          )}
          <HeaderComponent />
          <View style={styles.contentWrapper}>
            <StudentInfoComponent
              esCualitativo={esCualitativo}
              estudiante={estudiante}
            />
            <View style={styles.pageBreakAvoid}>
              <Text style={styles.sectionHeader}>
                INFORME DE DESEMPEÑO ACADEMICO
              </Text>
            </View>
            <View style={[styles.table, styles.pageBreakAvoid]}>
              <TableHeaderComponent esCualitativo={esCualitativo} />
              <View style={styles.tableRow}>
                <View style={{ width: "100%", padding: 20 }}>
                  <Text
                    style={[
                      styles.noIndicadores,
                      { fontSize: 11, color: "#666" },
                    ]}
                  >
                    No hay calificaciones o áreas disponibles para mostrar en
                    este período.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <FooterComponent director={director} />
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {distribucionPaginas.map((paginaData, indicePagina) => {
        const esUltimaPagina = indicePagina === distribucionPaginas.length - 1;

        return (
          <Page key={`page-${indicePagina}`} wrap size="A4" style={styles.page}>
            {esCualitativo && (
              <View style={styles.backgroundImageContainer}>
                <Image
                  src="/backgroundCualitative.png"
                  style={styles.backgroundImage}
                />
              </View>
            )}

            {/* Header solo en la primera página */}
            {paginaData.esPrimeraPagina && <HeaderComponent />}

            <View style={styles.contentWrapper}>
              {/* Información del estudiante solo en la primera página */}
              {paginaData.esPrimeraPagina && (
                <>
                  <StudentInfoComponent
                    esCualitativo={esCualitativo}
                    estudiante={estudiante}
                  />
                  <View style={styles.pageBreakAvoid}>
                    <Text style={styles.sectionHeader}>
                      INFORME DE DESEMPEÑO ACADEMICO
                    </Text>
                  </View>
                </>
              )}

              {/* Tabla con las áreas de esta página */}
              <View style={[styles.table, styles.pageBreakAvoid]}>
                {/* Header de tabla siempre presente */}
                <TableHeaderComponent esCualitativo={esCualitativo} />

                {/* Renderizar las áreas de esta página */}
                {paginaData.areas.length > 0
                  ? paginaData.areas.map((areaData, indiceArea) => {
                      const isLastInPage =
                        indiceArea === paginaData.areas.length - 1;
                      const isLastOverall = esUltimaPagina && isLastInPage;

                      return (
                        <AreaRowComponent
                          key={`area-${areaData.area.id}-page-${indicePagina}`}
                          areaData={areaData}
                          esCualitativo={esCualitativo}
                          isLast={isLastOverall}
                        />
                      );
                    })
                  : /* Solo mostrar mensaje en primera página si no hay áreas */
                    paginaData.esPrimeraPagina && (
                      <View style={styles.tableRow}>
                        <View style={{ width: "100%", padding: 20 }}>
                          <Text
                            style={[
                              styles.noIndicadores,
                              { fontSize: 11, color: "#666" },
                            ]}
                          >
                            No hay calificaciones registradas para este período.
                          </Text>
                        </View>
                      </View>
                    )}
              </View>
            </View>

            {/* Footer solo en la última página */}
            {esUltimaPagina && <FooterComponent director={director} />}
          </Page>
        );
      })}
    </Document>
  );
};

// ==========================================
// ESTILOS ACTUALIZADOS
// ==========================================
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_CONFIG.MARGINS.LEFT,
    paddingTop: PAGE_CONFIG.MARGINS.TOP,
    paddingBottom: PAGE_CONFIG.MARGINS.BOTTOM,
    fontSize: 11,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4e70be",
    padding: 15,
  },
  header: {
    fontWeight: "bold",
    fontSize: 11,
    maxWidth: 300,
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
    fontSize: 11,
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
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader2: {
    width: "20%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader3: {
    width: "20%",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableColHeader4: {
    width: "20%",
    paddingVertical: 3,
    paddingHorizontal: 5,
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
    fontSize: 11,
    textAlign: "center",
    textTransform: "capitalize",
  },
  valueText: {
    fontSize: 11,
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
  superiorValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5715",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  altoValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  basicoValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  bajoValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  grayValue: {
    color: "#00000074",
    backgroundColor: "#F0F0F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    textAlign: "center",
  },
  // Nuevos estilos para evaluación cualitativa
  dsValue: {
    color: "#2E8B57",
    backgroundColor: "#2E8B5715",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  daValue: {
    color: "#007AFF",
    backgroundColor: "#F0F7FF",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  dbValue: {
    color: "#FF9500",
    backgroundColor: "#FFF9F0",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  spValue: {
    color: "#e60f0f",
    backgroundColor: "#FDF1F1",
    padding: 3,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    fontSize: 11,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9E9E9E",
    marginTop: 40,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
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
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4472C4",
    textAlign: "center",
    backgroundColor: "#4472C415",
    padding: 4,
  },
  indicadoresHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4472C4",
    marginBottom: 2,
    textAlign: "left",
  },
  indicadorItem: {
    fontSize: 11,
    color: "#333",
    marginBottom: 2,
    paddingLeft: 8,
    textAlign: "left",
  },
  indicadorBullet: {
    fontSize: 11,
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
  signature: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    width: 200,
    margin: "auto",
    marginBottom: 10,
  },
  pageBreakAvoid: {
    pageBreakInside: "avoid",
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
