import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import BusquedaHomeSearch from "../../assets/BusquedaHome.png";
import "./ReservasComponent.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ICONOS & LOGOS FOOTER
import Logo from "../../assets/LogoPraiarSinNombre.png";
import LogoNombre from "../../assets/LogoCircular.png";
import XFooter from "../../assets/XLogo.png";
import InstagramFooter from "../../assets/InstagramLogo.webp";
import LinkedinFooter from "../../assets/LinkedinLogo.png";
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
  const footerHeight = 90;
  doc.setFillColor("#00405E");
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");
  const logoSize = 38;
  const logoX = 48;
  const logoY = pageHeight - footerHeight + 13;
  if (base64s.logonombre) {
    doc.addImage(base64s.logonombre, "PNG", logoX, logoY, logoSize, logoSize, undefined, 'FAST');
  }
  const sloganX = logoX + logoSize / 2;
  const sloganY = logoY + logoSize + 7;
  doc.setFontSize(9);
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "normal");
  doc.text("Empezá el verano realmente", sloganX, sloganY, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Praiando", sloganX, sloganY + 10, { align: "center" });
  let contactoX = logoX + logoSize + 30;
  let contactoY = logoY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#fff");
  doc.text("Contacto", contactoX, contactoY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const iconSize = 8;
  contactoY += 7;
  if (base64s.gancho) doc.addImage(base64s.gancho, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("ORT Argentina, CABA", contactoX + 12, contactoY + 6);
  contactoY += 11;
  if (base64s.mail) doc.addImage(base64s.mail, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("contacto@praiar.com", contactoX + 12, contactoY + 6);
  contactoY += 11;
  if (base64s.tel) doc.addImage(base64s.tel, "PNG", contactoX, contactoY, iconSize, iconSize);
  doc.text("+54 911 0000-0000", contactoX + 12, contactoY + 6);
  contactoY += 11;
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
  const bloqueInferiorY = Math.max(sloganY + 18, redesY + redesIcon + 6);
  doc.setDrawColor("#aaa");
  doc.setLineWidth(0.7);
  doc.line(36, bloqueInferiorY, pageWidth - 36, bloqueInferiorY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#fff");
  doc.text("© 2025 Praiar. Todos los derechos reservados.", pageWidth / 2, bloqueInferiorY + 10, { align: "center" });
}

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
  const [reservasOriginales, setReservasOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1005);
  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendario, setShowCalendario] = useState(false);
  const [metodoReservaFiltro, setMetodoReservaFiltro] = useState("");
  const [balnearioFiltro, setBalnearioFiltro] = useState("");
  const [balnearios, setBalnearios] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [iconosBase64, setIconosBase64] = useState({});
  const { id } = useParams();
  const idBalneario = Number.isNaN(parseInt(id)) ? null : parseInt(id);

  useEffect(() => {
    Promise.all([
      getBase64FromImageUrl(Logo),
      getBase64FromImageUrl(LogoNombre),
      getBase64FromImageUrl(InstagramFooter),
      getBase64FromImageUrl(LinkedinFooter),
      getBase64FromImageUrl(XFooter),
      getBase64FromImageUrl(MailFooter),
      getBase64FromImageUrl(TelefonoFooter),
      getBase64FromImageUrl(GanchoFooter),
    ]).then(([logo, logonombre, insta, linkedin, twitter, mail, tel, gancho]) => {
      setIconosBase64({ logo, logonombre, insta, linkedin, twitter, mail, tel, gancho });
    });
  }, []);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Función para obtener métodos de pago dinámicamente desde el backend
  const fetchMetodosPago = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/metodos-pago");
      if (response.ok) {
        const data = await response.json();
        setMetodosPago(data.metodos_pago || []);
      } else {
        setMetodosPago([
          "mercado pago",
          "debito",
          "credito",
          "efectivo",
          "manual"
        ]);
      }
    } catch (error) {
      setMetodosPago([
        "mercado pago",
        "debito",
        "credito",
        "efectivo",
        "manual"
      ]);
    }
  };

  // Nueva función: obtener balnearios para filtrar (según tipo de usuario y reservas)
  const fetchBalneariosFiltrados = (reservasData = []) => {
    if (usuario && usuario.esPropietario) {
      fetch("http://localhost:3000/api/balnearios?propietario_id=" + usuario.auth_id)
        .then(res => res.ok ? res.json() : [])
        .then(balneariosPropios => setBalnearios(balneariosPropios))
        .catch(() => setBalnearios([]));
    } else {
      // Cliente: solo balnearios con reserva
      const balneariosSet = new Map();
      reservasData.forEach(r => {
        if (r.balneario_nombre && !balneariosSet.has(r.balneario_nombre)) {
          balneariosSet.set(r.balneario_nombre, {
            id_balneario: r.id_balneario,
            nombre: r.balneario_nombre
          });
        }
      });
      setBalnearios(Array.from(balneariosSet.values()));
    }
  };

  // --- FUNCION PRINCIPAL DE CARGA Y FILTRO DE RESERVAS ---
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
      body = { idBalneario };
    } else {
      url = "http://localhost:3000/api/reservas-usuario";
      body = { auth_id: usuario.auth_id };
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
        setReservasOriginales([]);
        setBalnearios([]);
      } else {
        let reservasAct = result.reservas || [];
        setReservasOriginales(reservasAct);

        // Actualizar balnearios para filtro según reservas actuales (solo para clientes)
        if (!idBalneario) fetchBalneariosFiltrados(reservasAct);

        // Filtrado dinámico
        let reservasFiltradas = [...reservasAct];
        if (metodoReservaFiltro && metodoReservaFiltro !== "") {
          reservasFiltradas = reservasFiltradas.filter(reserva =>
            reserva.metodo_pago &&
            reserva.metodo_pago.toLowerCase().includes(metodoReservaFiltro.toLowerCase())
          );
        }
        if (balnearioFiltro && balnearioFiltro !== "") {
          reservasFiltradas = reservasFiltradas.filter(reserva =>
            reserva.balneario_nombre &&
            reserva.balneario_nombre.toLowerCase().includes(balnearioFiltro.toLowerCase())
          );
        }
        setReservas(reservasFiltradas);
      }
    } catch (e) {
      setError("Error cargando reservas.");
      setReservas([]);
      setReservasOriginales([]);
      setBalnearios([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
    fetchMetodosPago();
    // eslint-disable-next-line
  }, []);

  // Hook para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1005);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FILTRO DINÁMICO: cada vez que cambian filtro, se re-filtra la lista localmente ---
  useEffect(() => {
    // Si los filtros están vacíos, mostramos todas las reservas originales
    if ((metodoReservaFiltro === "" || metodoReservaFiltro == null) && (balnearioFiltro === "" || balnearioFiltro == null)) {
      setReservas(reservasOriginales);
      return;
    }
    // Si no hay reservas originales, no filtrar
    if (!reservasOriginales || reservasOriginales.length === 0) {
      setReservas([]);
      return;
    }
    let filtradas = [...reservasOriginales];
    if (metodoReservaFiltro && metodoReservaFiltro !== "") {
      filtradas = filtradas.filter(reserva =>
        reserva.metodo_pago &&
        reserva.metodo_pago.toLowerCase().includes(metodoReservaFiltro.toLowerCase())
      );
    }
    if (balnearioFiltro && balnearioFiltro !== "") {
      filtradas = filtradas.filter(reserva =>
        reserva.balneario_nombre &&
        reserva.balneario_nombre.toLowerCase().includes(balnearioFiltro.toLowerCase())
      );
    }
    setReservas(filtradas);
  }, [metodoReservaFiltro, balnearioFiltro, reservasOriginales]);

  // --- FILTRO DE FECHA SE EJECUTA DIRECTAMENTE SOBRE EL BACK Y ACTUALIZA TODO ---
  const handleBuscar = () => {
    fetchReservas(true);
  };

  // Helper para obtener todos los atributos de la reserva
  function getPDFReservaInfo(reserva) {
    let clienteNombre = "";
    let clienteApellido = "";
    let clienteEmail = "";
    let clienteTelefono = "";
    if (reserva.cliente_nombre) {
      const nombreCompleto = reserva.cliente_nombre.split(" ");
      clienteNombre = nombreCompleto[0] || "";
      clienteApellido = nombreCompleto.slice(1).join(" ") || "";
      clienteEmail = reserva.email || "";
      clienteTelefono = reserva.telefono || "";
    } else if (usuario) {
      clienteNombre = usuario.nombre || "";
      clienteApellido = usuario.apellido || "";
      clienteEmail = usuario.email || "";
      clienteTelefono = usuario.telefono || "";
    }
    const ubicaciones = reserva.ubicaciones && reserva.ubicaciones.length > 0 
      ? reserva.ubicaciones.map(u => `Posición ${u.posicion || u.id_carpa}`).join(", ")
      : "Sin ubicaciones especificadas";
    return [
      ["ID Reserva", reserva.id_reserva || ""],
      ["Cliente", clienteNombre],
      ["Apellido", clienteApellido],
      ["Email", clienteEmail],
      ["Teléfono", clienteTelefono],
      ["Balneario", reserva.balneario_nombre || "Sin nombre"],
      ["Ubicaciones", ubicaciones],
      ["Fecha Entrada", reserva.fecha_inicio ? format(new Date(reserva.fecha_inicio + "T00:00:00"), "dd/MM/yyyy") : ""],
      ["Fecha Salida", reserva.fecha_salida ? format(new Date(reserva.fecha_salida + "T00:00:00"), "dd/MM/yyyy") : ""],
      ["Dirección", reserva.direccion || ""],
      ["Ciudad", reserva.ciudad || ""],
      ["Código Postal", reserva.codigo_postal || ""],
      ["País/Región", reserva.pais_region || reserva.pais || ""],
      ["Método de Pago", reserva.metodo_pago || ""],
      ["Precio Total", reserva.precio_total !== undefined ? `$${reserva.precio_total}` : ""],
    ];
  }

  const handleVerPDF = (reserva) => {
    if (!iconosBase64.logonombre) return;
    const doc = new jsPDF();
    const info = getPDFReservaInfo(reserva);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor("#00405E");
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.addImage(iconosBase64.logo, "PNG", 20, 10, 25, 25);
    doc.setFontSize(20);
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE RESERVA", pageWidth / 2, 25, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor("#B8D4E3");
    doc.setFont("helvetica", "normal");
    doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 20, 35, { align: "right" });
    let y = 65;
    const leftMargin = 25;
    const rightMargin = pageWidth - 25;
    const contentWidth = rightMargin - leftMargin;
    const footerHeight = 90;
    const maxContentHeight = pageHeight - footerHeight - 20;
    doc.setFillColor("#F0F8FF");
    doc.rect(leftMargin, y - 5, contentWidth, 15, "F");
    doc.setFontSize(14);
    doc.setTextColor("#00405E");
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL CLIENTE", leftMargin + 10, y + 2);
    y += 20;
    const clientInfo = info.slice(1, 5);
    clientInfo.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.setTextColor("#333333");
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", leftMargin, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "No especificado"), leftMargin + 60, y);
      y += 8;
    });
    y += 10;
    doc.setFillColor("#F0F8FF");
    doc.rect(leftMargin, y - 5, contentWidth, 15, "F");
    doc.setFontSize(14);
    doc.setTextColor("#00405E");
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DE LA RESERVA", leftMargin + 10, y + 2);
    y += 20;
    const reservaInfo = info.slice(0, 1).concat(info.slice(5, 9));
    reservaInfo.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.setTextColor("#333333");
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", leftMargin, y);
      doc.setFont("helvetica", "normal");
      const displayValue = String(value || "No especificado");
      if (displayValue.length > 50) {
        const lines = doc.splitTextToSize(displayValue, contentWidth - 60);
        doc.text(lines, leftMargin + 60, y);
        y += (lines.length - 1) * 8;
      } else {
        doc.text(displayValue, leftMargin + 60, y);
      }
      y += 8;
    });
    y += 10;
    if (y > maxContentHeight - 50) {
      doc.addPage();
      y = 30;
    }
    doc.setFillColor("#F0F8FF");
    doc.rect(leftMargin, y - 5, contentWidth, 15, "F");
    doc.setFontSize(14);
    doc.setTextColor("#00405E");
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DE FACTURACIÓN", leftMargin + 10, y + 2);
    y += 20;
    const facturacionInfo = info.slice(9, 15);
    facturacionInfo.forEach(([label, value]) => {
      if (y > maxContentHeight - 10) {
        doc.addPage();
        y = 30;
      }
      doc.setFontSize(11);
      doc.setTextColor("#333333");
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", leftMargin, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "No especificado"), leftMargin + 60, y);
      y += 8;
    });
    if (y < maxContentHeight - 20) {
      y += 15;
      doc.setDrawColor("#00405E");
      doc.setLineWidth(1);
      doc.line(leftMargin, y, rightMargin, y);
    }
    agregarFooterEstiloPraiar(doc, pageWidth, pageHeight, iconosBase64);
    const balneario = info.find(([l]) => l === "Balneario")?.[1] || "Reserva";
    const entrada = info.find(([l]) => l === "Fecha Entrada")?.[1] || "";
    const salida = info.find(([l]) => l === "Fecha Salida")?.[1] || "";
    const fileName = `Reserva_${balneario.replace(/[^a-zA-Z0-9]/g, '_')}_${entrada}_${salida}.pdf`;
    doc.save(fileName);
  };

  // Helper para saber si es mobile en el render
  function getLabelText(label) {
    if (!isMobile) return label;
    return label;
  }

  return (
    <div className="tus-reservas">
      <h1 className="hero-title">{idBalneario ? "Reservas de Clientes" : "Tus Reservas"}</h1>
      <div className="busqueda-form">
        <div className="input-group date-group">
          <FontAwesomeIcon
            icon="fa-solid fa-calendar-days"
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
              <>
                <div className="calendario-overlay" onClick={() => setShowCalendario(false)}></div>
                <div className="calendario-container">
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setRangoFechas([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={rangoFechas}
                    months={2}
                    direction="horizontal"
                    rangeColors={["#005984"]}
                    // El calendario ahora NO restringe fechas anteriores
                    // minDate={new Date()}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        {!idBalneario && (
          <>
            <div className="input-group">
              <FontAwesomeIcon
                icon="fa-solid fa-credit-card"
                className="iconFecha"
                alt="Icono de método de pago"
              />
              <div className="input-wrapper">
                <label className="subtitulo">Método de Pago</label>
                <select
                  className="input-estandar"
                  value={metodoReservaFiltro}
                  onChange={(e) => setMetodoReservaFiltro(e.target.value)}
                >
                  <option value="">Todos los métodos</option>
                  {metodosPago.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-group">
              <FontAwesomeIcon
                icon="fa-solid fa-building"
                className="iconFecha"
                alt="Icono de balneario"
              />
              <div className="input-wrapper">
                <label className="subtitulo">Balneario</label>
                <select
                  className="input-estandar"
                  value={balnearioFiltro}
                  onChange={(e) => setBalnearioFiltro(e.target.value)}
                >
                  <option value="">Todos los balnearios</option>
                  {balnearios.map((balneario) => (
                    <option key={balneario.id_balneario} value={balneario.nombre}>
                      {balneario.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
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
              <th>{isMobile ? "" : "Acción"}</th>
            </tr>
          </thead>
          <tbody>
            {reservas
              .sort((a, b) => new Date(b.fecha_inicio + 'T00:00:00') - new Date(a.fecha_inicio + 'T00:00:00'))
              .map((reserva) => (
                <tr key={reserva.id_reserva}>
                  <td data-label={getLabelText(idBalneario ? "Cliente" : "Balneario")}>
                    {idBalneario
                      ? reserva.cliente_nombre
                      : reserva.balneario_nombre}
                  </td>
                  <td data-label={getLabelText("Ubicación")}>
                    {(reserva.ubicaciones && reserva.ubicaciones.length > 0)
                      ? reserva.ubicaciones
                        .map(u => u.posicion || u.id_carpa)
                        .filter(Boolean)
                        .join(", ")
                      : "-"}
                  </td>
                  <td data-label={getLabelText("Entrada")}>{format(new Date(reserva.fecha_inicio + 'T00:00:00'), "dd/MM/yyyy")}</td>
                  <td data-label={getLabelText("Salida")}>{format(new Date(reserva.fecha_salida + 'T00:00:00'), "dd/MM/yyyy")}</td>
                  <td data-label={isMobile ? "" : getLabelText("Acción")}>
                    <button
                      className="ver-button"
                      disabled={!iconosBase64.logonombre}
                      onClick={() => handleVerPDF(reserva)}
                    >
                      {isMobile ? "Descargar PDF" : "Ver"}
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