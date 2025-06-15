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
app.post('/api/consultas', async (req, res) => {
  const { nombre, mail, problema, id_usuario } = req.body;

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

// GET /api/mis-balnearios?auth_id=el-uuid
app.get('/api/mis-balnearios', async (req, res) => {
  const { auth_id } = req.query;

  if (!auth_id) {
    return res.status(400).json({ error: 'Falta el auth_id del usuario.' });
  }

  try {
    const { data: balnearios, error } = await supabase
      .from('balnearios')
      .select('*')
      .eq('id_usuario', auth_id);

    if (error) {
      return res.status(500).json({ error: 'Error cargando balnearios.' });
    }

    res.json({ balnearios });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/crear-balneario
app.post('/api/crear-balneario', async (req, res) => {
  const {
    nombre,
    direccion,
    telefono,
    imagenUrl,
    cantidadCarpas,
    cantSillas,
    cantMesas,
    cantReposeras,
    capacidad,
    ciudadSeleccionada,
    idUsuario // auth_id del usuario (UUID)
  } = req.body;

  if (!idUsuario) {
    return res.status(400).json({ error: 'Falta el id del usuario.' });
  }
  if (!ciudadSeleccionada) {
    return res.status(400).json({ error: 'Debe seleccionar una ciudad.' });
  }

  try {
    // 1. Crear el balneario
    const { data: balnearioData, error: balnearioError } = await supabase
      .from("balnearios")
      .insert([{
        nombre,
        direccion,
        telefono,
        imagen: imagenUrl,
        id_usuario: idUsuario,
        id_ciudad: ciudadSeleccionada
      }])
      .select()
      .single();

    if (balnearioError) {
      return res.status(500).json({ error: "Error al guardar el balneario." });
    }

    const nuevoBalnearioId = balnearioData.id_balneario;

    // 2. Crear carpas con posiciones x, y calculadas
    const carpas = Array.from({ length: cantidadCarpas }, (_, i) => {
      const maxPorFila = 10;
      const anchoCarpa = 100;
      const altoCarpa = 100;
      const fila = Math.floor(i / maxPorFila);
      const columna = i % maxPorFila;
      return {
        id_balneario: nuevoBalnearioId,
        posicion: i + 1,
        reservado: false,
        cant_sillas: cantSillas,
        cant_mesas: cantMesas,
        cant_reposeras: cantReposeras,
        capacidad: capacidad,
        id_usuario: idUsuario,
        x: columna * anchoCarpa,
        y: fila * altoCarpa,
      };
    });

    const { error: carpasError } = await supabase
      .from("ubicaciones")
      .insert(carpas);

    if (carpasError) {
      return res.status(500).json({ error: "Balneario creado, pero ocurrió un error al crear las carpas." });
    }

    res.status(200).json({ mensaje: 'Balneario y carpas creados correctamente.' });
  } catch (err) {
    console.error("Error en /api/crear-balneario:", err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --------- ENDPOINTS PARA CarpasDelBalneario ------------

// GET /api/balneario/:id/info
app.get('/api/balneario/:id/info', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: balneario, error } = await supabase
      .from("balnearios")
      .select("*")
      .eq("id_balneario", id)
      .single();
    if (error || !balneario) return res.status(404).json({ error: 'Balneario no encontrado.' });

    let ciudadNombre = "";
    if (balneario.id_ciudad) {
      const { data: ciudadData } = await supabase
        .from("ciudades")
        .select("nombre")
        .eq("id_ciudad", balneario.id_ciudad)
        .single();
      ciudadNombre = ciudadData?.nombre || "";
    }

    // Servicios
    const { data: relaciones } = await supabase
      .from("balnearios_servicios")
      .select("id_servicio")
      .eq("id_balneario", id);

    const idsServicios = relaciones?.map(r => r.id_servicio) || [];
    let servicios = [];
    if (idsServicios.length > 0) {
      const { data: serviciosData } = await supabase
        .from("servicios")
        .select("id_servicio, nombre, imagen")
        .in("id_servicio", idsServicios);
      servicios = serviciosData || [];
    }

    res.json({
      ...balneario,
      ciudad: ciudadNombre,
      servicios
    });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// GET /api/balneario/:id/carpas
app.get('/api/balneario/:id/carpas', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: carpas, error } = await supabase
      .from("ubicaciones")
      .select("*")
      .eq("id_balneario", id);

    if (error) return res.status(500).json({ error: 'Error cargando carpas.' });
    res.json(carpas);
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// GET /api/balneario/:id/elementos
app.get('/api/balneario/:id/elementos', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: elementos, error } = await supabase
      .from("elementos_ubicacion")
      .select("*")
      .eq("id_balneario", id);

    if (error) return res.status(500).json({ error: 'Error cargando elementos.' });
    res.json(elementos);
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// GET /api/balneario/:id/servicios-todos
app.get('/api/balneario/:id/servicios-todos', async (req, res) => {
  try {
    const { data: servicios, error } = await supabase
      .from("servicios")
      .select("id_servicio, nombre, imagen");
    if (error) return res.status(500).json({ error: 'Error cargando servicios.' });
    res.json(servicios);
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// POST /api/balneario/:id/servicio
app.post('/api/balneario/:id/servicio', async (req, res) => {
  const { id } = req.params;
  const { id_servicio } = req.body;
  try {
    const { error } = await supabase
      .from("balnearios_servicios")
      .insert({ id_balneario: Number(id), id_servicio: Number(id_servicio) });
    if (error) return res.status(500).json({ error: 'Error agregando servicio.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// DELETE /api/balneario/:id/servicio/:id_servicio
app.delete('/api/balneario/:id/servicio/:id_servicio', async (req, res) => {
  const { id, id_servicio } = req.params;
  try {
    const { error } = await supabase
      .from("balnearios_servicios")
      .delete()
      .match({ id_balneario: Number(id), id_servicio: Number(id_servicio) });
    if (error) return res.status(500).json({ error: 'Error quitando servicio.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// POST /api/balneario/:id/elemento
app.post('/api/balneario/:id/elemento', async (req, res) => {
  const { id } = req.params;
  const { tipo, x = 100, y = 100 } = req.body;
  try {
    const { data, error } = await supabase
      .from("elementos_ubicacion")
      .insert({ id_balneario: id, tipo, x, y })
      .select()
      .single();
    if (error) return res.status(500).json({ error: 'Error agregando elemento.' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// PUT /api/balneario/carpas/:id_carpa
app.put('/api/balneario/carpas/:id_carpa', async (req, res) => {
  const { id_carpa } = req.params;
  const updateData = req.body;
  try {
    const { error } = await supabase
      .from("ubicaciones")
      .update(updateData)
      .eq("id_carpa", id_carpa);
    if (error) return res.status(500).json({ error: 'Error actualizando carpa.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// DELETE /api/balneario/carpas/:id_carpa
app.delete('/api/balneario/carpas/:id_carpa', async (req, res) => {
  const { id_carpa } = req.params;
  try {
    const { error } = await supabase
      .from("ubicaciones")
      .delete()
      .eq("id_carpa", id_carpa);
    if (error) return res.status(500).json({ error: 'Error eliminando carpa.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// PUT /api/balneario/elementos/:id_elemento
app.put('/api/balneario/elementos/:id_elemento', async (req, res) => {
  const { id_elemento } = req.params;
  const updateData = req.body;
  try {
    const { error } = await supabase
      .from("elementos_ubicacion")
      .update(updateData)
      .eq("id_elemento", id_elemento);
    if (error) return res.status(500).json({ error: 'Error actualizando elemento.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});

// GET /api/balneario/:id/reservas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
app.get('/api/balneario/:id/reservas', async (req, res) => {
  const { id } = req.params;
  // Si se quisiera filtrar por fechas, se podrían usar los query params
  try {
    const { data, error } = await supabase
      .from("reservas")
      .select("id_ubicacion, fecha_inicio, fecha_salida")
      .eq("id_balneario", id);

    if (error) return res.status(500).json({ error: 'Error obteniendo reservas.' });
    res.json(data || []);
  } catch (e) {
    res.status(500).json({ error: 'Error interno.' });
  }
});


// POST /api/reservas-balneario  (Propietario: ver reservas de su balneario)
app.post('/api/reservas-balneario', async (req, res) => {
  const { idBalneario, fechaInicio, fechaFin } = req.body;
  if (!idBalneario) {
    return res.status(400).json({ error: "Falta id del balneario." });
  }

  let query = supabase
    .from("reservas")
    .select(`
      *,
      ubicaciones (
        id_carpa,
        posicion
      ),
      balnearios (
        nombre
      )
    `)
    .eq("id_balneario", idBalneario);

  if (fechaInicio && fechaFin) {
    query = query
      .lte("fecha_inicio", fechaFin)
      .gte("fecha_salida", fechaInicio);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Error cargando reservas." });
  }

  // Mapear reservas para devolver nombre de cliente y ubicación
  const usuarioIds = [...new Set(data.map(r => r.id_usuario).filter(Boolean))];
  let usuarios = {};
  if (usuarioIds.length > 0) {
    const { data: usuariosData } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre, apellido")
      .in("id_usuario", usuarioIds);
    if (usuariosData) {
      usuariosData.forEach(u => { usuarios[u.id_usuario] = u; });
    }
  }

  const reservas = data.map(r => ({
    id_reserva: r.id_reserva,
    id_usuario: r.id_usuario,
    ubicacion_posicion: r.ubicaciones?.posicion,
    ubicacion_id_carpa: r.ubicaciones?.id_carpa,
    balneario_nombre: r.balnearios?.nombre,
    fecha_inicio: r.fecha_inicio,
    fecha_salida: r.fecha_salida,
  }));

  res.json({ reservas, usuarios });
});

// POST /api/reservas-usuario  (Cliente: ver sus reservas)
app.post('/api/reservas-usuario', async (req, res) => {
  const { auth_id, fechaInicio, fechaFin } = req.body;
  if (!auth_id) {
    return res.status(400).json({ error: "Falta id del usuario." });
  }

  let query = supabase
    .from("reservas")
    .select(`
      *,
      ubicaciones (
        id_carpa,
        posicion
      ),
      balnearios (
        nombre
      )
    `)
    .eq("id_usuario", auth_id);

  if (fechaInicio && fechaFin) {
    query = query
      .lte("fecha_inicio", fechaFin)
      .gte("fecha_salida", fechaInicio);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Error cargando reservas." });
  }

  const reservas = data.map(r => ({
    id_reserva: r.id_reserva,
    ubicacion_posicion: r.ubicaciones?.posicion,
    ubicacion_id_carpa: r.ubicaciones?.id_carpa,
    balneario_nombre: r.balnearios?.nombre,
    fecha_inicio: r.fecha_inicio,
    fecha_salida: r.fecha_salida,
  }));

  res.json({ reservas });
});

// GET /api/reserva/ubicacion/:id_ubicacion
app.get('/api/reserva/ubicacion/:id_ubicacion', async (req, res) => {
  const { id_ubicacion } = req.params;
  try {
    // Traer la ubicación y el balneario relacionado
    const { data: ubicacion, error: ubicacionError } = await supabase
      .from("ubicaciones")
      .select("*, balnearios: id_balneario (id_balneario, nombre, direccion, id_ciudad)")
      .eq("id_carpa", id_ubicacion)
      .single();

    if (ubicacionError || !ubicacion) {
      return res.status(404).json({ error: "Ubicación no encontrada." });
    }

    let balneario = ubicacion.balnearios;
    let ciudad_nombre = "";
    if (balneario?.id_ciudad) {
      const { data: ciudad } = await supabase
        .from("ciudades")
        .select("nombre")
        .eq("id_ciudad", balneario.id_ciudad)
        .single();
      ciudad_nombre = ciudad?.nombre || "";
    }
    balneario.ciudad_nombre = ciudad_nombre;

    // Elimina el alias "balnearios" de la respuesta
    delete ubicacion.balnearios;

    res.json({ ubicacion, balneario });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo datos de la ubicación." });
  }
});

// POST /api/reserva
app.post('/api/reserva', async (req, res) => {
  const { id_usuario, id_ubicacion, id_balneario, fecha_inicio, fecha_salida, metodo_pago } = req.body;

  if (!id_usuario || !id_ubicacion || !id_balneario || !fecha_inicio || !fecha_salida) {
    return res.status(400).json({ error: "Datos incompletos para la reserva." });
  }

  try {
    // Verificar reservas existentes para esa ubicación y balneario
    const { data: reservasExistentes, error: reservasError } = await supabase
      .from("reservas")
      .select("*")
      .eq("id_ubicacion", id_ubicacion)
      .eq("id_balneario", id_balneario);

    if (reservasError) {
      return res.status(500).json({ error: "Error verificando reservas." });
    }

    // Validar solapamiento de fechas
    const conflicto = reservasExistentes.some(r =>
      fecha_inicio <= r.fecha_salida && fecha_salida >= r.fecha_inicio
    );

    if (conflicto) {
      return res.status(400).json({ error: "Ya hay una reserva para esas fechas." });
    }

    // Insertar nueva reserva
    const { error: insertError } = await supabase.from("reservas").insert({
      id_usuario,
      id_ubicacion,
      id_balneario,
      fecha_inicio,
      fecha_salida,
      metodo_pago
    });

    if (insertError) {
      return res.status(500).json({ error: "Error al realizar la reserva." });
    }

    res.status(200).json({ mensaje: "Reserva realizada con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la reserva." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});