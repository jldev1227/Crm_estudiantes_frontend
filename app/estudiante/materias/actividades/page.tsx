"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import {
  BookOpen,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Activity,
  XCircle,
  ArrowLeft,
  Camera,
  FileDown,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import { OBTENER_AREAS_POR_GRADO } from "@/app/graphql/queries/obtenerAreasPorGrado";
import { formatearFecha } from "@/helpers/formatearFecha";
import PDFThumbnail from "@/components/PDFThumbnail";
import { OBTENER_ACTIVIDADES_ESTUDIANTE_GENERAL } from "@/app/graphql/queries/obtenerActividadesEstudiante copy";
import { formatearFechaCompleta } from "@/helpers/formatearFechaCompleta";
import { convertirA12Horas } from "@/helpers/convertirA12Horas";

// Definir los tipos
interface Area {
  id: string;
  nombre: string;
}

interface Actividad {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  fotos: string[];
  pdfs: string[];
  area: Area;
}

// Componente Modal mejorado para mostrar imágenes
const ImagenModal = ({
  isOpen,
  onClose,
  imagen,
  onPrev,
  onNext,
  contador,
}: {
  isOpen: boolean;
  onClose: () => void;
  imagen: string;
  onPrev: () => void;
  onNext: () => void;
  contador: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="!mt-0 fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm"
      role="button"
      onClick={onClose}
    >
      <div
        className="max-w-4xl max-h-[85vh] relative"
        role="button"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre */}
        <button
          className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <XCircle size={20} />
        </button>

        {/* Contador */}
        <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded-lg font-medium">
          {contador}
        </div>

        {/* Imagen */}
        <img
          alt="Imagen ampliada"
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
          src={imagen}
        />

        {/* Controles */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 ml-4 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 mr-4 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ArrowLeft className="rotate-180" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function ActividadesPage() {
  const searchParams = useSearchParams();
  const initialAreaId = searchParams.get("area");

  const [areaId, setAreaId] = useState(initialAreaId || "");
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const { usuario } = useAuth();

  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenActual, setImagenActual] = useState("");
  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);
  const [indiceImagen, setIndiceImagen] = useState(0);

  // Función para obtener color del área
  const getColorArea = (areaNombre: string) => {
    const colores: { [key: string]: any } = {
      ARTES: "secondary",
      CIENCIAS: "success",
      CORPORAL: "warning",
      DANZAS: "secondary",
      "DIMENSIÓN COGNITIVA": "primary",
      "DIMENSIÓN ÉTICA": "danger",
      "EDUCACIÓN FÍSICA": "warning",
      EMPRENDIMIENTO: "success",
      "ESTIMULACIÓN LENGUAJE": "secondary",
      "ESTIMULACIÓN SENSORIAL": "primary",
      ÉTICA: "danger",
      FRANCÉS: "secondary",
      HABILMENTE: "primary",
      INGLÉS: "danger",
      LENGUAJE: "secondary",
      MATEMÁTICAS: "primary",
      MÚSICA: "secondary",
      "PLAN LECTOR": "secondary",
      RELIGIÓN: "warning",
      SCIENCE: "success",
      SOCIAL: "warning",
      SOCIOAFECTIVA: "danger",
      TECNOLOGÍA: "primary",
    };

    return colores[areaNombre.toUpperCase()] || "default";
  };

  // Funciones para el modal
  const mostrarImagen = (fotos: string[], indice: number) => {
    const fotosConKey = fotos.map(
      (foto) => `${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`,
    );

    setFotosGaleria(fotosConKey);
    setIndiceImagen(indice);
    setImagenActual(fotosConKey[indice]);
    setModalVisible(true);
  };

  const ocultarImagen = () => {
    setModalVisible(false);
  };

  const imagenAnterior = () => {
    const nuevoIndice =
      indiceImagen === 0 ? fotosGaleria.length - 1 : indiceImagen - 1;

    setIndiceImagen(nuevoIndice);
    setImagenActual(fotosGaleria[nuevoIndice]);
  };

  const imagenSiguiente = () => {
    const nuevoIndice =
      indiceImagen === fotosGaleria.length - 1 ? 0 : indiceImagen + 1;

    setIndiceImagen(nuevoIndice);
    setImagenActual(fotosGaleria[nuevoIndice]);
  };

  // Manejar eventos de teclado para navegación
  useEffect(() => {
    const manejarTeclas = (e: KeyboardEvent) => {
      if (!modalVisible) return;

      switch (e.key) {
        case "ArrowLeft":
          imagenAnterior();
          break;
        case "ArrowRight":
          imagenSiguiente();
          break;
        case "Escape":
          ocultarImagen();
          break;
      }
    };

    window.addEventListener("keydown", manejarTeclas);

    return () => window.removeEventListener("keydown", manejarTeclas);
  }, [modalVisible, indiceImagen, fotosGaleria]);

  // Obtener áreas disponibles
  const { data: areasData, loading: areasLoading } = useQuery(
    OBTENER_AREAS_POR_GRADO,
    {
      variables: { gradoId: usuario?.grado_id },
      skip: !usuario?.grado_id,
    },
  );

  // Obtener actividades
  const {
    data: actividadesData,
    loading: actividadesLoading,
    error: actividadesError,
  } = useQuery(OBTENER_ACTIVIDADES_ESTUDIANTE_GENERAL, {
    variables: {
      areaId: areaId || null,
      gradoId: usuario?.grado_id,
    },
    skip: !usuario?.grado_id,
  });

  // Estado local para actividades filtradas
  const [actividadesFiltradas, setActividadesFiltradas] = useState<
    Actividad[] | []
  >([]);

  // Aplicar filtros cuando cambian los datos o los criterios de filtrado
  useEffect(() => {
    if (!actividadesData?.obtenerActividadesEstudianteGeneral) return;

    let filtradas = [...actividadesData.obtenerActividadesEstudianteGeneral];

    // Filtrar por área
    if (areaId) {
      filtradas = filtradas.filter((actividad) => actividad.area.id === areaId);
    }

    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      const textoBusquedaNormalizado = normalizarTexto(busqueda.trim());

      filtradas = filtradas.filter((actividad) => {
        const nombreNormalizado = normalizarTexto(actividad.nombre);
        const descripcionNormalizada = normalizarTexto(actividad.descripcion);

        return (
          nombreNormalizado.includes(textoBusquedaNormalizado) ||
          descripcionNormalizada.includes(textoBusquedaNormalizado)
        );
      });
    }

    if (fechaFiltro) {
      const fechaObj = new Date(fechaFiltro);

      fechaObj.setHours(0, 0, 0, 0);

      filtradas = filtradas.filter((actividad) => {
        // Convertir el string de timestamp a número
        const timestamp = Number(actividad.fecha);
        const actividadFechaObj = new Date(timestamp);

        actividadFechaObj.setHours(0, 0, 0, 0);

        // Compara año, mes y día para evitar problemas con zonas horarias
        return (
          actividadFechaObj.getFullYear() === fechaObj.getFullYear() &&
          actividadFechaObj.getMonth() === fechaObj.getMonth() &&
          actividadFechaObj.getDate() === fechaObj.getDate()
        );
      });
    }

    setActividadesFiltradas(
      filtradas.sort((a, b) => {
        // Primero ordenar por fecha (timestamp)
        const fechaA = parseInt(a.fecha);
        const fechaB = parseInt(b.fecha);

        if (fechaA !== fechaB) {
          return fechaB - fechaA; // Orden ascendente por fecha
        }

        // Si las fechas son iguales, ordenar por hora y minuto
        const [horasA, minutosA] = a.hora.split(":").map(Number);
        const [horasB, minutosB] = b.hora.split(":").map(Number);

        // Convertir a minutos totales para facilitar la comparación
        const minutostotalesA = horasA * 60 + minutosA;
        const minutostotalesB = horasB * 60 + minutosB;

        return minutostotalesB - minutostotalesA; // Orden ascendente por hora
      }),
    );
  }, [busqueda, fechaFiltro, areaId, actividadesData]);

  // Manejar cambio de área
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAreaId(e.target.value);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setAreaId("");
    setBusqueda("");
    setFechaFiltro("");
  };

  // Mostrar spinner durante la carga
  if (areasLoading || actividadesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (actividadesError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="shadow-sm">
          <CardBody className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Activity className="mx-auto" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Error al cargar
            </h3>
            <p className="text-gray-600">
              Error al cargar las actividades. Por favor, intenta de nuevo.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Obtener la lista de áreas
  const areas = areasData?.obtenerAreasPorGrado || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Actividades del Curso
              </h1>
              <p className="text-gray-600">
                Revisa las actividades realizadas en cada materia
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-600" size={20} />
            <div>
              <div className="text-xl font-bold text-purple-600">
                {actividadesFiltradas.length}
              </div>
              <div className="text-xs text-purple-600">Actividades</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600" size={20} />
            <div>
              <div className="text-xl font-bold text-blue-600">
                {new Set(actividadesFiltradas.map((a) => a.area.id)).size}
              </div>
              <div className="text-xs text-blue-600">Materias</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Camera className="text-green-600" size={20} />
            <div>
              <div className="text-xl font-bold text-green-600">
                {actividadesFiltradas.reduce(
                  (acc, act) => acc + (act.fotos?.length || 0),
                  0,
                )}
              </div>
              <div className="text-xs text-green-600">Fotos</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <FileDown className="text-orange-600" size={20} />
            <div>
              <div className="text-xl font-bold text-orange-600">
                {actividadesFiltradas.reduce(
                  (acc, act) => acc + (act.pdfs?.length || 0),
                  0,
                )}
              </div>
              <div className="text-xs text-orange-600">Documentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter size={20} />
              Filtros de Búsqueda
            </h2>
            <Button
              color="danger"
              size="sm"
              startContent={<XCircle size={16} />}
              variant="light"
              onPress={limpiarFiltros}
            >
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="area"
              >
                <BookOpen className="inline mr-2" size={16} />
                Materia
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                id="area"
                value={areaId}
                onChange={handleAreaChange}
              >
                <option value="">Todas las materias</option>
                {areas.map((area: Area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="busqueda"
              >
                <Search className="inline mr-2" size={16} />
                Buscar
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                id="busqueda"
                placeholder="Buscar actividades..."
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="fecha"
              >
                <CalendarIcon className="inline mr-2" size={16} />
                Fecha
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                id="fecha"
                type="date"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de actividades */}
      {actividadesFiltradas.length === 0 ? (
        <Card className="shadow-sm">
          <CardBody className="text-center py-12">
            <Activity className="text-gray-300 mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron actividades
            </h3>
            <p className="text-sm text-gray-600">
              No hay actividades que coincidan con los filtros seleccionados.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={20} />
            Actividades Encontradas ({actividadesFiltradas.length})
          </h2>
          {actividadesFiltradas.map((actividad) => (
            <Card
              key={actividad.id}
              className="shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <CardBody className="p-6">
                <div className="space-y-4">
                  {/* Header de la actividad */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {actividad.nombre}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon size={14} />
                          <span>
                            {formatearFechaCompleta(
                              formatearFecha(actividad.fecha),
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{convertirA12Horas(actividad.hora)}</span>
                        </div>
                      </div>
                      <Chip
                        className="font-medium"
                        color={getColorArea(actividad.area?.nombre)}
                        size="sm"
                        variant="flat"
                      >
                        {actividad.area?.nombre}
                      </Chip>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <p className="text-gray-700">{actividad.descripcion}</p>
                  </div>

                  {/* Archivos adjuntos */}
                  {(actividad.fotos?.length > 0 ||
                    actividad.pdfs?.length > 0) && (
                    <div>
                      <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        {actividad.fotos?.length > 0 && <Camera size={16} />}
                        {actividad.pdfs?.length > 0 && <FileDown size={16} />}
                        Archivos adjuntos (
                        {(actividad.fotos?.length || 0) +
                          (actividad.pdfs?.length || 0)}
                        )
                      </p>
                      <div className="relative group">
                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {/* Fotos */}
                          {actividad.fotos?.map((foto, index) => (
                            <div key={`foto-${index}`} className="flex-none">
                              <div
                                className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                                role="button"
                                onClick={() =>
                                  mostrarImagen(actividad.fotos, index)
                                }
                              >
                                <img
                                  alt={`Foto ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                  src={`${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                                />
                              </div>
                            </div>
                          ))}

                          {/* PDFs */}
                          {actividad.pdfs?.map((pdfUrl, index) => (
                            <div
                              key={`pdf-${index}`}
                              className="flex-none w-24 h-24 md:w-32 md:h-32"
                            >
                              <PDFThumbnail index={index} url={pdfUrl} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de imagen */}
      <ImagenModal
        contador={`${indiceImagen + 1} / ${fotosGaleria.length}`}
        imagen={imagenActual}
        isOpen={modalVisible}
        onClose={ocultarImagen}
        onNext={imagenSiguiente}
        onPrev={imagenAnterior}
      />
    </div>
  );
}
