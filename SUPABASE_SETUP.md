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
- Tabla `pais_likes` - Likes de países por usuario (se guardan con la cuenta y se restauran al volver a entrar)
- Tabla `chat_messages` - Memoria del asistente: historial de conversación por usuario (RLS: cada usuario solo ve/inserta los suyos)
- Buckets de Storage para avatares y documentos

> ⚠️ **Si ya ejecutaste el schema antes** (versión previa): el upsert de
> likes fallará con un error de RLS al volver a dar like a un país ya
> guardado, y la columna de orden no existirá. Ejecuta estas líneas en el
> SQL Editor para corregirlo:
>
> ```sql
> CREATE POLICY "Users can update own likes" ON pais_likes
>   FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
>
> ALTER TABLE pais_likes ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
> ```

### 5. Configurar Autenticación con Google

> ⚠️ **IMPORTANTE**: el **Client Secret** es secreto y **SOLO** se pega en el
> panel de Supabase. **NUNCA** debe ir en archivos del código (perfil.js,
> perfil.html, etc.) porque cualquiera podría verlo en el navegador.

Datos de este proyecto (configurados en `js/perfil.js` y `perfil.html`):

- **Client ID**: `103720820760-fi091rq34tik6dgbevv8j37v8mtt86q1.apps.googleusercontent.com`
- **Client Secret**: pégalo en Supabase (ver paso 3)
- **Supabase callback URL**: `https://dxxiwtakhtbuzljjilnp.supabase.co/auth/v1/callback`

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
   y una **Credencial OAuth Client ID** de tipo *Web application*.
2. Agrega el origen (Authorized JavaScript origins) donde corre tu sitio,
   por ejemplo:
   - `http://localhost:5500` (desarrollo, Live Server de VS Code)
   - `https://tudominio.com` (producción)
3. En Supabase, ve a **Authentication** → **Providers** → **Google**:
   - Habilita **Google** (interruptor activado)
   - **Client ID**: `103720820760-fi091rq34tik6dgbevv8j37v8mtt86q1.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-...` (el que muestra Google Cloud Console, pegarlo aquí)
4. En Google Cloud Console, agrega este URL de redirección (para que Supabase
   valide el token):
   ```
   https://dxxiwtakhtbuzljjilnp.supabase.co/auth/v1/callback
   ```
5. El `Client ID` debe coincidir en tres lugares:
   - El botón en `perfil.html` (atributo `data-client_id`) ✅ ya actualizado
   - La constante `GOOGLE_CLIENT_ID` en `js/perfil.js` ✅ ya actualizado
   - El proveedor Google en el panel de Supabase ← **verifica este**

> Importante: con `signInWithIdToken` el usuario NO es redirigido; el flujo se
> completa con una ventana emergente de Google. Si GIS no está disponible
> (p. ej. abriendo el archivo con `file://`), el botón usa el flujo de
> redirección OAuth estándar de Supabase (como GitHub).

### 6. Configurar Políticas de Email (Opcional)
Para personalizar los emails de verificación:
1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates de:
   - Confirm signup
   - Magic Link
   - Change Email Address

### 7. Asistente con IA (Gemini)

El asistente de chat (botón flotante) ahora:

- **Usa Gemini** (modelo `gemini-2.5-flash`) para responder con lenguaje natural.
- **Recuerda la conversación** (memoria): el historial se guarda en el navegador y, si
  inicias sesión, también en la tabla `chat_messages` de Supabase (se recuerda en
  cualquier dispositivo).
- **Responde con la información real del sitio**: el servidor indexa `data/data.json`
  (37 países) y le pasa al modelo los fragmentos relevantes de tu pregunta (RAG).

#### Para activarlo

1. Asegúrate de que existe el archivo `server/.env` con tu clave:
   ```
   GEMINI_API_KEY=TU_CLAVE_DE_GOOGLE_AI_STUDIO
   ```
   Puedes crearla gratis en [Google AI Studio](https://aistudio.google.com/apikey).
   Copia `server/.env.example` → `server/.env`.
2. Inicia el servidor de chat (desde la carpeta del proyecto):
   ```
   cd server
   npm install   # una sola vez (express + cors)
   npm start
   ```
   Verás `KAVARI Chat API v3 en http://localhost:3007`.
3. Abre el sitio (p. ej. `node scripts/dev-server.js 5501`) y usa el chat. Si el
   servidor no está corriendo o no hay clave, el asistente responde igual con el
   motor local.

> ⚠️ **La clave NUNCA va en la carpeta pública.** Se eliminó `js/server.js` (que la
> exponía). La clave solo vive en `server/.env` (ignorado por git gracias al
> `.gitignore` creado).

### 8. Verificar la Configuración
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
