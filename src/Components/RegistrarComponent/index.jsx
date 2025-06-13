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
    const [codigoPais, setCodigoPais] = useState('+54');

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

      // ---- VALIDACIONES PREVIAS ----
      if (!formData.nombre.trim() || !formData.apellido.trim()) {
        setErrorMsg('Nombre y apellido son obligatorios.');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMsg('El email es obligatorio y debe ser válido.');
        return;
      }
      if (!formData.contraseña || formData.contraseña.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (!formData.telefono.trim() || formData.telefono.length < 6) {
        setErrorMsg('El teléfono es obligatorio y debe ser válido.');
        return;
      }
      if (!formData.dni.trim() || formData.dni.length < 6) {
        setErrorMsg('El DNI es obligatorio y debe ser válido.');
        return;
      }

      // ---- CHEQUEAR DUPLICADOS EN TABLA USUARIOS ----
      const telefonoCompleto = codigoPais + formData.telefono;
      const condiciones = [];
      if (formData.email) condiciones.push(`email.eq.${encodeURIComponent(formData.email)}`);
      if (formData.dni && !isNaN(formData.dni)) condiciones.push(`dni.eq.${parseInt(formData.dni, 10)}`);
      if (formData.telefono) condiciones.push(`telefono.eq.${telefonoCompleto}`);
      const orString = condiciones.join(',');
      if (orString === '') {
        setErrorMsg('Error: Debe ingresar email, dni o teléfono.');
        return;
      }

      const { data: existeUsuario, error: existeError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .or(orString);


      if (existeError) {
        setErrorMsg('Error verificando duplicados. Intente nuevamente.');
        return;
      }
      if (existeUsuario && existeUsuario.length > 0) {
        setErrorMsg('Ya existe un usuario registrado con este email, DNI o teléfono.');
        return;
      }

      // ---- REGISTRO EN SUPABASE AUTH (solo si no hay duplicados) ----
      const { email, contraseña, ...perfilData } = formData;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: contraseña,
      });

      if (signUpError) {
        setErrorMsg('Error al registrar usuario: ' + signUpError.message);
        return;
      }

      // Tomar datos del usuario recién creado en Auth
      const userId = signUpData?.user?.id;
      const userEmail = signUpData?.user?.email;
      if (!userId) {
        setErrorMsg('No se pudo autenticar el usuario.');
        return;
      }

      // ---- SUBIDA DE IMAGEN (opcional) ----
      let imageUrl = null;
      if (imagenFile) {
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('usuarios')
          .upload(filePath, imagenFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          setErrorMsg('Error al subir imagen de perfil.');
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('usuarios')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // ---- INSERCIÓN EN TABLA USUARIOS ----
      const { data: perfil, error: insertError } = await supabase
        .from('usuarios')
        .insert([
          {
            auth_id: userId,
            nombre: perfilData.nombre,
            apellido: perfilData.apellido,
            email: userEmail,
            telefono: telefonoCompleto,
            esPropietario: perfilData.esPropietario,
            dni: perfilData.dni,
            imagen: imageUrl,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setErrorMsg('Error al guardar los datos del usuario. Por favor contacte a soporte. No intente registrarse nuevamente con el mismo email.');
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
                <div className="form-group telefono-group">
                  <label className="subtitulo">Teléfono</label>
                  <div className="telefono-wrapper">
                    <select value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}>
                      <option value="+54">🇦🇷 +54</option>
                    </select>
                    <input
                      type="number"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group dni-reducido">
                  <label className="subtitulo">DNI</label>
                  <input
                    type="number"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
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