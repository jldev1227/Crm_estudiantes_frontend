"use client";

import { useMutation } from "@apollo/client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LOGIN_ESTUDIANTE } from "../graphql/mutation/loginEstudiante";
import { LOGIN_MAESTRO } from "../graphql/mutation/loginMaestro";
import { LOGIN_USUARIO } from "../graphql/mutation/loginUsuario";
import { useAuth } from "../context/AuthContext";

import LoaderIngreso from "@/components/loaderIngreso";

export default function Page() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "estudiante";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMaestro, setIsMaestro] = useState(activeTab === "maestro");
  const [loading, setLoading] = useState(false);
  const [pensionInactiva, setPensionInactiva] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRoleChange = (value: boolean) => {
    setIsMaestro(value);
  };

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as string);

    // Update URL params to persist tab selection
    const params = new URLSearchParams(window.location.search);

    params.set("tab", key as string);

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    window.history.pushState({}, "", newUrl);

    // Reset form states when changing tabs
    setNumeroIdentificacion("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
    setPensionInactiva(false);

    // Set isMaestro based on tab selection
    setIsMaestro(key === "maestro");
  };

  // useMutation hooks
  const [loginEstudiante, { data: dataEstudiante, error: errorEstudiante }] =
    useMutation(LOGIN_ESTUDIANTE);
  const [loginMaestro, { data: dataMaestro, error: errorMaestro }] =
    useMutation(LOGIN_MAESTRO);
  const [loginUsuario, { data: dataUsuario, error: errorUsuario }] =
    useMutation(LOGIN_USUARIO);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPensionInactiva(false);
    setErrorMessage("");

    try {
      let data;

      if (activeTab === "administrador") {
        // Admin login with email/password
        const result = await loginUsuario({
          variables: {
            email,
            password,
          },
        });

        data = result.data;

        if (data?.loginUsuario) {
          const { token, usuario } = data.loginUsuario;

          login({
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
            numero_identificacion: usuario.numero_identificacion,
            email: usuario.email,
            rol: usuario.rol,
            token,
          });
          router.push("/admin");
        }
      } else {
        // Student or teacher login with ID/password
        const mutation = isMaestro ? loginMaestro : loginEstudiante;

        const result = await mutation({
          variables: {
            numero_identificacion: numeroIdentificacion,
            password,
          },
        });

        data = result.data;

        // Handle student login
        if (!isMaestro && data?.loginEstudiante) {
          const { token, estudiante } = data.loginEstudiante;

          // Verificar pensión activa antes de procesar el login
          if (estudiante.pension_activa === false) {
            setPensionInactiva(true);
            setErrorMessage(
              "Tu pensión no está activa. Por favor contacta con administración.",
            );

            // Aún realizar el login pero redirigir a la página de pensión inactiva
            login({
              id: estudiante.id,
              nombre_completo: estudiante.nombre_completo,
              numero_identificacion: estudiante.numero_identificacion,
              tipo_documento: estudiante.tipo_documento,
              rol: "estudiante",
              grado_id: estudiante.grado_id,
              grado_nombre: estudiante.grado.nombre,
              fecha_nacimiento: estudiante.fecha_nacimiento,
              celular_padres: estudiante.celular_padres,
              pension_activa: false,
              token,
            });

            return;
          }

          // Procesar login normal si la pensión está activa
          login({
            id: estudiante.id,
            nombre_completo: estudiante.nombre_completo,
            numero_identificacion: estudiante.numero_identificacion,
            tipo_documento: estudiante.tipo_documento,
            rol: "estudiante",
            grado_id: estudiante.grado_id,
            grado_nombre: estudiante.grado.nombre,
            fecha_nacimiento: estudiante.fecha_nacimiento,
            celular_padres: estudiante.celular_padres,
            pension_activa: true,
            token,
          });
          router.push("/estudiante");
        }
        // Handle teacher login
        else if (isMaestro && data?.loginMaestro) {
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
        }
      }

      // If no successful login was processed
      if (
        !data?.loginEstudiante &&
        !data?.loginMaestro &&
        !data?.loginUsuario
      ) {
        setErrorMessage("Respuesta del servidor inesperada");
      }
    } catch (err: any) {
      console.error("Error detallado:", err);

      // Detectar si el error está relacionado con pensión inactiva
      const errorMessage = err.message || "";

      if (
        errorMessage.toLowerCase().includes("pensión") ||
        errorMessage.toLowerCase().includes("pension")
      ) {
        setPensionInactiva(true);
      }

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
    if (errorEstudiante) setErrorMessage(errorEstudiante.message);
    if (errorMaestro) setErrorMessage(errorMaestro.message);
    if (errorUsuario) setErrorMessage(errorUsuario.message);

    // Detectar si el error está relacionado con pensión inactiva
    const currentError = errorEstudiante || errorMaestro || errorUsuario;

    if (currentError && currentError.message) {
      const message = currentError.message.toLowerCase();

      if (message.includes("pensión") || message.includes("pension")) {
        setPensionInactiva(true);
      }
    }
  }, [errorEstudiante, errorMaestro, errorUsuario]);

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
        />
        {/* Overlay sobre la imagen (opcional) */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Columna Derecha: Formulario */}
      <form
        className="bg-blue-100 md:shadow-md col-span-1 flex flex-col"
        onSubmit={handleSubmit}
      >
        {/* Logo */}
        <Image
          alt="Logo"
          className="mx-auto mt-8"
          height={300}
          src={"/LOGO.png"}
          width={300}
        />

        {/* Contenido en bloque blanco */}
        <div className="bg-white p-6 flex flex-col space-y-6 flex-1">
          <h2 className="text-2xl font-bold text-center">Inicia sesión</h2>

          {errorMessage && (
            <div
              className={`border-l-4 p-2 px-4 ${
                pensionInactiva
                  ? "bg-amber-100 border-amber-500 text-amber-700"
                  : "bg-red-100 border-red-500 text-red-700"
              }`}
            >
              <p>
                <strong>{pensionInactiva ? "Aviso:" : "Error:"}</strong>{" "}
                {errorMessage}
              </p>
            </div>
          )}

          <Tabs
            classNames={{
              tabList:
                "gap-4 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
            }}
            color="primary"
            selectedKey={activeTab}
            variant="underlined"
            onSelectionChange={handleTabChange}
          >
            <Tab key="estudiante" title="Estudiante" />
            <Tab key="maestro" title="Maestro" />
            <Tab key="administrador" title="Administrador" />
          </Tabs>

          <div className="space-y-4">
            {activeTab === "administrador" ? (
              // Admin form with email
              <Input
                label="Email"
                placeholder="Ingresa tu email"
                value={email}
                variant="bordered"
                onValueChange={setEmail}
              />
            ) : (
              // Student/Teacher form with ID number
              <Input
                label="Número documento"
                placeholder="Ingresa tu número de documento"
                value={numeroIdentificacion}
                variant="bordered"
                onValueChange={setNumeroIdentificacion}
              />
            )}

            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              variant="bordered"
              onValueChange={setPassword}
            />
          </div>

          <Button
            fullWidth
            className="h-14"
            color="primary"
            endContent={
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            type="submit"
          >
            Ingresar
          </Button>
        </div>
      </form>
    </div>
  );
}
