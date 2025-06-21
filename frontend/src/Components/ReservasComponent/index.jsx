import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import FechaBusquedaHome from "../../assets/FechaBusquedaHome.png";
import BusquedaHomeSearch from "../../assets/BusquedaHome.png";
import "./ReservasComponent.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ICONOS & LOGOS FOOTER
import Logo from "../../assets/LogoPraiarSinNombre.png";
import LogoNombre from "../../assets/LogoCircular.png";  // <--- circular logo PNG!
import InstaFooter from "../../assets/InstaFooter.png";
import LinkedinFooter from "../../assets/LinkedinFooter.png";
import TwitterFooter from "../../assets/TwitterFooter.png";
import MailFooter from "../../assets/MailFooter.png";
import TelefonoFooter from "../../assets/TelefonoFooter.png";
import GanchoFooter from "../../assets/GanchoFooter.png";

// Helper para convertir imagen a base64
function getBase64FromImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// --- FOOTER PDF ESTILO PRAIAR ---
function agregarFooterEstiloPraiar(doc, pageWidth, pageHeight, base64s) {
  // --- BACKGROUND FOOTER ---
  const footerHeight = 90;
  doc.setFillColor("#00405E");
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");

  // --- LOGO CIRCULAR (más chico, bien arriba) ---
  const logoSize = 38;
  const logoX = 48;
  const logoY = pageHeight - footerHeight + 13;
  if (base64s.logonombre) {
    doc.addImage(base64s.logonombre, "PNG", logoX, logoY, logoSize, logoSize, undefined, 'FAST');
  }

  // --- SLOGAN (centrado debajo del logo, más arriba) ---
  const sloganX = logoX + logoSize / 2;
  const sloganY = logoY + logoSize + 7;
  doc.setFontSize(9);
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "normal");
  doc.text("Empezá el verano realmente", sloganX, sloganY, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Praiando", sloganX, sloganY + 10, { align: "center" });

  // --- CONTACTO (pegado al título) ---
  let contactoX = logoX + logoSize + 30;
  let contactoY = logoY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#fff");
  doc.text("Contacto", contactoX, contactoY);

  // Bloque de contacto pegado al título (sin salto grande)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const iconSize = 8;
  contactoY += 7; // solo 7, para que quede pegado al título

  if (base64s.gancho) doc.addImage(base64s.gancho, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("ORT Argentina, CABA", contactoX + 12, contactoY + 6);
  contactoY += 11;

  if (base64s.mail) doc.addImage(base64s.mail, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("contacto@praiar.com", contactoX + 12, contactoY + 6);
  contactoY += 11;

  if (base64s.tel) doc.addImage(base64s.tel, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("+54 911 0000-0000", contactoX + 12, contactoY + 6);
  contactoY += 11;

  // --- REDES SOCIALES (bien alineado debajo, sin espacio extra) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor("#fff");
  doc.text("Redes Sociales", contactoX, contactoY);

  const redesY = contactoY + 6;
  const redesXInicio = contactoX;
  const redesIcon = 8;
  const iconSpacing = 20;
  let iconIndex = 0;

  if (base64s.insta) {
    doc.addImage(base64s.insta, "PNG", redesXInicio + iconIndex * iconSpacing, redesY, redesIcon, redesIcon, undefined, undefined, 0, { url: "https://instagram.com/praiar" });
    iconIndex++;
  }
  if (base64s.linkedin) {
    doc.addImage(base64s.linkedin, "PNG", redesXInicio + iconIndex * iconSpacing, redesY, redesIcon, redesIcon, undefined, undefined, 0, { url: "https://linkedin.com/company/praiararg" });
    iconIndex++;
  }
  if (base64s.twitter) {
    doc.addImage(base64s.twitter, "PNG", redesXInicio + iconIndex * iconSpacing, redesY, redesIcon, redesIcon, undefined, undefined, 0, { url: "https://twitter.com/praiar" });
  }

  // --- LÍNEA SEPARADORA ---
  const bloqueInferiorY = Math.max(sloganY + 18, redesY + redesIcon + 6);
  doc.setDrawColor("#aaa");
  doc.setLineWidth(0.7);
  doc.line(36, bloqueInferiorY, pageWidth - 36, bloqueInferiorY);

  // --- COPYRIGHT ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#fff");
  doc.text("© 2025 Praiar. Todos los derechos reservados.", pageWidth / 2, bloqueInferiorY + 10, { align: "center" });
}

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendario, setShowCalendario] = useState(false);

  // Para los iconos y logo en base64
  const [iconosBase64, setIconosBase64] = useState({});
  const { id } = useParams();
  const idBalneario = Number.isNaN(parseInt(id)) ? null : parseInt(id);

  // Cargar todos los iconos al inicio
  useEffect(() => {
    Promise.all([
      getBase64FromImageUrl(Logo),
      getBase64FromImageUrl(LogoNombre),
      getBase64FromImageUrl(InstaFooter),
      getBase64FromImageUrl(LinkedinFooter),
      getBase64FromImageUrl(TwitterFooter),
      getBase64FromImageUrl(MailFooter),
      getBase64FromImageUrl(TelefonoFooter),
      getBase64FromImageUrl(GanchoFooter),
    ]).then(([logo, logonombre, insta, linkedin, twitter, mail, tel, gancho]) => {
      setIconosBase64({ logo, logonombre, insta, linkedin, twitter, mail, tel, gancho });
    });
  }, []);

  // Obtener usuario logueado del localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Traer reservas desde el backend
  const fetchReservas = async (filtrarPorFechas = false) => {
    setLoading(true);
    setError(null);

    if (!usuario) {
      setError("No hay usuario logueado.");
      setLoading(false);
      return;
    }

    let url = "";
    let body = null;
    let method = "POST";

    if (idBalneario && usuario.esPropietario) {
      url = "http://localhost:3000/api/reservas-balneario";
      body = {
        idBalneario,
      };
    } else {
      url = "http://localhost:3000/api/reservas-usuario";
      body = {
        auth_id: usuario.auth_id,
      };
    }

    if (filtrarPorFechas) {
      const { startDate, endDate } = rangoFechas[0];
      body.fechaInicio = format(startDate, "yyyy-MM-dd");
      body.fechaFin = format(endDate, "yyyy-MM-dd");
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error cargando reservas.");
        setReservas([]);
      } else {
        setReservas(result.reservas || []);
        if (idBalneario && result.usuarios) {
          setUsuarios(result.usuarios);
        }
      }
    } catch (e) {
      setError("Error cargando reservas.");
      setReservas([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line
  }, []);

  const handleBuscar = () => {
    fetchReservas(true);
  };

  const handleVerPDF = (reserva) => {
    // Solo generamos el PDF si ya están los iconos cargados
    if (!iconosBase64.logonombre) return;

    const doc = new jsPDF();

    const cliente =
      idBalneario && usuarios[reserva.id_usuario]
        ? `${usuarios[reserva.id_usuario]?.nombre || ""} ${usuarios[reserva.id_usuario]?.apellido || ""}`
        : usuario?.nombre || "Cliente";

    const balneario = reserva.balneario_nombre || "Sin nombre";
    const ubicacion = reserva.ubicacion_posicion || reserva.ubicacion_id_carpa || "Sin ubicación";
    const entrada = format(new Date(reserva.fecha_inicio), "dd/MM/yyyy");
    const salida = format(new Date(reserva.fecha_salida), "dd/MM/yyyy");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Insertar logo arriba a la izquierda
    doc.addImage(iconosBase64.logo, "PNG", 15, 10, 25, 25); // x, y, width, height

    // Título centrado
    doc.setFontSize(18);
    doc.setTextColor("#004b75");
    doc.text("Detalle de Reserva", pageWidth / 2, 20, { align: "center" });

    // Datos de la reserva
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const left = 30;
    let y = 50;

    const info = [
      ["Cliente:", cliente],
      ["Balneario:", balneario],
      ["Ubicación:", ubicacion],
      ["Entrada:", entrada],
      ["Salida:", salida],
    ];

    info.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, left, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), left + 40, y);
      y += 10;
    });

    // Línea separadora antes del footer
    y += 10;
    doc.setDrawColor("#008ab2");
    doc.setLineWidth(0.5);
    doc.line(left, y, pageWidth - left, y);

    // --- FOOTER PDF ---
    agregarFooterEstiloPraiar(doc, pageWidth, pageHeight, iconosBase64);

    // Guardar el archivo
    doc.save(`Reserva_${balneario}_${entrada}.pdf`);
  };

  return (
    <div className="tus-reservas">
      <h1 className="hero-title">{idBalneario ? "Reservas de Clientes" : "Tus Reservas"}</h1>

      <div className="busqueda-form">
        <div className="input-group date-group">
          <img
            src={FechaBusquedaHome}
            className="iconFecha"
            alt="Icono de fecha"
            onClick={() => setShowCalendario(!showCalendario)}
            style={{ cursor: "pointer" }}
          />
          <div className="input-wrapper">
            <label className="subtitulo">Fecha</label>
            <div
              className="date-summary input-estandar"
              onClick={() => setShowCalendario(!showCalendario)}
            >
              {format(rangoFechas[0].startDate, "dd/MM/yyyy")} -{" "}
              {format(rangoFechas[0].endDate, "dd/MM/yyyy")}
            </div>
            {showCalendario && (
              <div className="calendario-container">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setRangoFechas([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={rangoFechas}
                  months={2}
                  direction="horizontal"
                  rangeColors={["#005984"]}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        <button className="search-button" onClick={handleBuscar}>
          <img src={BusquedaHomeSearch} className="search-icon" alt="Buscar" />
        </button>
      </div>

      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && reservas.length === 0 && <p>No tenés reservas aún.</p>}

      {!loading && reservas.length > 0 && (
        <table className="tabla-reservas">
          <thead>
            <tr>
              <th>{idBalneario ? "Cliente" : "Balneario"}</th>
              <th>Ubicación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id_reserva}>
                <td>
                  {idBalneario && usuarios[reserva.id_usuario]
                    ? `${usuarios[reserva.id_usuario].nombre} ${usuarios[reserva.id_usuario].apellido}`
                    : reserva.balneario_nombre}
                </td>
                <td>
                  {reserva.ubicacion_posicion || reserva.ubicacion_id_carpa}
                </td>
                <td>{format(new Date(reserva.fecha_inicio), "dd/MM/yyyy")}</td>
                <td>{format(new Date(reserva.fecha_salida), "dd/MM/yyyy")}</td>
                <td>
                  <button
                    className="ver-button"
                    disabled={!iconosBase64.logonombre}
                    onClick={() => handleVerPDF(reserva)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReservasComponent;