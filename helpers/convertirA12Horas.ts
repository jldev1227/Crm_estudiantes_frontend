/**
 * Convierte una hora en formato 24 horas a formato AM/PM
 * @param {string} horaMilitar - Hora en formato 24 horas (HH:MM o HH:MM:SS)
 * @returns {string} Hora en formato AM/PM
 */
export const convertirA12Horas = (horaMilitar: string) => {
  // Si no hay hora, devolver string vacío
  if (!horaMilitar) return "";

  // Extraer horas y minutos
  const [horas, minutos, segundos] = horaMilitar.split(":");
  const horasNum = parseInt(horas, 10);

  // Determinar AM o PM
  const periodo = horasNum >= 12 ? "PM" : "AM";

  // Convertir horas a formato 12 horas
  let horas12 = horasNum % 12;

  horas12 = horas12 === 0 ? 12 : horas12; // Si es 0, mostrar como 12

  // Formatear salida final (con o sin segundos)
  if (segundos) {
    return `${horas12}:${minutos}:${segundos} ${periodo}`;
  } else {
    return `${horas12}:${minutos} ${periodo}`;
  }
};
