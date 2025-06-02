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
  email: string;
  celular: string;
  tipo_documento: string;
  numero_identificacion: string;
};

export type Curso = {
  id: string
  nombre: string
  areas: Area[]
  grado: Grado;
  director: Maestro;
  estudiantes: Estudiante[];
};

export type Area = {
  id: string;
  nombre: string;
}

export type Grado = {
  id: string;
  nombre: string;
  director?: Maestro
}
