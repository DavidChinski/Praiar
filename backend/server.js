// backend/server.js
const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabaseClient');
const app = express();

app.use(cors());
app.use(express.json());

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


// Ruta para obtener el usuario autenticado (usa supabase)
app.get('/api/usuario', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) return res.status(401).json({ error: error.message });

    res.json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Ruta para guardar consulta
app.post('/api/consultas', async (req, res) => {
  const { nombre_usuario, mail_usuario, problema, id_usuario } = req.body;

  if (!nombre_usuario || !mail_usuario || !problema || !id_usuario) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const { error } = await supabase.from("consultas").insert([
    { nombre_usuario, mail_usuario, problema, id_usuario }
  ]);

  if (error) {
    console.error("Error al insertar consulta:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "Consulta guardada correctamente" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
