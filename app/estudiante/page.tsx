import ProtectedRoute from "@/components/ProtectedRoute";

export default function EstudiantePage() {
    return (
        <ProtectedRoute>
            <div>
                <h1>Bienvenido, Estudiante</h1>
                <p>Contenido protegido solo para estudiantes.</p>
            </div>
        </ProtectedRoute>
    );
}
