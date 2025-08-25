import './RegistrarComponent.css';
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

function RegistrarComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    password: '',
    esPropietario: false,
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codigoPais, setCodigoPais] = useState('+54');

  useEffect(() => {
    const usuario = getUserFromStorage();
    if (usuario) {
      // Si ya está logueado, redirigir a home
      navigate('/');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const formToSend = new FormData();
    for (const key in formData) {
      formToSend.append(key, formData[key]);
    }
    formToSend.append('codigoPais', codigoPais);
    if (imagenFile) {
      formToSend.append('imagen', imagenFile);
    }

    try {
      const response = await fetch('http://localhost:3000/api/registrar', {
        method: 'POST',
        body: formToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Error al registrar usuario.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.dispatchEvent(new Event('authChanged'));
      setSuccessMsg('Usuario registrado correctamente.');
      navigate('/');
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/auth/${provider}`;
  };

  return (
    <div className="registrar-background">
      <div className="registrar-container">
        <h2>Regístrate</h2>
        <p>¿Ya tienes cuenta? <a href='/login'>Inicia Sesión</a></p>
        <form className="registrar-form" onSubmit={handleRegister}>
          <div className="input-row">
            <div className="form-group">
              <label className="subtitulo" style={{color: '#003F5E'}}>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ingrese su nombre" required />
            </div>
            <div className="form-group">
              <label className="subtitulo" style={{color: '#003F5E'}}>Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ingrese su apellido" required />
            </div>
          </div>

          <label className="subtitulo">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ingrese su email" required />
          
          <div className="password-container">
            <label className="subtitulo">Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
          </div>

          <div className="input-row">
            <div className="form-group telefono-group">
              <label className="subtitulo" style={{color: '#003F5E'}}>Teléfono</label>
              <div className="telefono-wrapper">
                <select value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}>
                  <option value="+54">🇦🇷 +54</option>
                </select>
                <input
                  type="number"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ingrese su teléfono"
                  required
                />
              </div>
            </div>
            <div className="form-group dni-reducido">
              <label className="subtitulo" style={{color: '#003F5E'}}>DNI</label>
              <input
                type="number"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ingrese su DNI"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imagen" className="custom-file-upload subtitulo">
              Subir imagen
            </label>
            <input
              type="file"
              id="imagen"
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {imagenFile && <p className="archivo-nombre">Archivo: {imagenFile.name}</p>}
          </div>

          <div className="checkbox-group">
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
          
          <button type="submit" className="secondary">Registrarse</button>
        </form>

        <hr className="linea"/>
        <p>O usa alguna de estas opciones</p>
        <div className="registrar-icons">
          <div id="icon-google" title="Google" onClick={() => handleSocialLogin('google')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-facebook" title="Facebook" onClick={() => handleSocialLogin('facebook')} style={{ cursor: 'pointer' }}></div>
          <div id="icon-apple" title="Apple" onClick={() => handleSocialLogin('apple')} style={{ cursor: 'pointer' }}></div>
        </div>
      </div>
    </div>
  );
}

export default RegistrarComponent;