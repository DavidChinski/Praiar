import nodemailer from 'nodemailer';

// Configuración del transportador de email
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'praiar.info@gmail.com',
    pass: process.env.EMAIL_PASS || 'hbtt hyzt ktwp team'
  }
});

// Template HTML para el email de notificación de reserva
export const createReservaNotificationEmail = (reservaData) => {
  const {
    clienteNombre,
    clienteEmail,
    clienteTelefono,
    balnearioNombre,
    ubicaciones,
    fechaInicio,
    fechaSalida,
    precioTotal,
    metodoPago,
    direccion,
    ciudad,
    codigoPostal,
    pais
  } = reservaData;

  const ubicacionesList = ubicaciones.map(ubic => `Ubicación #${ubic.id_ubicacion}`).join(', ');
  
  const approveUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/reserva/approve/${reservaData.id_reserva}`;
  const rejectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/reserva/reject/${reservaData.id_reserva}`;

  return {
    subject: `Nueva reserva en ${balnearioNombre} - Requiere aprobación`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Reserva - ${balnearioNombre}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2b87f5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2b87f5;
            margin: 0;
            font-size: 24px;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2b87f5;
          }
          .section h3 {
            margin-top: 0;
            color: #2b87f5;
            font-size: 18px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          .info-value {
            color: #333;
          }
          .buttons {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
          }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .btn-approve {
            background-color: #28a745;
            color: white;
          }
          .btn-approve:hover {
            background-color: #218838;
            transform: translateY(-2px);
          }
          .btn-reject {
            background-color: #dc3545;
            color: white;
          }
          .btn-reject:hover {
            background-color: #c82333;
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .urgent {
            background-color: #fff3cd;
            border-color: #ffc107;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ Nueva Reserva Recibida</h1>
            <p>Se ha recibido una nueva reserva en tu balneario que requiere tu aprobación</p>
          </div>

          <div class="urgent">
            ⚠️ Esta reserva está pendiente de aprobación. Por favor, revisa los detalles y toma una decisión.
          </div>

          <div class="section">
            <h3>📋 Información del Cliente</h3>
            <div class="info-row">
              <span class="info-label">Nombre completo:</span>
              <span class="info-value">${clienteNombre}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${clienteEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">${clienteTelefono}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dirección:</span>
              <span class="info-value">${direccion}, ${ciudad} ${codigoPostal}, ${pais}</span>
            </div>
          </div>

          <div class="section">
            <h3>🏖️ Detalles de la Reserva</h3>
            <div class="info-row">
              <span class="info-label">Balneario:</span>
              <span class="info-value">${balnearioNombre}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ubicaciones reservadas:</span>
              <span class="info-value">${ubicacionesList}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha de entrada:</span>
              <span class="info-value">${new Date(fechaInicio).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha de salida:</span>
              <span class="info-value">${new Date(fechaSalida).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Duración:</span>
              <span class="info-value">${Math.ceil((new Date(fechaSalida) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24))} días</span>
            </div>
            <div class="info-row">
              <span class="info-label">Método de pago:</span>
              <span class="info-value">${metodoPago}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Precio total:</span>
              <span class="info-value"><strong>$${precioTotal}</strong></span>
            </div>
          </div>

          <div class="buttons">
            <a href="${approveUrl}" class="btn btn-approve">✅ Aprobar Reserva</a>
            <a href="${rejectUrl}" class="btn btn-reject">❌ Rechazar Reserva</a>
          </div>

          <div class="footer">
            <p>Este email fue enviado automáticamente por el sistema de Praiar.</p>
            <p>Si tienes alguna pregunta, contacta con soporte técnico.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Nueva Reserva Recibida - ${balnearioNombre}

Se ha recibido una nueva reserva que requiere tu aprobación.

INFORMACIÓN DEL CLIENTE:
- Nombre: ${clienteNombre}
- Email: ${clienteEmail}
- Teléfono: ${clienteTelefono}
- Dirección: ${direccion}, ${ciudad} ${codigoPostal}, ${pais}

DETALLES DE LA RESERVA:
- Balneario: ${balnearioNombre}
- Ubicaciones: ${ubicacionesList}
- Fecha entrada: ${fechaInicio}
- Fecha salida: ${fechaSalida}
- Duración: ${Math.ceil((new Date(fechaSalida) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24))} días
- Método pago: ${metodoPago}
- Precio total: $${precioTotal}

Para aprobar o rechazar esta reserva, visita tu panel de administración en Praiar.

Este email fue enviado automáticamente por el sistema de Praiar.
    `
  };
};

// Template para email de confirmación de aprobación
export const createApprovalEmail = (reservaData) => {
  return {
    subject: `Reserva aprobada en ${reservaData.balnearioNombre}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Aprobada</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #28a745;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #28a745;
            margin: 0;
            font-size: 24px;
          }
          .success-message {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Reserva Aprobada</h1>
          </div>
          
          <div class="success-message">
            Tu reserva ha sido aprobada exitosamente
          </div>
          
          <p>Hola ${reservaData.clienteNombre},</p>
          
          <p>Nos complace informarte que tu reserva en <strong>${reservaData.balnearioNombre}</strong> ha sido aprobada por el propietario.</p>
          
          <p><strong>Detalles de tu reserva:</strong></p>
          <ul>
            <li>Fechas: ${new Date(reservaData.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(reservaData.fechaSalida).toLocaleDateString('es-ES')}</li>
            <li>Precio total: $${reservaData.precioTotal}</li>
            <li>Método de pago: ${reservaData.metodoPago}</li>
          </ul>
          
          <p>¡Esperamos que disfrutes tu estadía!</p>
          
          <p>Saludos,<br>El equipo de Praiar</p>
        </div>
      </body>
      </html>
    `
  };
};

// Template para email de rechazo
export const createRejectionEmail = (reservaData) => {
  return {
    subject: `Reserva rechazada en ${reservaData.balnearioNombre}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Rechazada</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #dc3545;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #dc3545;
            margin: 0;
            font-size: 24px;
          }
          .rejection-message {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Reserva Rechazada</h1>
          </div>
          
          <div class="rejection-message">
            Tu reserva no pudo ser confirmada
          </div>
          
          <p>Hola ${reservaData.clienteNombre},</p>
          
          <p>Lamentamos informarte que tu reserva en <strong>${reservaData.balnearioNombre}</strong> no pudo ser confirmada por el propietario.</p>
          
          <p>Esto puede deberse a:</p>
          <ul>
            <li>Indisponibilidad en las fechas solicitadas</li>
            <li>Cambios en la disponibilidad del balneario</li>
            <li>Otros motivos operativos</li>
          </ul>
          
          <p>Te recomendamos:</p>
          <ul>
            <li>Contactar directamente con el balneario</li>
            <li>Buscar fechas alternativas</li>
            <li>Explorar otros balnearios en nuestra plataforma</li>
          </ul>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p>Saludos,<br>El equipo de Praiar</p>
        </div>
      </body>
      </html>
    `
  };
};
