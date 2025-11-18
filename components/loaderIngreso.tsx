import React, { useState, useEffect } from "react";

/* eslint-disable react/no-unknown-property */
export default function LoaderIngreso({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [animate, setAnimate] = useState(false);
  const [logoScale, setLogoScale] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Secuencia de animaciones
    const timeout1 = setTimeout(() => setAnimate(true), 100);
    const timeout2 = setTimeout(() => setLogoScale(true), 400);
    const timeout3 = setTimeout(() => setShowText(true), 700);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  return (
    <div className="flex flex-col relative h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-red-50">
      {/* Decorative animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Parte superior (Azul) con efecto glass */}
      <div
        className={`
          flex justify-center items-end 
          bg-gradient-to-br from-blue-600 to-blue-700
          h-1/2 absolute w-full 
          transition-all duration-700 ease-out
          shadow-2xl
          ${animate ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Semicírculo superior con borde y efecto glass */}
        <div className="relative">
          <div className="h-16 w-32 bg-white/95 backdrop-blur-sm rounded-t-full border-4 border-b-0 border-red-600 shadow-xl" />
          {/* Inner glow effect */}
          <div className="absolute inset-0 h-16 w-32 bg-gradient-to-b from-white/50 to-transparent rounded-t-full" />
        </div>
      </div>

      {/* Contenido central con logo y animaciones */}
      <div className="absolute z-20 inset-0 flex flex-col items-center justify-center space-y-6">
        {/* Logo container with glass effect */}
        <div
          className={`
            relative
            transition-all duration-1000 ease-out
            ${logoScale ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
        >
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-red-400 rounded-full blur-2xl opacity-30 animate-pulse" />

          {/* Logo with glass background */}
          <img
            alt="Logo Vancouver"
            className="relative z-10 drop-shadow-lg"
            height={120}
            src={"/LOGO.png"}
            width={120}
          />
        </div>
      </div>

      {/* Parte inferior (Rojo) con efecto glass */}
      <div
        className={`
          flex flex-col justify-start items-center
          bg-gradient-to-br from-red-600 to-red-700
          h-1/2 absolute w-full bottom-0
          transition-all duration-700 ease-out
          shadow-2xl
          ${animate ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        `}
      >
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Semicírculo inferior con borde y efecto glass */}
        <div className="relative mt-0">
          <div className="h-16 w-32 bg-white/95 backdrop-blur-sm rounded-b-full border-4 border-t-0 border-blue-600 shadow-xl" />
          {/* Inner glow effect */}
          <div className="absolute inset-0 h-16 w-32 bg-gradient-to-t from-white/50 to-transparent rounded-b-full" />
        </div>

        {/* Texto con animación */}
        <div
          className={`
            transition-all duration-500 ease-out mt-6
            ${showText ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
          `}
        >
          <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/30 shadow-lg">
            <p className="text-white text-lg font-bold tracking-wide">
              {children || "Cargando..."}
            </p>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-6 w-64 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-blue-400 to-white animate-[slideProgress_1.5s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes slideProgress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
