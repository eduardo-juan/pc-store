import { useContext } from 'react'
import { CarritoContext } from '../context/CarritoContext'

export const useCarrito = () => {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe estar dentro de CarritoProvider')
  }
  return context
}
