# KAVARI — Plataforma de Turismo

Plataforma web de turismo con guias completas de 37+ paises, asistente IA (Botpress), planes de membresia y planificacion de viajes.

## Requisitos

- [Node.js](https://nodejs.org/) 18+
- npm

## Inicio rapido

```bash
# Instalar dependencias del servidor
cd server && npm install

# Volver a la raiz
cd ..

# Arrancar ambos servidores (sitio + API)
./iniciar-servidores.bat      # Windows
# o manualmente:
node scripts/dev-server.js 5501   # Sitio web -> http://localhost:5501
cd server && node index.js         # API datos -> http://localhost:3007
```

## Estructura

```
Kavariwebsite/
├── index.html              # Pagina principal
├── paises.html             # Explorador de destinos
├── destino.html            # Ficha de pais (generada por JS)
├── planes.html             # Planes de membresia
├── perfil.html             # Panel de usuario
├── contacto.html           # Formulario de contacto
├── ayuda.html              # Centro de ayuda / FAQ
├── sobrenosotros.html      # Sobre KAVARI
├── terminos.html           # Terminos y condiciones
├── privacidad.html         # Politica de privacidad
├── cookies.html            # Politica de cookies
├── cuenta.html             # Login / registro
├── css/                    # Estilos (29 archivos modulares)
├── js/                     # Logica del cliente (32 archivos)
├── img/                    # Imagenes y favicon
├── data/
│   ├── data.json           # Datos de 37+ paises (fuente principal)
│   └── i18n/               # Traducciones (es, en, pt, fr)
├── server/
│   ├── index.js            # API de datos (Express)
│   └── package.json        # Dependencias del servidor
├── scripts/                # Utilidades de desarrollo
└── .htaccess               # Configuracion Apache (gzip, cache, seguridad)
```

## Variables de entorno

Copia `.env.example` a `.env` (en la raiz) y a `server/.env`:

| Variable | Descripcion |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth |

## Tecnologias

- **Frontend:** HTML, CSS modular, JavaScript vanilla
- **Backend:** Node.js, Express
- **Chatbot:** Botpress Webchat v3.7
- **Auth:** Supabase Auth + Google OAuth

## Despliegue

El sitio es estatico y puede desplegarse en cualquier hosting Apache o CDN:
- Copiar todos los archivos excepto `server/`, `scripts/`, `.env`, `node_modules/`
- Configurar `server/` como servicio Node.js separado
- Asegurar que `.htaccess` funcione (Apache) o replicar headers en el CDN
