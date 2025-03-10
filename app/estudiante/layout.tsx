"use client";

import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Divider } from "@heroui/divider";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useMediaQuery } from "react-responsive";
import SideMenu from "@/components/navbarMenu";
import { EstudianteProvider } from "../context/EstudianteContext";

export default function MaestroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = useAuth();
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1024 });

  return (
    <EstudianteProvider>
      <ProtectedRoute allowedRoles={['estudiante']}>
        <main
          className={`${isDesktopOrLaptop ? "grid grid-cols-5" : ""} h-screen`}
        >
          {isDesktopOrLaptop ? (
            <div className="col-span-1 border-r-2 bg-blue-600 text-white h-full">
              <div className="sticky top-0">
                <div className="bg-white">
                  <Image
                    className="mx-auto"
                    src={"/LOGO.png"}
                    width={200}
                    height={200}
                    alt="Logo"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h1 className="text-xl font-bold">Bienvenido!</h1>
                  <h2 className="text-sm">{usuario?.nombre}</h2>
                </div>
                <Divider />
                <div>
                  <ul className="flex flex-col p-5">
                    <Link
                      className="flex items-center gap-5 hover:bg-white/10 rounded-md p-2 transition-colors ease-in-out"
                      href={"/estudiante/materias"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                      <p>Materias</p>
                    </Link>
                    <Link
                      className="flex items-center gap-5 hover:bg-white/10 rounded-md p-2 transition-colors ease-in-out"
                      href={"/estudiante/actividades"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                        />
                      </svg>
                      <p>Actividades</p>
                    </Link>
                    <Link
                      className="flex items-center gap-5 hover:bg-white/10 rounded-md p-2 transition-colors ease-in-out"
                      href={"/estudiante/perfil"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      <p>Perfil</p>
                    </Link>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <SideMenu></SideMenu>
          )}
          <div className="col-span-4 p-4 md:p-10 h-screen">{children}</div>
        </main>
      </ProtectedRoute>
    </EstudianteProvider>
  );
}
