"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { useMaestro } from "@/app/context/MaestroContext";
import { GUARDAR_CALIFICACIONES } from "@/app/graphql/mutation/guardarCalificaciones";

const SistemaCalificaciones = () => {
  const params = useParams();
  const router = useRouter();
  const grado_id = params?.curso as string;
  const area_id = params?.area as string;

  // Constants
  const REGULAR_ACTIVITIES_PERCENTAGE = 70;
  const FINAL_EVALUATION_PERCENTAGE = 30;

  // Use the MaestroContext
  const {
    obtenerCurso,
    obtenerCalificaciones,
    establecerPeriodo,
    curso,
    area,
    calificaciones: calificacionesContext,
    periodoSeleccionado
  } = useMaestro();

  // Estados locales
  const [actividades, setActividades] = useState([
    { id: "final", nombre: "Evaluación Final", porcentaje: 30, isFinal: true }
  ]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [calificaciones, setCalificaciones] = useState({});
  const [editando, setEditando] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({ nombre: "", porcentaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GraphQL mutation
  const [guardarCalificaciones, { loading: guardandoCalificaciones }] = useMutation(GUARDAR_CALIFICACIONES, {
    onCompleted: (data) => {
      if (data.guardarCalificaciones.success) {
        toast.success(data.guardarCalificaciones.mensaje || "Calificaciones guardadas con éxito");
        // Actualizar los datos desde el contexto
        obtenerCalificaciones(grado_id, area_id, periodoSeleccionado);
      } else {
        toast.error(data.guardarCalificaciones.mensaje || "Error al guardar calificaciones");
      }
      setLoading(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setError(error.message);
      setLoading(false);
    }
  });

  // Efecto para cargar datos del curso
  const fetchData = useCallback(async () => {
    if (!grado_id || !area_id) return;

    try {
      // Cargar datos del curso
      await obtenerCurso(grado_id, area_id);

      // Cargar calificaciones para el periodo seleccionado
      await obtenerCalificaciones(grado_id, area_id, periodoSeleccionado);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    }
  }, [grado_id, area_id, periodoSeleccionado, obtenerCurso, obtenerCalificaciones]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const mounted = { current: true };

    if (mounted.current) {
      fetchData();
    }

    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  // Efecto para cargar estudiantes cuando se obtienen los datos del curso
  useEffect(() => {
    if (curso?.estudiantes) {
      setEstudiantes(curso.estudiantes);
    }
  }, [curso]);

  // Efecto para cargar calificaciones existentes desde el contexto
  useEffect(() => {
    if (calificacionesContext) {
      const nuevasCalificaciones = {};

      calificacionesContext.forEach(calificacion => {
        nuevasCalificaciones[calificacion.estudiante_id] = {};

        calificacion.notas.forEach(nota => {
          nuevasCalificaciones[calificacion.estudiante_id][nota.id] = nota.valor;
        });
      });

      setCalificaciones(nuevasCalificaciones);
    }
  }, [calificacionesContext]);

  // Efecto para inicializar la estructura de calificaciones con los estudiantes disponibles
  useEffect(() => {
    if (estudiantes.length > 0 && Object.keys(calificaciones).length === 0) {
      const nuevasCalificaciones = {};

      estudiantes.forEach(estudiante => {
        nuevasCalificaciones[estudiante.id] = {};

        actividades.forEach(actividad => {
          nuevasCalificaciones[estudiante.id][actividad.id] = '';
        });
      });

      setCalificaciones(nuevasCalificaciones);
    }
  }, [estudiantes, actividades]);

  // Función para distribuir porcentajes equitativamente entre actividades regulares
  const distribuirPorcentajes = useCallback((actividadesRegulares, actividadesFinal) => {
    if (actividadesRegulares.length === 0) {
      return []; // Si no hay actividades regulares, devolver array vacío
    }

    // El nuevo porcentaje para cada actividad regular (total 70% dividido equitativamente)
    const nuevoPorcentaje = REGULAR_ACTIVITIES_PERCENTAGE / actividadesRegulares.length;

    // Actualizar los porcentajes
    const nuevasActividadesRegulares = actividadesRegulares.map(act => ({
      ...act,
      porcentaje: nuevoPorcentaje
    }));

    return [...nuevasActividadesRegulares, ...actividadesFinal];
  }, []);

  // Manejar cambio de periodo
  const handlePeriodoChange = (periodo) => {
    establecerPeriodo(parseInt(periodo));
  };

  // Manejar cambio de calificación
  const handleCalificacionChange = (estudianteId, actividadId, valor) => {
    // Validar que la nota esté entre 0 y 5
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) && valor !== '') {
      return;
    }

    if (valorNumerico < 0 || valorNumerico > 5) {
      return;
    }

    setCalificaciones(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [actividadId]: valor
      }
    }));
  };

  // Añadir nueva actividad
  const handleAddActividad = () => {
    if (!nuevaActividad.nombre) {
      toast.error("Ingrese nombre para la nueva actividad");
      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter(act => !act.isFinal);
    const actividadesFinal = actividades.filter(act => act.isFinal);

    // Crear la nueva actividad
    const nuevaActividadObj = {
      id: `act${actividades.length + 1}`,
      nombre: nuevaActividad.nombre,
    };

    // Añadir la nueva actividad a las actividades regulares
    const nuevasActividadesRegulares = [...actividadesRegulares, nuevaActividadObj];

    // Redistribuir porcentajes automáticamente
    const nuevasActividades = distribuirPorcentajes(nuevasActividadesRegulares, actividadesFinal);
    setActividades(nuevasActividades);

    // Actualizar la estructura de calificaciones
    setCalificaciones(prev => {
      const nuevo = { ...prev };
      Object.keys(nuevo).forEach(estudianteId => {
        nuevo[estudianteId][nuevaActividadObj.id] = '';
      });
      return nuevo;
    });

    // Reiniciar el formulario
    setNuevaActividad({ nombre: "" });

    toast.success(`Actividad "${nuevaActividad.nombre}" añadida. Porcentajes redistribuidos automáticamente.`);
  };

  // Recalcular porcentajes
  const recalcularPorcentajes = () => {
    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter(act => !act.isFinal);
    const actividadesFinal = actividades.filter(act => act.isFinal);

    if (actividadesRegulares.length === 0) {
      toast.error("No hay actividades regulares para redistribuir");
      return;
    }

    // Distribuir porcentajes y actualizar actividades
    const nuevasActividades = distribuirPorcentajes(actividadesRegulares, actividadesFinal);
    setActividades(nuevasActividades);

    toast.success("Porcentajes redistribuidos equitativamente");
  };

  // Calcular nota final para un estudiante
  const calcularNotaFinal = (estudianteId) => {
    if (!calificaciones[estudianteId]) return "-";

    let notaFinal = 0;
    let porcentajeTotal = 0;

    actividades.forEach(actividad => {
      const valor = parseFloat(calificaciones[estudianteId][actividad.id]);
      if (!isNaN(valor)) {
        notaFinal += (valor * (actividad.porcentaje / 100));
        porcentajeTotal += actividad.porcentaje;
      }
    });

    if (porcentajeTotal === 0) return "-";

    // Ajustar según el porcentaje evaluado
    return (notaFinal * (100 / porcentajeTotal)).toFixed(2);
  };

  // Eliminar actividad
  const handleEliminarActividad = (actividadId) => {
    if (actividades.length <= 1) {
      toast.error("Debe haber al menos una actividad");
      return;
    }

    // No permitir eliminar la evaluación final
    const actividad = actividades.find(act => act.id === actividadId);
    if (actividad.isFinal) {
      toast.error("No se puede eliminar la evaluación final");
      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter(act => !act.isFinal);
    const actividadesFinal = actividades.filter(act => act.isFinal);

    // Eliminar la actividad de las actividades regulares
    const nuevasActividadesRegulares = actividadesRegulares.filter(act => act.id !== actividadId);

    if (nuevasActividadesRegulares.length === 0) {
      toast.error("Debe haber al menos una actividad regular");
      return;
    }

    // Redistribuir porcentajes automáticamente
    const nuevasActividades = distribuirPorcentajes(nuevasActividadesRegulares, actividadesFinal);
    setActividades(nuevasActividades);

    // Actualizar calificaciones
    setCalificaciones(prev => {
      const nuevo = { ...prev };
      Object.keys(nuevo).forEach(estudianteId => {
        const nuevoEstudiante = { ...nuevo[estudianteId] };
        delete nuevoEstudiante[actividadId];
        nuevo[estudianteId] = nuevoEstudiante;
      });
      return nuevo;
    });

    toast.success(`Actividad eliminada. Porcentajes redistribuidos automáticamente.`);
  };

  // Guardar calificaciones
  const handleGuardarCalificaciones = async () => {
    setLoading(true);
    setError("");

    try {
      const calificacionesSubmit = estudiantes.map(estudiante => ({
        estudiante_id: estudiante.id,
        notas: actividades.map(actividad => ({
          actividad_id: actividad.id,
          nombre: actividad.nombre,
          valor: parseFloat(calificaciones[estudiante.id][actividad.id] || 0),
          porcentaje: actividad.porcentaje
        }))
      }));

      await guardarCalificaciones({
        variables: {
          input: {
            grado_id,
            area_id,
            periodo: periodoSeleccionado,
            calificaciones: calificacionesSubmit
          }
        }
      });
    } catch (error) {
      console.error("Error al guardar calificaciones:", error);
      setError("Ocurrió un error al guardar las calificaciones. Por favor, intenta de nuevo.");
      setLoading(false);
    }
  };

  // Verificar porcentajes totales y mostrar advertencias si es necesario
  const verificarPorcentajes = () => {
    const actividadesRegulares = actividades.filter(act => !act.isFinal);
    const actividadesFinal = actividades.filter(act => act.isFinal);

    const totalRegulares = actividadesRegulares.reduce((sum, act) => sum + act.porcentaje, 0);
    const totalFinal = actividadesFinal.reduce((sum, act) => sum + act.porcentaje, 0);

    return {
      totalRegulares,
      totalFinal,
      total: totalRegulares + totalFinal,
      esValido: Math.abs(totalRegulares - REGULAR_ACTIVITIES_PERCENTAGE) < 0.1 &&
        Math.abs(totalFinal - FINAL_EVALUATION_PERCENTAGE) < 0.1
    };
  };

  // Verificar si hay notas para mostrar advertencia
  const hayNotasSinCompletar = () => {
    let incompleto = false;
    Object.keys(calificaciones).forEach(estudianteId => {
      Object.keys(calificaciones[estudianteId]).forEach(actividadId => {
        if (calificaciones[estudianteId][actividadId] === '') {
          incompleto = true;
        }
      });
    });
    return incompleto;
  };

  // Renderizado - Mostrar loading mientras carga
  if (!curso) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar porcentajes
  const porcentajes = verificarPorcentajes();

  return (
    <div className="space-y-6">
      {/* Encabezado responsivo */}
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
          Curso - {curso.nombre} {area ? `/ ${area.nombre}` : ""}
        </h1>
        <div className="w-full md:w-auto">
          <Select
            label="Periodo"
            selectedKeys={[periodoSeleccionado.toString()]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0] as string;
              handlePeriodoChange(key);
            }}
            className="w-full md:w-40"
          >
            <SelectItem key="1">Periodo 1</SelectItem>
            <SelectItem key="2">Periodo 2</SelectItem>
            <SelectItem key="3">Periodo 3</SelectItem>
            <SelectItem key="4">Periodo 4</SelectItem>
          </Select>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Advertencia de notas incompletas */}
      {hayNotasSinCompletar() && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">⚠️ Hay estudiantes con notas sin completar</p>
          <p className="text-sm">Las notas vacías serán calculadas como 0 al guardar</p>
        </div>
      )}

      {/* Advertencia de porcentajes incorrectos - mejorada para móvil */}
      {!porcentajes.esValido && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">⚠️ Los porcentajes no están correctamente distribuidos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-1">
            <p className="text-sm">Actividades regulares: {porcentajes.totalRegulares.toFixed(1)}% (debe ser 70%)</p>
            <p className="text-sm">Evaluación final: {porcentajes.totalFinal.toFixed(1)}% (debe ser 30%)</p>
            <p className="text-sm">Total: {porcentajes.total.toFixed(1)}% (debe ser 100%)</p>
          </div>
          <div className="mt-2">
            <Button
              color="warning"
              size="sm"
              fullWidth={true}
              className="sm:w-auto"
              onPress={recalcularPorcentajes}
            >
              Redistribuir porcentajes automáticamente
            </Button>
          </div>
        </div>
      )}

      {/* Gestión de actividades */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-bold">Actividades de Evaluación</h2>
          <Button
            color="primary"
            variant="light"
            fullWidth={true}
            className="sm:w-auto"
            onPress={() => setEditando(!editando)}
          >
            {editando ? "Cancelar" : "Editar Actividades"}
          </Button>
        </div>

        {editando && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-3">Actividades Configuradas</h3>
            <div className="overflow-x-auto">
              <Table
                aria-label="Tabla de actividades"
                removeWrapper
                classNames={{
                  td: "px-2 py-2"
                }}
              >
                <TableHeader>
                  <TableColumn>Nombre</TableColumn>
                  <TableColumn>Porcentaje</TableColumn>
                  <TableColumn className="hidden sm:table-cell">Tipo</TableColumn>
                  <TableColumn>Acciones</TableColumn>
                </TableHeader>
                <TableBody>
                  {actividades.map((actividad) => (
                    <TableRow key={actividad.id} className={actividad.isFinal ? "bg-blue-50" : ""}>
                      <TableCell>{actividad.nombre}</TableCell>
                      <TableCell>{actividad.porcentaje.toFixed(1)}%</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {actividad.isFinal ? "Evaluación Final" : "Actividad Regular"}
                      </TableCell>
                      <TableCell>
                        {!actividad.isFinal && (
                          <Button
                            color="danger"
                            variant="light"
                            size="sm"
                            onPress={() => handleEliminarActividad(actividad.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Añadir Nueva Actividad</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Nombre de la actividad"
                    placeholder="Ej: Taller 3"
                    value={nuevaActividad.nombre}
                    onValueChange={(val) => setNuevaActividad({ ...nuevaActividad, nombre: val })}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <Button
                    color="primary"
                    className="w-full sm:w-auto"
                    onPress={handleAddActividad}
                  >
                    Añadir
                  </Button>
                  {/* <Button
                    color="secondary"
                    className="w-full sm:w-auto"
                    onPress={recalcularPorcentajes}
                  >
                    Distribuir 70% Equitativo
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribución de porcentajes actual - mejorado para móvil */}
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Distribución actual:</h3>
          <div className="flex flex-wrap gap-2">
            {actividades.map((actividad) => (
              <div
                key={actividad.id}
                className={`px-3 py-1 rounded-full text-sm ${actividad.isFinal
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
                  }`}
              >
                {actividad.nombre}: {actividad.porcentaje.toFixed(1)}%
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600 flex flex-col sm:flex-row sm:gap-2">
            <span>Total actividades regulares: {porcentajes.totalRegulares.toFixed(1)}%</span>
            <span className="hidden sm:inline">|</span>
            <span>Evaluación final: {porcentajes.totalFinal.toFixed(1)}%</span>
            <span className="hidden sm:inline">|</span>
            <span>Total: {porcentajes.total.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Tabla de calificaciones con HeroUI - mejorada para móvil */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className='mb-4 space-y-2'>
          <h2 className="text-xl font-bold">Registro de Calificaciones</h2>
          <p className="text-blue-600">
            Total estudiantes: {estudiantes.length}
          </p>
        </div>

        {estudiantes.length > 0 ? (
          <div className="overflow-x-auto -mx-4 px-4">
            <Table
              aria-label="Tabla de calificaciones"
              removeWrapper
              isHeaderSticky
              classNames={{
                base: "max-h-[600px]",
                table: "min-h-[150px] min-w-[640px]", // Asegura un ancho mínimo para scroll horizontal
              }}
            >
              <TableHeader>
                <TableColumn className="bg-gray-50 sticky left-0 z-10 min-w-[150px]">Estudiante</TableColumn>
                {actividades.map(actividad => (
                  <TableColumn key={actividad.id}>
                    <div className="text-center whitespace-normal px-1">
                      <div className="font-medium">{actividad.nombre}</div>
                      <div className="text-xs text-gray-500">{actividad.porcentaje.toFixed(1)}%</div>
                    </div>
                  </TableColumn>
                ))}
                <TableColumn>Nota Final</TableColumn>
              </TableHeader>
              <TableBody>
                {estudiantes.map(estudiante => (
                  <TableRow key={estudiante.id}>
                    <TableCell className="font-medium sticky left-0 bg-white min-w-[150px]">
                      {estudiante.nombre_completo}
                    </TableCell>

                    {actividades.map(actividad => (
                      <TableCell key={`${estudiante.id}-${actividad.id}`} className="text-center">
                        <input
                          type="number"
                          className="w-16 p-1 border rounded text-center"
                          min="0"
                          max="5"
                          step="0.1"
                          value={calificaciones[estudiante.id]?.[actividad.id] || ''}
                          onChange={(e) => handleCalificacionChange(estudiante.id, actividad.id, e.target.value)}
                        />
                      </TableCell>
                    ))}

                    <TableCell className="text-center font-bold">
                      <span className={`${parseFloat(calcularNotaFinal(estudiante.id)) >= 3.5
                        ? "text-green-600"
                        : parseFloat(calcularNotaFinal(estudiante.id)) >= 3.0
                          ? "text-yellow-600"
                          : "text-red-600"
                        }`}>
                        {calcularNotaFinal(estudiante.id)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay estudiantes registrados para este curso
          </div>
        )}
      </div>

      {/* Botones de acción - mejor responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
        <Button
          radius='sm'
          color="danger"
          variant="light"
          className="w-full sm:w-auto"
          onPress={() => router.back()}
        >
          Volver
        </Button>
        <Button
          radius='sm'
          color="primary"
          className="w-full sm:w-auto"
          onPress={handleGuardarCalificaciones}
          isLoading={loading || guardandoCalificaciones}
          isDisabled={!porcentajes.esValido}
        >
          Guardar Calificaciones
        </Button>
      </div>
    </div>
  );
};

export default SistemaCalificaciones;