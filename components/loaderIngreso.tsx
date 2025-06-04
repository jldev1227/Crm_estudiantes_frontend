import React, { useState, useEffect } from "react";

export default function LoaderIngreso({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Activa la animación después de 3 segundos
    const timeout = setTimeout(() => setAnimate(true), 100);

    return () => clearTimeout(timeout); // Limpia el timeout al desmontar
  }, []);

  return (
    <div className="flex flex-col relative h-screen overflow-hidden">
      {/* Parte superior (Azul) */}
      <div
        className={`flex justify-center items-end bg-blue-600 h-1/2 absolute w-full opacity-75 transition-transform duration-500 ease-in-out ${
          animate ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="h-14 w-28 bg-white rounded-t-full border-4 border-b-0 border-red-600" />
      </div>

      {/* Contenido opcional (Texto o animación en el centro) */}
      <div
        className={`absolute z-10 inset-0 flex flex-col items-center justify-center space-y-3`}
      >
        <img alt="Logo" height={100} src={"/LOGO.png"} width={100} />
      </div>

      {/* Parte inferior (Rojo) */}
      <div
        className={`flex flex-col justify-start items-center space-y-4 bg-red-600 h-1/2 absolute w-full bottom-0 opacity-75 transition-transform duration-500 ease-in-out ${
          animate ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-14 w-28 bg-white rounded-b-full border-4 border-t-0 border-blue-600" />
        <p className="text-white text-lg font-semibold">{children}</p>
      </div>

      {/* Contenido opcional */}
    </div>
  );
}
