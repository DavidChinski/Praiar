import './LoginComponent.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function getUserFromStorage() {
  try {
    const str =
      window.localStorage.getItem("usuario") ||
      window.sessionStorage.getItem("usuario");
    if (str) return JSON.parse(str);
    return null;
  } catch {
    return null;
  }
}
function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = getUserFromStorage();
    if (usuario) {
      // Si ya está logueado, redirigir a home
      navigate('/');
    }
  }, []);

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
      navigate('/');
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/auth/${provider}`;
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Inicia Sesión</h2>
        <p>Es tu primera vez? <a href='/registrar'>Regístrate</a></p>
        <form className="login-form" onSubmit={handleLogin}>
          <label className='subtitulo'>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ingrese su email" required />
          
          <div className='password-container'>
            <label className='subtitulo'>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
              />
              <button
                type="button"
                className={`eye-toggle${showPassword ? " cruz" : ""}`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar u ocultar contraseña"
              >
                <span className="material-icons ojo-icon">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
          </div>

          {errorMsg && <p className="error">{errorMsg}</p>}
          <button type="submit" className="secondary">Inicia Sesión</button>
        </form>

        <hr className='linea'/>
        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <div id="icon-google" title="Google" onClick={() => handleSocialLogin('google')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-facebook" title="Facebook" onClick={() => handleSocialLogin('facebook')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-apple" title="Apple" onClick={() => handleSocialLogin('apple')} style={{ cursor: 'pointer' }}></div>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
