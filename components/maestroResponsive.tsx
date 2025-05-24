"use client";

import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import TablaMaestros from "@/components/TablaMaestros";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { Maestro } from "@/types";
import { EditIcon, EyeIcon } from "lucide-react";

// Opciones de filtrado y ordenamiento
type SortField = 'nombre_completo' | 'numero_identificacion' | 'tipo_documento';
type SortDirection = 'asc' | 'desc';

export default function MaestrosResponsive({
    maestros,
    handlePension
}: {
    maestros: Maestro[];
    handlePension?: (id: string) => void;
}) {
    const isDesktop = useMediaQuery({ minWidth: 992 });

    // Estados para búsqueda, filtrado y ordenamiento
    const [busqueda, setBusqueda] = useState("");
    const [sortField, setSortField] = useState<SortField>('nombre_completo');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [filtrando, setFiltrando] = useState(false);

    // Estado local de maestros para manipulación
    const [maestrosFiltrados, setMaestrosFiltrados] = useState<Maestro[]>(maestros);

    // Actualizar maestros cuando cambia el prop
    useEffect(() => {
        aplicarFiltros(maestros, busqueda, sortField, sortDirection);
    }, [maestros]);

    // Función para aplicar todos los filtros y ordenamientos
    const aplicarFiltros = (
        listaMaestros: Maestro[],
        terminoBusqueda: string,
        campoOrden: SortField,
        direccionOrden: SortDirection,
    ) => {
        // Paso 1: Filtrar por término de búsqueda
        let resultado = listaMaestros.filter(maestro => {
            if (!terminoBusqueda.trim()) return true;

            const termino = terminoBusqueda.toLowerCase();
            return (
                maestro.nombre_completo.toLowerCase().includes(termino) ||
                maestro.numero_identificacion.toLowerCase().includes(termino)
            );
        });

        // Paso 3: Ordenar resultados
        resultado.sort((a, b) => {

            // Para otros campos, comparar strings
            const valorA = String(a[campoOrden] || '').toLowerCase();
            const valorB = String(b[campoOrden] || '').toLowerCase();

            if (direccionOrden === 'asc') {
                return valorA.localeCompare(valorB);
            } else {
                return valorB.localeCompare(valorA);
            }
        });

        setMaestrosFiltrados(resultado);
        setFiltrando(!!terminoBusqueda);
    };

    // Manejadores de eventos
    const handleBusquedaChange = (valor: string) => {
        setBusqueda(valor);
        aplicarFiltros(maestros, valor, sortField, sortDirection);
    };

    const handleSortChange = (campo: SortField) => {
        // Si hacemos clic en el mismo campo, cambiamos la dirección
        if (campo === sortField) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            aplicarFiltros(maestros, busqueda, campo, newDirection);
        } else {
            // Si es un campo diferente, usamos ese campo con dirección ascendente
            setSortField(campo);
            setSortDirection('asc');
            aplicarFiltros(maestros, busqueda, campo, 'asc');
        }
    };

    const limpiarFiltros = () => {
        setBusqueda("");
        setSortField('nombre_completo');
        setSortDirection('asc');
        aplicarFiltros(maestros, "", 'nombre_completo', 'asc');
    };

    // Texto del ordenamiento actual para mostrar en botones móviles
    const getSortLabel = () => {
        const fieldLabels: Record<SortField, string> = {
            nombre_completo: "Nombre",
            numero_identificacion: "Documento",
            tipo_documento: "Tipo Doc.",
        };

        return `${fieldLabels[sortField]} ${sortDirection === 'asc' ? '↑' : '↓'}`;
    };

    // Si no hay maestros, muestra un mensaje
    if (maestros.length === 0) {
        return <p>No hay maestros asociados al curso</p>;
    }

    // Componentes de interfaz de búsqueda y filtrado
    const filtrosDesktop = (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        label="Buscar maestro"
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
                    </Select>
                </div>

                <div className="w-full md:w-48">
                    <Select
                        label="Dirección"
                        selectedKeys={[sortDirection]}
                        onChange={(e) => {
                            setSortDirection(e.target.value as SortDirection);
                            aplicarFiltros(maestros, busqueda, sortField, e.target.value as SortDirection);
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
                        <DropdownItem key="invertir"
                            onPress={() => {
                                const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                                setSortDirection(newDirection);
                                aplicarFiltros(maestros, busqueda, sortField, newDirection);
                            }}
                            className="text-primary"
                        >
                            Invertir dirección ({sortDirection === 'asc' ? 'Asc ↑' : 'Desc ↓'})
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

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

                {/* Tabla con maestros filtrados */}
                <TablaMaestros
                    maestros={maestrosFiltrados}
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
                Mostrando {maestrosFiltrados.length} de {maestros.length} maestros
            </p>

            {/* Cards de maestros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {maestrosFiltrados.map((maestro: Maestro) => (
                    <Card
                        key={maestro.id}
                        className="shadow-sm transition-shadow ease-in-out duration-500 bg-gray-50 hover:shadow-md"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{maestro.nombre_completo}</h3>
                            </div>

                            <div className="mt-2 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span className="font-medium">Tipo doc:</span> {maestro.tipo_documento}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span className="font-medium">Documento:</span> {maestro.numero_identificacion}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span className="font-medium">Email:</span> {maestro.email}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span className="font-medium">Teléfono:</span> {maestro.celular}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <span className="font-medium">Curso asignado:</span> {maestro.celular}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        fullWidth
                                        color="primary"
                                    >
                                        <EyeIcon/>
                                    </Button>
                                    <Button
                                        fullWidth
                                        color="warning"
                                    >
                                       <EditIcon/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}