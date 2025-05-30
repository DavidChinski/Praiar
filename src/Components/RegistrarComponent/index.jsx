import './RegistrarComponent.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import appleIcon from '../../assets/apple.jpg';
import facebookIcon from '../../assets/facebook.png';
import googleIcon from '../../assets/google.png';
import { useNavigate } from 'react-router-dom';

function RegistrarComponent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '', // cambiado de mail → email
    dni: '',
    telefono: '',
    contraseña: '',
    esPropietario: false,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { email, contraseña, ...perfilData } = formData;

    // Paso 1: Crear cuenta en Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: contraseña,
    });

    if (signUpError) {
      setErrorMsg('Error al registrar usuario: ' + signUpError.message);
      return;
    }

    const userId = authData?.user?.id;

    // Paso 2: Guardar perfil en la tabla 'usuarios'
    const { data: perfil, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        nombre: perfilData.nombre,
        apellido: perfilData.apellido,
        telefono: perfilData.telefono,
        dni: perfilData.dni,
        esPropietario: perfilData.esPropietario,
        auth_id: userId
      }])
      .select()
      .single();

    if (insertError) {
      setErrorMsg('Error al guardar los datos del usuario.');
      return;
    }

    // Paso 3: Guardar en localStorage y redirigir
    localStorage.setItem('usuario', JSON.stringify(perfil));
    setSuccessMsg('Usuario registrado correctamente.');
    navigate('/');
  };

  return (
    <div className="registrar-background">
      <div className="split">
        <div className="registrar-left">
          <h2>Regístrate</h2>
          <form className="registrar-form" onSubmit={handleRegister}>
            <div className="input-row">
              <div className="form-group">
                <label className='subtitulo'>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className='subtitulo'>Apellido</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className='subtitulo'>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className='subtitulo'>Contraseña</label>
                <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className='subtitulo'>Teléfono</label>
                <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className='subtitulo'>DNI</label>
                <input type="number" name="dni" value={formData.dni} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="esPropietario" className="checkbox-label subtitulo">
                ¿Eres propietario?
              </label>
              <input
                type="checkbox"
                name="esPropietario"
                id="esPropietario"
                checked={formData.esPropietario}
                onChange={handleChange}
              />
            </div>

            {errorMsg && <p className="error">{errorMsg}</p>}
            {successMsg && <p className="success">{successMsg}</p>}

            <div className="registrar-buttons">
              <button type="submit" className="secondary">Registrarse</button>
            </div>
          </form>
        </div>

        <div className="divider" />

        <div className="registrar-right">
          <p>O usa alguna de estas opciones</p>
          <div className="registrar-icons">
            <img src={appleIcon} alt="Apple registrar" />
            <img src={facebookIcon} alt="Facebook registrar" />
            <img src={googleIcon} alt="Google registrar" />
          </div>
          <div className="extra-buttons">
            <button className="secondary" onClick={() => window.location.href = '/login'}>¿Ya tienes cuenta?</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrarComponent;
