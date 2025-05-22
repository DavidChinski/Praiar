import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';

function BusquedaHome() {
    const [ciudades, setCiudades] = useState([]);


    useEffect(() => {
        async function fetchCiudadesConBalnearios() {
            const { data: ciudadesData, error: ciudadesError } = await supabase
                .from('ciudades')
                .select('id_ciudad, nombre')
                .order('nombre', { ascending: true });

            console.log('Fetched ciudades:', ciudadesData, 'Error:', ciudadesError);

            if (ciudadesError) {
                console.error('Error al obtener ciudades:', ciudadesError.message);
                return;
            }

            const ciudadesConCantidad = await Promise.all(
                ciudadesData.map(async (ciudad) => {
                    const { count, error: countError } = await supabase
                        .from('ciudades_x_balnearios')
                        .select('*', { count: 'exact', head: true })
                        .eq('id_ciudad', ciudad.id_ciudad);

                    if (countError) {
                        console.error('Error al contar balnearios:', countError.message);
                        return { ...ciudad, cantidadBalnearios: 0 };
                    }

                    return { ...ciudad, cantidadBalnearios: count };
                })
            );
            setCiudades(ciudadesConCantidad);
        }

        fetchCiudadesConBalnearios();
    }, []);

    return (
        <form>
            <select>
                {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                        {ciudad.nombre} ({ciudad.cantidadBalnearios})
                    </option>
                ))}
            </select>
        </form>
    )
}
export default BusquedaHome;
