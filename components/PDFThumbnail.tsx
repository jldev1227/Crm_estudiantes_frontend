import React from 'react';

interface PDFThumbnailProps {
  url: string;
  index: number;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ url, index }) => {
  // Extraer un nombre más amigable del PDF
  const extractName = (url: string): string => {
    try {
      const parts = url.split('/');
      let fileName = parts[parts.length - 1];
      if (fileName.includes('?')) fileName = fileName.split('?')[0];
      if (fileName.endsWith('.pdf')) fileName = fileName.slice(0, -4);
      return fileName.replace(/-/g, ' ').substring(0, 15) + (fileName.length > 15 ? '...' : '');
    } catch (e) {
      return `PDF ${index + 1}`;
    }
  };
  
  const documentName = extractName(url);

  return (
    <a target='_blank' href={`${url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`} className="h-full w-full border rounded bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Área de previsualización */}
      <div className="flex-grow flex flex-col items-center justify-center p-3 bg-gray-50">
        <svg
          className="w-12 h-12 text-red-500 mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        
        <p className="text-xs text-center font-medium text-gray-700 line-clamp-1">
          {documentName}
        </p>
      </div>
    </a>
  );
};

export default PDFThumbnail;