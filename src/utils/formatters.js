export const formatters = {
  formatMoney(amount) {
    return `L ${Number(amount).toFixed(2)}`
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('es-HN')
  },

  formatDateTime(date) {
    return new Date(date).toLocaleString('es-HN')
  },

  formatPhoneNumber(phone) {
    return phone?.replace(/(\d{4})(\d{4})/, '$1-$2')
  }
}