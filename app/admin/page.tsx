"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  ChevronRight,
  PersonStanding,
  BarChart3,
  Activity,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";

import { useAdmin } from "../context/AdminContext";

export default function CourseManagementWelcome() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { obtenerEstadisticas, estadisticas } = useAdmin();

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const cards = [
    {
      id: "cursos",
      title: "Cursos",
      description: "Gestiona todos los cursos disponibles en el sistema",
      icon: GraduationCap,
      route: "/admin/cursos",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      bgPattern: "bg-gradient-to-br from-blue-50 to-blue-100",
      stats: estadisticas.totalGrados || 0,
    },
    {
      id: "maestros",
      title: "Maestros",
      description: "Administra la información de los maestros",
      icon: Users,
      route: "/admin/maestros",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "from-emerald-600 to-emerald-700",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      stats: estadisticas.totalMaestros || 0,
    },
    {
      id: "estudiantes",
      title: "Estudiantes",
      description: "Administra la información de los estudiantes",
      icon: PersonStanding,
      route: "/admin/estudiantes",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
      bgPattern: "bg-gradient-to-br from-purple-50 to-purple-100",
      stats: estadisticas.totalEstudiantes || 0,
    },
    {
      id: "areas",
      title: "Areas",
      description: "Administra la información de las areas de estudio",
      icon: PersonStanding,
      route: "/admin/areas",
      color: "from-amber-500 to-amber-600",
      hoverColor: "from-amber-600 to-amber-700",
      bgPattern: "bg-gradient-to-br from-amber-50 to-amber-100",
      stats: estadisticas.totalAreas || 0,
    },
  ];

  const additionalMetrics = [
    {
      icon: Activity,
      label: "Actividades",
      value: estadisticas.totalActividades || "0",
      color: "text-indigo-600",
    },
    {
      icon: Award,
      label: "Calificaciones",
      value: estadisticas.totalCalificaciones || "0",
      color: "text-green-600",
    },
    {
      icon: TrendingUp,
      label: "Tareas",
      value: estadisticas.totalTareas || "0",
      color: "text-red-600",
    },
    {
      icon: Clock,
      label: "Total Usuarios",
      value: estadisticas.totalUsuarios || "0",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Panel de Administración
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Administra cursos, maestros y calificaciones desde un solo lugar con
          herramientas intuitivas y potentes.
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.id;

          return (
            <div
              key={card.id}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              role="button"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => router.push(card.route)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`relative overflow-hidden bg-gradient-to-br ${isHovered ? card.hoverColor : card.color} text-white rounded-3xl p-8 shadow-xl transition-all duration-500 group-hover:shadow-2xl border border-white/20`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className={`w-full h-full ${card.bgPattern}`} />
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500" />

                <div className="relative z-10 space-y-6">
                  {/* Header with icon and stats */}
                  <div className="flex items-start justify-between">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      <Icon
                        className="text-white group-hover:scale-110 transition-transform duration-300"
                        size={32}
                      />
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                        <span className="text-sm font-bold">{card.stats}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold">{card.title}</h2>
                    <p className="text-white/90 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Action button */}
                  <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 group-hover:bg-white/30 transition-all duration-300">
                    <span className="font-medium">Gestionar</span>
                    <ChevronRight
                      className="group-hover:translate-x-2 transition-transform duration-300"
                      size={20}
                    />
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
          Métricas Adicionales
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/70 border border-gray-200 rounded-xl p-4 hover:bg-white/90 transition-all duration-300 hover:scale-105"
            >
              <div className="text-xl font-bold text-gray-800">
                {metric.value}
              </div>
              <div className="text-xs text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
