export function formatearFechaCompleta(fechaStr : string) {
    // Verificar si la fecha está en formato DD/MM/YYYY
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaStr)) {
      throw new Error("El formato de fecha debe ser DD/MM/YYYY");
    }
  
    // Dividir la fecha en día, mes y año
    const [dia, mes, anio] = fechaStr.split('/').map(num => parseInt(num, 10));
    
    // Crear el objeto de fecha (los meses en JavaScript son base 0)
    const fecha = new Date(anio, mes - 1, dia);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha proporcionada no es válida");
    }
    
    // Nombres de los días de la semana
    const diasSemana = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 
      'Jueves', 'Viernes', 'Sábado'
    ];
    
    // Nombres de los meses
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Obtener el día de la semana, día, mes y año
    const diaSemana = diasSemana[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mesNombre = meses[fecha.getMonth()];
    const anioNum = fecha.getFullYear();
    
    // Construir el string formateado
    return `${diaSemana} ${diaMes} de ${mesNombre} de ${anioNum}`;
  }
  