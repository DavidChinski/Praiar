import './RegistrarComponent.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import appleIcon from '../../img/apple.svg';
import facebookIcon from '../../img/facebook.png';
import googleIcon from '../../img/google.jfif';

function RegistrarComponent() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    contraseña: '',
    repetirContraseña: '',
    telefono: '',
    dni: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const { nombre, apellido, mail, contraseña, repetirContraseña, telefono, dni } = formData;
  
    if (contraseña !== repetirContraseña) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
  
    // Insertar el nuevo cliente
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nombre, apellido, mail, dni, telefono, contraseña }])
      .select(); // importante para obtener los datos insertados
  
    if (error) {
      setErrorMsg('Error al registrar: ' + error.message);
    } else {
      // Guardar al cliente en localStorage
      localStorage.setItem('cliente', JSON.stringify(data[0]));
  
      // Redirigir al home
      navigate('/');
    }
  };
  

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Regístrate</h2>
        <form className="login-form" onSubmit={handleRegister}>
          <label>Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

          <label>Apellido</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="mail" value={formData.mail} onChange={handleChange} required />

          <label>Contraseña</label>
          <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />

          <label>Repetir Contraseña</label>
          <input type="password" name="repetirContraseña" value={formData.repetirContraseña} onChange={handleChange} required />

          <label>Teléfono</label>
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />

          <label>DNI</label>
          <input type="text" name="dni" value={formData.dni} onChange={handleChange} required />

          {errorMsg && <p className="error">{errorMsg}</p>}

          <div className="login-buttons">
            <button type="submit">Registrarse</button>
          </div>
        </form>

        <hr />

        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <img src={appleIcon} alt="Apple login" />
          <img src={facebookIcon} alt="Facebook login" />
          <img src={googleIcon} alt="Google login" />
        </div>

        <div className="extra-buttons">
          <button className="secondary" onClick={() => navigate('/login')}>¿Ya tienes una cuenta?</button>
          <button className="secondary">Regístrate como Bañeario</button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarComponent;
