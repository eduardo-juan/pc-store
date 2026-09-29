// Módulo reutilizable que concentra la lógica y presentación de esta funcionalidad.
import { useContext } from 'react'
import { CarritoContext } from '../context/CarritoContext'

export const useCarrito = () => {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe estar dentro de CarritoProvider')
  }
  return context
}