// src/components/Login/LoginComponent.jsx
import './LoginComponent.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import appleIcon from '../../assets/apple.svg';
import facebookIcon from '../../assets/facebook.png';
import googleIcon from '../../assets/google.jfif';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('mail', email)
      .eq('contraseña', password)
      .single();

    if (error || !data) {
      setErrorMsg('Email o contraseña incorrectos');
    } else {
      localStorage.setItem('usuario', JSON.stringify(data));
      window.location.href = '/';
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Inicia Sesión</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label className='subtitulo'>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ingrese su email" />
          <label className='subtitulo'>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" />

          {errorMsg && <p className="error">{errorMsg}</p>}

          <div className="login-buttons">
            <button type="submit">Inicia Sesión</button>
            <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
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
          <button className="secondary">Regístrate</button>
          <button className="secondary">Inicia como Balneario</button>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
