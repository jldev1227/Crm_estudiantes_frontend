'use client';
import { useMutation } from '@apollo/client';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { LOGIN_ESTUDIANTE } from '../graphql/queries/loginEstudiante';
import ToggleMaestroEstudiante from '@/components/toggleIngreso';

export default function page() {
    const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isMaestro, setIsMaestro] = useState(false);
    const handleRoleChange = (value: boolean) => {
        setIsMaestro(value);
        console.log("¿Es Maestro?:", value);
    };
    // useMutation nos devuelve la función loginEstudiante y el estado (data, loading, error)
    const [loginEstudiante, { data, loading, error }] = useMutation(LOGIN_ESTUDIANTE);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!numeroIdentificacion || !password) {
            setErrorMessage("Faltan campos por llenar");
            return;
        }

        try {
            await loginEstudiante({
                variables: {
                    numero_identificacion: numeroIdentificacion,
                    password,
                },
            });
            // Si necesitas, puedes manejar la respuesta aquí
            // Por ejemplo, guardar el token en localStorage o en cookies
            console.log("Respuesta GraphQL:", data);
        } catch (err) {
            console.error("Error al hacer login:", err);
        }
    };

    useEffect(() => {
        if (error) {
            setErrorMessage(error.message);
        }
    }, [data, error]);

    if (loading) return <p>Cargando...</p>;

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
            <form onSubmit={handleSubmit} className="bg-blue-100 md:shadow-md col-span-1 flex flex-col">
                {/* Logo */}
                <Image
                    className="mx-auto mt-8"
                    src={'/LOGO.png'}
                    width={350}
                    height={350}
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

                    <div className='flex gap-5 items-center justify-center'>
                        <label className="block text-sm font-medium text-gray-700">Es maestro?</label>

                        <ToggleMaestroEstudiante
                            defaultChecked={false}   // Inicia en "Estudiante"
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
                        className='h-14'
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