import ProtectedRoute from "@/components/ProtectedRoute";

export default function MaestroPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Bienvenido, Maestro</h1>
      </div>
    </ProtectedRoute>
  );
}
