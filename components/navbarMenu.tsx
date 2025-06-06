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
    },
    {
      label: "Actividades diarias",
      href: "/estudiante/actividades",
    },
    {
      label: "Tareas",
      href: "/estudiante/tareas",
    },
    {
      label: "Calificaciones",
      href: "/estudiante/calificaciones",
    },
  ];

  const menuItemsMaestro = [
    {
      label: "Cursos",
      href: "/maestro/cursos",
    },
  ];

  // Determinar qué menú mostrar basado en el rol
  const menuItemsAdmin = [
    {
      label: "Cursos",
      href: "/admin/cursos",
    },
    {
      label: "Maestros",
      href: "/admin/maestros",
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

  // Modificado para no esperar un evento específico
  const handleLogoutClick = () => {
    // Primero cerrar el menú y los modales
    handleLinkClick();

    // Usar setTimeout para asegurar que la navegación ocurra después de actualizar el estado
    setTimeout(() => {
      router.push("/cerrar-sesion");
    }, 0);
  };

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      {/* Menú móvil - Toggle */}
      <NavbarContent className="md:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        />
      </NavbarContent>

      {/* Logo en móvil */}
      <NavbarContent className="md:hidden pr-3" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Menú desktop */}
      <NavbarContent className="hidden md:flex gap-4" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>

        <NavbarItem>
          <Button as={Link} href={`/${usuario?.rol}`} variant="light">
            Inicio
          </Button>
        </NavbarItem>

        {menuItems.map((item, index) => (
          <NavbarItem
            key={`desktop-${item.label}-${index}`}
            isActive={pathname === item.href}
          >
            <Button
              as={Link}
              href={item.href}
              variant="light"
              onPress={handleLinkClick}
            >
              {item.label}
            </Button>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Botón de cerrar sesión (desktop) */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            as={Link}
            color="primary"
            href={`/${usuario?.rol}/perfil`}
            variant="flat"
          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            color="danger"
            variant="flat"
            onPress={handleLogoutClick}
          >
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Menú móvil - Contenido */}
      <NavbarMenu>
        <NavbarMenuItem>
          <Button
            as={Link}
            className="w-full justify-start"
            color="primary"
            href={`/${usuario?.rol}`}
            size="lg"
            variant="light"
          >
            Inicio
          </Button>
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`mobile-${item.label}-${index}`}>
            <Button
              as={Link}
              className="w-full justify-start"
              href={item.href}
              size="lg"
              variant="light"
              onPress={handleLinkClick}
            >
              {item.label}
            </Button>
          </NavbarMenuItem>
        ))}
        {/* Añadir el elemento de cerrar sesión al final */}
        <NavbarMenuItem>
          <Button
            className="w-full justify-start"
            color="danger"
            size="lg"
            variant="light"
            onPress={handleLogoutClick}
          >
            Cerrar Sesión
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
