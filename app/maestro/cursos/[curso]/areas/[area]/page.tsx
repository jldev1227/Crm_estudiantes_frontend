"use client";

import { useMutation, useQuery } from "@apollo/client";
import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { formatearFecha } from "@/helpers/formatearFecha";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ELIMINAR_ACTIVIDAD } from "@/app/graphql/mutation/eliminarActividad";
import { Divider } from "@heroui/divider";
import { OBTENER_ACTIVIDADES_POR_AREA } from "@/app/graphql/queries/obtenerActividadesPorArea";
import { useState, useEffect } from "react";
import PDFThumbnail from "@/components/PDFThumbnail";
import { ELIMINAR_TAREA } from "@/app/graphql/mutation/eliminarTarea";
import { OBTENER_TAREAS_POR_GRADO_Y_AREA } from "@/app/graphql/queries/obtenerTareasPorArea";
import { toast } from 'react-hot-toast';
import { convertirA12Horas } from "@/helpers/convertirA12Horas";
import { useMaestro } from "@/app/context/MaestroContext";

// Define el tipo de los datos que obtendrás del servidor
type AreaData = {
  id: string;
  nombre: string;
};

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
  estado: 'activa' | 'vencida' | 'cancelada';
  fotos: string[];
  pdfs: string[];
};

// Componente Modal simple para mostrar imágenes
const ImagenModal = ({ isOpen, onClose, imagen, onPrev, onNext, contador }: {
  isOpen: boolean;
  onClose: () => void;
  imagen: string;
  onPrev: () => void;
  onNext: () => void;
  contador: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}>
      <div className="max-w-4xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
        {/* Botón de cierre */}
        <button
          className="absolute top-2 right-2 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contador */}
        <div className="absolute top-2 left-2 text-white bg-black/50 px-3 py-1 rounded-md">
          {contador}
        </div>

        {/* Imagen */}
        <img
          src={imagen}
          alt="Imagen ampliada"
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
        />

        {/* Controles */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 ml-2"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 mr-2"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
    const fotosConKey = fotos.map(foto => `${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`);
    setFotosGaleria(fotosConKey);
    setIndiceImagen(indice);
    setImagenActual(fotosConKey[indice]);
    setModalVisible(true);
  };

  const ocultarImagen = () => {
    setModalVisible(false);
  };

  const imagenAnterior = () => {
    const nuevoIndice = indiceImagen === 0 ? fotosGaleria.length - 1 : indiceImagen - 1;
    setIndiceImagen(nuevoIndice);
    setImagenActual(fotosGaleria[nuevoIndice]);
  };

  const imagenSiguiente = () => {
    const nuevoIndice = indiceImagen === fotosGaleria.length - 1 ? 0 : indiceImagen + 1;
    setIndiceImagen(nuevoIndice);
    setImagenActual(fotosGaleria[nuevoIndice]);
  };

  // Manejar eventos de teclado para navegación
  useEffect(() => {
    const manejarTeclas = (e: KeyboardEvent) => {
      if (!modalVisible) return;

      switch (e.key) {
        case 'ArrowLeft':
          imagenAnterior();
          break;
        case 'ArrowRight':
          imagenSiguiente();
          break;
        case 'Escape':
          ocultarImagen();
          break;
      }
    };

    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
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

  const [eliminarActividad] = useMutation(
    ELIMINAR_ACTIVIDAD,
    {
      refetchQueries: ["ObtenerActividadesPorArea"],
      onError: (error) => {
        console.error("Error al eliminar actividad:", error);
      },
    },
  );

  const [eliminarTarea] = useMutation(
    ELIMINAR_TAREA,
    {
      refetchQueries: ["ObtenerTareasPorGradoYArea"],
      onError: (error) => {
        console.error("Error al eliminar tarea:", error);
      },
    },
  );

  const handleEliminarActividad = async (id: string | number) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        // Mostrar toast de carga
        toast.loading("Eliminando actividad...", { id: "eliminar-actividad" });

        await eliminarActividad({
          variables: { id },
        });

        // Mostrar toast de éxito
        toast.success("Actividad eliminada exitosamente", {
          id: "eliminar-actividad",
          duration: 3000
        });
      } catch (error) {
        // Mostrar toast de error
        toast.error("Error al eliminar la actividad", {
          id: "eliminar-actividad",
          duration: 3000
        });
        // El error ya es manejado por onError en la configuración del useMutation
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
        // Mostrar toast de carga
        toast.loading("Eliminando tarea...", { id: "eliminar-tarea" });

        await eliminarTarea({
          variables: { id },
        });

        // Mostrar toast de éxito
        toast.success("Tarea eliminada exitosamente", {
          id: "eliminar-tarea",
          duration: 3000
        });
      } catch (error) {
        // Mostrar toast de error
        toast.error("Error al eliminar la tarea", {
          id: "eliminar-tarea",
          duration: 3000
        });
        // El error ya es manejado por onError en la configuración del useMutation
      }
    }
  };

  // Función para determinar si una tarea está vencida
  const estaTareaVencida = (fechaEntrega: string): boolean => {
    const hoy = new Date();
    const fechaLimite = new Date(fechaEntrega);
    return hoy > fechaLimite;
  };

  // Función para obtener la clase de color basada en el estado o fecha de vencimiento
  const getEstadoTareaClass = (tarea: TareaData): string => {
    if (tarea.estado === 'cancelada') return 'text-red-500';
    if (tarea.estado === 'vencida' || estaTareaVencida(tarea.fechaEntrega)) return 'text-orange-500';
    return 'text-green-500';
  };

  if (loading || loadingActividades || loadingTareas) return <div>Cargando...</div>;

  // Manejar errores específicamente
  if (error) return <div>Error al cargar el curso: {error}</div>;
  if (errorActividades)
    return <div>Error al cargar las actividades: {errorActividades.message}</div>;
  if (errorTareas)
    return <div>Error al cargar las tareas: {errorTareas.message}</div>;

  // Verificar que los datos existan
  if (!curso) return <div>No se encontró información del curso</div>;

  // Asegurarse de que actividades sea siempre un array, incluso si es undefined
  const actividades: ActividadData[] =
    actividadesData?.obtenerActividadesPorArea || [];

  // Asegurarse de que tareas sea siempre un array, incluso si es undefined
  const tareas: TareaData[] =
    tareasData?.obtenerTareasPorGradoYArea || [];

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
            Curso - {curso.nombre} / {curso.area.nombre}
          </h1>
          <Button radius="sm" as={Link} color="primary" href={"/admin/cursos"}>
            Volver
          </Button>
        </div>
        <div className="space-y-10">
          {/* Sección de estudiantes */}
          <div className="space-y-4">
            <div className="space-y-4 md:flex justify-between items-center">
              <h2 className="text-gray-600 text-xl">Estudiantes</h2>
              <Button
                className="max-sm:w-full"
                radius="sm"
                as={Link}
                color="primary"
                href={`/maestro/cursos/${id}/areas/${area_id}/calificaciones`}
                variant="solid"
              >
                Calificaciones
              </Button>
            </div>
            {/* Verificar que estudiantes exista antes de pasarlo al componente */}
            {curso.estudiantes && curso.estudiantes.length > 0 ? (
              <EstudiantesResponsive estudiantes={curso.estudiantes} />
            ) : (
              <p className="text-yellow-500">
                No hay estudiantes en este curso
              </p>
            )}
          </div>

          {/* Sección de Tareas */}
          <div className="space-y-5">
            <div className="sm:flex justify-between items-center max-sm:space-y-3">
              <h2 className="text-gray-600 text-xl">Tareas asignadas</h2>
              <Button
                className="max-sm:w-full"
                radius="sm"
                as={Link}
                color="primary"
                href={`/maestro/cursos/${id}/areas/${area_id}/tareas/agregar`}
                variant="solid"
              >
                Crear tarea
              </Button>
            </div>
            <div className="space-y-4">
              {tareas.length > 0 ? (
                tareas.map((tarea) => (
                  <div key={tarea.id} className="border rounded-lg">
                    <div className="p-5">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-lg">
                            {tarea.nombre}
                          </h3>
                          <span className={`font-semibold ${getEstadoTareaClass(tarea)}`}>
                            {tarea.estado === 'activa'
                              ? estaTareaVencida(tarea.fechaEntrega)
                                ? 'Vencida'
                                : 'Activa'
                              : tarea.estado === 'vencida'
                                ? 'Vencida'
                                : 'Cancelada'}
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:gap-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Fecha de asignación:</span> {formatearFecha(tarea.fecha)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Fecha de entrega:</span> {formatearFecha(tarea.fechaEntrega)}
                          </p>
                        </div>
                        <p className="break-words">{tarea.descripcion}</p>
                      </div>

                      {/* Galería con scroll horizontal y flechas de navegación */}
                      {(tarea.fotos?.length > 0 || tarea.pdfs?.length > 0) && (
                        <div className="mt-4">
                          <p className="font-medium text-gray-700 mb-2">
                            {tarea.fotos?.length > 0 && tarea.pdfs?.length > 0
                              ? "Archivos adjuntos:"
                              : tarea.fotos?.length > 0
                                ? "Fotos:"
                                : "Documentos:"}
                          </p>
                          <div className="relative group">
                            {/* Flecha izquierda */}
                            <button
                              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                const container = e.currentTarget.nextElementSibling as HTMLElement;
                                if (container) {
                                  container.scrollBy({ left: -200, behavior: 'smooth' });
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {/* Contenedor con scroll horizontal */}
                            <div
                              className="flex overflow-x-auto px-2 pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-x overflow-y-hidden"
                              style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
                            >
                              {/* Renderizar fotos */}
                              {tarea.fotos?.map((foto, index) => (
                                <div key={`foto-${index}`} className="flex-none w-36 h-36 md:w-48 md:h-48 snap-start">
                                  <img
                                    src={`${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                                    alt={`Foto ${index + 1}`}
                                    className="h-full w-full bg-gray-50 p-2 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => mostrarImagen(tarea.fotos, index)}
                                  />
                                </div>
                              ))}

                              {/* Renderizar PDFs */}
                              {tarea.pdfs?.map((pdfUrl, index) => (
                                <div key={`pdf-${index}`} className="flex-none w-36 h-36 md:w-48 md:h-48 snap-start">
                                  <PDFThumbnail
                                    url={pdfUrl}
                                    index={index}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Flecha derecha */}
                            <button
                              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                const container = e.currentTarget.previousElementSibling as HTMLElement;
                                if (container) {
                                  container.scrollBy({ left: 200, behavior: 'smooth' });
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      <Divider />
                      <div className="flex gap-2 justify-end p-2">
                        <Button
                          color="primary"
                          size="md"
                          variant="light"
                          as={Link}
                          href={`/maestro/cursos/${id}/areas/${area_id}/tareas/actualizar/${tarea.id}`}
                        >
                          Actualizar
                        </Button>
                        <Button
                          color="danger"
                          size="md"
                          variant="light"
                          onPress={() => handleEliminarTarea(tarea.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-yellow-500">No hay tareas asignadas aún</p>
              )}
            </div>
          </div>

          {/* Sección de Actividades */}
          <div className="space-y-5">
            <div className="sm:flex justify-between items-center max-sm:space-y-3">
              <h2 className="text-gray-600 text-xl">Actividades recientes</h2>
              <Button
                className="max-sm:w-full"
                radius="sm"
                as={Link}
                color="primary"
                href={`/maestro/cursos/${id}/areas/${area_id}/actividades/agregar`}
                variant="solid"
              >
                Crear actividad
              </Button>
            </div>
            <div className="space-y-4">
              {actividades.length > 0 ? (
                actividades.map((actividad) => (
                  <div key={actividad.id} className="border rounded-lg">
                    <div className="p-5">
                      <div className="space-y-2">
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg">
                            {actividad.nombre}
                          </h3>
                          <div className="flex max-sm:flex-col sm:gap-3 text-sm text-gray-600">
                            <p className="font-medium">Fecha de asignación: <span>{formatearFecha(actividad.fecha)}</span></p>
                            <p className="font-medium">Hora: <span>{convertirA12Horas(actividad.hora)}</span></p>
                          </div>
                        </div>
                        <p className="text-gray-700 break-words">{actividad.descripcion}</p>
                      </div>

                      {/* Galería con scroll horizontal y flechas de navegación */}
                      {(actividad.fotos?.length > 0 || actividad.pdfs?.length > 0) && (
                        <div className="mt-4">
                          <p className="font-medium text-gray-700 mb-2">
                            {actividad.fotos?.length > 0 && actividad.pdfs?.length > 0
                              ? "Archivos adjuntos:"
                              : actividad.fotos?.length > 0
                                ? "Fotos:"
                                : "Documentos:"}
                          </p>
                          <div className="relative group">
                            {/* Flecha izquierda */}
                            <button
                              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                const container = e.currentTarget.nextElementSibling as HTMLElement;
                                if (container) {
                                  container.scrollBy({ left: -200, behavior: 'smooth' });
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {/* Contenedor con scroll horizontal */}
                            <div
                              className="flex overflow-x-auto px-2 pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-x overflow-y-hidden"
                              style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
                            >
                              {/* Renderizar fotos */}
                              {actividad.fotos?.map((foto, index) => (
                                <div key={`foto-${index}`} className="flex-none w-36 h-36 md:w-48 md:h-48 snap-start">
                                  <img
                                    src={`${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                                    alt={`Foto ${index + 1}`}
                                    className="h-full w-full bg-gray-50 p-2 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => mostrarImagen(actividad.fotos, index)}
                                  />
                                </div>
                              ))}

                              {/* Renderizar PDFs */}
                              {actividad.pdfs?.map((pdfUrl, index) => (
                                <div key={`pdf-${index}`} className="flex-none w-36 h-36 md:w-48 md:h-48 snap-start">
                                  <PDFThumbnail
                                    url={pdfUrl}
                                    index={index}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Flecha derecha */}
                            <button
                              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                const container = e.currentTarget.previousElementSibling as HTMLElement;
                                if (container) {
                                  container.scrollBy({ left: 200, behavior: 'smooth' });
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      <Divider />
                      <div className="flex gap-2 justify-end p-2">
                        <Button
                          color="primary"
                          size="md"
                          variant="light"
                          as={Link}
                          href={`/maestro/cursos/${id}/areas/${area_id}/actividades/actualizar/${actividad.id}`}
                        >
                          Actualizar
                        </Button>
                        <Button
                          color="danger"
                          size="md"
                          variant="light"
                          onPress={() => handleEliminarActividad(actividad.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-yellow-500">No hay actividades creadas aún</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen */}
      <ImagenModal
        isOpen={modalVisible}
        onClose={ocultarImagen}
        imagen={imagenActual}
        onPrev={imagenAnterior}
        onNext={imagenSiguiente}
        contador={`${indiceImagen + 1} / ${fotosGaleria.length}`}
      />
    </div>
  );
}