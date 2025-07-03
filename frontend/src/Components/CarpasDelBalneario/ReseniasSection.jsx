import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function ReseniasSection({
  loadingResenias,
  handleRetrocederResenias,
  handleAvanzarResenias,
  indiceResenia,
  animating,
  handleTransitionEnd,
  reseñasExtendidas,
  CARD_WIDTH,
  RESEÑAS_POR_VISTA,
  likeResenia,
  usuarioLogueado,
  esDuenio,
  reseniaNueva,
  setReseniaNueva,
  agregarResenia
}) {
  return (
    <div className="resenias-section" style={{ marginTop: "3em" }}>
      <h3>Reseñas</h3>
      {loadingResenias ? (
        <p>Cargando reseñas...</p>
      ) : (
        <>
          <div className="resenias-carrusel-wrapper">
            <button
              className="resenias-carrusel-btn flecha-carrusel"
              onClick={handleRetrocederResenias}
              aria-label="Ver reseñas anteriores"
            >
              <FaChevronLeft />
            </button>
            <div className="resenias-carrusel-lista-viewport">
              <div
                className="resenias-lista"
                style={{
                  transform: `translateX(${-indiceResenia * CARD_WIDTH + ((RESEÑAS_POR_VISTA * CARD_WIDTH) / 2)}px)`,
                  transition: animating ? "transform 0.55s cubic-bezier(.5,1.6,.31,1)" : "none"
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {reseñasExtendidas.map((resenia, i) => (
                  <div className="resenia-card" key={i + "-" + (resenia?.id_reseña || i)}>
                    <div className="resenia-header">
                      <img
                        className="resenia-avatar"
                        src={
                          resenia?.usuario_imagen
                            ? resenia.usuario_imagen
                            : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        }
                        alt={resenia?.usuario_nombre || "Usuario"}
                      />
                      <div className="resenia-usuario">
                        <span className="resenia-usuario-nombre">
                          {resenia?.usuario_nombre
                            ? resenia.usuario_nombre
                            : "Usuario"}
                        </span>
                        <span className="resenia-estrellas">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <span
                              key={v}
                              style={{
                                color: v <= resenia.estrellas ? "#ffb700" : "#ccc",
                                fontSize: "1.1em",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="resenia-comentario">{resenia?.comentario}</div>
                    <div className="resenia-footer">
                      <span className="resenia-likes" style={{ marginRight: 8 }}>
                        <button
                          className={`like-boton ${resenia.dioLike ? "ya-like" : ""}`}
                          onClick={() => likeResenia(resenia.id_reseña)}
                          disabled={!usuarioLogueado || resenia.dioLike}
                          title={resenia.dioLike ? "Ya diste like" : "Dar like"}
                        >
                          👍
                        </button>
                        {resenia?.likes || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="resenias-carrusel-btn flecha-carrusel"
              onClick={handleAvanzarResenias}
              aria-label="Ver más reseñas"
            >
              <FaChevronRight />
            </button>
          </div>
          {/* Form agregar reseña */}
          {usuarioLogueado && !esDuenio && (
            <div className="agregar-resenia-form">
              <h4>Dejá tu reseña</h4>
              <label>
                Estrellas:{" "}
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    style={{
                      cursor: "pointer",
                      color: v <= (reseniaNueva.estrellasHover ?? reseniaNueva.estrellas) ? "#ffb700" : "#ccc",
                      fontSize: "1.6em",
                      marginRight: 2,
                      transition: "color 0.2s"
                    }}
                    onClick={() =>
                      setReseniaNueva((r) => ({
                        ...r,
                        estrellas: v,
                      }))
                    }
                    onMouseEnter={() => setReseniaNueva((r) => ({ ...r, estrellasHover: v }))}
                    onMouseLeave={() => setReseniaNueva((r) => ({ ...r, estrellasHover: undefined }))}
                  >
                    ★
                  </span>
                ))}
              </label>
              <label>
                Comentario:{" "}
                <textarea
                  value={reseniaNueva.comentario}
                  onChange={e =>
                    setReseniaNueva(r => ({
                      ...r,
                      comentario: e.target.value
                    }))
                  }
                />
              </label>
              <button className="boton-agregar-servicio" onClick={agregarResenia}>
                Publicar reseña
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReseniasSection;