import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Estudiante = {
  id: string;
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
  pension_activa?: boolean;
};

export type Maestro = {
  id: string;
  nombre_completo: string;
  email: boolean;
  celular: string;
  tipo_documento: string;
  numero_identificacion: string;
};

export type Curso = {
  id: string
  nombre: string
  area: {
    id: string;
    nombre: string;
  };
  grado: {
    id: string;
    nombre: string;
  };
  director: {
    id: string;
    nombre_completo: string;
  };
  estudiantes: Estudiante[];
};