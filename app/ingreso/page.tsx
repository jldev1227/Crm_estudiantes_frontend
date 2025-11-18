"use client";

import { useMutation } from "@apollo/client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LOGIN_ESTUDIANTE } from "../graphql/mutation/loginEstudiante";
import { LOGIN_MAESTRO } from "../graphql/mutation/loginMaestro";
import { LOGIN_USUARIO } from "../graphql/mutation/loginUsuario";
import { useAuth } from "../context/AuthContext";

import LoaderIngreso from "@/components/loaderIngreso";

// ✅ Componente de carga para Suspense
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/20 border border-white/40 p-8 space-y-6">
            <div className="h-24 w-24 bg-gray-200 animate-pulse rounded-2xl mx-auto" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-12 bg-gray-200 animate-pulse rounded-xl" />
              <div className="h-12 bg-gray-200 animate-pulse rounded-xl" />
              <div className="h-14 bg-gray-200 animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Componente interno que usa useSearchParams
function LoginForm() {
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
  const [loginEstudiante, { error: errorEstudiante }] =
    useMutation(LOGIN_ESTUDIANTE);
  const [loginMaestro, { error: errorMaestro }] = useMutation(LOGIN_MAESTRO);
  const [loginUsuario, { error: errorUsuario }] = useMutation(LOGIN_USUARIO);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPensionInactiva(false);
    setErrorMessage("");

    // Delay mínimo para mostrar el loader con animaciones completas (2.5 segundos)
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      let data;

      if (activeTab === "administrador") {
        // Admin login with email/password
        const [result] = await Promise.all([
          loginUsuario({
            variables: {
              email,
              password,
            },
          }),
          minimumDelay,
        ]);

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

        const [result] = await Promise.all([
          mutation({
            variables: {
              numero_identificacion: numeroIdentificacion,
              password,
            },
          }),
          minimumDelay,
        ]);

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
              ver_calificaciones: estudiante.ver_calificaciones,
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
            ver_calificaciones: estudiante.ver_calificaciones,
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
      console.groupEnd();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50 relative overflow-hidden">
      {/* Decorative animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          {/* Glass card container */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/20 border border-white/40 overflow-hidden">
            {/* Logo section with gradient background */}
            <div className="relative bg-gradient-to-br from-blue-500/10 via-white/50 to-red-500/10 p-8 border-b border-white/40">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
              <div className="relative">
                <img
                  alt="Logo Vancouver"
                  className="mx-auto drop-shadow-lg"
                  height={120}
                  src={"/LOGO.png"}
                  width={120}
                />
              </div>
            </div>

            {/* Form content */}
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-red-700 bg-clip-text text-transparent">
                  Bienvenido
                </h2>
                <p className="text-slate-600 text-sm">
                  Inicia sesión para acceder al sistema
                </p>
              </div>

              {/* Error/Warning message with glass effect */}
              {errorMessage && (
                <div
                  className={`
                    relative overflow-hidden rounded-2xl p-4
                    ${
                      pensionInactiva
                        ? "bg-amber-500/10 border-2 border-amber-500/30"
                        : "bg-red-500/10 border-2 border-red-500/30"
                    }
                    backdrop-blur-sm
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${pensionInactiva ? "bg-amber-500" : "bg-red-500"}
                    `}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          pensionInactiva ? "text-amber-800" : "text-red-800"
                        }`}
                      >
                        <strong>{pensionInactiva ? "Aviso:" : "Error:"}</strong>{" "}
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs with glass effect */}
              <div className="bg-slate-100/50 backdrop-blur-sm rounded-2xl">
                <Tabs
                  classNames={{
                    tabList: "gap-2 w-full relative rounded-xl bg-transparent",
                    cursor: "bg-white shadow-sm rounded-xl",
                    tab: "h-11 font-semibold text-slate-600 data-[selected=true]:text-blue-700",
                    tabContent:
                      "group-data-[selected=true]:font-bold group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-blue-700 group-data-[selected=true]:to-red-700 group-data-[selected=true]:bg-clip-text group-data-[selected=true]:text-transparent",
                  }}
                  color="primary"
                  selectedKey={activeTab}
                  variant="solid"
                  onSelectionChange={handleTabChange}
                >
                  <Tab key="estudiante" title="Estudiante" />
                  <Tab key="maestro" title="Maestro" />
                  <Tab key="administrador" title="Admin" />
                </Tabs>
              </div>

              {/* Form inputs with glass effect */}
              <div className="space-y-4">
                {activeTab === "administrador" ? (
                  <Input
                    classNames={{
                      input: "bg-white/50",
                      inputWrapper:
                        "bg-white/60 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400/50 data-[hover=true]:bg-white/70 group-data-[focus=true]:bg-white/80 group-data-[focus=true]:border-blue-500",
                      label: "text-slate-700 font-medium",
                    }}
                    label="Email"
                    placeholder="correo@ejemplo.com"
                    size="lg"
                    type="email"
                    value={email}
                    variant="bordered"
                    onValueChange={setEmail}
                  />
                ) : (
                  <Input
                    classNames={{
                      input: "bg-white/50",
                      inputWrapper:
                        "bg-white/60 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400/50 data-[hover=true]:bg-white/70 group-data-[focus=true]:bg-white/80 group-data-[focus=true]:border-blue-500",
                      label: "text-slate-700 font-medium",
                    }}
                    label="Número de documento"
                    placeholder="Ingresa tu número de documento"
                    size="lg"
                    value={numeroIdentificacion}
                    variant="bordered"
                    onValueChange={setNumeroIdentificacion}
                  />
                )}

                <Input
                  classNames={{
                    input: "bg-white/50",
                    inputWrapper:
                      "bg-white/60 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-400/50 data-[hover=true]:bg-white/70 group-data-[focus=true]:bg-white/80 group-data-[focus=true]:border-red-500",
                    label: "text-slate-700 font-medium",
                  }}
                  label="Contraseña"
                  placeholder="••••••••"
                  size="lg"
                  type="password"
                  value={password}
                  variant="bordered"
                  onValueChange={setPassword}
                />
              </div>

              {/* Submit button with gradient and glass effect */}
              <Button
                fullWidth
                className="h-14 text-base font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-red-600 hover:from-blue-700 hover:via-blue-600 hover:to-red-700 text-white shadow-xl shadow-blue-300/30 hover:shadow-blue-400/40 hover:scale-[1.02] transition-all duration-300 border-2 border-white/20"
                endContent={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                size="lg"
                type="submit"
              >
                Ingresar al Sistema
              </Button>

              {/* Footer text */}
              <p className="text-center text-xs text-slate-500 pt-2">
                Gimnasio Pedagógico Vancouver
                <br />
                Sistema de Gestión Educativa
              </p>
            </div>
          </div>

          {/* Optional: Forgot password link */}
          <div className="text-center mt-6">
            <button
              className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors backdrop-blur-sm bg-white/40 px-4 py-2 rounded-full hover:bg-white/60"
              type="button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600" />
    </div>
  );
}

// ✅ Componente principal que exporta por defecto con Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
