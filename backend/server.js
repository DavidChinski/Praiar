const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { supabase } = require('./supabaseClient');
const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// post /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !authData.user) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const userId = authData.user.id;

  const { data: usuario, error: fetchError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', userId)
    .limit(1)
    .maybeSingle();

  if (fetchError || !usuario) {
    return res.status(500).json({ error: 'No se pudo obtener el perfil del usuario' });
  }

  res.json({ usuario });
});

// post /api/registrar
app.post('/api/registrar', upload.single('imagen'), async (req, res) => {
  try {
    const {
      nombre, apellido, email, dni, telefono, password, esPropietario, codigoPais
    } = req.body;
    
    if (!nombre?.trim() || !apellido?.trim()) {
      return res.status(400).json({ error: 'Nombre y apellido son obligatorios.' });
    }
    if (!email?.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'El email es obligatorio y debe ser válido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (!telefono?.trim() || telefono.length < 6) {
      return res.status(400).json({ error: 'El teléfono es obligatorio y debe ser válido.' });
    }
    if (!dni?.trim() || dni.length < 6) {
      return res.status(400).json({ error: 'El DNI es obligatorio y debe ser válido.' });
    }

    const telefonoCompleto = (codigoPais || '+54') + telefono;
    const condiciones = [];
    if (email) condiciones.push(`email.eq.${encodeURIComponent(email)}`);
    if (dni && !isNaN(dni)) condiciones.push(`dni.eq.${parseInt(dni, 10)}`);
    if (telefono) condiciones.push(`telefono.eq.${telefonoCompleto}`);
    const orString = condiciones.join(',');

    if (orString === '') {
      return res.status(400).json({ error: 'Debe ingresar email, dni o teléfono.' });
    }

    const { data: existeUsuario, error: existeError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .or(orString);

    if (existeError) {
      return res.status(500).json({ error: 'Error verificando duplicados. Intente nuevamente.' });
    }
    if (existeUsuario && existeUsuario.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario registrado con este email, DNI o teléfono.' });
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError || !signUpData.user) {
      return res.status(500).json({ error: 'Error al registrar usuario: ' + (signUpError?.message || '') });
    }

    const userId = signUpData.user.id;
    const userEmail = signUpData.user.email;

    let imageUrl = null;
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('usuarios')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: 'Error al subir imagen de perfil.' });
      }

      const { data: publicUrlData } = supabase.storage
        .from('usuarios')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data: perfil, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          auth_id: userId,
          nombre,
          apellido,
          email: userEmail,
          telefono: telefonoCompleto,
          esPropietario: String(esPropietario) === 'true' || esPropietario === true,
          dni,
          imagen: imageUrl,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        error: 'Error al guardar los datos del usuario. Por favor contacte a soporte. No intente registrarse nuevamente con el mismo email.'
      });
    }

    res.json({ usuario: perfil });
  } catch (err) {
    console.error('Error en /api/registrar:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// post /api/logout
app.post('/api/logout', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Falta el token de sesión.' });
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: 'Error al cerrar sesión.' });
  }

  res.json({ success: true });
});


// get /api/ciudades
app.get('/api/ciudades', async (req, res) => {
  const { data: ciudadesData, error: ciudadesError } = await supabase
    .from('ciudades')
    .select('id_ciudad, nombre')
    .order('nombre', { ascending: true });

  if (ciudadesError) return res.status(500).json({ error: ciudadesError.message });

  const ciudadesConCantidad = await Promise.all(
    ciudadesData.map(async (ciudad) => {
      const { count, error: countError } = await supabase
        .from('balnearios')
        .select('*', { count: 'exact', head: true })
        .eq('id_ciudad', ciudad.id_ciudad);

      if (countError) return { ...ciudad, cantidadBalnearios: 0 };
      return { ...ciudad, cantidadBalnearios: typeof count === 'number' ? count : 0 };
    })
  );

  ciudadesConCantidad.sort((a, b) => b.cantidadBalnearios - a.cantidadBalnearios);
  res.json(ciudadesConCantidad);
});

app.get('/api/balnearios', async (req, res) => {
  const ciudadId = req.query.ciudad_id;

  if (!ciudadId) return res.status(400).json({ error: 'Falta el parámetro ciudad_id' });

  const { data, error } = await supabase
    .from('balnearios')
    .select('id_balneario, nombre')
    .eq('id_ciudad', ciudadId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// get /api/perfil/:auth_id
app.get('/api/perfil/:auth_id', async (req, res) => {
  const { auth_id } = req.params;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', auth_id)
    .single();

  if (error || !usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json({ usuario });
});

// put /api/perfil/:auth_id
app.put('/api/perfil/:auth_id', async (req, res) => {
  const { auth_id } = req.params;
  const { nombre, apellido, email, dni, telefono } = req.body;

  if (!auth_id) return res.status(400).json({ error: 'Falta el auth_id.' });

  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nombre,
      apellido,
      email,
      dni,
      telefono,
    })
    .eq('auth_id', auth_id)
    .select()
    .maybeSingle();

  if (error || !data) {
    return res.status(500).json({ error: error?.message || 'Error al actualizar usuario.' });
  }

  res.json({ usuario: data });
});


// post /api/consultas
// post /api/consultas
app.post('/api/consultas', async (req, res) => {
  const { nombre, mail, problema, id_usuario } = req.body;

  // Ya NO requiere token ni Authorization
  try {
    const { error } = await supabase
      .from('consultas')
      .insert([{ nombre_usuario: nombre, mail_usuario: mail, problema, id_usuario }]);

    if (error) throw error;

    res.status(200).json({ mensaje: 'Consulta enviada correctamente.' });
  } catch (error) {
    console.error('Error en /api/consultas:', error.message);
    res.status(500).json({ error: 'Error al guardar la consulta.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});