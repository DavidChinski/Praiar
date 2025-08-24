import 'dotenv/config';
import nodemailer from 'nodemailer';

// Configuración del transportador usando SMTP Brevo
export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
	port: Number(process.env.EMAIL_PORT) || 587,
	secure: false, // true si usas 465
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
	console.warn('[EMAIL] Faltan EMAIL_USER/EMAIL_PASS para SMTP. Si usas API, define BREVO_API_KEY.');
}

// Función para enviar correos
export const sendEmail = async ({ to, subject, html, text }) => {
	const from = process.env.EMAIL_FROM || 'praiar.info@gmail.com';
	const apiKey = process.env.BREVO_API_KEY;

	// Si tenemos API Key de Brevo y fetch disponible, usar API oficial
	if (apiKey && typeof fetch === 'function') {
		const toArray = Array.isArray(to) ? to : [to];
		const payload = {
			sender: { name: 'Praiar', email: from },
			to: toArray.filter(Boolean).map((email) => ({ email })),
			subject,
			...(html ? { htmlContent: html } : {}),
			...(text ? { textContent: text } : {}),
		};

		const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'api-key': apiKey,
				accept: 'application/json',
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		const data = await resp.json().catch(() => ({}));
		if (!resp.ok) {
			const reason = data?.message || resp.statusText;
			throw new Error(`Brevo API error: ${resp.status} ${reason}`);
		}
		// Normalizar respuesta para que el caller tenga messageId/accepted
		return { messageId: data?.messageId || data?.messageId || '', accepted: toArray, rejected: [] };
	}

	// Fallback a SMTP (nodemailer + Brevo SMTP)
	const options = { from: `"Praiar" <${from}>`, to, subject, html, text };
	const info = await transporter.sendMail(options);
	return info;
};

// Template HTML para el email de notificación de reserva
export const createReservaNotificationEmail = (reservaData) => {
	const {
		id_reserva,
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
		pais,
	} = reservaData;

	const ubicacionesList = (ubicaciones || [])
		.map((u) => `Ubicación #${u.id_ubicacion ?? u}`)
		.join(', ');

	// Importante: los links de acción deben apuntar al backend (SERVER_URL)
	const base = process.env.SERVER_URL || 'http://localhost:3000';
	const approveUrl = `${base}/api/reserva/approve/${id_reserva}`;
	const rejectUrl = `${base}/api/reserva/reject/${id_reserva}`;

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
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
					.container { background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
					.header { text-align: center; border-bottom: 3px solid #2b87f5; padding-bottom: 20px; margin-bottom: 30px; }
					.header h1 { color: #2b87f5; margin: 0; font-size: 24px; }
					.section { margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #2b87f5; }
					.section h3 { margin-top: 0; color: #2b87f5; font-size: 18px; }
					.info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; }
					.info-label { font-weight: bold; color: #555; }
					.buttons { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; }
					.btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; }
					.btn-approve { background-color: #28a745; color: white; }
					.btn-approve:hover { background-color: #218838; transform: translateY(-2px); }
					.btn-reject { background-color: #dc3545; color: white; }
					.btn-reject:hover { background-color: #c82333; transform: translateY(-2px); }
					.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🏖️ Nueva Reserva Recibida</h1>
						<p>Se ha recibido una nueva reserva en tu balneario que requiere tu aprobación</p>
					</div>
					<div class="section">
						<h3>📋 Información del Cliente</h3>
						<div class="info-row"><span class="info-label">Nombre completo:</span><span>${clienteNombre}</span></div>
						<div class="info-row"><span class="info-label">Email:</span><span>${clienteEmail}</span></div>
						<div class="info-row"><span class="info-label">Teléfono:</span><span>${clienteTelefono}</span></div>
						<div class="info-row"><span class="info-label">Dirección:</span><span>${direccion}, ${ciudad} ${codigoPostal}, ${pais}</span></div>
					</div>
					<div class="section">
						<h3>🏖️ Detalles de la Reserva</h3>
						<div class="info-row"><span class="info-label">Balneario:</span><span>${balnearioNombre}</span></div>
						<div class="info-row"><span class="info-label">Ubicaciones reservadas:</span><span>${ubicacionesList}</span></div>
						<div class="info-row"><span class="info-label">Fecha de entrada:</span><span>${new Date(fechaInicio).toLocaleDateString('es-ES')}</span></div>
						<div class="info-row"><span class="info-label">Fecha de salida:</span><span>${new Date(fechaSalida).toLocaleDateString('es-ES')}</span></div>
						<div class="info-row"><span class="info-label">Duración:</span><span>${Math.ceil((new Date(fechaSalida) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24))} días</span></div>
						<div class="info-row"><span class="info-label">Método de pago:</span><span>${metodoPago}</span></div>
						<div class="info-row"><span class="info-label">Precio total:</span><span><strong>$${precioTotal}</strong></span></div>
					</div>
					<div class="buttons">
						<a href="${approveUrl}" class="btn btn-approve">✅ Aprobar Reserva</a>
						<a href="${rejectUrl}" class="btn btn-reject">❌ Rechazar Reserva</a>
					</div>
					<div class="footer">
						<p>Este email fue enviado automáticamente por el sistema de Praiar.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
Nueva Reserva Recibida - ${balnearioNombre}
Cliente: ${clienteNombre}, Email: ${clienteEmail}, Teléfono: ${clienteTelefono}
Fechas: ${fechaInicio} - ${fechaSalida}
Precio: $${precioTotal}
Aprobar: ${approveUrl}
Rechazar: ${rejectUrl}
		`,
	};
};

// Template para email de confirmación de aprobación
export const createApprovalEmail = (reservaData) => ({
	subject: `Reserva aprobada en ${reservaData.balnearioNombre}`,
	html: `
		<h1>✅ Reserva Aprobada</h1>
		<p>Hola ${reservaData.clienteNombre}, tu reserva en <strong>${reservaData.balnearioNombre}</strong> ha sido aprobada.</p>
		<p>Fechas: ${new Date(reservaData.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(reservaData.fechaSalida).toLocaleDateString('es-ES')}</p>
		<p>Precio total: $${reservaData.precioTotal}</p>
		<p>¡Gracias por elegirnos!</p>
	`,
});

// Template para email de rechazo
export const createRejectionEmail = (reservaData) => ({
	subject: `Reserva rechazada en ${reservaData.balnearioNombre}`,
	html: `
		<h1>❌ Reserva Rechazada</h1>
		<p>Hola ${reservaData.clienteNombre}, lamentamos informarte que tu reserva en <strong>${reservaData.balnearioNombre}</strong> no pudo ser confirmada.</p>
		<p>Por favor, intenta con otras fechas o comunícate con el balneario.</p>
	`,
});

