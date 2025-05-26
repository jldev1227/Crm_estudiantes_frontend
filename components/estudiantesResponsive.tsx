"use client";

import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import TablaEstudiantes from "@/components/TablaEstudiantes";
import { Card } from "@heroui/card";
import { Estudiante } from "@/types";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";

// Opciones de filtrado y ordenamiento
type SortField = 'nombre_completo' | 'numero_identificacion' | 'tipo_documento' | 'fecha_nacimiento' | 'pension_activa';
type SortDirection = 'asc' | 'desc';
type PensionFilter = 'todas' | 'activa' | 'inactiva';

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
    if (mesNacimiento > mesActual || (mesNacimiento === mesActual && diaNacimiento > diaActual)) {
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
  handlePension
}: {
  estudiantes: EstudianteConPension[];
  isAdmin?: boolean;
  handlePension?: (id: string) => void;
}) {
  const isDesktop = useMediaQuery({ minWidth: 992 });

  // Estados para búsqueda, filtrado y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState<SortField>('nombre_completo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [pensionFilter, setPensionFilter] = useState<PensionFilter>('todas');
  const [filtrando, setFiltrando] = useState(false);

  // Estado local de estudiantes para manipulación
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState<EstudianteConPension[]>(estudiantes);

  // Actualizar estudiantes cuando cambia el prop
  useEffect(() => {
    aplicarFiltros(estudiantes, busqueda, sortField, sortDirection, pensionFilter);
  }, [estudiantes]);

  // Función para aplicar todos los filtros y ordenamientos
  const aplicarFiltros = (
    listaEstudiantes: EstudianteConPension[],
    terminoBusqueda: string,
    campoOrden: SortField,
    direccionOrden: SortDirection,
    filtroPension: PensionFilter
  ) => {
    // Paso 1: Filtrar por término de búsqueda
    let resultado = listaEstudiantes.filter(estudiante => {
      if (!terminoBusqueda.trim()) return true;

      const termino = terminoBusqueda.toLowerCase();
      return (
        estudiante.nombre_completo.toLowerCase().includes(termino) ||
        estudiante.numero_identificacion.toLowerCase().includes(termino)
      );
    });

    // Paso 2: Filtrar por estado de pensión (solo para admin)
    if (isAdmin && filtroPension !== 'todas') {
      resultado = resultado.filter(estudiante => {
        if (filtroPension === 'activa') return estudiante.pension_activa === true;
        if (filtroPension === 'inactiva') return estudiante.pension_activa === false;
        return true;
      });
    }

    // Paso 3: Ordenar resultados
    resultado.sort((a, b) => {
      // Si el campo de ordenamiento es fecha_nacimiento, convertir a edades
      if (campoOrden === 'fecha_nacimiento') {
        const edadA = calcularEdad(a.fecha_nacimiento);
        const edadB = calcularEdad(b.fecha_nacimiento);
        return direccionOrden === 'asc' ? edadA - edadB : edadB - edadA;
      }

      // Si el campo de ordenamiento es pension_activa
      if (campoOrden === 'pension_activa' && isAdmin) {
        const pensionA = a.pension_activa ? 1 : 0;
        const pensionB = b.pension_activa ? 1 : 0;
        return direccionOrden === 'asc' ? pensionA - pensionB : pensionB - pensionA;
      }

      // Para otros campos, comparar strings
      const valorA = String(a[campoOrden] || '').toLowerCase();
      const valorB = String(b[campoOrden] || '').toLowerCase();

      if (direccionOrden === 'asc') {
        return valorA.localeCompare(valorB);
      } else {
        return valorB.localeCompare(valorA);
      }
    });

    setEstudiantesFiltrados(resultado);
    setFiltrando(!!terminoBusqueda || filtroPension !== 'todas');
  };

  // Manejadores de eventos
  const handleBusquedaChange = (valor: string) => {
    setBusqueda(valor);
    aplicarFiltros(estudiantes, valor, sortField, sortDirection, pensionFilter);
  };

  const handleSortChange = (campo: SortField) => {
    // Si hacemos clic en el mismo campo, cambiamos la dirección
    if (campo === sortField) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      aplicarFiltros(estudiantes, busqueda, campo, newDirection, pensionFilter);
    } else {
      // Si es un campo diferente, usamos ese campo con dirección ascendente
      setSortField(campo);
      setSortDirection('asc');
      aplicarFiltros(estudiantes, busqueda, campo, 'asc', pensionFilter);
    }
  };

  const handlePensionFilterChange = (valor: PensionFilter) => {
    setPensionFilter(valor);
    aplicarFiltros(estudiantes, busqueda, sortField, sortDirection, valor);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setPensionFilter('todas');
    setSortField('nombre_completo');
    setSortDirection('asc');
    aplicarFiltros(estudiantes, "", 'nombre_completo', 'asc', 'todas');
  };

  // Texto del ordenamiento actual para mostrar en botones móviles
  const getSortLabel = () => {
    const fieldLabels: Record<SortField, string> = {
      nombre_completo: "Nombre",
      numero_identificacion: "Documento",
      tipo_documento: "Tipo Doc.",
      fecha_nacimiento: "Edad",
      pension_activa: "Pensión"
    };

    return `${fieldLabels[sortField]} ${sortDirection === 'asc' ? '↑' : '↓'}`;
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
            label="Buscar estudiante"
            placeholder="Nombre o documento..."
            value={busqueda}
            onValueChange={handleBusquedaChange}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            }
            className="w-full"
          />
        </div>

        {isAdmin && (
          <div className="w-full md:w-64">
            <Select
              label="Estado de pensión"
              selectedKeys={[pensionFilter]}
              onChange={(e) => handlePensionFilterChange(e.target.value as PensionFilter)}
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
            <SelectItem key="nombre_completo" >Nombre completo</SelectItem>
            <SelectItem key="numero_identificacion">Número de documento</SelectItem>
            <SelectItem key="tipo_documento">Tipo de documento</SelectItem>
            <SelectItem key="fecha_nacimiento">Edad</SelectItem>
            {isAdmin ? <SelectItem key="pension_activa">Estado pensión</SelectItem> : null}
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select
            label="Dirección"
            selectedKeys={[sortDirection]}
            onChange={(e) => {
              setSortDirection(e.target.value as SortDirection);
              aplicarFiltros(estudiantes, busqueda, sortField, e.target.value as SortDirection, pensionFilter);
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
                onClose={() => handleBusquedaChange("")}
                variant="flat"
                color="primary"
              >
                Búsqueda: {busqueda}
              </Chip>
            )}

            {isAdmin && pensionFilter !== 'todas' && (
              <Chip
                onClose={() => handlePensionFilterChange("todas")}
                variant="flat"
                color={pensionFilter === 'activa' ? "success" : "danger"}
              >
                Pensión: {pensionFilter === 'activa' ? 'Activa' : 'Inactiva'}
              </Chip>
            )}

            <Chip variant="flat" color="default">
              Ordenado por: {getSortLabel()}
            </Chip>
          </div>

          <Button
            color="danger"
            variant="flat"
            size="sm"
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
        value={busqueda}
        onValueChange={handleBusquedaChange}
        startContent={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        }
      />

      <div className="flex justify-between gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              color="primary"
              className="flex-1"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              }
            >
              Ordenar
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Opciones de ordenamiento">
            <DropdownItem key="nombre" onPress={() => handleSortChange('nombre_completo')}>
              Nombre {sortField === 'nombre_completo' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            <DropdownItem key="documento" onPress={() => handleSortChange('numero_identificacion')}>
              Documento {sortField === 'numero_identificacion' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            <DropdownItem key="tipo" onPress={() => handleSortChange('tipo_documento')}>
              Tipo Doc. {sortField === 'tipo_documento' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            <DropdownItem key="edad" onPress={() => handleSortChange('fecha_nacimiento')}>
              Edad {sortField === 'fecha_nacimiento' && (sortDirection === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            {isAdmin ? (
              <DropdownItem key="pension" onPress={() => handleSortChange('pension_activa')}>
                Pensión {sortField === 'pension_activa' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownItem>
            ) : null}
            <DropdownItem key="invertir"
              onPress={() => {
                const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                setSortDirection(newDirection);
                aplicarFiltros(estudiantes, busqueda, sortField, newDirection, pensionFilter);
              }}
              className="text-primary"
            >
              Invertir dirección ({sortDirection === 'asc' ? 'Asc ↑' : 'Desc ↓'})
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {isAdmin && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                color={pensionFilter !== 'todas' ?
                  (pensionFilter === 'activa' ? "success" : "danger") :
                  "primary"
                }
                className="flex-1"
                startContent={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                  </svg>
                }
              >
                Filtrar
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Opciones de filtro de pensión">
              <DropdownItem key="todas" onPress={() => handlePensionFilterChange('todas')}>
                Todas las pensiones
              </DropdownItem>
              <DropdownItem key="activa" onPress={() => handlePensionFilterChange('activa')}>
                Pensión activa
              </DropdownItem>
              <DropdownItem key="inactiva" onPress={() => handlePensionFilterChange('inactiva')}>
                Pensión inactiva
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {filtrando && (
          <Button
            variant="flat"
            color="danger"
            className="flex-1"
            onPress={limpiarFiltros}
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            }
          >
            Limpiar
          </Button>
        )}
      </div>

      {filtrando && (
        <div className="flex flex-wrap gap-2 mt-2">
          {busqueda && (
            <Chip
              size="sm"
              onClose={() => handleBusquedaChange("")}
              variant="flat"
              color="primary"
            >
              {busqueda}
            </Chip>
          )}

          {isAdmin && pensionFilter !== 'todas' && (
            <Chip
              size="sm"
              variant="flat"
              color={pensionFilter === 'activa' ? "success" : "danger"}
            >
              {pensionFilter === 'activa' ? 'Pensión activa' : 'Pensión inactiva'}
            </Chip>
          )}

          <Chip size="sm" variant="flat" color="default">
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
          isAdmin={isAdmin}
          estudiantes={estudiantesFiltrados}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onPensionChange={handlePension}
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
        Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
      </p>

      {/* Cards de estudiantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {estudiantesFiltrados.map((estudiante: EstudianteConPension) => (
          <Card
            key={estudiante.id}
            className="shadow-sm transition-shadow ease-in-out duration-500 bg-gray-50 hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{estudiante.nombre_completo}</h3>
                {isAdmin && (
                  <Chip
                    size="sm"
                    color={estudiante.pension_activa ? "success" : "danger"}
                    variant="flat"
                  >
                    {estudiante.pension_activa ? "Pensión activa" : "Pensión inactiva"}
                  </Chip>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Tipo doc:</span> {estudiante.tipo_documento}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Documento:</span> {estudiante.numero_identificacion}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Edad:</span> {calcularEdad(estudiante.fecha_nacimiento)} años
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Teléfono:</span> {estudiante.celular_padres}
                </p>
              </div>

              {isAdmin && handlePension && (
                <Button
                  onPress={() => handlePension(estudiante.id)}
                  className="mt-6"
                  color={estudiante.pension_activa ? "danger" : "success"}
                  fullWidth
                  variant="flat"
                >
                  {estudiante.pension_activa ? "Desactivar" : "Activar"} pensión
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}