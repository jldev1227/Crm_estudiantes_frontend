import React from 'react';
import { GraduationCap, Users, BookOpen, Award, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@heroui/button';
import Link from 'next/link';

export default function VancouverLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-red-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <nav className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Vancouver</span>
            </div>
            <div className="hidden md:flex space-x-6 text-white/80">
              <a href="#" className="hover:text-white transition-colors">Inicio</a>
              <a href="#" className="hover:text-white transition-colors">Nosotros</a>
              <a href="#" className="hover:text-white transition-colors">Programas</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </nav>
        </header>

        {/* Hero section */}
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/90">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Excelencia en Educación</span>
            </div>

            {/* Main title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                GIMNASIO
                <br />
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                  PEDAGÓGICO
                </span>
                <br />
                VANCOUVER
              </h1>
              
              <div className="flex items-center justify-center space-x-3 text-xl md:text-2xl text-white/90 font-light">
                <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent flex-1 max-w-20"></div>
                <span className="px-4">"CONSTRUYENDO MENTES INNOVADORAS"</span>
                <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent flex-1 max-w-20"></div>
              </div>
              
              {/* Multilingual indicator */}
              <div className="flex flex-col items-center space-y-2 pt-4">
                <div className="flex items-center justify-center space-x-6 text-sm text-white/90 font-medium">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>ESPAÑOL</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>INGLES</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>FRANCES</span>
                  </span>
                </div>
                <p className="text-white/70 text-sm font-light">
                  De Prejardín a Quinto de Primaria
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button as={Link} href='/ingreso' size='lg' className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl shadow-red-500/25 transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/40">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">Acceder al Sistema Estudiantil</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
              </Button>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Comunidad Educativa</h3>
                <p className="text-white/70 text-sm">Formamos una familia educativa comprometida con la excelencia académica y humana</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <BookOpen className="w-6 h-6 text-green-300" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Educación Trilingüe</h3>
                <p className="text-white/70 text-sm">Metodologías innovadoras en español, inglés y francés desde los primeros años</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Award className="w-6 h-6 text-yellow-300" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Primera Infancia</h3>
                <p className="text-white/70 text-sm">Especialistas en educación inicial, acompañando el desarrollo integral desde prejardín</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4">
            <p className="text-white/60 text-sm">
              © 2024 Gimnasio Pedagógico Vancouver. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}