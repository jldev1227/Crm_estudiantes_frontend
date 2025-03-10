"use client";
import React, { useState } from "react";

interface ToggleMaestroEstudianteProps {
  /** Valor inicial (opcional) */
  defaultChecked?: boolean;
  /**
   * onChange se dispara cada vez que el toggle cambia
   * y envía el nuevo estado (true = Maestro, false = Estudiante)
   */
  onChange?: (value: boolean) => void;
  id?: string;

}

export default function ToggleMaestroEstudiante({
  defaultChecked = false,
  onChange,
  id
}: ToggleMaestroEstudianteProps) {
  // El estado interno del toggle
  const [isMaestro, setIsMaestro] = useState(defaultChecked);

  const handleToggle = () => {
    // Cambiamos al valor opuesto
    const newValue = !isMaestro;
    setIsMaestro(newValue);

    // Si el padre pasó onChange, lo llamamos
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <label className="flex items-center cursor-pointer">
      {/* Texto a la izquierda */}
      {/* Contenedor del switch */}
      <div className="relative">
        {/* Checkbox “invisible” para controlar el estado */}
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isMaestro}
          onChange={handleToggle}
          id={id} // Add this line
        />

        {/* Fondo del switch */}
        <div
          className="
            block
            w-16 h-5
            bg-gray-300
            rounded-full
            peer-checked:bg-blue-500
            transition-colors
            duration-300
          "
        />

        {/* Botón que se desplaza */}
        <div
          className="
            absolute
            left-1 top-1
            w-3 h-3
            bg-white
            rounded-full
            shadow
            transition-all
            duration-300
            peer-checked:translate-x-11
          "
        />
      </div>
    </label>
  );
}
