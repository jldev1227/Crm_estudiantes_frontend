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
  ver_calificaciones?: boolean;
  grado: Grado;
};

export type EstudianteInput = {
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
  password?: string;
  grado_id?: string;
};

export type Maestro = {
  id: number;
  nombre_completo: string;
  email: string;
  celular: string;
  tipo_documento: string;
  numero_identificacion: string;
  grados_asignados: { id: number; nombre_grado: string }[];
};

export type Curso = {
  id: number;
  nombre: string;
  areas: Area[];
  grado: Grado;
  director: Maestro;
  estudiantes: Estudiante[];
};

export type Area = {
  id: number;
  nombre: string;
  maestro: Maestro;
};

export type Grado = {
  id: number;
  nombre: string;
  director?: Maestro;
};

export type Nota = {
  id: number;
  nombre: string;
  valor: number;
  porcentaje: number;
  completada?: boolean;
  actividad_id: string;
};

export type Calificacion = {
  id: number;
  estudiante: Estudiante;
  grado: Curso;
  area: Area;
  notas: Nota[];
  grado_id?: number;
  area_id?: number;
  estudiante_id?: number;
  periodo: number;
  notaFinal: number;
  [key: string]: any; // Para otras propiedades que pueda tener
};
