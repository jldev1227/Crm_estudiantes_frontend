"use client";

import Image from "next/image"
import { useAuth } from "../context/AuthContext";
import { Divider } from "@heroui/divider";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useMediaQuery } from "react-responsive";
import SideMenu from "@/components/navbarMenu";
import { MaestroProvider } from "../context/MaestroContext";

export default function MaestroLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { usuario } = useAuth();
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 });

  return (
    <MaestroProvider>
      <ProtectedRoute>
        <main className={`${isDesktopOrLaptop ? "grid grid-cols-5" : ""} h-screen`}>
          {isDesktopOrLaptop ? (
            <div className="col-span-1 border-r-2 bg-blue-600 text-white h-full">
              <div className="sticky top-0">
                <div className="bg-white">
                  <Image
                    className="mx-auto"
                    src={'/LOGO.png'}
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
                    <Link className="flex items-center gap-5 hover:bg-white/10 rounded-md p-2 transition-colors ease-in-out" href={'/maestro/cursos'}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                      </svg>
                      <p>Cursos</p>
                    </Link>
                    <Link className="flex items-center gap-5 hover:bg-white/10 rounded-md p-2 transition-colors ease-in-out" href={'perfil'}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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
          <div className="col-span-4 p-4 md:p-10">
            {children}
          </div>
        </main>
      </ProtectedRoute>
    </MaestroProvider>
  )
}