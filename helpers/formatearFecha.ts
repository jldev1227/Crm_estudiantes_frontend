export function formatearFecha(timestamp: string) {
  // Crear fecha a partir del timestamp
  const fecha = new Date(Number(timestamp));

  // Verificar que sea una fecha válida
  if (isNaN(fecha.getTime())) {
    return "Fecha inválida";
  }

  // Ajustar la zona horaria (por ejemplo, para Colombia/Bogotá, GMT-5)
  // Puedes ajustar este valor según tu zona horaria
  const offsetHoras = 0; // Para Colombia

  // Crear una nueva fecha ajustada
  const fechaAjustada = new Date(
    fecha.getTime() + offsetHoras * 60 * 60 * 1000,
  );

  // Formatear la fecha como DD/MM/YYYY
  const dia = fechaAjustada.getUTCDate().toString().padStart(2, "0");
  const mes = (fechaAjustada.getUTCMonth() + 1).toString().padStart(2, "0");
  const año = fechaAjustada.getUTCFullYear();

  return `${dia}/${mes}/${año}`;
}
