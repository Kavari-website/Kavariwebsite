/* ══════════════════════════════════════════════════════════════════
   CEREBRO DEL CHATBOT DE KAVARI — v2
   Responde SOLO con contenido visible en la ficha (ctx); no inventa
   datos externos. Esta versión mejora la detección de intención:
     - normaliza texto (tildes, mayúsculas, signos)
     - puntúa TODAS las intenciones y elige la de mayor coincidencia
       (en vez de "la primera que matchea gana")
     - agrega sinónimos, plurales y mezcla ES/EN
     - suma intenciones nuevas: saludo, gracias, ayuda, presupuesto,
       transporte, seguridad, conectividad, propinas
     - el fallback ahora sugiere temas disponibles en vez de un
       mensaje genérico
   ══════════════════════════════════════════════════════════════════ */
(function () {

  /* ---------- utilidades ---------- */
  const clean = value => String(value || '').replace(/[<>]/g, '');
  const lang = () => (localStorage.getItem('kavari-idioma') || 'es') === 'en';

  // quita tildes, pasa a minúsculas y colapsa espacios
  const normalize = str => String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const items = (list, mapper) => list.slice(0, 3).map(mapper).join('<br>');

  /* ---------- diccionario de intenciones ---------- */
  // cada intención tiene una lista de palabras clave (ya normalizadas)
  // y una función que arma la respuesta con datos de ctx.
  const INTENTS = [
    {
      name: 'saludo',
      keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hello', 'hey', 'que tal'],
      handler: (d, ctx, en, name) => en
        ? `Hi! I'm the KAVARI assistant${name ? ` for ${name}` : ''}. Ask me about places, food, culture, activities, guides, flights, stays or practical info.`
        : `¡Hola! Soy el asistente de KAVARI${name ? ` para ${name}` : ''}. Pregúntame por lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes o info práctica.`
    },
    {
      name: 'gracias',
      keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'thanks', 'thank you', 'great', 'awesome'],
      handler: (d, ctx, en) => en
        ? 'You\'re welcome! Anything else about your trip?'
        : '¡De nada! ¿Algo más sobre tu viaje?'
    },
    {
      name: 'ayuda',
      keywords: ['ayuda', 'que puedes hacer', 'que sabes', 'capacidades', 'help', 'what can you do'],
      handler: (d, ctx, en, name) => en
        ? `I can answer about ${name || 'this destination'}: places, food, culture, activities, guides, flights, accommodation, budget, transport, safety, connectivity and practical info.`
        : `Puedo responder sobre ${name || 'este destino'}: lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes, presupuesto, transporte, seguridad, conectividad e info práctica.`
    },
    {
      name: 'visa',
      keywords: ['visa', 'visado', 'pasaporte', 'documento', 'documentos', 'migracion', 'entrar', 'entrada', 'passport', 'document', 'requisitos'],
      handler: (d, ctx, en, name) => {
        const card = d.practica?.info_cards?.find(x => x.icono === 'visa');
        return card
          ? `<strong>${en ? 'Information in KAVARI' : 'Información en KAVARI'}:</strong><br>${clean(card.texto)}`
          : (en ? `KAVARI does not have entry-requirement data for ${name}. Check an official consular source.` : `KAVARI no tiene requisitos de entrada para ${name}. Consulta una fuente consular oficial.`);
      }
    },
    {
      name: 'clima',
      keywords: ['clima', 'temporada', 'temporadas', 'epoca', 'lluvia', 'lluvias', 'calor', 'frio', 'weather', 'season', 'seasons', 'rain'],
      handler: (d, ctx, en, name) => {
        const seasons = d.practica?.temporadas || [];
        return seasons.length
          ? `<strong>${en ? 'Seasons shown for' : 'Temporadas disponibles para'} ${name}:</strong><br>${items(seasons, s => `<strong>${clean(s.nombre)}</strong> (${clean(s.meses)}): ${clean(s.descripcion)}`)}`
          : (en ? 'There are no seasonal details in this KAVARI page. Open “Practical info” for available data.' : 'Esta ficha no tiene temporadas cargadas. Abre “Info práctica” para ver los datos disponibles.');
      }
    },
    {
      name: 'gastronomia',
      keywords: ['comida', 'comer', 'plato', 'platos', 'gastronomia', 'restaurante', 'restaurantes', 'food', 'dish', 'restaurant', 'eat'],
      handler: (d, ctx, en, name) => {
        const dishes = d.gastronomia?.platos || [];
        return dishes.length
          ? `<strong>${en ? 'Food listed for' : 'Gastronomía de'} ${name}:</strong><br>${items(dishes, p => `<strong>${clean(p.nombre)}</strong>${p.descripcion ? ` — ${clean(p.descripcion)}` : ''}`)}`
          : (en ? 'This country page has no food entries yet.' : 'Esta ficha todavía no tiene platos cargados.');
      }
    },
    {
      name: 'lugares',
      keywords: ['lugares', 'lugar', 'destino', 'destinos', 'visitar', 'imperdible', 'imperdibles', 'places', 'place', 'visit', 'sightseeing'],
      handler: (d, ctx, en, name) => {
        const places = d.destinos || [];
        return places.length
          ? `<strong>${en ? 'Places in' : 'Lugares en'} ${name}:</strong><br>${items(places, p => `<strong>${clean(p.nombre)}</strong>${p.tag ? ` — ${clean(p.tag)}` : ''}`)}`
          : (en ? 'This country page has no destination entries yet.' : 'Esta ficha todavía no tiene lugares cargados.');
      }
    },
    {
      name: 'guias',
      keywords: ['guia', 'guias', 'tour', 'tours', 'guide', 'guides'],
      handler: (d, ctx, en, name) => {
        const guides = ctx?.guias || [];
        return guides.length
          ? `<strong>${en ? 'Guides displayed in KAVARI' : 'Guías mostrados en KAVARI'}:</strong><br>${items(guides, g => `<strong>${clean(g.name)}</strong>${g.especialidades?.length ? ` — ${g.especialidades.map(clean).join(', ')}` : ''}${g.price ? ` · $${clean(g.price)}/h` : ''}`)}`
          : (en ? `No guides are listed for ${name} right now.` : `No hay guías listados para ${name} por ahora.`);
      }
    },
    {
      name: 'hospedaje',
      keywords: ['hotel', 'hoteles', 'hospedaje', 'hospedajes', 'alojamiento', 'airbnb', 'stay', 'stays', 'accommodation', 'hostal', 'donde dormir'],
      handler: (d, ctx, en) => {
        const stays = ctx?.hospedajes || [];
        return stays.length
          ? `<strong>${en ? 'Accommodation options shown' : 'Hospedajes mostrados'}:</strong><br>${items(stays, h => `<strong>${clean(h.nombre)}</strong>${h.precio_noche ? ` · $${clean(h.precio_noche)} ${clean(h.moneda || 'USD')}/noche` : ''}`)}`
          : (en ? 'No accommodation options are loaded for this page.' : 'No hay hospedajes cargados en esta ficha.');
      }
    },
    {
      name: 'vuelos',
      keywords: ['vuelo', 'vuelos', 'aerolinea', 'aerolineas', 'avion', 'flight', 'flights', 'airline', 'airlines', 'boleto', 'tiquete'],
      handler: (d, ctx, en) => {
        const airlines = ctx?.aerolineas || [];
        return airlines.length
          ? `<strong>${en ? 'Airlines shown' : 'Aerolíneas mostradas'}:</strong><br>${items(airlines, a => `<strong>${clean(a.nombre)}</strong>${a.precio_desde ? ` · ${en ? 'from' : 'desde'} $${clean(a.precio_desde)} ${clean(a.moneda || 'USD')}` : ''}`)}`
          : (en ? 'No airline options are loaded for this page.' : 'No hay aerolíneas cargadas en esta ficha.');
      }
    },
    {
      name: 'cultura',
      keywords: ['cultura', 'historia', 'tradicion', 'tradiciones', 'culture', 'history', 'costumbres'],
      handler: (d, ctx, en, name) => {
        const culture = d.cultura;
        return culture
          ? `<strong>${en ? 'Culture in' : 'Cultura de'} ${name}:</strong><br>${clean(culture.descripcion || '')}`
          : (en ? 'This page has no culture information yet.' : 'Esta ficha aún no tiene información cultural.');
      }
    },
    {
      name: 'aventura',
      keywords: ['aventura', 'actividad', 'actividades', 'senderismo', 'excursion', 'adventure', 'activity', 'activities', 'hiking'],
      handler: (d, ctx, en, name) => {
        const activities = d.aventura?.actividades || [];
        return activities.length
          ? `<strong>${en ? 'Activities in' : 'Actividades en'} ${name}:</strong><br>${items(activities, a => `<strong>${clean(a.nombre)}</strong>${a.descripcion ? ` — ${clean(a.descripcion)}` : ''}`)}`
          : (en ? 'This page has no activity entries yet.' : 'Esta ficha aún no tiene actividades cargadas.');
      }
    },
    {
      name: 'presupuesto',
      keywords: ['presupuesto', 'precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'budget', 'price', 'cost', 'money', 'dinero'],
      handler: (d, ctx, en) => {
        const stays = ctx?.hospedajes || [];
        const airlines = ctx?.aerolineas || [];
        const guides = ctx?.guias || [];
        const bits = [];
        if (stays.length) bits.push(`${en ? 'Stays from' : 'Hospedajes desde'} $${clean(Math.min(...stays.map(s => Number(s.precio_noche) || Infinity)))}`);
        if (airlines.length) bits.push(`${en ? 'Flights from' : 'Vuelos desde'} $${clean(Math.min(...airlines.map(a => Number(a.precio_desde) || Infinity)))}`);
        if (guides.length) bits.push(`${en ? 'Guides from' : 'Guías desde'} $${clean(Math.min(...guides.map(g => Number(g.price) || Infinity)))}/h`);
        return bits.length
          ? `<strong>${en ? 'Rough prices shown in KAVARI' : 'Precios de referencia en KAVARI'}:</strong><br>${bits.join('<br>')}`
          : (en ? 'There is no pricing loaded on this page yet.' : 'Esta ficha aún no tiene precios cargados.');
      }
    },
    {
      name: 'practica',
      keywords: ['moneda', 'idioma local', 'enchufe', 'electricidad', 'sim', 'internet', 'conectividad', 'wifi', 'currency', 'plug', 'electricity', 'connectivity'],
      handler: (d, ctx, en, name) => {
        const cards = d.practica?.info_cards || [];
        return cards.length
          ? `<strong>${en ? 'Practical info for' : 'Info práctica de'} ${name}:</strong><br>${items(cards, c => clean(c.texto))}`
          : (en ? 'This page has no practical info cards yet.' : 'Esta ficha aún no tiene tarjetas de info práctica.');
      }
    }
  ];

  /* ---------- motor de puntuación ---------- */
  function bestIntent(qNorm) {
    let best = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      let score = 0;
      for (const kw of intent.keywords) {
        if (qNorm.includes(kw)) score += kw.split(' ').length; // frases largas pesan más
      }
      if (score > bestScore) { bestScore = score; best = intent; }
    }
    return bestScore > 0 ? best : null;
  }

  /* ---------- respuesta principal (ficha de destino) ---------- */
  window.generateChatResponse = function (q, ctx) {
    const d = ctx?.country || ctx;
    const en = lang();
    if (!d?.nombre) return window.generateGeneralResponse(q);
    const name = clean(d.nombre);
    const qNorm = normalize(q);

    const intent = bestIntent(qNorm);
    if (intent) return intent.handler(d, ctx, en, name);

    // Fallback: sugiere temas disponibles en vez de un mensaje genérico
    const topics = en
      ? ['places', 'food', 'culture', 'activities', 'guides', 'flights', 'stays', 'budget', 'practical info']
      : ['lugares', 'gastronomía', 'cultura', 'actividades', 'guías', 'vuelos', 'hospedajes', 'presupuesto', 'info práctica'];
    return en
      ? `I can only answer from the KAVARI page for <strong>${name}</strong>. Try asking about: ${topics.join(', ')}.`
      : `Solo puedo responder con esta ficha de <strong>${name}</strong>. Prueba preguntando por: ${topics.join(', ')}.`;
  };

  /* ---------- intenciones generales (fuera de una ficha de destino) ---------- */
  const GENERAL_INTENTS = [
    {
      name: 'saludo',
      keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hello', 'hey', 'que tal'],
      handler: en => en
        ? 'Hi! I\'m Kari, the KAVARI assistant. Ask me about destinations, guides, plans, your account, language, theme, contact or how the site works.'
        : '¡Hola! Soy Kari, el asistente de KAVARI. Pregúntame por destinos, guías, planes, tu cuenta, idioma, tema, contacto o cómo funciona el sitio.'
    },
    {
      name: 'gracias',
      keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'thanks', 'thank you', 'great', 'awesome'],
      handler: en => en ? 'You\'re welcome! Anything else I can help with?' : '¡De nada! ¿Algo más en lo que pueda ayudarte?'
    },
    {
      name: 'identidad',
      keywords: ['quien eres', 'eres un bot', 'eres una ia', 'eres humano', 'who are you', 'are you a bot', 'are you ai', 'que eres'],
      handler: en => en
        ? 'I\'m Kari, KAVARI\'s virtual assistant. I answer using the information published on this site — destinations, guides, plans and account help.'
        : 'Soy Kari, el asistente virtual de KAVARI. Respondo con la información publicada en este sitio: destinos, guías, planes y ayuda con tu cuenta.'
    },
    {
      name: 'ayuda',
      keywords: ['ayuda', 'que puedes hacer', 'que sabes', 'capacidades', 'help', 'what can you do', 'en que me ayudas'],
      handler: en => en
        ? 'I can help with: finding destinations, tourist guides, travel plans and pricing, creating or managing your account, and site settings like language or dark mode. Ask me anything about those.'
        : 'Puedo ayudarte con: buscar destinos, guías turísticos, planes de viaje y precios, crear o gestionar tu cuenta, y ajustes del sitio como idioma o modo oscuro. Pregúntame lo que necesites sobre eso.'
    },
    {
      name: 'quees',
      keywords: ['que es kavari', 'como funciona kavari', 'para que sirve kavari', 'what is kavari', 'how does kavari work'],
      handler: en => en
        ? 'KAVARI is a travel platform: browse destinations by country, see culture, food, activities and practical info, find certified local guides, compare flights and stays, and manage everything from your account.'
        : 'KAVARI es una plataforma de viajes: explora destinos por país, mira cultura, gastronomía, actividades e info práctica, encuentra guías locales certificados, compara vuelos y hospedajes, y gestiona todo desde tu cuenta.'
    },
    {
      name: 'destinos',
      keywords: ['destino', 'destinos', 'pais', 'paises', 'buscar destino', 'a donde viajar', 'donde viajar', 'destination', 'destinations', 'country', 'countries', 'where to travel'],
      handler: en => en
        ? 'Open <strong>Destinations</strong> in the navigation to browse countries. Each country page has places, food, culture, activities, guides, flights, stays and practical info.'
        : 'Abre <strong>Destinos</strong> en la navegación para explorar países. Cada ficha de país tiene lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes e info práctica.'
    },
    {
      name: 'guias',
      keywords: ['guia', 'guias', 'tour', 'tours', 'guide', 'guides', 'guia turistico', 'tourist guide'],
      handler: en => en
        ? 'The <strong>Guides</strong> page and every destination page show the certified local guides KAVARI has listed, with their specialties and rates.'
        : 'La página <strong>Guías</strong> y cada ficha de destino muestran los guías locales certificados que KAVARI tiene listados, con sus especialidades y tarifas.'
    },
    {
      name: 'planes',
      keywords: ['plan', 'planes', 'membres', 'membership', 'precio del plan', 'suscripcion', 'pricing', 'subscription', 'tarifas del plan'],
      handler: en => en
        ? 'Open <strong>Plans</strong> in the navigation to compare Traveler, Explorer and Professional Guide. This demo saves your choice on this device.'
        : 'Abre <strong>Planes</strong> en la navegación para comparar Viajero, Explorador y Guía profesional. Esta demo guarda tu elección en este dispositivo.'
    },
    {
      name: 'cuenta',
      keywords: ['cuenta', 'registr', 'login', 'ingresar', 'iniciar sesion', 'crear cuenta', 'join', 'account', 'sign up', 'log in', 'contrasena', 'password'],
      handler: en => en
        ? 'Use <strong>Log in / Join</strong> in the navigation to sign in, register, or continue with Google. Once registered, you can edit your info, travel preferences and settings from your profile.'
        : 'Usa <strong>Ingresar / Unirme</strong> en la navegación para entrar, registrarte o continuar con Google. Ya registrado, puedes editar tu información, preferencias de viaje y configuración desde tu perfil.'
    },
    {
      name: 'idioma_tema',
      keywords: ['idioma', 'language', 'ingles', 'english', 'espanol', 'spanish', 'oscuro', 'tema', 'dark mode', 'modo oscuro', 'modo claro'],
      handler: en => en
        ? 'Use the ES/EN switch and the theme button in the navigation to change language or turn on dark mode. Your choice is saved on this device.'
        : 'Usa el interruptor ES/EN y el botón de tema en la navegación para cambiar el idioma o activar el modo oscuro. Tu elección se guarda en este dispositivo.'
    },
    {
      name: 'contacto',
      keywords: ['contacto', 'soporte', 'ayuda humana', 'hablar con alguien', 'contact', 'support', 'talk to someone', 'reclamo', 'queja'],
      handler: en => en
        ? 'For anything I can\'t solve, open <strong>Contact</strong> in the footer to reach the KAVARI team directly.'
        : 'Para lo que no pueda resolver yo, abre <strong>Contacto</strong> en el pie de página para escribirle directo al equipo de KAVARI.'
    },
    {
      name: 'privacidad',
      keywords: ['privacidad', 'datos personales', 'seguridad de mis datos', 'privacy', 'my data', 'data security'],
      handler: en => en
        ? 'Your account data is stored securely and only used to personalize your KAVARI experience. Check the Privacy Policy linked at registration for details.'
        : 'Los datos de tu cuenta se guardan de forma segura y solo se usan para personalizar tu experiencia en KAVARI. Revisa la Política de Privacidad enlazada en el registro para más detalles.'
    },
    {
      name: 'presupuesto_general',
      keywords: ['presupuesto', 'precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'cuanto vale', 'budget', 'price', 'cost', 'how much does it cost', 'how much is'],
      handler: en => en
        ? 'Prices depend on the destination. Open a country page and ask me there — I\'ll pull the flights, stays and guide rates loaded for that page.'
        : 'Los precios dependen del destino. Abre la ficha de un país y pregúntame ahí — te muestro los vuelos, hospedajes y tarifas de guías cargados en esa ficha.'
    },
    {
      name: 'clima_general',
      keywords: ['clima', 'temporada', 'epoca', 'weather', 'season', 'best time to visit'],
      handler: en => en
        ? 'Weather and seasons are shown per destination. Open a country page and ask me about its seasons there.'
        : 'El clima y las temporadas se muestran por destino. Abre la ficha de un país y pregúntame por sus temporadas ahí.'
    }
  ];

  function bestGeneralIntent(qNorm) {
    let best = null;
    let bestScore = 0;
    for (const intent of GENERAL_INTENTS) {
      let score = 0;
      for (const kw of intent.keywords) {
        if (qNorm.includes(normalize(kw))) score += kw.split(' ').length;
      }
      if (score > bestScore) { bestScore = score; best = intent; }
    }
    return bestScore > 0 ? best : null;
  }

  /* ---------- respuesta general (fuera de una ficha de destino) ---------- */
  window.generateGeneralResponse = function (q) {
    const en = lang();
    const qNorm = normalize(q);

    const intent = bestGeneralIntent(qNorm);
    if (intent) return intent.handler(en);

    const topics = en
      ? ['destinations', 'guides', 'plans', 'your account', 'language/theme', 'contact']
      : ['destinos', 'guías', 'planes', 'tu cuenta', 'idioma/tema', 'contacto'];
    return en
      ? `I answer only about KAVARI. Try asking about: ${topics.join(', ')}.`
      : `Respondo solo sobre KAVARI. Prueba preguntando por: ${topics.join(', ')}.`;
  };
})();