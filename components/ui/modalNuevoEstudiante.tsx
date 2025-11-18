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
import { DateValue } from "@internationalized/date";
import { useParams } from "next/navigation";

import { Grado } from "@/types";
import { useAdmin } from "@/app/context/AdminContext";

export default function ModalNuevoEstudiante() {
  const params = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    obtenerEstudiantes,
    estudiantes,
    crearEstudiante,
    cambiarGradoEstudiante,
    cambiarGradoEstudiantesMasivo,
  } = useAdmin();
  const [busqueda, setBusqueda] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState<Number | string>(
    "",
  );
  const [selectedView, setSelectedView] = useState<"listado" | "nuevo">(
    "listado",
  );
  const [estudiantesSelecteds, setEstudiantesSelecteds] = useState<number[]>(
    [],
  );
  const [formData, setFormData] = useState({
    nombre_completo: "",
    numero_identificacion: "",
    celular_padres: "",
  });
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null,
  );
  const [tipoDocumento, setTipoDocumento] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const navigationTabs = [
    { key: "listado", label: "Listado", icon: List },
    { key: "nuevo", label: "Registrar", icon: PlusCircle },
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
      if (
        estudiante.grado &&
        !acc.some((g: Grado) => g.id === estudiante.grado.id)
      ) {
        acc.push({
          id: estudiante.grado.id,
          nombre: estudiante.grado.nombre,
        });
      }

      return acc;
    }, []);

    return gradosUnicos.sort((a, b) =>
      a.id.toString().localeCompare(b.id.toString()),
    );
  }, [estudiantes]);

  // Hook actualizado para filtrar por búsqueda y grado
  const estudiantesOptions = useCallback(() => {
    let estudiantesFiltrados = estudiantes;

    // Filtrar por grado si hay uno seleccionado
    if (gradoSeleccionado) {
      estudiantesFiltrados = estudiantesFiltrados.filter(
        (est) => est.grado?.id === gradoSeleccionado,
      );
    }

    // Filtrar por búsqueda si hay texto
    if (busqueda) {
      estudiantesFiltrados = estudiantesFiltrados.filter((est) =>
        est.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()),
      );
    }

    return estudiantesFiltrados.filter(
      (estudiante) => estudiante.grado.id.toString() !== params.curso,
    );
  }, [busqueda, gradoSeleccionado, estudiantes]);

  const handleSelectStudent = (estudianteId: number) => {
    setEstudiantesSelecteds((prev) => {
      if (prev.includes(estudianteId)) {
        return prev.filter((id) => id !== estudianteId);
      }

      return [...prev, estudianteId];
    });
  };

  const handleDeleteStudent = (estudianteId: number) => {
    setEstudiantesSelecteds((prev) => prev.filter((id) => id !== estudianteId));
  };

  const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData, // Mantiene los valores existentes
      [e.target.name]: e.target.value, // Solo actualiza el campo que cambió
    });
  };

  const handleSubmit = async (onClose: () => void) => {
    setIsLoading(true);

    try {
      if (selectedView === "listado") {
        const gradoDestino = Array.isArray(params.curso)
          ? (params.curso[0] as string)
          : (params.curso as string);

        if (!gradoDestino) {
          alert("Error: No se pudo identificar el grado destino");

          return;
        }

        if (estudiantesSelecteds.length === 0) {
          alert("Debe seleccionar al menos un estudiante");

          return;
        }

        if (estudiantesSelecteds.length === 1) {
          await cambiarGradoEstudiante(
            estudiantesSelecteds[0].toString(),
            gradoDestino,
          );
          alert("Grado del estudiante cambiado exitosamente");
        } else {
          const resultado = await cambiarGradoEstudiantesMasivo(
            estudiantesSelecteds.map((id) => id.toString()),
            gradoDestino,
          );

          if (resultado) {
            alert(
              `Operación completada:\n` +
                `• ${resultado.total_exitosos} estudiantes cambiados exitosamente\n` +
                `• ${resultado.total_fallidos} estudiantes con errores`,
            );
          }
        }

        setEstudiantesSelecteds([]);
        onClose();
      } else {
        if (!fechaNacimiento) {
          alert("Debe seleccionar una fecha de nacimiento");

          return;
        }

        const gradoDestino = Array.isArray(params.curso)
          ? (params.curso[0] as string)
          : (params.curso as string);

        if (!gradoDestino) {
          alert("Error: No se pudo identificar el grado destino");

          return;
        }

        const newEstudiante = {
          ...formData,
          tipo_documento: tipoDocumento,
          fecha_nacimiento: fechaNacimiento.toString(),
          password: formData.numero_identificacion,
          grado_id: gradoDestino,
        };

        await crearEstudiante(newEstudiante);
        alert("Estudiante creado exitosamente");

        setFormData({
          nombre_completo: "",
          numero_identificacion: "",
          celular_padres: "",
        });
        setFechaNacimiento(null);
        setTipoDocumento("");
        onClose();
      }
    } catch (error) {
      console.error("Error en operación:", error);
      alert("Error al realizar la operación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="bg-blue-500 text-white hover:scale-105 transition-transform"
        startContent={<Plus className="w-5 h-5" />}
        onPress={onOpen}
      >
        Nuevo Estudiante
      </Button>
      <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Nuevo Estudiante
              </ModalHeader>
              <ModalBody>
                <div className="flex space-x-2">
                  {navigationTabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.key}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                          selectedView === tab.key
                            ? "bg-blue-500 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedView(tab.key as any)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedView === "listado" && (
                  <div className="mt-4 space-y-4">
                    {/* Buscador */}
                    <Input
                      placeholder="Buscar estudiante..."
                      size="lg"
                      startContent={
                        <Search className="w-5 h-5 text-gray-400" />
                      }
                      type="search"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />

                    {/* Filtro por grado */}
                    <Select
                      multiple
                      label="Grado"
                      placeholder="Seleccionar grado"
                      onChange={(e) => setGradoSeleccionado(e.target.value)}
                    >
                      {gradosOptions.map((grado) => (
                        <SelectItem key={grado.id}>{grado.nombre}</SelectItem>
                      ))}
                    </Select>

                    {/* Indicadores de filtros activos */}
                    {(busqueda || gradoSeleccionado) && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {busqueda && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Búsqueda: &quot;{busqueda}&quot;
                            <button
                              className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                              onClick={() => setBusqueda("")}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {gradoSeleccionado && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Grado:{" "}
                            {
                              gradosOptions.find(
                                (g) => g.id === gradoSeleccionado,
                              )?.nombre
                            }
                            <button
                              className="ml-1 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                              onClick={() => setGradoSeleccionado("")}
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
                          <li
                            key={estudiante.id || index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors border-l-4 border-blue-500"
                          >
                            <div className="font-medium text-gray-900">
                              <p>{estudiante.nombre_completo}</p>
                              <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                {estudiante.grado?.nombre}
                              </span>
                            </div>

                            {estudiantesSelecteds.includes(estudiante.id) ? (
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                onPress={() =>
                                  handleDeleteStudent(estudiante.id)
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                isIconOnly
                                className="bg-blue-500 text-white"
                                size="sm"
                                onPress={() =>
                                  handleSelectStudent(estudiante.id)
                                }
                              >
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
                      Mostrando {estudiantesOptions().length} de{" "}
                      {
                        estudiantes.filter(
                          (estudiante) =>
                            estudiante.grado.id.toString() !== params.curso,
                        ).length
                      }{" "}
                      estudiantes
                    </div>

                    {/* Resumen de estudiantes seleccionados */}
                    {estudiantesSelecteds.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                          Estudiantes seleccionados (
                          {estudiantesSelecteds.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {estudiantesSelecteds.map((id) => {
                            const estudiante = estudiantes.find(
                              (est) => est.id === id,
                            );

                            return estudiante ? (
                              <div
                                key={id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-blue-700 font-medium">
                                  {estudiante.nombre_completo}
                                </span>
                                <Button
                                  isIconOnly
                                  color="danger"
                                  size="sm"
                                  variant="light"
                                  onPress={() => handleDeleteStudent(id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          Los estudiantes seleccionados serán trasladados a este
                          grado.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedView === "nuevo" && (
                  <form className="mt-3">
                    <div className="space-y-4">
                      <Select
                        isRequired
                        label="Documento de identidad"
                        name="tipo_documento"
                        placeholder="Seleccionar documento"
                        onChange={(e) => setTipoDocumento(e.target.value)}
                      >
                        {documentos.map((animal) => (
                          <SelectItem key={animal.key}>
                            {animal.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        isRequired
                        isInvalid={
                          !formData.numero_identificacion &&
                          formData.numero_identificacion !== ""
                        }
                        label="Número identificación"
                        name="numero_identificacion"
                        placeholder="Ingresa el número de identificación"
                        type="number"
                        onChange={handleChangeForm}
                      />
                      <Input
                        isRequired
                        className="w-full"
                        label="Nombre completo"
                        name="nombre_completo"
                        placeholder="Nombre completo del estudiante"
                        type="text"
                        onChange={handleChangeForm}
                      />
                      <Input
                        isRequired
                        className="w-full"
                        label="Teléfono Padre/Madre"
                        name="celular_padres"
                        placeholder="Teléfono"
                        type="number"
                        onChange={handleChangeForm}
                      />
                      <DatePicker
                        showMonthAndYearPickers
                        label="Fecha nacimiento"
                        value={fechaNacimiento}
                        variant="bordered"
                        onChange={setFechaNacimiento}
                      />
                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  className="bg-blue-500 text-white"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  onPress={() => handleSubmit(onClose)}
                >
                  {selectedView === "listado"
                    ? "Cambiar de Grado"
                    : "Registrar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
