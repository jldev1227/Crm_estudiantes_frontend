import React, { useEffect } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  NavbarBrand,
} from "@heroui/navbar";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useRouter } from "next/navigation";
import { Home, BookOpen, Calendar, FileText, BarChart3, Users, User, LogOut, GraduationCap } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";

// Logo del Gimnasio Vancouver
const GimnasioLogo = () => {
  return (
    <div className="flex items-center">
      <img
        alt="Logo"
        className="mx-auto"
        height={42}
        src={"/LOGO.png"}
        width={42}
      />
      <span className="font-bold text-inherit">Gimnasio Vancouver</span>
    </div>
  );
};

// Declaración global para el modal
declare global {
  interface Window {
    closeAnyOpenModal?: () => void;
  }
}

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { usuario } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Cierra el menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
    // Si hay un modal abierto, ciérralo
    if (typeof window !== "undefined" && window.closeAnyOpenModal) {
      window.closeAnyOpenModal();
    }
  }, [pathname]);

  const menuItemsEstudiante = [
    {
      label: "Materias",
      href: "/estudiante/materias",
      icon: BookOpen,
      description: "Consulta tus materias"
    },
    {
      label: "Actividades diarias",
      href: "/estudiante/actividades",
      icon: Calendar,
      description: "Revisa tu cronograma"
    },
    {
      label: "Tareas",
      href: "/estudiante/tareas",
      icon: FileText,
      description: "Gestiona tus tareas"
    },
    {
      label: "Calificaciones",
      href: "/estudiante/calificaciones",
      icon: BarChart3,
      description: "Revisa tus notas"
    },
  ];

  const menuItemsMaestro = [
    {
      label: "Cursos",
      href: "/maestro/cursos",
      icon: GraduationCap,
      description: "Gestiona tus cursos"
    },
  ];

  const menuItemsAdmin = [
    {
      label: "Cursos",
      href: "/admin/cursos",
      icon: GraduationCap,
      description: "Administrar cursos"
    },
    {
      label: "Maestros",
      href: "/admin/maestros",
      icon: Users,
      description: "Gestionar maestros"
    },
  ];

  const menuItems =
    usuario?.rol === "admin"
      ? menuItemsAdmin
      : usuario?.rol === "maestro"
        ? menuItemsMaestro
        : menuItemsEstudiante;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
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

  const NavbarItem_Custom = ({ item, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    
    if (isMobile) {
      return (
        <Button
          as={Link}
          className={`w-full justify-start p-4 h-auto ${
            isActive 
              ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
              : 'hover:bg-gray-50'
          }`}
          href={item.href}
          variant="light"
          onPress={handleLinkClick}
        >
          <div className="flex items-center space-x-4 w-full">
            <div className={`p-2 rounded-xl ${isActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 text-left">
              <div className={`font-medium ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                {item.label}
              </div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </div>
        </Button>
      );
    }

    return (
      <Button
        as={Link}
        className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'bg-primary-50 text-primary-600 shadow-md border border-primary-200' 
            : 'hover:bg-gray-50 text-gray-700 hover:scale-105'
        }`}
        href={item.href}
        variant="light"
        onPress={handleLinkClick}
      >
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} />
          <span className="font-medium">{item.label}</span>
        </div>
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"></div>
        )}
      </Button>
    );
  };

  return (
    <Navbar 
      isBordered 
      isMenuOpen={isMenuOpen} 
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
      classNames={{
        wrapper: "px-4 sm:px-6 max-w-full",
        brand: "mr-4",
        content: "gap-4",
        menu: "bg-white backdrop-blur-md border-r border-gray-200/50 shadow-xl",
      }}
    >
      {/* Menú móvil - Toggle */}
      <NavbarContent className="xl:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="text-gray-600 hover:text-primary-600 transition-colors"
        />
      </NavbarContent>

      {/* Logo en móvil */}
      <NavbarContent className="xl:hidden pr-3" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Menú desktop */}
      <NavbarContent className="hidden xl:flex gap-6" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>

        <NavbarItem>
          <Button 
            as={Link} 
            href={`/${usuario?.rol}`} 
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              pathname === `/${usuario?.rol}`
                ? 'bg-primary-50 text-primary-600 shadow-md border border-primary-200'
                : 'hover:bg-gray-50 text-gray-700 hover:scale-105'
            }`}
            variant="light"
          >
            <div className="flex items-center space-x-2">
              <Home className={`w-4 h-4 ${pathname === `/${usuario?.rol}` ? 'text-primary-600' : 'text-gray-600'}`} />
              <span className="font-medium">Inicio</span>
            </div>
            {pathname === `/${usuario?.rol}` && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"></div>
            )}
          </Button>
        </NavbarItem>

        {menuItems.map((item, index) => (
          <NavbarItem key={`desktop-${item.label}-${index}`}>
            <NavbarItem_Custom item={item} />
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* User actions */}
      <NavbarContent justify="end" className="gap-2">
        {/* User info badge */}
        <div className="hidden lg:flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700 truncate max-w-32">
              {usuario?.nombre_completo || 'Usuario'}
            </div>
            <div className="text-xs text-gray-500 capitalize">{usuario?.rol}</div>
          </div>
        </div>

        {/* Profile button */}
        <NavbarItem>
          <Button
            as={Link}
            href={`/${usuario?.rol}/perfil`}
            className="bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 rounded-xl transition-all duration-300 hover:scale-105"
            isIconOnly
            variant="flat"
          >
            <User className="w-5 h-5" />
          </Button>
        </NavbarItem>

        {/* Logout button */}
        <NavbarItem>
          <Button
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all duration-300 hover:scale-105"
            isIconOnly
            variant="flat"
            onPress={handleLogoutClick}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Menú móvil - Contenido */}
      <NavbarMenu className="pt-6 space-y-2">
        {/* User info in mobile */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 mb-4 border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-primary-700">
                {usuario?.nombre_completo || 'Usuario'}
              </div>
              <div className="text-sm text-primary-600 capitalize">
                Rol: {usuario?.rol}
              </div>
            </div>
          </div>
        </div>

        {/* Home item */}
        <NavbarMenuItem>
          <Button
            as={Link}
            className={`w-full justify-start p-4 h-auto ${
              pathname === `/${usuario?.rol}`
                ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                : 'hover:bg-gray-50'
            }`}
            href={`/${usuario?.rol}`}
            variant="light"
            onPress={handleLinkClick}
          >
            <div className="flex items-center space-x-4 w-full">
              <div className={`p-2 rounded-xl ${pathname === `/${usuario?.rol}` ? 'bg-primary-100' : 'bg-gray-100'}`}>
                <Home className={`w-5 h-5 ${pathname === `/${usuario?.rol}` ? 'text-primary-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${pathname === `/${usuario?.rol}` ? 'text-primary-700' : 'text-gray-700'}`}>
                  Inicio
                </div>
                <div className="text-xs text-gray-500">Panel principal</div>
              </div>
            </div>
          </Button>
        </NavbarMenuItem>

        {/* Menu items */}
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`mobile-${item.label}-${index}`}>
            <NavbarItem_Custom item={item} isMobile={true} />
          </NavbarMenuItem>
        ))}

        {/* Profile item */}
        <NavbarMenuItem>
          <Button
            as={Link}
            className={`w-full justify-start p-4 h-auto ${
              pathname === `/${usuario?.rol}/perfil`
                ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                : 'hover:bg-gray-50'
            }`}
            href={`/${usuario?.rol}/perfil`}
            variant="light"
            onPress={handleLinkClick}
          >
            <div className="flex items-center space-x-4 w-full">
              <div className={`p-2 rounded-xl ${pathname === `/${usuario?.rol}/perfil` ? 'bg-primary-100' : 'bg-gray-100'}`}>
                <User className={`w-5 h-5 ${pathname === `/${usuario?.rol}/perfil` ? 'text-primary-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${pathname === `/${usuario?.rol}/perfil` ? 'text-primary-700' : 'text-gray-700'}`}>
                  Perfil
                </div>
                <div className="text-xs text-gray-500">Información personal</div>
              </div>
            </div>
          </Button>
        </NavbarMenuItem>

        {/* Logout item */}
        <NavbarMenuItem className="mt-6">
          <Button
            className="w-full justify-start p-4 h-auto bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl"
            variant="light"
            onPress={handleLogoutClick}
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="p-2 rounded-xl bg-red-100">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-red-700">Cerrar Sesión</div>
                <div className="text-xs text-red-500">Salir del sistema</div>
              </div>
            </div>
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}