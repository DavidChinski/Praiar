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
    mail: '',
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

    const { mail } = formData;

    // Verificar si el usuario ya existe
    const { data: existingUser, error: existingError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('mail', mail)
      .single();

    if (existingUser) {
      setErrorMsg('Este correo ya está registrado.');
      return;
    }

    // Insertar nuevo usuario
    const { data, error } = await supabase
    .from('usuarios')
    .insert([formData])
    .select()
    .single();

    if (error) {
    setErrorMsg('Error al registrar. Intenta nuevamente.');
    } else {
    // Guardar usuario en localStorage
    localStorage.setItem('usuario', JSON.stringify(data));

    setSuccessMsg('Usuario registrado correctamente.');
    setFormData({
      nombre: '',
      apellido: '',
      mail: '',
      dni: '',
      telefono: '',
      contraseña: '',
      esPropietario: false,
    });

    navigate('/'); // Redirigir al home


    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Regístrate</h2>
        <form className="login-form" onSubmit={handleRegister}>
          <label className='subtitulo'>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

          <label className='subtitulo'>Apellido</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />

          <label className='subtitulo'>Email</label>
          <input type="email" name="mail" value={formData.mail} onChange={handleChange} required />

          <label className='subtitulo'>DNI</label>
          <input type="number" name="dni" value={formData.dni} onChange={handleChange} required />

          <label className='subtitulo'>Teléfono</label>
          <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} required />

          <label className='subtitulo'>Contraseña</label>
          <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />

          <label className='subtitulo'>
            <input type="checkbox" name="esPropietario" checked={formData.esPropietario} onChange={handleChange} />
            ¿Eres propietario?
          </label>

          {errorMsg && <p className="error">{errorMsg}</p>}
          {successMsg && <p className="success">{successMsg}</p>}

          <div className="login-buttons">
            <button type="submit" className="secondary">Registrarse</button>
          </div>
        </form>

        <hr className='linea' />
        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <img src={appleIcon} alt="Apple login" />
          <img src={facebookIcon} alt="Facebook login" />
          <img src={googleIcon} alt="Google login" />
        </div>

        <div className="extra-buttons">
          <button className="secondary" onClick={() => window.location.href = '/login'}>¿Ya tienes cuenta? Inicia sesión</button>
          <button className="secondary">Inicia como Balneario</button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarComponent;
