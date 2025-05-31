import './LoginComponent.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';


function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Paso 1: Login con email/contraseña
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Error de login:", loginError.message);
      setErrorMsg('Email o contraseña incorrectos');
      return;
    }

    const userId = authData.user.id; // UID del usuario autenticado

    // Paso 2: Buscar al usuario en la tabla 'usuarios'
    const { data: usuario, error: fetchError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', userId)
    .limit(1)
    .maybeSingle(); // <-- clave


    if (fetchError) {
      console.error("Error al buscar en la tabla usuarios:", fetchError.message);
      setErrorMsg('No se pudo obtener el perfil del usuario');
      return;
    }

    console.log("Usuario logueado:", usuario);

    // (Opcional) Guardar datos en localStorage o context si querés usarlos después
    localStorage.setItem('usuario', JSON.stringify(usuario));

    // Redireccionar al home u otra parte
    window.location.href = "/";
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
            <button type="submit" className="secondary">Inicia Sesión</button>
            <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
          </div>
        </form>

        <hr className='linea'/>
        <p>O usa alguna de estas opciones</p>
        <div className="login-icons">
          <div id="icon-google" title="Google"></div>
          <div id="icon-facebook" title="Facebook"></div>
          <div id="icon-apple" title="Apple"></div>
        </div>

        <div className="extra-buttons">
          <button className="secondary" onClick={() => window.location.href = '/registrar'}>Regístrate</button>
          <button className="secondary">Inicia como Balneario</button>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
