export const validators = {
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  isPhoneNumber(phone) {
    return /^\d{8}$/.test(phone?.replace(/\D/g, ''))
  },

  isStrongPassword(password) {
    return password.length >= 8
  },

  isNotEmpty(value) {
    return value && value.trim().length > 0
  },
}
