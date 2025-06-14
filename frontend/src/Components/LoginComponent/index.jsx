import './LoginComponent.css';
import { useState } from 'react';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Email o contraseña incorrectos');
        return;
      }

      // Guardar usuario en localStorage y redirigir
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = "/";
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  const handleSocialLogin = (provider) => {
    // Esto sigue como antes, se maneja desde el frontend
    window.location.href = `/auth/${provider}`;
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Inicia Sesión</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label className='subtitulo'>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ingrese su email" required />
          <label className='subtitulo'>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
            <button type="button"
              className={`eye-toggle${showPassword ? " cruz" : ""}`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar u ocultar contraseña"
            >
              <span className="material-icons ojo-icon">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {errorMsg && <p className="error">{errorMsg}</p>}
          <div className="login-buttons">
            <button type="submit" className="secondary">Inicia Sesión</button>
            <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
          </div>
        </form>

        <hr className='linea'/>
        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <div id="icon-google" title="Google" onClick={() => handleSocialLogin('google')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-facebook" title="Facebook" onClick={() => handleSocialLogin('facebook')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-apple" title="Apple" onClick={() => handleSocialLogin('apple')} style={{ cursor: 'pointer' }}></div>
        </div>
        <div className="extra-buttons">
          <button className="secondary" onClick={() => window.location.href = '/registrar'}>Regístrate</button>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;