import './LoginComponent.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Error de login:", loginError.message);
      setErrorMsg('Email o contraseña incorrectos');
      return;
    }

    const userId = authData.user.id;

    const { data: usuario, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', userId)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error al buscar en la tabla usuarios:", fetchError.message);
      setErrorMsg('No se pudo obtener el perfil del usuario');
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.href = "/";
  };

  const handleSocialLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };  

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Inicia Sesión</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label className='subtitulo'>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su email"
            required
          />

          <label className='subtitulo'>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {errorMsg && <p className="error">{errorMsg}</p>}

          <div className="login-buttons">
            <button type="submit" className="secondary">Inicia Sesión</button>
            <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
          </div>
        </form>

        <hr className='linea'/>
        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <div
            id="icon-google"
            title="Google"
            onClick={() => handleSocialLogin('google')}
            style={{ cursor: 'pointer' }}
          ></div>
          <div
            id="icon-facebook"
            title="Facebook"
            onClick={() => handleSocialLogin('facebook')}
            style={{ cursor: 'pointer' }}
          ></div>
          <div
            id="icon-apple"
            title="Apple"
            onClick={() => handleSocialLogin('apple')}
            style={{ cursor: 'pointer' }}
          ></div>
        </div>

        <div className="extra-buttons">
          <button className="secondary" onClick={() => window.location.href = '/registrar'}>Regístrate</button>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
