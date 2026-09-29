// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/context/AuthContext.jsx
// Responsabilidad: Forma parte del funcionamiento de PC Store.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// ============================================================
// CONTEXTO DE AUTENTICACIÓN
// Centraliza la sesión, usuario, perfil, registro, login,
// cierre de sesión y permisos de acceso de PC Store.
// ============================================================
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Contexto compartido para que cualquier componente pueda
// consultar y controlar la autenticación del usuario.
const AuthContext = createContext();

// Proveedor que mantiene disponible el estado de autenticación
// para toda la aplicación.
export const AuthProvider = ({ children }) => {

// Estado principal de autenticación:
// usuario contiene el perfil, session la sesión activa,
// cargando indica si se está verificando y error almacena errores.
  const [usuario, setUsuario] = useState(null);
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

// Registra en Supabase el acceso exitoso del usuario
// mediante la función de auditoría.
  const registrarAcceso = async () => {
    try {
      const { error } = await supabase.rpc("registrar_acceso_auditoria");
      if (error)
      console.error("[AUDITORIA] Error registrando acceso:", error);
    } catch (err) {
      console.error("[AUDITORIA] Error inesperado:", err);
    }
  };

// Obtiene el perfil adicional desde la tabla usuarios
// y lo combina con la información de Supabase Auth.
  const cargarPerfil = async (authUser) => {
    if (!authUser) {
      setUsuario(null);
      return null;
    }
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("id,email,nombre,apellido,teléfono,dirección,ciudad,país,avatar_url,rol,activo,bloqueado,dni,created_at,updated_at")
        .eq("id", authUser.id)
        .maybeSingle();
      if (perfilError) {
      console.error("[AUTH] Error cargando perfil:", perfilError);
        setUsuario({ ...authUser });
        return authUser;
      }

// Si el usuario está bloqueado, cerramos su sesión
// y evitamos que pueda continuar en la aplicación.
      if (perfil?.bloqueado === true) {
        const mensaje =
          "Tu cuenta está bloqueada. Contacta con el Soporte.";
        setError(mensaje);
        setUsuario(null);
        setSession(null);
        await supabase.auth.signOut();
        return null;
      }
      const usuarioCompleto = { ...authUser, ...(perfil || {}) };
      setUsuario(usuarioCompleto);
      return usuarioCompleto;
    } catch (err) {
      console.error("[AUTH] Error inesperado cargando perfil:", err);
      setUsuario({ ...authUser });
      return authUser;
    }
  };

// Inicializa la autenticación al cargar la aplicación,
// recuperando la sesión existente y escuchando sus cambios.
  useEffect(() => {
    let activo = true;
    const iniciarAuth = async () => {
      try {
        const {
          data: { session: sesionActual },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (!activo) return;
        if (sessionError) {
      console.error("[AUTH] Error obteniendo sesión:", sessionError);
          setError(sessionError.message);
        }
        if (sesionActual?.user) {
          setSession(sesionActual);
          await cargarPerfil(sesionActual.user);
        } else {
          setSession(null);
          setUsuario(null);
        }
      } catch (err) {
      console.error("[AUTH] Error inicializando autenticación:", err);
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    };
    iniciarAuth();

// Escucha cambios de autenticación para mantener sincronizado
// el estado de sesión con Supabase.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nuevaSesion) => {
      if (!activo) return;
      
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setSession(null);
        setUsuario(null);
        return;
      }
      if (nuevaSesion?.user) setSession(nuevaSesion);
    });
    return () => {
      activo = false;
      subscription?.unsubscribe();
    };
  }, []);

// Cuando cambia la sesión, actualizamos el perfil del usuario
// para mantener sincronizada su información.  
  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      if (!session?.user) return;
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!activo) return;
      await cargarPerfil(session.user);
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [session]);

// Registra un nuevo usuario en Supabase Auth y crea
// su perfil correspondiente en la tabla usuarios.  
  const registro = async (email, password, nombre, apellido, teléfono) => {
    try {
      setError(null);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!user) throw new Error("No se pudo crear el usuario");

      const { error: perfilError } = await supabase.from("usuarios").insert([
        {
          id: user.id,
          email,
          nombre,
          apellido,
          teléfono,
          rol: "user",
          bloqueado: false,
          activo: true,
        },
      ]);
      if (perfilError) throw perfilError;

      const {
        data: { session: nuevaSesion },
      } = await supabase.auth.getSession();
      if (nuevaSesion) {
        setSession(nuevaSesion);
        await cargarPerfil(user);
      }
      return { success: true, user };
    } catch (err) {
      console.error("[AUTH] Error en registro:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

// Autentica al usuario, carga su perfil y registra
// el acceso exitoso en auditoría.  
  const login = async (email, password) => {
    try {
      setError(null);
      const {
        data: { session: nuevaSesion, user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (!user || !nuevaSesion) throw new Error("No se pudo iniciar sesión");
      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("id,email,nombre,apellido,teléfono,dirección,ciudad,país,avatar_url,rol,activo,bloqueado,dni,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle();

// Impide el acceso a usuarios bloqueados aunque
// sus credenciales sean correctas.        
      if (perfilError) {
      console.error(
          "[AUTH] Error cargando perfil después del login:",
          perfilError,
        );
        setSession(nuevaSesion);
        setUsuario(user);
        await registrarAcceso();
        return { success: true, user };
      }
      if (perfil?.bloqueado === true) {
        const mensaje =
          "Tu cuenta está bloqueada. Contacta con el administrador.";
        await supabase.auth.signOut();
        setSession(null);
        setUsuario(null);
        setError(mensaje);
        return { success: false, error: mensaje };
      }
      setSession(nuevaSesion);
      setUsuario({ ...user, ...(perfil || {}) });
      await registrarAcceso();
      return { success: true, user };
    } catch (err) {
      console.error("[AUTH] Error en login:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

// Cierra la sesión en Supabase y limpia el estado
// de autenticación de la aplicación.  
  const logout = async () => {
    try {
      setError(null);
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      setSession(null);
      setUsuario(null);
    } catch (err) {
      console.error("[AUTH] Error cerrando sesión:", err);
      setError(err.message);
    }
  };

// Determina los permisos principales según el rol del usuario.
// Staff incluye administradores y empleados.  
  const esAdmin = usuario?.rol === "admin";
  const esEmpleado = usuario?.rol === "empleado";
  const esStaff = esAdmin || esEmpleado;

// Exponemos el usuario, sesión, estados, acciones de autenticación
// y permisos al resto de la aplicación.  
  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil: usuario,
        session,
        cargando,
        error,
        registro,
        login,
        logout,
        esAdmin,
        esEmpleado,
        esStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de autenticación.
// Genera un error si se utiliza fuera de AuthProvider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
