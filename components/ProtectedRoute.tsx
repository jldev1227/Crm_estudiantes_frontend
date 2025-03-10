"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoaderIngreso from "./loaderIngreso";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/ingreso"); // Si no hay token, redirigir a login
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoaderIngreso>Autenticando</LoaderIngreso>;

  return <>{children}</>; // Si el usuario está autenticado, renderiza la página
}
