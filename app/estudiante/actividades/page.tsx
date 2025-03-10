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

export default function ActividadesPage() {
  const searchParams = useSearchParams();
  const initialAreaId = searchParams.get("area");

  const [areaId, setAreaId] = useState(initialAreaId || "");
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const { usuario } = useAuth();

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
    refetch,
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

  // Actualizar actividades cuando cambian los datos
  useEffect(() => {
    if (actividadesData?.obtenerActividadesEstudiante) {
      setActividadesFiltradas(actividadesData.obtenerActividadesEstudiante);
    }
  }, [actividadesData]);

  // Aplicar filtros cuando cambia la búsqueda o la fecha
  useEffect(() => {
    if (!actividadesData?.obtenerActividadesPorArea) return;

    let filtradas = [...actividadesData.obtenerActividadesPorArea];

    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      const textoBusqueda = busqueda.toLowerCase();
      filtradas = filtradas.filter(
        (actividad) =>
          actividad.nombre.toLowerCase().includes(textoBusqueda) ||
          actividad.descripcion.toLowerCase().includes(textoBusqueda),
      );
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

    if (areaId) {
      filtradas = filtradas.filter((actividad) => actividad.area.id === areaId);
    }

    setActividadesFiltradas(filtradas);
  }, [busqueda, fechaFiltro, actividadesData]);

  // Manejar cambio de área
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAreaId(e.target.value);
    // Resetear filtros al cambiar de área
    setBusqueda("");
    setFechaFiltro("");
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
                    <div>
                      {actividad.fotos && actividad.fotos.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4">
                          {actividad.fotos.map((foto, index) => (
                            <img
                              key={index}
                              src={`${foto}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                              alt={`Foto ${index + 1}`}
                              className="w-16 h-16 md:w-24 md:h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
