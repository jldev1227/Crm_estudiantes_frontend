import React from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { useAuth } from "@/app/context/AuthContext";

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { usuario } = useAuth()

  const menuItemsEstudiante = [
    {
      label: "Materias",
      href: '/estudiante/materias',
    },
    {
      label: "Actividades",
      href: '/estudiante/actividades',
    },
    {
      label: "Cerrar sesión",
      href: '/cerrar-sesion',
    }
  ];

  const menuItemsMaestro = [
    {
      label: "Cursos",
      href: '/maestro/cursos',
    },
    {
      label: "Cerrar sesión",
      href: '/cerrar-sesion',
    }
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="xl:hidden"
        />
      </NavbarContent>

      <NavbarContent className="hidden xl:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {usuario?.rol === 'maestro' ? (
          menuItemsMaestro.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full"
                color={
                  index === menuItemsMaestro.length - 1 ? "danger" : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))
        ) : (
          menuItemsEstudiante.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full"
                color={
                  index === menuItemsEstudiante.length - 1 ? "danger" : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))
        )}
      </NavbarMenu>
    </Navbar>
  );
}
