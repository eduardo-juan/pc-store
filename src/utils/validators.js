export const validators = {

// Verifica que el valor tenga una estructura básica de correo electrónico.  
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

// Verifica que el teléfono contenga exactamente 8 dígitos.  
  isPhoneNumber(phone) {
    return /^\d{8}$/.test(phone?.replace(/\D/g, ''))
  },

// Verifica que la contraseña tenga al menos 8 caracteres.  
  isStrongPassword(password) {
    return password.length >= 8
  },

// Verifica que el valor no esté vacío.  
  isNotEmpty(value) {
    return value && value.trim().length > 0
  }
}