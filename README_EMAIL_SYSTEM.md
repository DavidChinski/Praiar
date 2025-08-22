# Sistema de Notificación por Email - Praiar

## Descripción

Este sistema implementa notificaciones automáticas por email cuando se realizan reservas en balnearios. Los dueños de los balnearios reciben emails con toda la información de la reserva y botones para aprobar o rechazar la reserva.

## Características

- ✅ **Email automático** al dueño del balneario cuando se hace una reserva
- ✅ **Información completa** de la reserva (cliente, fechas, ubicaciones, precio)
- ✅ **Botones de acción** en el email para aprobar/rechazar
- ✅ **Notificación al cliente** cuando se aprueba o rechaza su reserva
- ✅ **Liberación automática** de ubicaciones cuando se rechaza una reserva
- ✅ **Panel de administración** para ver reservas pendientes

## Configuración

### 1. Variables de Entorno

Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Configuración del servidor
PORT=3000
SERVER_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Configuración de Email (Gmail)
EMAIL_USER=praiar.info@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Nota: Para Gmail, necesitas usar una "Contraseña de aplicación"
# Ve a: https://myaccount.google.com/apppasswords
```

### 2. Configuración de Gmail

1. Ve a [Google Account Settings](https://myaccount.google.com/)
2. Activa la **verificación en dos pasos** si no está activada
3. Ve a **Contraseñas de aplicación**
4. Genera una nueva contraseña para "Praiar"
5. Usa esa contraseña en la variable `EMAIL_PASS`

### 3. Instalación de Dependencias

```bash
cd backend
npm install
```

## Uso

### 1. Iniciar el Servidor

```bash
cd backend
npm start
```

### 2. Flujo de Reserva

1. **Cliente hace reserva** → Se envía email al dueño del balneario
2. **Dueño recibe email** → Ve toda la información y botones de acción
3. **Dueño hace clic** → En "Aprobar" o "Rechazar"
4. **Sistema procesa** → Actualiza estado y notifica al cliente

### 3. Panel de Administración

Los propietarios pueden ver todas las reservas pendientes en el componente `ReservasPendientes`:

```jsx
import ReservasPendientes from './Components/ReservasPendientes';

// En tu componente de panel del propietario
<ReservasPendientes idBalneario={idBalneario} />
```

## Estructura de Archivos

```
backend/
├── emailConfig.js          # Configuración y templates de email
├── server.js              # Servidor con endpoints de email
└── .env                   # Variables de entorno

frontend/
├── src/
│   ├── utils/
│   │   └── reservaActions.js    # Funciones para aprobar/rechazar
│   └── Components/
│       └── ReservasPendientes/  # Componente de administración
```

## Endpoints de la API

### POST `/api/reserva/approve/:id_reserva`
Aprueba una reserva y notifica al cliente.

### POST `/api/reserva/reject/:id_reserva`
Rechaza una reserva, libera ubicaciones y notifica al cliente.

### GET `/api/reserva/status/:id_reserva`
Obtiene el estado actual de una reserva.

## Templates de Email

### 1. Notificación de Nueva Reserva
- **Para:** Dueño del balneario
- **Contenido:** Información completa de la reserva
- **Botones:** Aprobar / Rechazar

### 2. Confirmación de Aprobación
- **Para:** Cliente
- **Contenido:** Confirmación de reserva aprobada

### 3. Notificación de Rechazo
- **Para:** Cliente
- **Contenido:** Información sobre reserva rechazada

## Personalización

### Modificar Templates de Email

Edita el archivo `backend/emailConfig.js` para personalizar:

- Colores y estilos CSS
- Contenido de los emails
- Información mostrada
- Textos y mensajes

### Agregar Campos Adicionales

Para mostrar información adicional en los emails:

1. Modifica el template en `emailConfig.js`
2. Actualiza la función de envío en `server.js`
3. Asegúrate de que los datos estén disponibles en la base de datos

## Solución de Problemas

### Email no se envía
1. Verifica las credenciales de Gmail
2. Asegúrate de usar contraseña de aplicación
3. Revisa los logs del servidor

### Botones no funcionan
1. Verifica que las URLs en el email sean correctas
2. Asegúrate de que el servidor esté corriendo
3. Revisa la configuración de `FRONTEND_URL`

### Error de autenticación
1. Verifica que `EMAIL_USER` y `EMAIL_PASS` estén configurados
2. Asegúrate de que la verificación en dos pasos esté activada en Gmail
3. Genera una nueva contraseña de aplicación

## Seguridad

- ✅ Las contraseñas de email están en variables de entorno
- ✅ Los endpoints requieren autenticación
- ✅ Las URLs de acción son seguras
- ✅ Se valida la existencia de reservas antes de procesar

## Mantenimiento

### Logs
El sistema registra todas las operaciones de email en la consola del servidor:
- Envío exitoso de emails
- Errores de envío
- Aprobaciones/rechazos de reservas

### Monitoreo
Revisa regularmente:
- Logs del servidor
- Estado de las reservas en la base de datos
- Funcionamiento de los emails

## Soporte

Para problemas técnicos:
1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Confirma que Gmail esté configurado correctamente
4. Revisa la conectividad de red

---

**Desarrollado para Praiar** 🏖️
