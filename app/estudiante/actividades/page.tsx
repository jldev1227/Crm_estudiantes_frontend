"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { OBTENER_AREAS_POR_GRADO } from "@/app/graphql/queries/obtenerAreasPorGrado";
import { formatearFecha } from "@/helpers/formatearFecha";
import { OBTENER_ACTIVIDADES_ESTUDIANTE } from "@/app/graphql/queries/obtenerActividadesEstudiante";

// Definir los tipos
interface Area {
  id: string;
  nombre: string;
}

interface Actividad {
  id: string;
  nombre: string;
  fecha: string;
  descripcion: string;
  fotos: string[];
  area: Area;
}

// Componente Modal simple para mostrar imágenes
const ImagenModal = ({ isOpen, onClose, imagen, onPrev, onNext, contador } :{
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
    const manejarTeclas = (e : KeyboardEvent) => {
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
  } = useQuery(OBTENER_ACTIVIDADES_ESTUDIANTE, {
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
    if (!actividadesData?.obtenerActividadesEstudiante) return;

    let filtradas = [...actividadesData.obtenerActividadesEstudiante];

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
        
        return nombreNormalizado.includes(textoBusquedaNormalizado) || 
               descripcionNormalizada.includes(textoBusquedaNormalizado);
      });
    }

    // Filtrar por fecha
    if (fechaFiltro) {
      const fechaObj = new Date(fechaFiltro);
      fechaObj.setHours(0, 0, 0, 0);

      filtradas = filtradas.filter((actividad) => {
        const actividadFecha = new Date(actividad.fecha);
        actividadFecha.setHours(0, 0, 0, 0);
        return actividadFecha.getTime() === fechaObj.getTime();
      });
    }

    setActividadesFiltradas(filtradas);
  }, [busqueda, fechaFiltro, areaId, actividadesData]);

  // Manejar cambio de área
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAreaId(e.target.value);
  };

  // Mostrar spinner durante la carga
  if (areasLoading || actividadesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mostrar error si existe
  if (actividadesError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        <p>Error al cargar las actividades. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  // Obtener la lista de áreas
  const areas = areasData?.obtenerAreasPorGrado || [];

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
        Actividades
      </h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Materia
            </label>
            <select
              id="area"
              value={areaId}
              onChange={handleAreaChange}
              className="w-full p-2 border border-gray-300 rounded-md"
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
              htmlFor="busqueda"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar
            </label>
            <input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Buscar actividades..."
            />
          </div>

          <div>
            <label
              htmlFor="fecha"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-center">
          <p>No se encontraron actividades con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {actividadesFiltradas.map((actividad) => (
            <div
              key={actividad.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {actividad.nombre}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatearFecha(actividad.fecha)}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {actividad.area?.nombre}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 break-words">
                    {actividad.descripcion}
                  </p>
                </div>

                {/* Galería de fotos */}
                {actividad.fotos && actividad.fotos.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">Fotos:</p>
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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