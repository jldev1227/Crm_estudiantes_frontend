'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const hasLoggedOutRef = useRef(false);
  const countdownTextRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    // Prevenir múltiples logouts
    if (hasLoggedOutRef.current) return;
    
    // Marcar que ya se hizo logout (usando ref para evitar re-renders)
    hasLoggedOutRef.current = true;
    
    // Ejecutar logout inmediatamente
    logout();
    
    // Configurar texto de cuenta regresiva
    let count = 3;
    if (countdownTextRef.current) {
      countdownTextRef.current.textContent = `Redirigiendo en ${count} segundos...`;
    }
    
    // Iniciar cuenta regresiva
    const timer = setInterval(() => {
      count -= 1;
      if (countdownTextRef.current) {
        countdownTextRef.current.textContent = `Redirigiendo en ${count} segundos...`;
      }
      
      if (count <= 0) {
        clearInterval(timer);
        // Usar setTimeout para asegurar que la navegación ocurra después del renderizado
        setTimeout(() => {
          router.push('/ingreso');
        }, 0);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // ejecutar solo una vez
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sesión cerrada</h1>
        
        <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
        </div>
        
        <p className="text-gray-600">
          Has cerrado sesión correctamente.
        </p>
        <p className="text-gray-500 text-sm mt-2" ref={countdownTextRef}>
          Redirigiendo en 3 segundos...
        </p>
      </div>
    </div>
  );
}