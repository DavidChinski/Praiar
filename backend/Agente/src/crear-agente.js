import { tool, agent } from "llamaindex";
import { Ollama } from "@llamaindex/ollama";
import { z } from "zod";
import { Busqueda } from "../lib/busqueda.js";

const busqueda = new Busqueda();

const systemPrompt = `
Sos un asistente para consultar información sobre balnearios y ciudades.
Tu tarea es ayudar a consultar o mostrar datos de balnearios y la ciudad donde se encuentran.

Usá las herramientas disponibles para:
- Buscar balnearios por ciudad
- Mostrar la lista completa de balnearios con su ciudad
- Mostrar la lista de todas las ciudades disponibles
- Filtrar balnearios en una ciudad y con servicios específicos
- Filtrar balnearios solo por servicios

Respondé de forma clara y breve.

IMPORTANTE:
- Cuando muestres una lista de elementos (por ejemplo, ciudades o balnearios), usá el formato Markdown de lista (cada elemento en una línea que empieza con "- " o "1. ").
- Ejemplo de lista:  
  - Ciudad1  
  - Ciudad2  
  - Ciudad3
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
            return balnearios.map(bal => 
                `Balneario: ${bal.nombre}, Dirección: ${bal.direccion}, Teléfono: ${bal.telefono || "No informado"}`
            ).join('\n');
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
            return lista.map(bal => 
                `Balneario: ${bal.nombre}, Ciudad: ${bal.ciudad}, Dirección: ${bal.direccion}, Teléfono: ${bal.telefono || "No informado"}`
            ).join('\n');
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
            return ciudades.map(ciudad => 
                `Ciudad: ${ciudad.nombre}`
            ).join('\n');
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
                `Balneario: ${bal.nombre}, Ciudad: ${bal.ciudad}, Dirección: ${bal.direccion}, Teléfono: ${bal.telefono || "No informado"}`
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
                `Balneario: ${bal.nombre}, Ciudad: ${bal.ciudad}, Dirección: ${bal.direccion}, Teléfono: ${bal.telefono || "No informado"}`
            ).join('\n');
        } catch (error) {
            return `Error al filtrar balnearios: ${error.message}`;
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
            filtrarBalneariosPorServiciosTool // Nuevo tool agregado
        ],
        llm: ollamaLLM,
        verbose,
        systemPrompt,
    });
}