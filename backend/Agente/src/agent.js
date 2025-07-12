// Aquí importá tu lógica real para el agente. Este es un stub de ejemplo.
// Reemplazá esto por la integración real con Ollama + LlamaIndex.

import { crearAgenteBalnearios } from './crear-agente.js';

// Exporta el mismo agente que usa CLI, pero sin verbose (o como prefieras)
export const elAgente = crearAgenteBalnearios({ verbose: false });