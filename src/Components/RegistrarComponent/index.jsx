import './RegistrarComponent.css';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useNavigate } from 'react-router-dom';

function RegistrarComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    contraseña: '',
    esPropietario: false,
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

    const { email, contraseña, ...perfilData } = formData;

    // Paso 1: Crear cuenta en Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: contraseña,
    });

    if (signUpError) {
      setErrorMsg('Error al registrar usuario: ' + signUpError.message);
      return;
    }

    // Paso 2: Obtener el usuario autenticado
    const { data: userData, error: userError } = await supabase.auth.getUser();

    const userId = userData?.user?.id;
    const userEmail = userData?.user?.email;

    if (!userId || userError) {
      console.error('Usuario no autenticado:', userError);
      setErrorMsg('No se pudo autenticar al usuario.');
      return;
    }

    // Paso 3: Subir imagen al bucket 'usuarios'
    let imageUrl = null;

    if (imagenFile) {
      const fileExt = imagenFile.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('usuarios')
        .upload(filePath, imagenFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error al subir imagen:', uploadError.message);
        setErrorMsg('Error al subir imagen de perfil.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('usuarios')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }
    // Paso 4: Insertar en tabla 'usuarios'
    const { data: perfil, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        auth_id: userId,
        nombre: perfilData.nombre,
        apellido: perfilData.apellido,
        email: userEmail,
        telefono: perfilData.telefono,
        esPropietario: perfilData.esPropietario,
        dni: perfilData.dni,
        imagen: imageUrl
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      setErrorMsg('Error al guardar los datos del usuario: ' + insertError.message);
      return;
    }

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
                <label className="subtitulo">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="subtitulo">Apellido</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="subtitulo">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group password-group">
                <label className="subtitulo">Contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
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
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="subtitulo">Teléfono</label>
                <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="subtitulo">DNI</label>
                <input type="number" name="dni" value={formData.dni} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="subtitulo">Imagen de perfil</label>
              <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files[0])} />
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
              <button type="submit" className="secondary">
                Registrarse
              </button>
            </div>
          </form>
        </div>

        <div className="divider" />

        <div className="registrar-right">
          <p>O usa alguna de estas opciones</p>
          <div className="registrar-icons">
            <div id="icon-google" title="Google"></div>
            <div id="icon-facebook" title="Facebook"></div>
            <div id="icon-apple" title="Apple"></div>
          </div>
          <div className="extra-buttons">
            <button className="secondary" onClick={() => window.location.href = '/login'}>
              ¿Ya tienes cuenta?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrarComponent;
