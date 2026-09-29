// Punto de entrada de React: monta la aplicación en el elemento raíz del documento
// y carga los estilos globales necesarios para iniciar la interfaz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
