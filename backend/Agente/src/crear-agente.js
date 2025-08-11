import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { Busqueda } from "../lib/busqueda.js";

const busqueda = new Busqueda();

const systemPrompt = `
Sos el asistente de Praiar. Ayudás a usuarios a encontrar y gestionar balnearios.

Contexto de sesión (si llega): session = { isLoggedIn, esPropietario, auth_id, nombre, email }.
- Si session.isLoggedIn es false o no existe, asumí usuario invitado.
- Si esPropietario es true, es dueño. Caso contrario, es cliente.

Capacidades:
- Buscar balnearios por ciudad
- Listar balnearios con su ciudad
- Listar ciudades
- Filtrar balnearios por ciudad y servicios, o solo por servicios
- Buscar disponibilidad por fechas (opcionalmente combinando ciudad y/o servicios)

Guía contextual:
- Invitado: sugerí registrarse/iniciar sesión y compartí el mapa: "/ciudades".
- Cliente: ofrecé links rápidos: "/ciudades" (mapa).
- Dueño: guiá cómo crear su balneario y linkeá: "/tusbalnearios". El flujo para crear balneario es: Tus Balnearios -> sección "Crear Balneario" -> completar datos, tandas y precios -> guardar.

Formato de respuesta:
- Sé claro y breve. Usá listas con "- ".
- Incluí rutas absolutas de la app (por ejemplo "/ciudades", "/tusbalnearios") para que el frontend pueda hacerlas clic.

Notas sobre filtros:
- El frontend puede enviar un bloque opcional de filtros al comienzo del mensaje con el formato:
  [Filtros]\n
  - fechaInicio=YYYY-MM-DD\n
  - fechaFin=YYYY-MM-DD\n
  - ciudad=NombreCiudad (opcional)\n
  - servicios=Wi-Fi,Pileta (opcional, separados por coma)
- Si hay fechaInicio y fechaFin, priorizá usar la herramienta "buscarDisponibilidad" combinándola con ciudad/servicios si también están presentes.
- Si no hay fechas, usá las herramientas de búsqueda y filtrado existentes según corresponda.
`.trim();

const ollamaLLM = new Ollama({
    model: "qwen3:1.7b",
    temperature: 0.75,
    timeout: 3 * 60 * 1000,
});

const buscarBalneariosPorCiudadTool = tool({
    name: "buscarBalneariosPorCiudad",
    description: "Usa esta función para encontrar balnearios en una ciudad específica",
    parameters: z.object({
        ciudad: z.string().describe("El nombre de la ciudad a buscar"),
    }),
    execute: async ({ ciudad }) => {
        try {
            const balnearios = await busqueda.buscarBalneariosPorCiudad(ciudad);
            if (!balnearios || balnearios.length === 0) return "No se encontraron balnearios en esa ciudad.";
            return balnearios.map(bal => {
                const tel = bal.telefono ? ` — Tel: ${bal.telefono}` : "";
                return `- ${bal.nombre} — Dirección: ${bal.direccion}${tel} — /balneario/${bal.id_balneario}`;
            }).join('\n');
        } catch (error) {
            return `Error al buscar balnearios: ${error.message}`;
        }
    },
});

const listarBalneariosTool = tool({
    name: "listarBalnearios",
    description: "Muestra todos los balnearios y la ciudad donde se encuentran",
    parameters: z.object({}),
    execute: async () => {
        try {
            const lista = await busqueda.listarBalneariosConCiudades();
            if (!lista || lista.length === 0) return "No hay balnearios registrados.";
            return lista.map(bal => `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`).join('\n');
        } catch (error) {
            return `Error al listar balnearios: ${error.message}`;
        }
    },
});

const listarCiudadesTool = tool({
    name: "listarCiudades",
    description: "Muestra la lista de todas las ciudades disponibles",
    parameters: z.object({}),
    execute: async () => {
        try {
            const ciudades = await busqueda.listarCiudades();
            if (!ciudades || ciudades.length === 0) return "No hay ciudades registradas.";
            // Enlaza al listado de balnearios de cada ciudad
            return ciudades.map(ciudad => `- ${ciudad.nombre} — /ciudades/${ciudad.id_ciudad}/balnearios`).join('\n');
        } catch (error) {
            return `Error al listar ciudades: ${error.message}`;
        }
    },
});

/**
 * Filtra balnearios por nombre de ciudad y por nombres de servicios (no por ID).
 */
const filtrarBalneariosPorCiudadYServiciosTool = tool({
    name: "filtrarBalneariosPorCiudadYServicios",
    description: "Filtra balnearios que estén en una ciudad (puede ser parcial) y cuenten con TODOS los servicios especificados por nombre (ejemplo: ciudad='Miramar', servicios=['Wi-Fi','Pileta'])",
    parameters: z.object({
        ciudad: z.string().describe("El nombre de la ciudad a buscar (puede ser parcial, puede quedar vacío para no filtrar por ciudad)"),
        servicios: z.array(z.string()).describe("Nombres de los servicios requeridos (puede ser parcial, ej: 'Wi-Fi', 'Pileta')"),
    }),
    execute: async ({ ciudad, servicios }) => {
        try {
            const balnearios = await busqueda.filtrarBalneariosPorCiudadYServicios(ciudad, servicios);
            if (!balnearios || balnearios.length === 0) return "No se encontraron balnearios en esa ciudad con esos servicios.";
            return balnearios.map(bal => 
                `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`
            ).join('\n');
        } catch (error) {
            return `Error al filtrar balnearios: ${error.message}`;
        }
    },
});

/**
 * NUEVO: Filtra balnearios solo por servicios (por nombre, no por ID), SIN filtrar por ciudad.
 * Recibe: servicios (array de string, nombres/parciales de servicios, ej: ["Wi-Fi", "Pileta"])
 */
const filtrarBalneariosPorServiciosTool = tool({
    name: "filtrarBalneariosPorServicios",
    description: "Filtra balnearios que cuenten con TODOS los servicios especificados por nombre (ejemplo: servicios=['Wi-Fi','Pileta']). No filtra por ciudad.",
    parameters: z.object({
        servicios: z.array(z.string()).describe("Nombres de los servicios requeridos (puede ser parcial, ej: 'Wi-Fi', 'Pileta')"),
    }),
    execute: async ({ servicios }) => {
        try {
            // Llama con ciudad vacía para que solo filtre por servicios
            const balnearios = await busqueda.filtrarBalneariosPorCiudadYServicios("", servicios);
            if (!balnearios || balnearios.length === 0) return "No se encontraron balnearios con esos servicios.";
            return balnearios.map(bal => 
                `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`
            ).join('\n');
        } catch (error) {
            return `Error al filtrar balnearios: ${error.message}`;
        }
    },
});

// Busca balnearios disponibles en un rango de fechas opcional, combinable con ciudad y/o servicios
const buscarDisponibilidadTool = tool({
    name: "buscarDisponibilidad",
    description: "Lista balnearios disponibles. Filtros opcionales: ciudad (parcial), servicios (debe cumplir TODOS), fechas (inicio y salida en formato YYYY-MM-DD). Si no se envían fechas, no filtra por disponibilidad.",
    parameters: z.object({
        ciudad: z.string().default("").describe("Nombre parcial de ciudad. Opcional."),
        servicios: z.array(z.string()).default([]).describe("Nombres de servicios requeridos. Opcional."),
        fechaInicio: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).optional().describe("YYYY-MM-DD. Opcional, usar junto con fechaFin."),
        fechaFin: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).optional().describe("YYYY-MM-DD. Opcional, usar junto con fechaInicio."),
    }),
    execute: async ({ ciudad = "", servicios = [], fechaInicio, fechaFin }) => {
        try {
            if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
                return "Para filtrar por disponibilidad, enviá ambas fechas: 'fechaInicio' y 'fechaFin' (YYYY-MM-DD).";
            }

            const lista = await busqueda.listarBalneariosDisponibles({ ciudad, servicios, fechaInicio, fechaFin });
            if (!lista || lista.length === 0) {
                return "No hay balnearios que cumplan con esos filtros.";
            }
            return lista.map(bal => `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`).join('\n');
        } catch (error) {
            return `Error al buscar disponibilidad: ${error.message}`;
        }
    },
});

export function crearAgenteBalnearios({ verbose = true } = {}) {
    return agent({
        tools: [
            buscarBalneariosPorCiudadTool,
            listarBalneariosTool,
            listarCiudadesTool,
            filtrarBalneariosPorCiudadYServiciosTool,
            filtrarBalneariosPorServiciosTool, // Nuevo tool agregado
            buscarDisponibilidadTool
        ],
        llm: ollamaLLM,
        verbose,
        systemPrompt,
    });
}