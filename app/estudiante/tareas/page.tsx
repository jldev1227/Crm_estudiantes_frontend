"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import {
  FileText,
  Search,
  Filter,
  Calendar as CalendarIcon,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  FileDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { OBTENER_AREAS_POR_GRADO } from "@/app/graphql/queries/obtenerAreasPorGrado";
import { formatearFecha } from "@/helpers/formatearFecha";
import { OBTENER_TAREAS_ESTUDIANTE } from "@/app/graphql/queries/obtenerTareasEstudiante";
import PDFThumbnail from "@/components/PDFThumbnail";

// Definir los tipos
interface Area {
  id: string;
  nombre: string;
}

interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  fechaEntrega: string;
  estado: string;
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

export default function TareasPage() {
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

  // Función para obtener el estado de la tarea con iconos
  const getEstadoTarea = (estado: string, fechaEntrega: string) => {
    const hoy = new Date();
    const fechaLimite = new Date(Number(fechaEntrega));
    const estaVencida = hoy > fechaLimite;

    if (estado === "cancelada") {
      return {
        icon: <XCircle size={16} />,
        text: "Cancelada",
        color: "default" as const,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
      };
    }

    if (estado === "vencida" || estaVencida) {
      return {
        icon: <AlertTriangle size={16} />,
        text: "Vencida",
        color: "danger" as const,
        bgColor: "bg-red-100",
        textColor: "text-red-600",
      };
    }

    return {
      icon: <CheckCircle size={16} />,
      text: "Activa",
      color: "success" as const,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    };
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

  // Obtener tareas
  const {
    data: tareasData,
    loading: tareasLoading,
    error: tareasError,
  } = useQuery(OBTENER_TAREAS_ESTUDIANTE, {
    variables: {
      gradoId: usuario?.grado_id,
      areaId: areaId || null,
    },
    skip: !usuario?.grado_id,
  });

  // Estado local para tareas filtradas
  const [tareasFiltradas, setTareasFiltradas] = useState<Tarea[] | []>([]);

  // Aplicar filtros cuando cambian los datos o los criterios de filtrado
  useEffect(() => {
    if (!tareasData?.obtenerTareasEstudiante) return;

    let filtradas = [...tareasData.obtenerTareasEstudiante];

    // Filtrar por área
    if (areaId) {
      filtradas = filtradas.filter((tarea) => tarea.area.id === areaId);
    }

    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      const textoBusquedaNormalizado = normalizarTexto(busqueda.trim());

      filtradas = filtradas.filter((tarea) => {
        const nombreNormalizado = normalizarTexto(tarea.nombre);
        const descripcionNormalizada = normalizarTexto(tarea.descripcion);

        return (
          nombreNormalizado.includes(textoBusquedaNormalizado) ||
          descripcionNormalizada.includes(textoBusquedaNormalizado)
        );
      });
    }

    // Filtrar por fecha
    if (fechaFiltro) {
      const fechaObj = new Date(fechaFiltro);

      fechaObj.setHours(0, 0, 0, 0);

      filtradas = filtradas.filter((tarea) => {
        // Convertir el string de timestamp a número
        const timestamp = Number(tarea.fechaEntrega);
        const tareaFechaObj = new Date(timestamp);

        tareaFechaObj.setHours(0, 0, 0, 0);

        // Compara año, mes y día para evitar problemas con zonas horarias
        return (
          tareaFechaObj.getFullYear() === fechaObj.getFullYear() &&
          tareaFechaObj.getMonth() === fechaObj.getMonth() &&
          tareaFechaObj.getDate() === fechaObj.getDate()
        );
      });
    }
    setTareasFiltradas(
      filtradas.sort((a, b) => Number(b.fechaEntrega) - Number(a.fechaEntrega)),
    );
  }, [busqueda, fechaFiltro, areaId, tareasData]);

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
  if (areasLoading || tareasLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (tareasError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="shadow-sm">
          <CardBody className="text-center py-12">
            <div className="text-red-500 mb-4">
              <FileText className="mx-auto" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Error al cargar
            </h3>
            <p className="text-gray-600">
              Error al cargar las tareas. Por favor, intenta de nuevo.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Obtener la lista de áreas
  const areas = areasData?.obtenerAreasPorGrado || [];

  // Calcular estadísticas
  const estadisticas = {
    total: tareasFiltradas.length,
    activas: tareasFiltradas.filter((t) => {
      const estado = getEstadoTarea(t.estado, t.fechaEntrega);

      return estado.text === "Activa";
    }).length,
    vencidas: tareasFiltradas.filter((t) => {
      const estado = getEstadoTarea(t.estado, t.fechaEntrega);

      return estado.text === "Vencida";
    }).length,
    materias: new Set(tareasFiltradas.map((t) => t.area.id)).size,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="text-orange-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mis Tareas</h1>
              <p className="text-gray-600">
                Gestiona y revisa tus tareas asignadas
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-600" size={20} />
            <div>
              <div className="text-xl font-bold text-orange-600">
                {estadisticas.total}
              </div>
              <div className="text-xs text-orange-600">Total Tareas</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <div className="text-xl font-bold text-green-600">
                {estadisticas.activas}
              </div>
              <div className="text-xs text-green-600">Activas</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={20} />
            <div>
              <div className="text-xl font-bold text-red-600">
                {estadisticas.vencidas}
              </div>
              <div className="text-xs text-red-600">Vencidas</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600" size={20} />
            <div>
              <div className="text-xl font-bold text-blue-600">
                {estadisticas.materias}
              </div>
              <div className="text-xs text-blue-600">Materias</div>
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
                placeholder="Buscar tareas..."
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
                Fecha de entrega
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

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <Card className="shadow-sm">
          <CardBody className="text-center py-12">
            <FileText className="text-gray-300 mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron tareas
            </h3>
            <p className="text-sm text-gray-600">
              No hay tareas que coincidan con los filtros seleccionados.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Tareas Encontradas ({tareasFiltradas.length})
          </h2>
          {tareasFiltradas.map((tarea) => {
            const estadoTarea = getEstadoTarea(
              tarea.estado,
              tarea.fechaEntrega,
            );

            return (
              <Card
                key={tarea.id}
                className="shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <CardBody className="p-6">
                  <div className="space-y-4">
                    {/* Header de la tarea */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {tarea.nombre}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            <span>
                              Entrega: {formatearFecha(tarea.fechaEntrega)}
                            </span>
                          </div>
                        </div>
                        <Chip
                          className="font-medium"
                          color={getColorArea(tarea.area?.nombre)}
                          size="sm"
                          variant="flat"
                        >
                          {tarea.area?.nombre}
                        </Chip>
                      </div>
                      <Chip
                        className="font-medium"
                        color={estadoTarea.color}
                        size="sm"
                        startContent={estadoTarea.icon}
                        variant="flat"
                      >
                        {estadoTarea.text}
                      </Chip>
                    </div>

                    {/* Descripción */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Descripción:</p>
                      <p className="text-gray-700">{tarea.descripcion}</p>
                    </div>

                    {/* Archivos adjuntos */}
                    {(tarea.fotos?.length > 0 || tarea.pdfs?.length > 0) && (
                      <div>
                        <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          {tarea.fotos?.length > 0 && <Camera size={16} />}
                          {tarea.pdfs?.length > 0 && <FileDown size={16} />}
                          Archivos adjuntos (
                          {(tarea.fotos?.length || 0) +
                            (tarea.pdfs?.length || 0)}
                          )
                        </p>
                        <div className="relative group">
                          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {/* Fotos */}
                            {tarea.fotos?.map((foto, index) => (
                              <div key={`foto-${index}`} className="flex-none">
                                <div
                                  className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                                  role="button"
                                  onClick={() =>
                                    mostrarImagen(tarea.fotos, index)
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
                            {tarea.pdfs?.map((pdfUrl, index) => (
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
            );
          })}
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
