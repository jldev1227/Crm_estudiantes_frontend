import React from "react";
import {
  Users,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles,
  Globe2,
  Star,
} from "lucide-react";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function VancouverLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-red-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-red-100/40 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-tr-full" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Hero section */}
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-red-600 rounded-full px-5 py-2.5 shadow-lg shadow-blue-200/50">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold text-white tracking-wide">
                EXCELENCIA EN EDUCACIÓN
              </span>
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>

            {/* Main title */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">
                <span className="text-blue-900">GIMNASIO</span>
                <br />
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
                  PEDAGÓGICO
                </span>
                <br />
                <span className="text-blue-900">VANCOUVER</span>
              </h1>

              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent flex-1 max-w-24" />
                <p className="text-xl md:text-2xl text-slate-700 font-semibold px-6 italic">
                  &quot;Construyendo Mentes Innovadoras&quot;
                </p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent flex-1 max-w-24" />
              </div>

              {/* Multilingual indicator */}
              <div className="flex flex-col items-center space-y-3 pt-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-center space-x-6 text-sm font-bold">
                    <span className="flex items-center space-x-2 text-blue-700">
                      <Globe2 className="w-4 h-4" />
                      <span>ESPAÑOL</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center space-x-2 text-red-700">
                      <Globe2 className="w-4 h-4" />
                      <span>INGLÉS</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center space-x-2 text-blue-700">
                      <Globe2 className="w-4 h-4" />
                      <span>FRANCÉS</span>
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-base font-medium bg-white/50 px-6 py-2 rounded-full">
                  De Prejardín a Quinto de Primaria
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button
                as={Link}
                className="group relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold py-6 px-10 rounded-2xl shadow-2xl shadow-red-300/50 transform transition-all duration-300 hover:scale-105 hover:shadow-red-400/60 border-2 border-red-400"
                href="/ingreso"
                size="lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    Acceder al Sistema Estudiantil
                  </span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Button glow effect */}
                <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
              </Button>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
              <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-lg shadow-blue-300/50 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-xl mb-3">
                  Comunidad Educativa
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Formamos una familia educativa comprometida con la excelencia
                  académica y humana
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-8 hover:border-red-400 hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-lg shadow-red-300/50 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-red-900 font-bold text-xl mb-3">
                  Educación Trilingüe
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Metodologías innovadoras en español, inglés y francés desde
                  los primeros años
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-lg shadow-blue-300/50 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-xl mb-3">
                  Primera Infancia
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Especialistas en educación inicial, acompañando el desarrollo
                  integral desde prejardín
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-2xl px-6 py-5 shadow-lg">
            <p className="text-slate-600 text-sm font-medium">
              © {new Date().getFullYear()} Gimnasio Pedagógico Vancouver. Todos
              los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
