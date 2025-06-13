// src/pages/InformacionExtra.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

const InformacionExtra = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // No logueado → lo mando al login
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setErrorMsg('No se encontró el usuario autenticado');
      setLoading(false);
      return;
    }

    // Verificar si el usuario ya existe en 'usuarios'
    const { data: existingUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error al buscar usuario existente:", fetchError.message);
      setErrorMsg('Error al verificar el usuario');
      setLoading(false);
      return;
    }

    if (existingUser) {
      // Si ya existe → hacemos UPDATE
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          dni,
          telefono,
        })
        .eq('auth_id', user.id);

      if (updateError) {
        console.error("Error al actualizar usuario:", updateError.message);
        setErrorMsg('Error al actualizar la información');
        setLoading(false);
        return;
      }

      // Guardar en localStorage y redirigir
      localStorage.setItem('usuario', JSON.stringify({
        ...existingUser,
        dni,
        telefono,
      }));
      navigate('/');
    } else {
      // No existe → hacemos INSERT
      const { data: insertedUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: user.id,
          email: user.email,
          dni,
          telefono,
          esPropietario: false, // Valor por defecto (puedes cambiarlo si querés)
          nombre: '',
          apellido: '',
          imagen: '',
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error al insertar usuario:", insertError.message);
        setErrorMsg('Error al guardar la información');
        setLoading(false);
        return;
      }

      // Guardar en localStorage y redirigir
      localStorage.setItem('usuario', JSON.stringify(insertedUser));
      navigate('/');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Completa tu información</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
        <label>DNI *</label>
        <input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Ingrese su DNI"
          required
        />

        <label>Teléfono *</label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ingrese su número de teléfono"
          required
        />

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Guardando...' : 'Guardar Información'}
        </button>
      </form>
    </div>
  );
};

export default InformacionExtra;
