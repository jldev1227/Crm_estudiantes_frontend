export function formatearFechaColombiaParaInput(fecha: Date): string {
  // Crear una fecha sin considerar la zona horaria
  const colombiaDate = new Date(fecha);

  // Ajustar a la zona horaria de Colombia (UTC-5)
  const offset = -5 * 60; // Offset en minutos para Colombia
  const colombiaOffset = colombiaDate.getTimezoneOffset(); // Offset local del navegador

  // Ajustar la diferencia si es necesario
  if (colombiaOffset !== offset) {
    // No ajustamos la hora, solo queremos la fecha en formato YYYY-MM-DD
  }

  const año = colombiaDate.getFullYear();
  const mes = String(colombiaDate.getMonth() + 1).padStart(2, "0");
  const dia = String(colombiaDate.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}
