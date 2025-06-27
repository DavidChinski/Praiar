import { useNavigate } from "react-router-dom";

function Error() {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          display: "flex",             // usar flexbox
          flexDirection: "column",     // apilar elementos verticalmente
          justifyContent: "center",    // centrar verticalmente
          alignItems: "center",        // centrar horizontalmente
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ marginBottom: "1rem" }}>No se encontró la página</h1>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "2px solid #a1c3d6",
            backgroundColor: "#ddf2f8",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            fontSize: "1.1rem"
          }}
        >
          Volver a la página anterior
        </button>
      </div>
    </>
  );
}

export default Error;
