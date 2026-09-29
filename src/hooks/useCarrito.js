// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/hooks/useCarrito.js
// Responsabilidad: Encapsula lógica reutilizable de estado.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

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