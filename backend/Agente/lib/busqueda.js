import { supabase } from '../../supabaseClient.js';

class Busqueda {
  // Busca balnearios según el nombre de la ciudad (búsqueda parcial, case insensitive)
  async buscarBalneariosPorCiudad(nombreCiudad) {
    // Agregar % para búsqueda parcial (contains)
    const { data: ciudades, error: errorCiudad } = await supabase
      .from('ciudades')
      .select('id_ciudad')
      .ilike('nombre', `%${nombreCiudad}%`);

    if (errorCiudad) throw errorCiudad;
    if (!ciudades || ciudades.length === 0) return [];

    // Tomamos la primera ciudad que coincida
    const idCiudad = ciudades[0].id_ciudad;

    // Busca balnearios con ese id_ciudad
    const { data: balnearios, error: errorBalnearios } = await supabase
      .from('balnearios')
      .select('id_balneario, nombre, direccion, telefono, imagen, id_ciudad')
      .eq('id_ciudad', idCiudad);

    if (errorBalnearios) throw errorBalnearios;
    return balnearios || [];
  }

  // Lista todos los balnearios con info de ciudad
  async listarBalneariosConCiudades() {
    const { data, error } = await supabase
      .from('balnearios')
      .select(`
        id_balneario,
        nombre,
        direccion,
        telefono,
        imagen,
        id_ciudad,
        ciudades (
          id_ciudad,
          nombre,
          img
        )
      `);

    if (error) throw error;

    return (data || []).map(balneario => ({
      id_balneario: balneario.id_balneario,
      nombre: balneario.nombre,
      direccion: balneario.direccion,
      telefono: balneario.telefono,
      imagen: balneario.imagen,
      ciudad: balneario.ciudades ? balneario.ciudades.nombre : null,
      ciudad_img: balneario.ciudades ? balneario.ciudades.imagen : null,
    }));
  }

  // Lista todas las ciudades
  async listarCiudades() {
    const { data, error } = await supabase
      .from('ciudades')
      .select('id_ciudad, nombre, img');

    if (error) throw error;
    return data || [];
  }

  /**
   * Filtra balnearios por ciudad y por servicios (por NOMBRE de servicio, no por id).
   * Devuelve los balnearios que estén en la ciudad buscada y tengan TODOS los servicios indicados.
   * @param {string} nombreCiudad - Nombre (o parte del nombre) de la ciudad. Si es null, ignora filtro de ciudad.
   * @param {Array<string>} nombresServicios - Array de nombres de servicios a filtrar.
   * @returns {Promise<Array>} lista de balnearios que cumplen con los servicios y ciudad
   */
  async filtrarBalneariosPorCiudadYServicios(nombreCiudad, nombresServicios) {
    if (!Array.isArray(nombresServicios) || nombresServicios.length === 0) return [];

    // 1. Buscar ids de los servicios por sus nombres (case insensitive, match parcial)
    const { data: servicios, error: errorServicios } = await supabase
      .from('servicios')
      .select('id_servicio, nombre')
      .or(
        nombresServicios
          .map(nom => `nombre.ilike.%${nom}%`)
          .join(',')
      );

    if (errorServicios) throw errorServicios;
    if (!servicios || servicios.length < nombresServicios.length) {
      // No se encontraron todos los servicios buscados
      return [];
    }

    const idsServicios = servicios.map(s => s.id_servicio);

    // 2. Si hay filtro de ciudad, buscar id_ciudad
    let idCiudad = null;
    if (nombreCiudad && nombreCiudad.trim() !== '') {
      const { data: ciudades, error: errorCiudad } = await supabase
        .from('ciudades')
        .select('id_ciudad')
        .ilike('nombre', `%${nombreCiudad}%`);

      if (errorCiudad) throw errorCiudad;
      if (!ciudades || ciudades.length === 0) return [];
      idCiudad = ciudades[0].id_ciudad;
    }

    // 3. Buscar balnearios_servicios que tengan esos servicios
    const { data: bs, error: errorBS } = await supabase
      .from('balnearios_servicios')
      .select('id_balneario, id_servicio')
      .in('id_servicio', idsServicios);

    if (errorBS) throw errorBS;
    if (!bs || bs.length === 0) return [];

    // 4. Contar ocurrencias de balneario: debe tener TODOS los servicios pedidos
    const balnearioCount = {};
    bs.forEach(row => {
      balnearioCount[row.id_balneario] = (balnearioCount[row.id_balneario] || 0) + 1;
    });

    const balneariosMatch = Object.entries(balnearioCount)
      .filter(([_, count]) => count === idsServicios.length)
      .map(([id]) => parseInt(id));

    if (balneariosMatch.length === 0) return [];

    // 5. Traer info de los balnearios filtrados (y de la ciudad si corresponde)
    let query = supabase
      .from('balnearios')
      .select(`
        id_balneario,
        nombre,
        direccion,
        telefono,
        imagen,
        id_ciudad,
        ciudades (
          id_ciudad,
          nombre,
          img
        )
      `)
      .in('id_balneario', balneariosMatch);

    if (idCiudad) {
      query = query.eq('id_ciudad', idCiudad);
    }

    const { data: balnearios, error: errorBal } = await query;
    if (errorBal) throw errorBal;

    return (balnearios || []).map(balneario => ({
      id_balneario: balneario.id_balneario,
      nombre: balneario.nombre,
      direccion: balneario.direccion,
      telefono: balneario.telefono,
      imagen: balneario.imagen,
      ciudad: balneario.ciudades ? balneario.ciudades.nombre : null,
      ciudad_img: balneario.ciudades ? balneario.ciudades.imagen : null,
    }));
  }
}

export { Busqueda };