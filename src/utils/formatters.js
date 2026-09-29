export const formatters = {

// Formatea un monto como moneda en lempiras con dos decimales.  
  formatMoney(amount) {
    return `L ${Number(amount).toFixed(2)}`
  },

// Convierte una fecha al formato de fecha utilizado en Honduras.  
  formatDate(date) {
    return new Date(date).toLocaleDateString('es-HN')
  },

// Convierte una fecha y hora al formato local de Honduras.  
  formatDateTime(date) {
    return new Date(date).toLocaleString('es-HN')
  },

// Formatea teléfonos de 8 dígitos separándolos en bloques de cuatro.  
  formatPhoneNumber(phone) {
    return phone?.replace(/(\d{4})(\d{4})/, '$1-$2')
  }
}