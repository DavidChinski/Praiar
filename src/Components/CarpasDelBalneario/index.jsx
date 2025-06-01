import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./CarpasDelBalneario.css";

function CarpasDelBalneario() {
  const { id } = useParams();
  const containerRef = useRef(null);
  const [carpas, setCarpas] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esDuenio, setEsDuenio] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [carpaEditando, setCarpaEditando] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // 1. Cargar carpas
      const { data: carpasData, error: carpasError } = await supabase
        .from("ubicaciones")
        .select("*")
        .eq("id_balneario", id);

      if (carpasError) {
        setError("Error al cargar carpas.");
        setLoading(false);
        return;
      }

      const carpasConPos = carpasData.map((c, i) => ({
        ...c,
        x: c.x ?? i * 100,
        y: c.y ?? 0,
      }));
      setCarpas(carpasConPos);

      // 2. Cargar elementos
      const { data: elementosData, error: elementosError } = await supabase
        .from("elementos_ubicacion")
        .select("*")
        .eq("id_balneario", id);

      if (elementosError) {
        setError("Error al cargar elementos.");
        setLoading(false);
        return;
      }

      setElementos(elementosData);

      // 3. Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false); // Solo visualización
        return;
      }

      // 4. Verificar si es dueño
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (userError || !usuario) {
        setLoading(false);
        return;
      }

      const { data: balneario, error: errorBalneario } = await supabase
        .from("balnearios")
        .select("id_usuario")
        .eq("id_balneario", id)
        .single();

      if (!errorBalneario && balneario?.id_usuario === usuario.auth_id) {
        setEsDuenio(true);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function agregarElemento(tipo) {
    if (!esDuenio) return;
    const x = 100, y = 100;
    const { data, error } = await supabase
      .from("elementos_ubicacion")
      .insert({ id_balneario: id, tipo, x, y })
      .select()
      .single();
    if (!error) {
      setElementos((prev) => [...prev, data]);
    }
  }

  function onMouseMove(e) {
    if (!esDuenio || !dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;

    if (dragging.tipo === "carpa") {
      setCarpas((prev) =>
        prev.map((c) =>
          c.id_carpa === dragging.id ? { ...c, x, y } : c
        )
      );
    } else if (dragging.tipo === "elemento") {
      setElementos((prev) =>
        prev.map((el) =>
          el.id_elemento === dragging.id ? { ...el, x, y } : el
        )
      );
    }
  }

  async function onMouseUp() {
    if (!esDuenio || !dragging) return;

    if (dragging.tipo === "carpa") {
      const carpa = carpas.find((c) => c.id_carpa === dragging.id);
      if (carpa) {
        const { error } = await supabase
          .from("ubicaciones")
          .update({ x: carpa.x, y: carpa.y })
          .eq("id_carpa", carpa.id_carpa);
        if (error) console.error("Error actualizando carpa:", error);
      }
    } else if (dragging.tipo === "elemento") {
      const el = elementos.find((el) => el.id_elemento === dragging.id);
      if (el) {
        const { error } = await supabase
          .from("elementos_ubicacion")
          .update({ x: el.x, y: el.y })
          .eq("id_elemento", el.id_elemento);
        if (error) console.error("Error actualizando elemento:", error);
      }
    }

    setDragging(null);
  }

  async function eliminarCarpa(id_carpa) {
    if (!esDuenio) return;
    const { error } = await supabase.from("ubicaciones").delete().eq("id_carpa", id_carpa);
    if (!error) {
      setCarpas((prev) => prev.filter((carpa) => carpa.id_carpa !== id_carpa));
    }
  }

  function handleEditarCarpa(carpa) {
    if (!esDuenio) return;
    setCarpaEditando({ ...carpa });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setCarpaEditando((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function guardarCambios() {
    if (!esDuenio) return;
    const { id_carpa, ...datos } = carpaEditando;
    const { error } = await supabase
      .from("ubicaciones")
      .update(datos)
      .eq("id_carpa", id_carpa);

    if (!error) {
      setCarpas((prev) =>
        prev.map((c) => (c.id_carpa === id_carpa ? { ...c, ...datos } : c))
      );
      setCarpaEditando(null);
    } else {
      console.error("Error al guardar cambios:", error);
    }
  }

  function rotarElemento(id_elemento) {
    if (!esDuenio) return;

    setElementos((prev) =>
      prev.map((el) =>
        el.id_elemento === id_elemento
          ? { ...el, rotado: (el.rotado || 0) + 90 }
          : el
      )
    );

    const el = elementos.find((e) => e.id_elemento === id_elemento);
    if (el) {
      supabase
        .from("elementos_ubicacion")
        .update({ rotado: (el.rotado || 0) + 90 })
        .eq("id_elemento", id_elemento)
        .then(({ error }) => {
          if (error) console.error("Error al rotar en Supabase:", error);
        });
    }
  }

  if (loading) return <p>Cargando carpas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="carpas-del-balneario">
      <h2>Carpas del Balneario</h2>

      {!esDuenio && (
        <p className="aviso-lectura">Vista de solo lectura. Iniciá sesión como propietario para editar.</p>
      )}

      {esDuenio && (
        <div className="toolbar">
          <button onClick={() => agregarElemento("pasillo")}>Agregar Pasillo</button>
          <button onClick={() => agregarElemento("pileta")}>Agregar Pileta</button>
          <button onClick={() => agregarElemento("quincho")}>Agregar Quincho</button>
        </div>
      )}

      <div
        className="carpa-container"
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {carpas.map((carpa) => (
          <div
            key={carpa.id_carpa}
            className={`carpa ${carpa.reservado ? "reservada" : "libre"}`}
            style={{ left: `${carpa.x}px`, top: `${carpa.y}px` }}
            onMouseDown={() => esDuenio && setDragging({ tipo: "carpa", id: carpa.id_carpa })}
            title={`Sillas: ${carpa.cant_sillas ?? "-"}, Mesas: ${carpa.cant_mesas ?? "-"}, Reposeras: ${carpa.cant_reposeras ?? "-"}, Capacidad: ${carpa.capacidad ?? "-"}`}
          >
            {carpa.posicion}
            {esDuenio && (
              <div className="acciones">
                <button onClick={() => eliminarCarpa(carpa.id_carpa)}>🗑</button>
                <button onClick={() => handleEditarCarpa(carpa)}>✏️</button>
              </div>
            )}
          </div>
        ))}

        {elementos.map((el) => (
          <div
            key={el.id_elemento}
            className={`elemento tipo-${el.tipo}`}
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              transform: `rotate(${el.rotado || 0}deg)`,
              transformOrigin: "center center",
              position: "absolute",
            }}
            onMouseDown={() =>
              esDuenio && setDragging({ tipo: "elemento", id: el.id_elemento })
            }
            title={el.tipo}
          >
            {el.tipo}
            {esDuenio && (
              <div className="acciones">
                <button onClick={() => rotarElemento(el.id_elemento)}>🔄</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {carpaEditando && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editando Carpa #{carpaEditando.posicion}</h3>
            <label>
              Sillas: <input name="cant_sillas" type="number" value={carpaEditando.cant_sillas || ''} onChange={handleInputChange} />
            </label>
            <label>
              Mesas: <input name="cant_mesas" type="number" value={carpaEditando.cant_mesas || ''} onChange={handleInputChange} />
            </label>
            <label>
              Reposeras: <input name="cant_reposeras" type="number" value={carpaEditando.cant_reposeras || ''} onChange={handleInputChange} />
            </label>
            <label>
              Capacidad: <input name="capacidad" type="number" value={carpaEditando.capacidad || ''} onChange={handleInputChange} />
            </label>
            <div className="modal-buttons">
              <button onClick={guardarCambios}>Guardar</button>
              <button onClick={() => setCarpaEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarpasDelBalneario;
