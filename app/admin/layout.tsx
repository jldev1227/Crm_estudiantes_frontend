"use client";

import { Divider } from "@heroui/divider";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { useState } from "react";
import { Home, BookOpen, User, LogOut, Menu, X, GraduationCap, Bell, Settings } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { AdminProvider } from "../context/AdminContext";

import SideMenu from "@/components/navbarMenu";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MaestroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = useAuth();
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 });
  const router = useRouter();

  const handleLinkClick = () => {
    // Si hay un modal abierto, ciérralo
    if (typeof window !== "undefined" && window.closeAnyOpenModal) {
      window.closeAnyOpenModal();
    }
  };

  const handleLogoutClick = () => {
    // Primero cerrar el menú y los modales
    handleLinkClick();

    // Usar setTimeout para asegurar que la navegación ocurra después de actualizar el estado
    setTimeout(() => {
      router.push("/cerrar-sesion");
    }, 0);
  };

  const menuItems = [
    {
      href: '/admin',
      icon: Home,
      label: 'Inicio',
      description: 'Panel principal'
    },
    {
      href: '/admin/cursos',
      icon: BookOpen,
      label: 'Cursos',
      description: 'Gestión de materias'
    },
    {
      href: '/admin/perfil',
      icon: User,
      label: 'Perfil',
      description: 'Información personal'
    }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

      {/* Animated background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-1/3 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Logo Section */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="bg-white m-4 rounded-2xl shadow-xl overflow-hidden">
            <img
              alt="Logo"
              className="w-full h-auto object-contain"
              src="/LOGO.png"
              style={{ maxHeight: '160px' }}
            />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="p-6 border-b border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h1 className="text-xl font-bold text-white">¡Bienvenido!</h1>
            </div>
            <h2 className="text-white/90 text-sm font-medium">
              {usuario?.nombre_completo || 'Usuario'}
            </h2>
            <div className="mt-3 flex items-center text-xs text-white/60">
              <span>Rol: {usuario?.rol || 'No especificado'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="group flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm hover:scale-105 hover:shadow-lg border border-transparent hover:border-white/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-white transition-colors">
                      {item.label}
                    </p>
                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">
                      {item.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-t border-white/10">
          {/* Logout Button - Mantiene el Button de HeroUI */}
          <Button
            fullWidth
            className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 hover:bg-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg text-red-200 hover:text-red-100"
            variant="faded"
            onPress={handleLogoutClick}
          >
            <div className="flex items-center justify-center space-x-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminProvider>
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="h-screen bg-gray-50">
          <main className={`${isDesktopOrLaptop ? "grid grid-cols-8" : ""} h-screen`}>
            {isDesktopOrLaptop ? (
              <div className="col-span-2 h-full">
                <SidebarContent />
              </div>
            ) : (
              <SideMenu />
            )}

            <div className={`${isDesktopOrLaptop ? 'col-span-6' : ''} relative`}>
              {/* Main content background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>

              {/* Floating background elements */}
              <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-48 h-48 bg-purple-100/30 rounded-full blur-2xl"></div>

              <div className="relative z-10 p-4 md:p-8 lg:p-10 min-h-full">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl min-h-full p-6 md:p-8">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AdminProvider>
  );
}