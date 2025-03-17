"use client";

import { useMutation } from "@apollo/client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { LOGIN_ESTUDIANTE } from "../graphql/mutation/loginEstudiante";
import ToggleMaestroEstudiante from "@/components/toggleIngreso";
import LoaderIngreso from "@/components/loaderIngreso";
import { LOGIN_MAESTRO } from "../graphql/mutation/loginMaestro";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Page() {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMaestro, setIsMaestro] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRoleChange = (value: boolean) => {
    setIsMaestro(value);
  };

  // useMutation nos devuelve la función loginEstudiante y el estado (data, loading, error)
  const [loginEstudiante, { data: dataEstudiante, error: errorEstudiante }] =
    useMutation(LOGIN_ESTUDIANTE);
  const [loginMaestro, { data: dataMaestro, error: errorMaestro }] =
    useMutation(LOGIN_MAESTRO);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mutation = isMaestro ? loginMaestro : loginEstudiante;

      // Elimina el setTimeout, puede causar problemas
      const { data } = await mutation({
        variables: {
          numero_identificacion: numeroIdentificacion,
          password,
        },
      });

      // Verifica la estructura de la respuesta
      if (isMaestro && data?.loginMaestro) {
        const { token, maestro } = data.loginMaestro;
        login({
          id: maestro.id,
          nombre_completo: maestro.nombre_completo,
          numero_identificacion: maestro.numero_identificacion,
          rol: "maestro",
          tipo_documento: maestro.tipo_documento,
          celular: maestro.celular,
          email: maestro.email,
          token,
        });
        router.push("/maestro");
      } else if (!isMaestro && data?.loginEstudiante) {
        const { token, estudiante } = data.loginEstudiante;
        login({
          id: estudiante.id,
          nombre_completo: estudiante.nombre_completo,
          numero_identificacion: estudiante.numero_identificacion,
          rol: "estudiante",
          grado_id: estudiante.grado_id,
          grado_nombre: estudiante.grado.nombre,
          fecha_nacimiento: estudiante.fecha_nacimiento,
          celular_padres: estudiante.celular_padres,
          token,
        });
        router.push("/estudiante");
      } else {
        setErrorMessage("Respuesta del servidor inesperada");
      }
    } catch (err: any) {
      console.error("Error detallado:", err);
      if (err.networkError) {
        console.error("Network error details:", err.networkError);
      }
      if (err.graphQLErrors) {
        const errorMsg = err.graphQLErrors
          .map((e: any) => e.message)
          .join(", ");
        setErrorMessage(`Error: ${errorMsg}`);
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (!token || !storedUser) return; // Si no hay token o usuario, no hacer nada

    try {
      const usuario = JSON.parse(storedUser); // Parsear usuario si existe

      if (usuario?.rol) {
        router.push(usuario.rol === "maestro" ? "/maestro" : "/estudiante");
      }
    } catch (error) {
      console.error("Error al parsear usuario:", error);
      localStorage.removeItem("usuario"); // Remover usuario si hay error
    }
  }, [router]); // Agregar router como dependencia

  useEffect(() => {
    if (errorEstudiante) setErrorMessage(errorEstudiante.message);
    if (errorMaestro) setErrorMessage(errorMaestro.message);
  }, [errorEstudiante, errorMaestro]);

  if (loading) return <LoaderIngreso>Autenticando</LoaderIngreso>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen">
      {/* Columna Izquierda: Imagen de fondo con overlay */}
      <div className="hidden md:relative md:col-span-2 md:block">
        {/* Imagen de fondo */}
        <div
          className="
                    h-full w-full
                    bg-cover bg-no-repeat
                    bg-[50%_37%]
                    bg-[url('/banner_ingreso2.jpeg')]
                    "
        ></div>
        {/* Overlay sobre la imagen (opcional) */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Columna Derecha: Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-blue-100 md:shadow-md col-span-1 flex flex-col"
      >
        {/* Logo */}
        <Image
          className="mx-auto mt-8"
          src={"/LOGO.png"}
          width={300}
          height={300}
          alt="Logo"
        />

        {/* Contenido en bloque blanco */}
        <div className="bg-white p-6 flex flex-col space-y-6 flex-1">
          <h2 className="text-2xl font-bold text-center">Inicia sesión</h2>

          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 px-4">
              <p>
                <strong>Error:</strong> {errorMessage}
              </p>
            </div>
          )}

          <div className="flex gap-5 items-center justify-center">
            <label
              htmlFor="maestro-toggle"
              className="block text-sm font-medium text-gray-700"
            >
              Es maestro?
            </label>

            <ToggleMaestroEstudiante
              id="maestro-toggle" // Add this ID to associate with the label
              defaultChecked={isMaestro}
              onChange={handleRoleChange}
            />
          </div>

          <div className="space-y-2">
            <Input
              variant="bordered"
              label="Número documento"
              placeholder="Ingresa tu número de documento"
              value={numeroIdentificacion}
              onValueChange={setNumeroIdentificacion}
            />
            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              variant="bordered"
              value={password}
              onValueChange={setPassword}
            />
          </div>
          <Button
            color="primary"
            className="h-14"
            fullWidth
            type="submit"
            endContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            }
          >
            Ingresar
          </Button>
        </div>
      </form>
    </div>
  );
}
