# KAVARI - Guía de Configuración de Supabase

## Pasos para configurar Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Nombre del proyecto: `kavari` (o el que prefieras)
4. Elige una contraseña para la base de datos
5. Selecciona la región más cercana a tus usuarios
6. Haz clic en "Create new project"

### 2. Obtener Credenciales
1. En tu proyecto, ve a **Settings** → **API**
2. Copia la **Project URL** (algo como: `https://xxxx.supabase.co`)
3. Copia la **anon public** key (empieza con `eyJ...`)

### 3. Actualizar la Configuración
Abre el archivo `js/supabase-client.js` y reemplaza:

```javascript
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';  // <-- Tu URL
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';  // <-- Tu Anon Key
```

### 4. Crear las Tablas en Supabase
1. En tu proyecto, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `server/schema.sql`
3. Haz clic en "Run" para ejecutar el script

Esto creará:
- Tabla `profiles` - Perfiles de usuarios
- Tabla `guide_registrations` - Registros de guías turísticos
- Buckets de Storage para avatares y documentos

### 5. Configurar Autenticación con Google
El botón de Google usa **Google Identity Services (GIS)** en el frontend y
`signInWithIdToken` de Supabase. Para que funcione:

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
   y una **Credencial OAuth Client ID** de tipo *Web application*.
2. Agrega el origen (Authorized JavaScript origins) donde corre tu sitio,
   por ejemplo:
   - `http://localhost:3000` (desarrollo)
   - `https://tudominio.com` (producción)
3. En Supabase, ve a **Authentication** → **Providers**:
   - Habilita **Google**
   - Ingresa el **mismo Client ID** y el Client Secret de Google Cloud Console.
4. En Google Cloud Console, agrega este URL de redirección (para que Supabase
   valide el token):
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```
5. El `Client ID` debe coincidir en tres lugares:
   - El botón en `perfil.html` (atributo `data-client_id`)
   - La constante `GOOGLE_CLIENT_ID` en `js/perfil.js`
   - El proveedor Google en el panel de Supabase

> Importante: con `signInWithIdToken` el usuario NO es redirigido; el flujo se
> completa con una ventana emergente de Google. No se necesita el flujo de
> redirección de OAuth de Supabase.

### 6. Configurar Políticas de Email (Opcional)
Para personalizar los emails de verificación:
1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates de:
   - Confirm signup
   - Magic Link
   - Change Email Address

### 7. Verificar la Configuración
1. Abre `perfil.html` en tu navegador
2. Intenta crear una cuenta con email/contraseña
3. Verifica que recibes el email de confirmación
4. Prueba login con Google (si lo configuraste)

---

## Estructura de Archivos

```
Kavariwebsite/
├── js/
│   ├── supabase-client.js    # Cliente Supabase (configuración)
│   ├── auth.js               # Sistema de autenticación
│   └── perfil.js             # Lógica de la página de perfil
├── css/
│   └── perfil.css            # Estilos del perfil
├── perfil.html               # Página de perfil
└── server/
    └── schema.sql            # Script SQL para Supabase
```

---

## Funcionalidades Implementadas

### Autenticación
- ✅ Registro con Email/Contraseña
- ✅ Login con Email/Contraseña
- ✅ Login con Google OAuth
- ✅ Verificación OTP por email
- ✅ Persistencia de sesión

### Perfil de Usuario
- ✅ Ver perfil completo
- ✅ Editar información personal
- ✅ Subir foto de perfil
- ✅ Preferencias de viaje
- ✅ Configuración de cuenta

### Registro de Guías
- ✅ Formulario completo con todos los campos
- ✅ Subida de foto de perfil
- ✅ Subida de registro criminal
- ✅ Subida de registro médico
- ✅ Selección de membresía (Plata/Oro/Diamante)
- ✅ Almacenamiento en Supabase

### Bilingüe
- ✅ Todas las traducciones en español
- ✅ Todas las traducciones en inglés
- ✅ Cambio de idioma en tiempo real

---

## Solución de Problemas

### "Supabase SDK no cargado"
- Verifica que el CDN de Supabase esté incluido antes de `supabase-client.js`
- Línea en HTML: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

### "Error al crear perfil"
- Verifica que las tablas estén creadas en Supabase
- Ejecuta el script `server/schema.sql` en el SQL Editor

### "No se pueden subir archivos"
- Verifica que los buckets de Storage estén creados
- Revisa las políticas de Storage en Supabase

### "Google Login no funciona"
- Verifica que Google esté habilitado en Authentication → Providers
- Confirma que el Client ID sea el mismo en Supabase y en `perfil.js`
- Asegúrate de que el origen de tu sitio esté en los *Authorized JavaScript origins*
  de Google Cloud Console
- Revisa la consola del navegador (F12): debe cargarse `gsi/client` sin errores
  y no debe haber bloqueos de ventanas emergentes

---

## Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12 → Console)
2. Los logs de Supabase en el dashboard
3. Las políticas de RLS en la base de datos
