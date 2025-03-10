"use client";

import { useMutation, useQuery } from "@apollo/client";
import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { formatearFecha } from "@/helpers/formatearFecha";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OBTENER_CURSO } from "@/app/graphql/queries/obtenerCurso";
import { ELIMINAR_ACTIVIDAD } from "@/app/graphql/mutation/eliminarActividad";
import { Divider } from "@heroui/divider";
import { OBTENER_ACTIVIDADES_POR_AREA } from "@/app/graphql/obtenerActividadesPorArea";
import { useState, useEffect } from "react";

// Define el tipo de los datos que obtendrás del servidor
type CursoData = {
  id: string;
  nombre: string;
  estudiantes: any[];
  area?: AreaData; // Hacerlo opcional por si no viene del servidor
};

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
  fotos: string[];
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

  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenActual, setImagenActual] = useState("");
  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);
  const [indiceImagen, setIndiceImagen] = useState(0);

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

  const {
    loading: loadingCurso,
    error: errorCurso,
    data: cursoData,
  } = useQuery(OBTENER_CURSO, {
    variables: { id, area_id },
  });

  const {
    loading: loadingActividades,
    error: errorActividades,
    data: actividadesData,
  } = useQuery(OBTENER_ACTIVIDADES_POR_AREA, {
    variables: { grado_id: id, area_id },
  });

  const [eliminarActividad, { loading: loadingDelete }] = useMutation(
    ELIMINAR_ACTIVIDAD,
    {
      refetchQueries: ["ObtenerActividadesPorArea"],
      onError: (error) => {
        console.error("Error al eliminar actividad:", error);
        // Opcionalmente, maneja errores con una notificación
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
        await eliminarActividad({
          variables: { id },
        });
        // Opcionalmente, muestra una notificación de éxito
      } catch (error) {
        // El error ya es manejado por onError en la configuración del useMutation
      }
    }
  };

  if (loadingCurso || loadingActividades) return <div>Cargando...</div>;

  // Manejar errores específicamente
  if (errorCurso)
    return <div>Error al cargar el curso: {errorCurso.message}</div>;
  if (errorActividades)
    return (
      <div>Error al cargar las actividades: {errorActividades.message}</div>
    );

  // Verificar que los datos existan
  if (!cursoData?.obtenerCurso)
    return <div>No se encontró información del curso</div>;

  const curso: CursoData = cursoData.obtenerCurso;

  // Asegurarse de que actividades sea siempre un array, incluso si es undefined
  const actividades: ActividadData[] =
    actividadesData?.obtenerActividadesPorArea || [];

  return (
    <div className="">
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
          Curso - {curso.nombre} {curso.area ? `/ ${curso.area.nombre}` : ""}
        </h1>
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-gray-600 text-xl">Estudiantes</h2>
            {/* Verificar que estudiantes exista antes de pasarlo al componente */}
            {curso.estudiantes && curso.estudiantes.length > 0 ? (
              <EstudiantesResponsive estudiantes={curso.estudiantes} />
            ) : (
              <p className="text-yellow-500">
                No hay estudiantes en este curso
              </p>
            )}
          </div>
          <div className="space-y-5">
            <div className="sm:flex justify-between items-center max-sm:space-y-3">
              <h2 className="text-gray-600 text-xl">Actividades recientes</h2>
              <Button
                className="max-sm:w-full"
                as={Link}
                color="primary"
                href={`/maestro/cursos/${id}/areas/${area_id}/agregar`} // Asegúrate de que la ruta sea correcta
                variant="solid"
              >
                Crear actividad
              </Button>
            </div>
            <div className="space-y-4">
              {actividades.length > 0 ? (
                actividades.map((actividad) => (
                  <div key={actividad.id} className="border rounded-lg">
                    <div className="space-y-2 p-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {actividad.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatearFecha(actividad.fecha)}
                        </p>
                      </div>
                      <p className="break-words">{actividad.descripcion}</p>
                    </div>
                    {actividad.fotos && actividad.fotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4">
                        {actividad.fotos.map((foto, index) => (
                          <img
                            key={index}
                            src={`${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                            alt={`Foto ${index + 1}`}
                            className="w-16 h-16 md:w-24 md:h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => mostrarImagen(actividad.fotos, index)}
                          />
                        ))}
                      </div>
                    )}
                    <Divider />
                    <div className="flex gap-2 justify-end p-2">
                      <Button
                        color="primary"
                        size="sm"
                        variant="light"
                        as={Link}
                        href={`/maestro/cursos/${id}/areas/${area_id}/actualizar/${actividad.id}`}
                      >
                        Actualizar
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleEliminarActividad(actividad.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-red-500">No hay actividades creadas aún</p>
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