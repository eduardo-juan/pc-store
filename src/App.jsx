import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import GlobalFeedback from "./components/GlobalFeedback";
import "./responsive.js";
import "./App.css";
import "./styles/required-fields.css";

import Inicio from "./pages/Inicio";
import Tienda from "./pages/Tienda";
import Checkout from "./pages/Checkout";
import MisOrdenes from "./pages/MisOrdenes";
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import OrdenConfirmada from "./pages/OrdenConfirmada";
import NotFound from "./pages/NotFound";

import Login from "./components/Auth/Login";
import Registro from "./components/Auth/Registro";
import RecuperarPassword from "./components/Auth/RecuperarPassword";
import RestablecerPassword from "./components/Auth/RestablecerPassword";
import Carrito from "./components/Productos/Carrito";
import DetalleProducto from "./components/Productos/DetalleProducto";

import AdminDashboard from "./components/Admin/AdminDashboard";
import EmpleadoDashboard from "./components/Admin/EmpleadoDashboard";
import GestionProductos from "./components/Admin/GestionProductos";
import GestionInventario from "./components/Admin/GestionInventario";
import GestionCategorias from "./components/Admin/GestionCategorias";
import GestionOrdenes from "./components/Admin/GestionOrdenes";
import GestionUsuarios from "./components/Admin/GestionUsuarios";
import GestionEmpleados from "./components/Admin/GestionEmpleados";
import RegistroEmpleado from "./components/Admin/RegistroEmpleado";
import HistorialVentas from "./components/Admin/HistorialVentas";
import HistorialComisionesEmpleado from "./components/Admin/HistorialComisionesEmpleado";
import AuditoriaAccesos from "./components/Admin/AuditoriaAccesos";
import AdminTableTools from "./components/Admin/AdminTableTools";