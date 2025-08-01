"use client";

interface PDFPREVIEWPROPS {
  onRemove: () => void;
}

const NextPDFPreview = ({ onRemove }: PDFPREVIEWPROPS) => {
  return (
    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer">
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        {/* Icono de documento PDF con sombra y efecto 3D */}
        <div className="relative w-24 h-32 bg-white border border-gray-200 rounded shadow-md mb-3 flex flex-col items-center justify-center transform transition-transform hover:scale-105">
          {/* Icono PDF */}
          <svg
            className="w-14 h-14 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              fillRule="evenodd"
            />
          </svg>

          {/* Texto PDF */}
          <span className="text-sm font-bold text-red-500 mt-1">PDF</span>

          {/* Esquina doblada */}
          <div className="absolute top-0 right-0 border-t-8 border-r-8 border-t-gray-200 border-r-transparent" />
        </div>
      </div>

      {/* Botón para eliminar */}
      {onRemove && (
        <button
          aria-label="Eliminar archivo"
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NextPDFPreview;
