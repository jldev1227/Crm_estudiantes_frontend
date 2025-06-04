import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Estudiante = {
  id: number;
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
  grado_id: string;
  pension_activa?: boolean;
  grado: Grado;
};

export type Maestro = {
  id: number;
  nombre_completo: string;
  email: string;
  celular: string;
  tipo_documento: string;
  numero_identificacion: string;
};

export type Curso = {
  id: string;
  nombre: string;
  areas: Area[];
  grado: Grado;
  director: Maestro;
  estudiantes: Estudiante[];
};

export type Area = {
  id: string;
  nombre: string;
};

export type Grado = {
  id: string;
  nombre: string;
  director?: Maestro;
};

export type Nota = {
  id: string;
  nombre: string;
  valor: number;
  porcentaje: number;
  completada?: boolean;
  actividad_id: string;
};

export type Calificacion = {
  id: string;
  estudiante: Estudiante;
  grado: Curso;
  area: Area;
  notas: Nota[];
  grado_id?: string;
  area_id?: string;
  estudiante_id?: number;
  periodo: number;
  notaFinal: number;
  [key: string]: any; // Para otras propiedades que pueda tener
};
