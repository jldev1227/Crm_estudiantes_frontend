import { useAdmin } from "@/app/context/AdminContext";
import { Button } from "@heroui/button";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/modal";
import { List, Plus, PlusCircle, PlusIcon, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Estudiante, Grado } from "@/types";
import { parseDate, getLocalTimeZone, DateValue } from "@internationalized/date";
import { useParams } from "next/navigation";
import { useDateFormatter } from "@react-aria/i18n";

export default function ModalNuevoEstudiante() {
    const params = useParams()
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { obtenerEstudiantes, estudiantes, crearEstudiante } = useAdmin();
    const [busqueda, setBusqueda] = useState("");
    const [gradoSeleccionado, setGradoSeleccionado] = useState<Number | string>('');
    const [selectedView, setSelectedView] = useState<'listado' | 'nuevo'>('listado');
    const [estudiantesSelecteds, setEstudiantesSelecteds] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        nombre_completo: '',
        numero_identificacion: '',
        celular_padres: '',
    })
    const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(null);
    const [tipoDocumento, setTipoDocumento] = useState<string>('');

    let formatter = useDateFormatter({
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    const navigationTabs = [
        { key: 'listado', label: 'Listado', icon: List },
        { key: 'nuevo', label: 'Registrar', icon: PlusCircle }
    ];

    const documentos = [
        { key: "RC", label: "Registro Civil" },
        { key: "TI", label: "Tarjeta de Identidad" },
    ];

    useEffect(() => {
        // Cargar estudiantes al abrir el modal
        if (isOpen) {
            obtenerEstudiantes();
        }
    }, [isOpen]);

    // Hook para obtener grados únicos
    const gradosOptions = useMemo(() => {
        const gradosUnicos = estudiantes.reduce((acc: Grado[], estudiante) => {
            if (estudiante.grado && !acc.some((g: Grado) => g.id === estudiante.grado.id)) {
                acc.push({
                    id: estudiante.grado.id,
                    nombre: estudiante.grado.nombre
                });
            }
            return acc;
        }, []);
        return gradosUnicos.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    }, [estudiantes]);

    // Hook actualizado para filtrar por búsqueda y grado
    const estudiantesOptions = useCallback(() => {
        let estudiantesFiltrados = estudiantes;

        // Filtrar por grado si hay uno seleccionado
        if (gradoSeleccionado) {
            estudiantesFiltrados = estudiantesFiltrados.filter(est =>
                est.grado?.id === gradoSeleccionado
            );
        }

        // Filtrar por búsqueda si hay texto
        if (busqueda) {
            estudiantesFiltrados = estudiantesFiltrados.filter(est =>
                est.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        return estudiantesFiltrados.filter(estudiante => estudiante.grado.id.toString() !== params.curso);
    }, [busqueda, gradoSeleccionado, estudiantes]);

    const handleSelectStudent = (estudianteId: number) => {
        setEstudiantesSelecteds(prev => {
            if (prev.includes(estudianteId)) {
                return prev.filter(id => id !== estudianteId);
            }
            return [...prev, estudianteId];
        });
    }

    const handleDeleteStudent = (estudianteId: number) => {
        setEstudiantesSelecteds(prev => prev.filter(id => id !== estudianteId));
    }

    const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,  // Mantiene los valores existentes
            [e.target.name]: e.target.value  // Solo actualiza el campo que cambió
        })
    }

    const handleSubmit = async () => {

        if (!fechaNacimiento) return

        const newEstudiante = {
            ...formData,
            tipo_documento: tipoDocumento,
            fecha_nacimiento: fechaNacimiento.toString(),
            password: formData.numero_identificacion,
            grado_id: params.curso
        }

        await crearEstudiante(newEstudiante)
    }

    return (
        <>
            <Button
                onPress={onOpen}
                startContent={<Plus className="w-5 h-5" />}
                className="bg-blue-500 text-white hover:scale-105 transition-transform"
            >
                Nuevo Estudiante
            </Button>
            <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Nuevo Estudiante</ModalHeader>
                            <ModalBody>
                                <div className="flex space-x-2">
                                    {navigationTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => setSelectedView(tab.key as any)}
                                                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${selectedView === tab.key
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedView === 'listado' && (
                                    <div className="mt-4 space-y-4">
                                        {/* Buscador */}
                                        <Input
                                            size="lg"
                                            type="search"
                                            placeholder="Buscar estudiante..."
                                            startContent={<Search className="w-5 h-5 text-gray-400" />}
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                        />

                                        {/* Filtro por grado */}
                                        <Select
                                            onChange={(e) => setGradoSeleccionado(e.target.value)}
                                            placeholder="Seleccionar grado"
                                            label="Grado"
                                            multiple
                                        >
                                            {gradosOptions.map(grado => (
                                                <SelectItem key={grado.id}>
                                                    {grado.nombre}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        {/* Indicadores de filtros activos */}
                                        {(busqueda || gradoSeleccionado) && (
                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {busqueda && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Búsqueda: "{busqueda}"
                                                        <button
                                                            onClick={() => setBusqueda('')}
                                                            className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {gradoSeleccionado && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Grado: {gradosOptions.find(g => g.id === gradoSeleccionado)?.nombre}
                                                        <button
                                                            onClick={() => setGradoSeleccionado('')}
                                                            className="ml-1 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Lista de estudiantes */}
                                        <ul className="space-y-2 max-h-72 overflow-y-auto">
                                            {estudiantesOptions().length > 0 ? (
                                                estudiantesOptions().map((estudiante, index) => (
                                                    <li key={estudiante.id || index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors border-l-4 border-blue-500">
                                                        <div className="font-medium text-gray-900">
                                                            <p>{estudiante.nombre_completo}</p>
                                                            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                                                {estudiante.grado?.nombre}
                                                            </span>
                                                        </div>

                                                        {estudiantesSelecteds.includes(estudiante.id) ? (
                                                            <Button onPress={() => handleDeleteStudent(estudiante.id)} isIconOnly color="danger" size="sm">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button onPress={() => handleSelectStudent(estudiante.id)} isIconOnly className="bg-blue-500 text-white" size="sm">
                                                                <PlusIcon />
                                                            </Button>
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-center py-8 text-gray-500">
                                                    <div className="text-lg mb-2">📚</div>
                                                    <div>No se encontraron estudiantes</div>
                                                    {(busqueda || gradoSeleccionado) && (
                                                        <div className="text-sm mt-1">
                                                            Intenta ajustar los filtros
                                                        </div>
                                                    )}
                                                </li>
                                            )}
                                        </ul>

                                        {/* Resumen de resultados */}
                                        <div className="mt-4 text-sm text-gray-600 text-center">
                                            Mostrando {estudiantesOptions().length} de {estudiantes.filter(estudiante => estudiante.grado.id.toString() !== params.curso).length} estudiantes
                                        </div>
                                    </div>
                                )}

                                {selectedView === 'nuevo' && (
                                    <form className="mt-3">
                                        <div className="space-y-4">
                                            <Select
                                                label="Documento de identidad"
                                                name="tipo_documento"
                                                placeholder="Seleccionar documento"
                                                isRequired
                                                onChange={(e) => setTipoDocumento(e.target.value)}
                                            >
                                                {documentos.map((animal) => (
                                                    <SelectItem key={animal.key}>{animal.label}</SelectItem>
                                                ))}
                                            </Select>
                                            <Input
                                                type="number"
                                                name="numero_identificacion"
                                                label="Número identificación"
                                                placeholder="Ingresa el número de identificación"
                                                isRequired
                                                onChange={handleChangeForm}
                                                errorMessage="Por favor ingresa un número de identificación"
                                                isInvalid={formData["numero_identificacion"]}
                                            />
                                            <Input
                                                type="text"
                                                name="nombre_completo"
                                                label="Nombre completo"
                                                placeholder="Nombre completo del estudiante"
                                                className="w-full"
                                                isRequired
                                                onChange={handleChangeForm}
                                            />
                                            <Input
                                                type="number"
                                                name="celular_padres"
                                                label="Teléfono Padre/Madre"
                                                placeholder="Teléfono"
                                                className="w-full"
                                                isRequired
                                                onChange={handleChangeForm}
                                            />
                                            <DatePicker value={fechaNacimiento} onChange={setFechaNacimiento} showMonthAndYearPickers label="Fecha nacimiento" variant="bordered" />
                                        </div>
                                    </form>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                                <Button className="bg-blue-500 text-white" onPress={handleSubmit}>
                                    {selectedView === 'listado' ? "Cambiar de Grado" : "Registrar"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
