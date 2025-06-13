// src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        // No hay user => error => mandalo al login
        navigate('/login');
        return;
      }

      // Buscar el usuario en la tabla 'usuarios'
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error al buscar en la tabla usuarios:", error.message);
        navigate('/login');
        return;
      }

      // Guardás en localStorage (como hacés en el login)
      if (usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Ahora chequeás si tiene los datos completos (esto depende de tu lógica)
        const datosCompletos = usuario.telefono && usuario.direccion; // ejemplo

        if (datosCompletos) {
          navigate('/');
        } else {
          navigate('/informacion-extra');
        }
      } else {
        // No existe el perfil => lo mandás a /informacion-extra sí o sí
        navigate('/informacion-extra');
      }
    };

    checkUser();
  }, [navigate]);

  return <p>Procesando login...</p>;
};

export default AuthCallback;
