"use client";

import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { useRouter, useParams } from "next/navigation";

import { Estudiante } from "@/types";
import TablaEstudiantes from "@/components/TablaEstudiantes";

const DocumentIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Opciones de filtrado y ordenamiento
type SortField =
  | "nombre_completo"
  | "numero_identificacion"
  | "tipo_documento"
  | "fecha_nacimiento"
  | "pension_activa"
  | "ver_calificaciones";
type SortDirection = "asc" | "desc";
type PensionFilter = "todas" | "activa" | "inactiva";
type CalificacionesFilter = "todas" | "activa" | "inactiva";

// Extender el tipo Estudiante para incluir pension_activa
interface EstudianteConPension extends Estudiante {
  pension_activa?: boolean;
}

// Calcular edad basada en fecha de nacimiento
const calcularEdad = (fechaNacimiento: string): number => {
  try {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    const mesNacimiento = fechaNac.getMonth();
    const diaNacimiento = fechaNac.getDate();

    // Ajustar edad si aún no ha cumplido años en el año actual
    if (
      mesNacimiento > mesActual ||
      (mesNacimiento === mesActual && diaNacimiento > diaActual)
    ) {
      edad--;
    }

    return edad > 0 ? edad : 0;
  } catch (error) {
    console.error("Error al calcular edad:", error);

    return 0;
  }
};

export default function EstudiantesResponsive({
  estudiantes,
  isAdmin,
  isDirector,
  isVisible,
  handlePension,
  handleCalificaciones,
}: {
  estudiantes: Estudiante[];
  isAdmin?: boolean;
  isDirector?: boolean;
  isVisible?: boolean;
  handlePension?: (id: number) => void;
  handleCalificaciones?: (id: number) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const isDesktop = useMediaQuery({ minWidth: 992 });

  // Estados para búsqueda, filtrado y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombre_completo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [pensionFilter, setPensionFilter] = useState<PensionFilter>("todas");
  const [calificacionesFilter, _] = useState<PensionFilter>("todas");
  const [filtrando, setFiltrando] = useState(false);

  // Estado local de estudiantes para manipulación
  const [estudiantesFiltrados, setEstudiantesFiltrados] =
    useState<EstudianteConPension[]>(estudiantes);

  // Actualizar estudiantes cuando cambia el prop
  useEffect(() => {
    aplicarFiltros(
      estudiantes,
      busqueda,
      sortField,
      sortDirection,
      pensionFilter,
      calificacionesFilter,
    );
  }, [estudiantes]);

  // Función para aplicar todos los filtros y ordenamientos
  const aplicarFiltros = (
    listaEstudiantes: EstudianteConPension[],
    terminoBusqueda: string,
    campoOrden: SortField,
    direccionOrden: SortDirection,
    filtroPension?: PensionFilter,
    filtroCalificaciones?: CalificacionesFilter,
  ) => {
    // Paso 1: Filtrar por término de búsqueda
    let resultado = listaEstudiantes.filter((estudiante) => {
      if (!terminoBusqueda.trim()) return true;

      const termino = terminoBusqueda.toLowerCase();

      return (
        estudiante.nombre_completo.toLowerCase().includes(termino) ||
        estudiante.numero_identificacion.toLowerCase().includes(termino)
      );
    });

    // Paso 2: Filtrar por estado de pensión (solo para admin)
    if (isAdmin && filtroPension !== "todas") {
      resultado = resultado.filter((estudiante) => {
        if (filtroPension === "activa")
          return estudiante.pension_activa === true;
        if (filtroPension === "inactiva")
          return estudiante.pension_activa === false;

        return true;
      });
    }

    // Paso 2: Filtrar por estado de calificaciones (solo para admin)
    if (isAdmin && filtroCalificaciones !== "todas") {
      resultado = resultado.filter((estudiante) => {
        if (filtroCalificaciones === "activa")
          return estudiante.pension_activa === true;
        if (filtroCalificaciones === "inactiva")
          return estudiante.pension_activa === false;

        return true;
      });
    }

    // Paso 3: Ordenar resultados
    resultado.sort((a, b) => {
      // Si el campo de ordenamiento es fecha_nacimiento, convertir a edades
      if (campoOrden === "fecha_nacimiento") {
        const edadA = calcularEdad(a.fecha_nacimiento);
        const edadB = calcularEdad(b.fecha_nacimiento);

        return direccionOrden === "asc" ? edadA - edadB : edadB - edadA;
      }

      // Si el campo de ordenamiento es pension_activa
      if (campoOrden === "pension_activa" && isAdmin) {
        const pensionA = a.pension_activa ? 1 : 0;
        const pensionB = b.pension_activa ? 1 : 0;

        return direccionOrden === "asc"
          ? pensionA - pensionB
          : pensionB - pensionA;
      }

      // Si el campo de ordenamiento es pension_activa
      if (campoOrden === "ver_calificaciones" && isAdmin) {
        const calificacionA = a.ver_calificaciones ? 1 : 0;
        const calificacionB = b.ver_calificaciones ? 1 : 0;

        return direccionOrden === "asc"
          ? calificacionA - calificacionB
          : calificacionB - calificacionA;
      }

      // Para otros campos, comparar strings
      const valorA = String(a[campoOrden] || "").toLowerCase();
      const valorB = String(b[campoOrden] || "").toLowerCase();

      if (direccionOrden === "asc") {
        return valorA.localeCompare(valorB);
      } else {
        return valorB.localeCompare(valorA);
      }
    });

    setEstudiantesFiltrados(resultado);
    setFiltrando(!!terminoBusqueda || filtroPension !== "todas");
  };

  // Manejadores de eventos
  const handleBusquedaChange = (valor: string) => {
    setBusqueda(valor);
    aplicarFiltros(
      estudiantes,
      valor,
      sortField,
      sortDirection,
      pensionFilter,
      calificacionesFilter,
    );
  };

  const handleSortChange = (campo: SortField) => {
    // Si hacemos clic en el mismo campo, cambiamos la dirección
    if (campo === sortField) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";

      setSortDirection(newDirection);
      aplicarFiltros(
        estudiantes,
        busqueda,
        campo,
        newDirection,
        pensionFilter,
        calificacionesFilter,
      );
    } else {
      // Si es un campo diferente, usamos ese campo con dirección ascendente
      setSortField(campo);
      setSortDirection("asc");
      aplicarFiltros(
        estudiantes,
        busqueda,
        campo,
        "asc",
        pensionFilter,
        calificacionesFilter,
      );
    }
  };

  const handlePensionFilterChange = (valor: PensionFilter) => {
    setPensionFilter(valor);
    aplicarFiltros(estudiantes, busqueda, sortField, sortDirection, valor);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setPensionFilter("todas");
    setSortField("nombre_completo");
    setSortDirection("asc");
    aplicarFiltros(estudiantes, "", "nombre_completo", "asc", "todas");
  };

  // Texto del ordenamiento actual para mostrar en botones móviles
  const getSortLabel = () => {
    const fieldLabels: Record<SortField, string> = {
      nombre_completo: "Nombre",
      numero_identificacion: "Documento",
      tipo_documento: "Tipo Doc.",
      fecha_nacimiento: "Edad",
      pension_activa: "Pensión",
      ver_calificaciones: "Puede ver Calificaciones",
    };

    return `${fieldLabels[sortField]} ${sortDirection === "asc" ? "↑" : "↓"}`;
  };

  // Si no hay estudiantes, muestra un mensaje
  if (estudiantes.length === 0) {
    return <p>No hay estudiantes asociados al curso</p>;
  }

  // Componentes de interfaz de búsqueda y filtrado
  const filtrosDesktop = (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            className="w-full"
            label="Buscar estudiante"
            placeholder="Nombre o documento..."
            startContent={
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            value={busqueda}
            onValueChange={handleBusquedaChange}
          />
        </div>

        {isAdmin && (
          <div className="w-full md:w-64">
            <Select
              label="Estado de pensión"
              selectedKeys={[pensionFilter]}
              onChange={(e) =>
                handlePensionFilterChange(e.target.value as PensionFilter)
              }
            >
              <SelectItem key="todas">Todas las pensiones</SelectItem>
              <SelectItem key="activa">Pensión activa</SelectItem>
              <SelectItem key="inactiva">Pensión inactiva</SelectItem>
            </Select>
          </div>
        )}

        <div className="w-full md:w-64">
          <Select
            label="Ordenar por"
            selectedKeys={[sortField]}
            onChange={(e) => handleSortChange(e.target.value as SortField)}
          >
            <SelectItem key="nombre_completo">Nombre completo</SelectItem>
            <SelectItem key="numero_identificacion">
              Número de documento
            </SelectItem>
            <SelectItem key="tipo_documento">Tipo de documento</SelectItem>
            <SelectItem key="fecha_nacimiento">Edad</SelectItem>
            {isAdmin ? (
              <SelectItem key="pension_activa">Estado pensión</SelectItem>
            ) : null}
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            label="Dirección"
            selectedKeys={[sortDirection]}
            onChange={(e) => {
              setSortDirection(e.target.value as SortDirection);
              aplicarFiltros(
                estudiantes,
                busqueda,
                sortField,
                e.target.value as SortDirection,
                pensionFilter,
              );
            }}
          >
            <SelectItem key="asc">Ascendente</SelectItem>
            <SelectItem key="desc">Descendente</SelectItem>
          </Select>
        </div>
      </div>

      {filtrando && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {busqueda && (
              <Chip
                color="primary"
                variant="flat"
                onClose={() => handleBusquedaChange("")}
              >
                Búsqueda: {busqueda}
              </Chip>
            )}

            {isAdmin && pensionFilter !== "todas" && (
              <Chip
                color={pensionFilter === "activa" ? "success" : "danger"}
                variant="flat"
                onClose={() => handlePensionFilterChange("todas")}
              >
                Pensión: {pensionFilter === "activa" ? "Activa" : "Inactiva"}
              </Chip>
            )}

            <Chip color="default" variant="flat">
              Ordenado por: {getSortLabel()}
            </Chip>
          </div>

          <Button
            color="danger"
            size="sm"
            variant="flat"
            onPress={limpiarFiltros}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );

  const filtrosMobile = (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
      <Input
        placeholder="Buscar por nombre o documento..."
        startContent={
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        value={busqueda}
        onValueChange={handleBusquedaChange}
      />

      <div className="flex justify-between gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="flex-1"
              color="primary"
              startContent={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              variant="flat"
            >
              Ordenar
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Opciones de ordenamiento">
            <DropdownItem
              key="nombre"
              onPress={() => handleSortChange("nombre_completo")}
            >
              Nombre{" "}
              {sortField === "nombre_completo" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownItem>
            <DropdownItem
              key="documento"
              onPress={() => handleSortChange("numero_identificacion")}
            >
              Documento{" "}
              {sortField === "numero_identificacion" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownItem>
            <DropdownItem
              key="tipo"
              onPress={() => handleSortChange("tipo_documento")}
            >
              Tipo Doc.{" "}
              {sortField === "tipo_documento" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownItem>
            <DropdownItem
              key="edad"
              onPress={() => handleSortChange("fecha_nacimiento")}
            >
              Edad{" "}
              {sortField === "fecha_nacimiento" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownItem>
            {isAdmin ? (
              <DropdownItem
                key="pension"
                onPress={() => handleSortChange("pension_activa")}
              >
                Pensión{" "}
                {sortField === "pension_activa" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownItem>
            ) : null}
            <DropdownItem
              key="invertir"
              className="text-primary"
              onPress={() => {
                const newDirection = sortDirection === "asc" ? "desc" : "asc";

                setSortDirection(newDirection);
                aplicarFiltros(
                  estudiantes,
                  busqueda,
                  sortField,
                  newDirection,
                  pensionFilter,
                );
              }}
            >
              Invertir dirección ({sortDirection === "asc" ? "Asc ↑" : "Desc ↓"}
              )
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {isAdmin && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="flex-1"
                color={
                  pensionFilter !== "todas"
                    ? pensionFilter === "activa"
                      ? "success"
                      : "danger"
                    : "primary"
                }
                startContent={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                variant="flat"
              >
                Filtrar
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Opciones de filtro de pensión">
              <DropdownItem
                key="todas"
                onPress={() => handlePensionFilterChange("todas")}
              >
                Todas las pensiones
              </DropdownItem>
              <DropdownItem
                key="activa"
                onPress={() => handlePensionFilterChange("activa")}
              >
                Pensión activa
              </DropdownItem>
              <DropdownItem
                key="inactiva"
                onPress={() => handlePensionFilterChange("inactiva")}
              >
                Pensión inactiva
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {filtrando && (
          <Button
            className="flex-1"
            color="danger"
            startContent={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18 18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            variant="flat"
            onPress={limpiarFiltros}
          >
            Limpiar
          </Button>
        )}
      </div>

      {filtrando && (
        <div className="flex flex-wrap gap-2 mt-2">
          {busqueda && (
            <Chip
              color="primary"
              size="sm"
              variant="flat"
              onClose={() => handleBusquedaChange("")}
            >
              {busqueda}
            </Chip>
          )}

          {isAdmin && pensionFilter !== "todas" && (
            <Chip
              color={pensionFilter === "activa" ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {pensionFilter === "activa"
                ? "Pensión activa"
                : "Pensión inactiva"}
            </Chip>
          )}

          <Chip color="default" size="sm" variant="flat">
            {getSortLabel()}
          </Chip>
        </div>
      )}
    </div>
  );

  // Si es desktop, muestra la tabla con filtros
  if (isDesktop) {
    return (
      <div>
        {/* Filtros para escritorio */}
        {filtrosDesktop}

        {/* Tabla con estudiantes filtrados */}
        <TablaEstudiantes
          estudiantes={estudiantesFiltrados}
          isAdmin={isAdmin}
          isDirector={isDirector}
          isVisible={isVisible}
          sortDirection={sortDirection}
          sortField={sortField}
          onCalificacionesChange={handleCalificaciones}
          onPensionChange={handlePension}
          onSortChange={handleSortChange}
        />
      </div>
    );
  }

  // Si es móvil o tablet, muestra cards con filtros
  return (
    <div>
      {/* Filtros para móvil */}
      {filtrosMobile}

      {/* Mensaje con conteo de resultados */}
      <p className="text-sm text-gray-500 mb-4">
        Mostrando {estudiantesFiltrados.length} de {estudiantes.length}{" "}
        estudiantes
      </p>

      {/* Cards de estudiantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {estudiantesFiltrados.map((estudiante: EstudianteConPension) => (
          <Card
            key={estudiante.id}
            className="shadow-sm transition-shadow ease-in-out duration-500 bg-gray-50 hover:shadow-md"
          >
            <div className="space-y-2 p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">
                  {estudiante.nombre_completo}
                </h3>
              </div>
              {isAdmin && (
                <div className="space-x-2">
                  <Chip
                    color={estudiante.pension_activa ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {estudiante.pension_activa
                      ? "Pensión activa"
                      : "Pensión inactiva"}
                  </Chip>
                  <Chip
                    color={estudiante.ver_calificaciones ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {estudiante.ver_calificaciones
                      ? "Calificaciones activa"
                      : "Calificaciones inactiva"}
                  </Chip>
                </div>
              )}

              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Tipo documento:</span>{" "}
                  {estudiante.tipo_documento}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Documento:</span>{" "}
                  {estudiante.numero_identificacion}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Edad:</span>{" "}
                  {calcularEdad(estudiante.fecha_nacimiento)} años
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Teléfono:</span>{" "}
                  {estudiante.celular_padres}
                </p>
              </div>

              {isAdmin && handlePension && (
                <Button
                  fullWidth
                  className="mt-6"
                  color={estudiante.pension_activa ? "danger" : "success"}
                  variant="flat"
                  onPress={() => handlePension(estudiante.id)}
                >
                  {estudiante.pension_activa ? "Desactivar" : "Activar"} pensión
                </Button>
              )}
              {isAdmin && handleCalificaciones && (
                <Button
                  fullWidth
                  className="mt-6"
                  color={estudiante.ver_calificaciones ? "danger" : "success"}
                  variant="flat"
                  onPress={() => handleCalificaciones(estudiante.id)}
                >
                  {estudiante.ver_calificaciones ? "Desactivar" : "Activar"}{" "}
                  calificaciones
                </Button>
              )}

              <Button
                fullWidth
                className="mt-6"
                color="warning"
                variant="flat"
                onPress={() =>
                  router.push(
                    `/admin/cursos/${params.curso}/calificaciones/${estudiante.id}`,
                  )
                }
              >
                <DocumentIcon />
                Ver calificaciones
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
