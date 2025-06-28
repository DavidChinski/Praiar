const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { supabase } = require('./supabaseClient');
const nodemailer = require('nodemailer');
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
    ciudadSeleccionada,
    idUsuario,
    tandasCarpas, // array de todas las tandas
    precios       // objeto { dia, semana, quincena, mes }
  } = req.body;

  if (!idUsuario) {
    return res.status(400).json({ error: 'Falta el id del usuario.' });
  }
  if (!ciudadSeleccionada) {
    return res.status(400).json({ error: 'Debe seleccionar una ciudad.' });
  }
  if (!Array.isArray(tandasCarpas) || tandasCarpas.length === 0) {
    return res.status(400).json({ error: 'Debe agregar al menos una tanda de carpas.' });
  }
  if (!Array.isArray(precios) || precios.length === 0) {
    return res.status(400).json({ error: 'Debe ingresar al menos un precio.' });
  }
  if (precios.some(p => !p.dia || !p.semana || !p.quincena || !p.mes || !p.id_tipo_ubicacion)) {
    return res.status(400).json({ error: 'Cada precio debe estar completo.' });
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

    // 2. Crear los precios asociados a este balneario
    const preciosAInsertar = precios.map(p => ({
      id_balneario: nuevoBalnearioId,
      id_tipo_ubicacion: p.id_tipo_ubicacion,
      dia: p.dia,
      semana: p.semana,
      quincena: p.quincena,
      mes: p.mes
    }));
    const { error: precioError } = await supabase
      .from("precios")
      .insert(preciosAInsertar);

    // 3. Crear todas las carpas de todas las tandas
    let ubicaciones = [];
    let pos = 1;
    tandasCarpas.forEach((tanda) => {
      const {
        id_tipo_ubicacion,
        cantidadCarpas,
        cantSillas,
        cantMesas,
        cantReposeras,
        capacidad
      } = tanda;
      const maxPorFila = 10, anchoCarpa = 100, altoCarpa = 100;
      for (let i = 0; i < cantidadCarpas; i++, pos++) {
        const fila = Math.floor((pos-1) / maxPorFila);
        const columna = (pos-1) % maxPorFila;
        ubicaciones.push({
          id_balneario: nuevoBalnearioId,
          id_tipo_ubicacion: id_tipo_ubicacion,
          posicion: pos,
          reservado: false,
          cant_sillas: cantSillas,
          cant_mesas: cantMesas,
          cant_reposeras: cantReposeras,
          capacidad: capacidad,
          id_usuario: idUsuario,
          x: columna * anchoCarpa,
          y: fila * altoCarpa,
        });
      }
    });

    const { error: carpasError } = await supabase
      .from("ubicaciones")
      .insert(ubicaciones);

    if (carpasError) {
      return res.status(500).json({ error: "Balneario y precios creados, pero ocurrió un error al crear las carpas." });
    }

    res.status(200).json({ mensaje: 'Balneario, precios y carpas creados correctamente.' });
  } catch (err) {
    console.error("Error en /api/crear-balneario:", err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Nuevo endpoint sugerido para traer tipos de ubicaciones
app.get('/api/tipos-ubicaciones', async (req, res) => {
  try {
    const { data, error } = await supabase.from("tipos_ubicaciones").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tipos de ubicaciones" });
  }
});

// GET /api/balneario/:id/precios
app.get('/api/balneario/:id/precios', async (req, res) => {
  const { id } = req.params;
  // Join con tipos_ubicaciones para traer el nombre
  const { data, error } = await supabase
    .from("precios")
    .select("id_tipo_ubicacion, dia, semana, quincena, mes, tipos_ubicaciones(nombre)")
    .eq("id_balneario", id);

  if (error) return res.status(500).json({ error: "Error trayendo precios." });

  // Mapear para que sea { id_tipo_ubicacion, nombre, dia, semana, ... }
  const precios = (data || []).map(p => ({
    id_tipo_ubicacion: p.id_tipo_ubicacion,
    nombre: p.tipos_ubicaciones?.nombre || "Desconocido",
    dia: p.dia,
    semana: p.semana,
    quincena: p.quincena,
    mes: p.mes,
  }));

  res.json(precios);
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

  // Obtener los ids de usuario de todas las reservas
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

  // Siempre devolver cliente_nombre en cada reserva
  const reservas = data.map(r => ({
    id_reserva: r.id_reserva,
    id_usuario: r.id_usuario,
    cliente_nombre: usuarios[r.id_usuario]
      ? `${usuarios[r.id_usuario].nombre} ${usuarios[r.id_usuario].apellido}`
      : "Cliente desconocido",
    ubicacion_posicion: r.ubicaciones?.posicion,
    ubicacion_id_carpa: r.ubicaciones?.id_carpa,
    balneario_nombre: r.balnearios?.nombre,
    fecha_inicio: r.fecha_inicio,
    fecha_salida: r.fecha_salida,
  }));

  res.json({ reservas });
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
    // ...validación de reservas...

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

    // === NUEVO: enviar email al dueño del balneario ===

    // 1. Buscar el balneario y obtener el id_usuario del dueño
    const { data: balneario, error: balnearioError } = await supabase
      .from("balnearios")
      .select("id_usuario, nombre")
      .eq("id_balneario", id_balneario)
      .single();

    if (!balneario || balnearioError) {
      return res.status(500).json({ error: "Reserva realizada pero no se pudo notificar al balneario (no se encontró el dueño)." });
    }

    // 2. Buscar el email del dueño del balneario
    const { data: duenio, error: duenioError } = await supabase
      .from("usuarios")
      .select("email")
      .eq("auth_id", balneario.id_usuario)
      .single();

    if (!duenio || duenioError) {
      return res.status(500).json({ error: "Reserva realizada pero no se pudo notificar al dueño del balneario (no se encontró su email)." });
    }

    // 3. Buscar nombre/email del cliente (quien reservó)
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("nombre, apellido, email")
      .eq("auth_id", id_usuario)
      .single();

    // 4. Configurá tu transport (esto es para SMTP de Gmail, cambiá a tu proveedor si es otro)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'praiar.info@gmail.com',
        pass: 'hbtt hyzt ktwp team'
      }
    });

    // 5. Armá el mail
    const mailOptions = {
      from: '"Reservas" <praiar.info@gmail.com>',
      to: duenio.email,
      subject: `Nueva reserva en ${balneario.nombre}`,
      text: `
¡Nueva reserva recibida!

Cliente: ${usuario ? usuario.nombre + ' ' + usuario.apellido : 'ID usuario: ' + id_usuario}
Email cliente: ${usuario?.email || 'No disponible'}

Ubicación: ${id_ubicacion}
Fecha inicio: ${fecha_inicio}
Fecha salida: ${fecha_salida}
Método de pago: ${metodo_pago}
      `
    };

    // 6. Enviá el mail (esto es async, pero no detiene la respuesta)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error enviando mail:", error);
      }
    });

    // Responder éxito al frontend
    res.status(200).json({ mensaje: "Reserva realizada con éxito. Se notificó al dueño del balneario por mail." });

  } catch (error) {
    res.status(500).json({ error: "Error al realizar la reserva." });
  }
});



// POST /api/balneario/:id/carpas
app.post('/api/balneario/:id/carpas', async (req, res) => {
  const { id } = req.params;
  const {
    id_tipo_ubicacion, // 1=simple, 2=doble, 3=sombrilla
    cant_sillas,
    cant_mesas,
    cant_reposeras,
    capacidad,
    id_usuario,
    x = 0,
    y = 0
  } = req.body;

  if (!id || !id_tipo_ubicacion || !id_usuario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Calcular posicion (mayor existente + 1)
    const { data: ubicaciones } = await supabase
      .from("ubicaciones")
      .select("posicion")
      .eq("id_balneario", id)
      .order("posicion", { ascending: false })
      .limit(1);

    const nuevaPosicion = (ubicaciones?.[0]?.posicion || 0) + 1;

    const { data, error } = await supabase
      .from("ubicaciones")
      .insert([{
        id_balneario: id,
        id_tipo_ubicacion,
        cant_sillas,
        cant_mesas,
        cant_reposeras,
        capacidad,
        id_usuario,
        reservado: false,
        posicion: nuevaPosicion,
        x,
        y,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Error agregando carpa o sombrilla." });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Error interno al agregar carpa." });
  }
});

// PUT /api/balneario/:id/precios/:id_tipo_ubicacion
app.put('/api/balneario/:id/precios/:id_tipo_ubicacion', async (req, res) => {
  const { id, id_tipo_ubicacion } = req.params;
  const { dia, semana, quincena, mes } = req.body;
  // Opcional: Chequear autenticación y que sea dueño del balneario

  try {
    const { error } = await supabase
      .from("precios")
      .update({ dia, semana, quincena, mes })
      .eq("id_balneario", id)
      .eq("id_tipo_ubicacion", id_tipo_ubicacion);

    if (error) {
      return res.status(500).json({ error: "Error actualizando precios." });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error interno." });
  }
});

// === RESEÑAS APIs ===

// Helper para parsear seguro el id de balneario (solo enteros válidos)
function toIntOrNull(val) {
  const n = parseInt(val, 10);
  return Number.isInteger(n) && !isNaN(n) ? n : null;
}

// GET /api/balneario/:id/resenias
app.get('/api/balneario/:id/resenias', async (req, res) => {
  const { id } = req.params;
  const balnearioId = toIntOrNull(id);
  if (balnearioId === null) return res.status(400).json({ error: 'Id de balneario inválido.' });
  try {
    // Buscar las reseñas asociadas a este balneario (con join de usuario)
    const { data: reseñasData, error: reseñasError } = await supabase
      .from('reseñas')
      .select(`
        id_reseña,
        comentario,
        estrellas,
        likes,
        id_usuario,
        id_balneario,
        usuarios (
          id_usuario,
          nombre,
          apellido
        )
      `)
      .eq('id_balneario', balnearioId);

    if (reseñasError) return res.status(500).json({ error: 'Error trayendo reseñas.' });

    const reseñas = (reseñasData || []).map(r => ({
      id_reseña: r.id_reseña,
      comentario: r.comentario,
      estrellas: r.estrellas,
      likes: r.likes || 0,
      id_usuario: r.id_usuario,
      usuario_nombre: r.usuarios?.nombre
        ? r.usuarios.nombre + (r.usuarios.apellido ? " " + r.usuarios.apellido : "")
        : undefined
    }));

    res.json({ resenias: reseñas });
  } catch (e) {
    res.status(500).json({ error: 'Error interno trayendo reseñas.' });
  }
});

// POST /api/balneario/:id/resenias
app.post('/api/balneario/:id/resenias', async (req, res) => {
  const { id } = req.params;
  const balnearioId = toIntOrNull(id);
  if (balnearioId === null) return res.status(400).json({ error: 'Id de balneario inválido.' });
  const { comentario, estrellas, id_usuario } = req.body;
  if (!comentario?.trim() || !estrellas || !id_usuario) {
    return res.status(400).json({ error: 'Datos incompletos para la reseña.' });
  }
  try {
    // Insertar reseña directamente con el id_balneario
    const { data: nuevaResenia, error: reseniaError } = await supabase
      .from('reseñas')
      .insert([{ comentario, estrellas, id_usuario, id_balneario: balnearioId, likes: 0 }])
      .select()
      .single();

    if (reseniaError || !nuevaResenia) {
      return res.status(500).json({ error: 'Error guardando reseña.' });
    }

    res.json({ ok: true, reseña: nuevaResenia });
  } catch (e) {
    res.status(500).json({ error: 'Error interno guardando reseña.' });
  }
});

// POST /api/resenias/:id_reseña/like
app.post('/api/resenias/:id_reseña/like', async (req, res) => {
  const { id_reseña } = req.params;
  try {
    // Sumar un like
    const { data: reseña, error: getError } = await supabase
      .from('reseñas')
      .select('likes')
      .eq('id_reseña', id_reseña)
      .single();
    if (getError || !reseña) {
      return res.status(404).json({ error: 'Reseña no encontrada.' });
    }
    const nuevosLikes = (reseña.likes || 0) + 1;
    const { error: updateError } = await supabase
      .from('reseñas')
      .update({ likes: nuevosLikes })
      .eq('id_reseña', id_reseña);
    if (updateError) {
      return res.status(500).json({ error: 'Error actualizando likes.' });
    }
    res.json({ ok: true, likes: nuevosLikes });
  } catch (e) {
    res.status(500).json({ error: 'Error interno sumando like.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});