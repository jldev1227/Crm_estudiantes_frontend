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
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Logo del Gimnasio Vancouver (reemplaza esto con tu logo real)
const GimnasioLogo = () => {
  return (
    <div className="flex items-center">
      <Image
        className="mx-auto"
        src={"/LOGO.png"}
        width={42}
        height={42}
        alt="Logo"
      />      <span className="font-bold text-inherit">Gimnasio Vancouver</span>
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
    if (typeof window !== 'undefined' && window.closeAnyOpenModal) {
      window.closeAnyOpenModal();
    }
  }, [pathname]);

  const menuItemsEstudiante = [
    {
      label: "Materias",
      href: "/estudiante/materias",
    },
    {
      label: "Actividades",
      href: "/estudiante/actividades",
    }
  ];

  const menuItemsMaestro = [
    {
      label: "Cursos",
      href: "/maestro/cursos",
    }
  ];

  // Determinar qué menú mostrar basado en el rol
  const menuItems = usuario?.rol === "maestro" ? menuItemsMaestro : menuItemsEstudiante;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    // Si hay un modal abierto, ciérralo
    if (typeof window !== 'undefined' && window.closeAnyOpenModal) {
      window.closeAnyOpenModal();
    }
  };

  const handleLogoutClick = () => {
    handleLinkClick(); // Cerrar menú y modales
    // Usar Next.js router para navegar programáticamente
    router.push("/cerrar-sesion");
  };

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      {/* Menú móvil - Toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} />
      </NavbarContent>

      {/* Logo en móvil */}
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Menú desktop */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <GimnasioLogo />
        </NavbarBrand>

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
            as={Link}
            color="primary"
            variant="flat"
            href={`/${usuario?.rol}/perfil`}
            isIconOnly
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            color="danger"
            variant="flat"
            onPress={handleLogoutClick}
            isIconOnly
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
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
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Menú móvil - Contenido */}
      <NavbarMenu>
        <NavbarMenuItem>
          <Button
            as={Link}
            href={`/${usuario?.rol}`}
            className="w-full justify-start"
            color="primary"
            variant="light"
            size="lg"
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
              variant="light"
              onPress={handleLinkClick}
              size="lg"
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
            variant="light"
            onPress={handleLogoutClick}
            size="lg"
          >
            Cerrar Sesión
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar >
  );
}