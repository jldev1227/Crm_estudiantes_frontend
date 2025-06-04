"use client";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Clock,
  Calendar as CalendarIcon,
  FileText,
  Users,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  FileDown,
} from "lucide-react";

import { ELIMINAR_ACTIVIDAD } from "@/app/graphql/mutation/eliminarActividad";
import { OBTENER_ACTIVIDADES_POR_AREA } from "@/app/graphql/queries/obtenerActividadesPorArea";
import PDFThumbnail from "@/components/PDFThumbnail";
import { ELIMINAR_TAREA } from "@/app/graphql/mutation/eliminarTarea";
import { OBTENER_TAREAS_POR_GRADO_Y_AREA } from "@/app/graphql/queries/obtenerTareasPorArea";
import { convertirA12Horas } from "@/helpers/convertirA12Horas";
import { useMaestro } from "@/app/context/MaestroContext";
import { formatearFecha } from "@/helpers/formatearFecha";
import EstudiantesResponsive from "@/components/estudiantesResponsive";

type ActividadData = {
  id: string;
  nombre: string;
  fecha: string;
  descripcion: string;
  hora: string;
  fotos: string[];
  pdfs: string[];
};

type TareaData = {
  id: string;
  nombre: string;
  fechaEntrega: string;
  fecha: string;
  descripcion: string;
  estado: "activa" | "vencida" | "cancelada";
  fotos: string[];
  pdfs: string[];
};

// Componente Modal simple para mostrar imágenes
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
      className="!mt-0 fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
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
          className="absolute top-2 right-2 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          onClick={onClose}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>

        {/* Contador */}
        <div className="absolute top-2 left-2 text-white bg-black/50 px-3 py-1 rounded-md">
          {contador}
        </div>

        {/* Imagen */}
        <img
          alt="Imagen ampliada"
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
          src={imagen}
        />

        {/* Controles */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CursoPage() {
  const params = useParams();
  const id = params.curso as string;
  const area_id = params.area as string;

  // Use the MaestroContext
  const { obtenerCurso, curso } = useMaestro();

  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenActual, setImagenActual] = useState("");
  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Efecto para cargar datos del curso usando el contexto
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id && area_id) {
          await obtenerCurso(id, area_id);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del curso");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, area_id]);

  const {
    loading: loadingActividades,
    error: errorActividades,
    data: actividadesData,
  } = useQuery(OBTENER_ACTIVIDADES_POR_AREA, {
    variables: { grado_id: id, area_id },
  });

  const {
    loading: loadingTareas,
    error: errorTareas,
    data: tareasData,
  } = useQuery(OBTENER_TAREAS_POR_GRADO_Y_AREA, {
    variables: { grado_id: id, area_id },
  });

  const [eliminarActividad] = useMutation(ELIMINAR_ACTIVIDAD, {
    refetchQueries: ["ObtenerActividadesPorArea"],
    onError: (error) => {
      console.error("Error al eliminar actividad:", error);
    },
  });

  const [eliminarTarea] = useMutation(ELIMINAR_TAREA, {
    refetchQueries: ["ObtenerTareasPorGradoYArea"],
    onError: (error) => {
      console.error("Error al eliminar tarea:", error);
    },
  });

  const handleEliminarActividad = async (id: string | number) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        toast.loading("Eliminando actividad...", { id: "eliminar-actividad" });
        await eliminarActividad({
          variables: { id },
        });
        toast.success("Actividad eliminada exitosamente", {
          id: "eliminar-actividad",
          duration: 3000,
        });
      } catch (error) {
        toast.error("Error al eliminar la actividad", {
          id: "eliminar-actividad",
          duration: 3000,
        });
      }
    }
  };

  const handleEliminarTarea = async (id: string | number) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        toast.loading("Eliminando tarea...", { id: "eliminar-tarea" });
        await eliminarTarea({
          variables: { id },
        });
        toast.success("Tarea eliminada exitosamente", {
          id: "eliminar-tarea",
          duration: 3000,
        });
      } catch (error) {
        toast.error("Error al eliminar la tarea", {
          id: "eliminar-tarea",
          duration: 3000,
        });
      }
    }
  };

  // Función para determinar si una tarea está vencida
  const estaTareaVencida = (fechaEntrega: string): boolean => {
    const hoy = new Date();
    const fechaLimite = new Date(fechaEntrega);

    return hoy > fechaLimite;
  };

  // Función para obtener el estado de la tarea con iconos
  const getEstadoTarea = (tarea: TareaData) => {
    if (tarea.estado === "cancelada") {
      return {
        icon: <XCircle size={16} />,
        text: "Cancelada",
        color: "danger" as const,
      };
    }
    if (tarea.estado === "vencida" || estaTareaVencida(tarea.fechaEntrega)) {
      return {
        icon: <AlertTriangle size={16} />,
        text: "Vencida",
        color: "warning" as const,
      };
    }

    return {
      icon: <CheckCircle size={16} />,
      text: "Activa",
      color: "success" as const,
    };
  };

  // Función para obtener color del área
  const getColorArea = (areaNombre: string) => {
    const colores: { [key: string]: any } = {
      MATEMATICAS: "primary",
      ESPAÑOL: "secondary",
      CIENCIAS: "success",
      SOCIALES: "warning",
      INGLES: "danger",
      "EDUCACION FISICA": "default",
    };

    return colores[areaNombre.toUpperCase()] || "default";
  };

  if (loading || loadingActividades || loadingTareas) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  // Manejar errores específicamente
  if (error)
    return (
      <div className="text-center text-red-500 p-8">
        Error al cargar el curso: {error}
      </div>
    );
  if (errorActividades)
    return (
      <div className="text-center text-red-500 p-8">
        Error al cargar las actividades: {errorActividades.message}
      </div>
    );
  if (errorTareas)
    return (
      <div className="text-center text-red-500 p-8">
        Error al cargar las tareas: {errorTareas.message}
      </div>
    );

  // Verificar que los datos existan
  if (!curso)
    return (
      <div className="text-center text-gray-500 p-8">
        No se encontró información del curso
      </div>
    );

  // Asegurarse de que actividades sea siempre un array
  const actividades: ActividadData[] =
    actividadesData?.obtenerActividadesPorArea || [];
  const tareas: TareaData[] = tareasData?.obtenerTareasPorGradoYArea || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header mejorado */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                as={Link}
                className="hover:bg-gray-100"
                href="/maestro/cursos"
                variant="light"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BookOpen className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                      {curso.nombre}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Chip
                        className="font-medium"
                        color={getColorArea(curso.area.nombre)}
                        size="sm"
                        variant="flat"
                      >
                        {curso.area.nombre}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Ver calificaciones">
                <Button
                  as={Link}
                  color="primary"
                  href={`/maestro/cursos/${id}/areas/${area_id}/calificaciones`}
                  size="sm"
                  startContent={<FileText size={16} />}
                  variant="flat"
                >
                  Calificaciones
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {curso.estudiantes?.length || 0}
              </div>
              <div className="text-sm text-blue-600">Estudiantes</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {
                  tareas.filter(
                    (t) =>
                      t.estado === "activa" &&
                      !estaTareaVencida(t.fechaEntrega),
                  ).length
                }
              </div>
              <div className="text-sm text-green-600">Tareas Activas</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <BookOpen className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {actividades.length}
              </div>
              <div className="text-sm text-purple-600">Actividades</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {
                  tareas.filter((t) =>
                    estaTareaVencida(formatearFecha(t.fechaEntrega)),
                  ).length
                }
              </div>
              <div className="text-sm text-orange-600">Tareas Vencidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de estudiantes mejorada */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} />
              Estudiantes del Curso
            </h2>
            <Chip color="default" size="sm" variant="flat">
              {curso.estudiantes?.length || 0} estudiantes
            </Chip>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          {curso.estudiantes && curso.estudiantes.length > 0 ? (
            <EstudiantesResponsive estudiantes={curso.estudiantes} />
          ) : (
            <div className="text-center py-8">
              <Users className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-500">
                No hay estudiantes matriculados en este curso
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sección de Tareas mejorada */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText size={20} />
              Tareas Asignadas
            </h2>
            <Button
              as={Link}
              color="primary"
              href={`/maestro/cursos/${id}/areas/${area_id}/tareas/agregar`}
              size="sm"
              startContent={<Plus size={16} />}
            >
              Nueva Tarea
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="space-y-4">
            {tareas.length > 0 ? (
              tareas.map((tarea) => {
                const estadoTarea = getEstadoTarea(tarea);

                return (
                  <Card
                    key={tarea.id}
                    className="shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <CardBody className="p-6">
                      <div className="space-y-4">
                        {/* Header de la tarea */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">
                              {tarea.nombre}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon size={14} />
                                <span>
                                  Asignada: {formatearFecha(tarea.fecha)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>
                                  Entrega: {formatearFecha(tarea.fechaEntrega)}
                                </span>
                              </div>
                            </div>
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
                        <p className="text-gray-700">{tarea.descripcion}</p>

                        {/* Archivos adjuntos */}
                        {(tarea.fotos?.length > 0 ||
                          tarea.pdfs?.length > 0) && (
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
                                  <div
                                    key={`foto-${index}`}
                                    className="flex-none"
                                  >
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

                        {/* Acciones */}
                        <Divider />
                        <div className="flex gap-2 justify-end">
                          <Button
                            as={Link}
                            color="primary"
                            href={`/maestro/cursos/${id}/areas/${area_id}/tareas/actualizar/${tarea.id}`}
                            size="sm"
                            startContent={<Edit3 size={14} />}
                            variant="light"
                          >
                            Editar
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            startContent={<Trash2 size={14} />}
                            variant="light"
                            onPress={() => handleEliminarTarea(tarea.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No hay tareas asignadas
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando una nueva tarea para tus estudiantes
                </p>
                <Button
                  as={Link}
                  color="primary"
                  href={`/maestro/cursos/${id}/areas/${area_id}/tareas/agregar`}
                  startContent={<Plus size={16} />}
                >
                  Crear Primera Tarea
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Sección de Actividades mejorada */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} />
              Actividades Recientes
            </h2>
            <Button
              as={Link}
              color="primary"
              href={`/maestro/cursos/${id}/areas/${area_id}/actividades/agregar`}
              size="sm"
              startContent={<Plus size={16} />}
            >
              Nueva Actividad
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="space-y-4">
            {actividades.length > 0 ? (
              actividades.map((actividad) => (
                <Card
                  key={actividad.id}
                  className="shadow-sm border hover:shadow-md transition-shadow"
                >
                  <CardBody className="p-6">
                    <div className="space-y-4">
                      {/* Header de la actividad */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-2">
                            {actividad.nombre}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              <span>{formatearFecha(actividad.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{convertirA12Horas(actividad.hora)}</span>
                            </div>
                          </div>
                        </div>
                        <Chip color="success" size="sm" variant="flat">
                          Completada
                        </Chip>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-700">{actividad.descripcion}</p>

                      {/* Archivos adjuntos */}
                      {(actividad.fotos?.length > 0 ||
                        actividad.pdfs?.length > 0) && (
                        <div>
                          <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            {actividad.fotos?.length > 0 && (
                              <Camera size={16} />
                            )}
                            {actividad.pdfs?.length > 0 && (
                              <FileDown size={16} />
                            )}
                            Archivos adjuntos (
                            {(actividad.fotos?.length || 0) +
                              (actividad.pdfs?.length || 0)}
                            )
                          </p>
                          <div className="relative group">
                            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                              {/* Fotos */}
                              {actividad.fotos?.map((foto, index) => (
                                <div
                                  key={`foto-${index}`}
                                  className="flex-none"
                                >
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

                      {/* Acciones */}
                      <Divider />
                      <div className="flex gap-2 justify-end">
                        <Button
                          as={Link}
                          color="primary"
                          href={`/maestro/cursos/${id}/areas/${area_id}/actividades/actualizar/${actividad.id}`}
                          size="sm"
                          startContent={<Edit3 size={14} />}
                          variant="light"
                        >
                          Editar
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          startContent={<Trash2 size={14} />}
                          variant="light"
                          onPress={() => handleEliminarActividad(actividad.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No hay actividades registradas
                </h3>
                <p className="text-gray-500 mb-4">
                  Documenta las actividades realizadas en clase
                </p>
                <Button
                  as={Link}
                  color="primary"
                  href={`/maestro/cursos/${id}/areas/${area_id}/actividades/agregar`}
                  startContent={<Plus size={16} />}
                >
                  Registrar Primera Actividad
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal de imagen mejorado */}
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
