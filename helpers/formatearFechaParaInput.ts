/**
 * Convierte un timestamp en milisegundos a formato 'YYYY-MM-DD' para input type="date"
 * 
 * @param {string|number} timestamp - El timestamp en milisegundos
 * @returns {string} Fecha formateada como 'YYYY-MM-DD'
 */
const formatearFechaParaInput = (timestamp : string) => {
    // Si no hay timestamp, devolver string vacío
    if (!timestamp) return '';
    
    // Convertir a número si es string
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    
    // Crear objeto Date
    const fecha = new Date(timestampNum);
    
    // Verificar si es una fecha válida
    if (isNaN(fecha.getTime())) return '';
    
    // Obtener año, mes y día
    const año = fecha.getFullYear();
    // getMonth() devuelve 0-11, por lo que sumamos 1 y añadimos padding con 0
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Formato YYYY-MM-DD requerido para input type="date"
    return `${año}-${mes}-${dia}`;
  };
  
  export default formatearFechaParaInput;