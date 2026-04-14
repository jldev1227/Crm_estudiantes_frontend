"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, ArrowLeft } from "lucide-react";

interface ImagenModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagen: string;
  onPrev: () => void;
  onNext: () => void;
  contador: string;
}

const ImagenModal = ({
  isOpen,
  onClose,
  imagen,
  onPrev,
  onNext,
  contador,
}: ImagenModalProps) => {
  // Bloquear el scroll del body mientras el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 99999 }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center w-full h-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre */}
        <button
          className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <XCircle size={24} />
        </button>

        {/* Contador */}
        <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-4 py-2 rounded-lg font-medium text-sm">
          {contador}
        </div>

        {/* Imagen */}
        <img
          alt="Imagen ampliada"
          className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
          src={imagen}
        />

        {/* Botón anterior */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Imagen anterior"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Botón siguiente */}
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Imagen siguiente"
        >
          <ArrowLeft className="rotate-180" size={24} />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ImagenModal;
