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
};

export type Curso = {
  area: {
    id: string;
    nombre: string;
  };
  grado: {
    id: string;
    nombre: string;
  };
};
