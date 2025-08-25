import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { Busqueda } from "../lib/busqueda.js";

const busqueda = new Busqueda();

const systemPrompt = `
Sos el asistente de Praiar. Tu objetivo es dar respuestas accionables con enlaces internos clicables.

Identificación de rol del usuario (por el bloque Contexto de sesión al inicio del mensaje):
- Si session.isLoggedIn es false o no existe => Rol: Invitado.
- Si session.esPropietario es true => Rol: Dueño.
- En otro caso, Rol: Cliente.

Guía por rol:
- Invitado: invitar a registrarse/iniciar sesión. Sugerir explorar ciudades en "/ciudades".
- Cliente: ayudar a encontrar balnearios rápidamente. Siempre que devuelvas balnearios, incluí un link a "/balneario/{id}". Ofrecer atajos: "/ciudades" para el mapa.
- Dueño: asistir en gestión. Atajos: "/tusbalnearios" para ver/crear. Si no tiene balnearios, guiar: Tus Balnearios → Crear Balneario → completar datos, tandas y precios → guardar.

Sugerencias rápidas por rol (al inicio de la respuesta):
- Invitado: "Ver ciudades /ciudades", "Cómo reservo", "Balnearios populares".
- Cliente: "Disponibilidad este fin de semana", "Filtrar por servicios", "Ver ciudades /ciudades".
- Dueño: "Mis balnearios /tusbalnearios", "Crear balneario", "Ver reservas recientes".

Herramientas disponibles:
- Buscar por ciudad, listar todas, filtrar por ciudad y servicios, filtrar por servicios, buscar disponibilidad por fechas, buscar por nombre, listar balnearios del dueño.

Formato de respuesta:
- Siempre usa secciones con títulos cortos seguidos de dos puntos (ej: "Opciones:"), y debajo listas con "- " o listas numeradas. Máximo 5 ítems por lista.
- Evitá párrafos largos; dividí en puntos. Cada ítem debe caber en una sola línea si es posible.
- Incluí rutas absolutas: "/ciudades", "/tusbalnearios", "/balneario/{id}" para navegación.
- Si el usuario pide disponibilidad con fechas, priorizá la herramienta buscarDisponibilidad.

Interpretación de intención y fechas:
- Extraé de forma robusta ciudad, servicios y rango de fechas desde lenguaje natural (ej: "del 5 al 10 de enero en Miramar").
- Confirmá brevemente lo entendido antes de listar resultados ("Entendido: Miramar, 5–10 ene").
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

// Nuevo: buscar balnearios por nombre (parcial)
const buscarBalnearioPorNombreTool = tool({
    name: "buscarBalnearioPorNombre",
    description: "Busca balnearios por nombre (parcial) y devuelve enlaces /balneario/{id}",
    parameters: z.object({
        nombre: z.string().describe("Nombre o parte del nombre del balneario"),
    }),
    execute: async ({ nombre }) => {
        try {
            const lista = await busqueda.buscarBalneariosPorNombre(nombre);
            if (!lista || lista.length === 0) return "No se encontraron balnearios con ese nombre.";
            return lista.map(bal => `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`).join('\n');
        } catch (error) {
            return `Error al buscar por nombre: ${error.message}`;
        }
    },
});

// Nuevo: listar balnearios del dueño autenticado
const listarMisBalneariosTool = tool({
    name: "listarMisBalnearios",
    description: "Lista los balnearios del dueño autenticado (usa session.auth_id)",
    parameters: z.object({
        auth_id: z.string().describe("auth_id del usuario dueño"),
    }),
    execute: async ({ auth_id }) => {
        try {
            const lista = await busqueda.listarBalneariosDelDueno(auth_id);
            if (!lista || lista.length === 0) return "No tenés balnearios aún. Andá a /tusbalnearios para crear el primero.";
            return lista.map(bal => `- ${bal.nombre} — ${bal.ciudad || "Ciudad"} — ${bal.direccion} — /balneario/${bal.id_balneario}`).join('\n');
        } catch (error) {
            return `Error al listar tus balnearios: ${error.message}`;
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
            buscarDisponibilidadTool,
            buscarBalnearioPorNombreTool,
            listarMisBalneariosTool
        ],
        llm: ollamaLLM,
        verbose,
        systemPrompt,
    });
}