/* ══════════════════════════════════════════════════════════════════
   CEREBRO DEL CHATBOT DE KAVARI — v3
   Responde SOLO con contenido visible en la ficha (ctx); no inventa
   datos externos. Esta versión mejora la detección de intención:
     - normaliza texto (tildes, mayúsculas, signos)
     - puntúa TODAS las intenciones y elige la de mayor coincidencia
       (en vez de "la primera que matchea gana")
     - agrega sinónimos, plurales y mezcla ES/EN/PT/FR
     - suma intenciones nuevas: saludo, gracias, ayuda, presupuesto,
       transporte, seguridad, conectividad, propinas
     - el fallback ahora sugiere temas disponibles en vez de un
       mensaje genérico
   ══════════════════════════════════════════════════════════════════ */
(function () {

  /* ---------- utilidades ---------- */
  const clean = value => String(value || '').replace(/[<>]/g, '');
  const lang = () => (localStorage.getItem('kavari-idioma') || localStorage.getItem('kavariIdioma') || 'es');
  const tr = (es, en, pt, fr) => {
    const l = lang();
    if (l === 'en') return en;
    if (l === 'pt') return pt;
    if (l === 'fr') return fr !== undefined ? fr : en;
    return es;
  };

  // quita tildes, pasa a minúsculas y colapsa espacios
  const normalize = str => String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const items = (list, mapper) => list.slice(0, 3).map(mapper).join('<br>');
  const noche = () => {
    const l = lang();
    if (l === 'pt') return '/noite';
    if (l === 'en') return '/night';
    if (l === 'fr') return '/nuit';
    return '/noche';
  };

  /* ---------- diccionario de intenciones ---------- */
  // cada intención tiene una lista de palabras clave (ya normalizadas)
  // y una función que arma la respuesta con datos de ctx.
  const INTENTS = [
    {
      name: 'saludo',
      keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hello', 'hey', 'que tal', 'ola', 'oi', 'e ai', 'tudo bem'],
      handler: (d, ctx, en, name) => tr(
        `¡Hola! Soy el asistente de KAVARI${name ? ` para ${name}` : ''}. Pregúntame por lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes o info práctica.`,
        `Hi! I'm the KAVARI assistant${name ? ` for ${name}` : ''}. Ask me about places, food, culture, activities, guides, flights, stays or practical info.`,
        `Olá! Sou o assistente da KAVARI${name ? ` para ${name}` : ''}. Pergunte-me sobre lugares, gastronomia, cultura, atividades, guias, voos, hospedagens ou informações práticas.`,
        `Bonjour ! Je suis l'assistant KAVARI${name ? ` pour ${name}` : ''}. Demandez-moi des lieux, la gastronomie, la culture, les activités, les guides, les vols, les hébergements ou les infos pratiques.`
      )
    },
    {
      name: 'gracias',
      keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'thanks', 'thank you', 'great', 'awesome', 'obrigado', 'obrigada', 'valeu', 'otimo', 'ótimo'],
      handler: (d, ctx, en) => tr(
        '¡De nada! ¿Algo más sobre tu viaje?',
        'You\'re welcome! Anything else about your trip?',
        'De nada! Mais alguma coisa sobre a sua viagem?'
      )
    },
    {
      name: 'ayuda',
      keywords: ['ayuda', 'que puedes hacer', 'que sabes', 'capacidades', 'help', 'what can you do', 'ajuda', 'o que voce faz', 'o que voce sabe'],
      handler: (d, ctx, en, name) => tr(
        `Puedo responder sobre ${name || 'este destino'}: lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes, presupuesto, transporte, seguridad, conectividad e info práctica.`,
        `I can answer about ${name || 'this destination'}: places, food, culture, activities, guides, flights, accommodation, budget, transport, safety, connectivity and practical info.`,
        `Posso responder sobre ${name || 'este destino'}: lugares, gastronomia, cultura, atividades, guias, voos, hospedagens, orçamento, transporte, segurança, conectividade e informações práticas.`
      )
    },
    {
      name: 'visa',
      keywords: ['visa', 'visado', 'pasaporte', 'documento', 'documentos', 'migracion', 'entrar', 'entrada', 'passport', 'document', 'requisitos', 'visto', 'passaporte', 'migracao'],
      handler: (d, ctx, en, name) => {
        const card = d.practica?.info_cards?.find(x => x.icono === 'visa');
        return card
          ? `<strong>${tr('Información en KAVARI', 'Information in KAVARI', 'Informações na KAVARI')}:</strong><br>${clean(card.texto)}`
          : tr(
            `KAVARI no tiene requisitos de entrada para ${name}. Consulta una fuente consular oficial.`,
            `KAVARI does not have entry-requirement data for ${name}. Check an official consular source.`,
            `A KAVARI não possui dados de requisitos de entrada para ${name}. Consulte uma fonte consular oficial.`
          );
      }
    },
    {
      name: 'clima',
      keywords: ['clima', 'temporada', 'temporadas', 'epoca', 'lluvia', 'lluvias', 'calor', 'frio', 'weather', 'season', 'seasons', 'rain', 'melhor epoca', 'temperatura', 'chuva'],
      handler: (d, ctx, en, name) => {
        const seasons = d.practica?.temporadas || [];
        return seasons.length
          ? `<strong>${tr(`Temporadas disponibles para ${name}`, `Seasons shown for ${name}`, `Temporadas disponíveis para ${name}`)}:</strong><br>${items(seasons, s => `<strong>${clean(s.nombre)}</strong> (${clean(s.meses)}): ${clean(s.descripcion)}`)}`
          : tr(
            'Esta ficha no tiene temporadas cargadas. Abre “Info práctica” para ver los datos disponibles.',
            'There are no seasonal details in this KAVARI page. Open “Practical info” for available data.',
            'Esta ficha não possui temporadas carregadas. Abra “Informações práticas” para ver os dados disponíveis.'
          );
      }
    },
    {
      name: 'gastronomia',
      keywords: ['comida', 'comer', 'plato', 'platos', 'gastronomia', 'restaurante', 'restaurantes', 'food', 'dish', 'restaurant', 'eat', 'prato', 'pratos'],
      handler: (d, ctx, en, name) => {
        const dishes = d.gastronomia?.platos || [];
        return dishes.length
          ? `<strong>${tr(`Gastronomía de ${name}`, `Food listed for ${name}`, `Gastronomia de ${name}`)}:</strong><br>${items(dishes, p => `<strong>${clean(p.nombre)}</strong>${p.descripcion ? ` — ${clean(p.descripcion)}` : ''}`)}`
          : tr(
            'Esta ficha todavía no tiene platos cargados.',
            'This country page has no food entries yet.',
            'Esta página ainda não possui pratos carregados.'
          );
      }
    },
    {
      name: 'lugares',
      keywords: ['lugares', 'lugar', 'destino', 'destinos', 'visitar', 'imperdible', 'imperdibles', 'places', 'place', 'visit', 'sightseeing', 'lugar', 'lugares', 'imperdivel'],
      handler: (d, ctx, en, name) => {
        const places = d.destinos || [];
        return places.length
          ? `<strong>${tr(`Lugares en ${name}`, `Places in ${name}`, `Lugares em ${name}`)}:</strong><br>${items(places, p => `<strong>${clean(p.nombre)}</strong>${p.tag ? ` — ${clean(p.tag)}` : ''}`)}`
          : tr(
            'Esta ficha todavía no tiene lugares cargados.',
            'This country page has no destination entries yet.',
            'Esta página ainda não possui lugares carregados.'
          );
      }
    },
    {
      name: 'guias',
      keywords: ['guia', 'guias', 'tour', 'tours', 'guide', 'guides', 'guia turistico'],
      handler: (d, ctx, en, name) => {
        const guides = ctx?.guias || [];
        return guides.length
          ? `<strong>${tr('Guías mostrados en KAVARI', 'Guides displayed in KAVARI', 'Guias exibidos na KAVARI')}:</strong><br>${items(guides, g => `<strong>${clean(g.name)}</strong>${g.especialidades?.length ? ` — ${g.especialidades.map(clean).join(', ')}` : ''}${g.price ? ` · $${clean(g.price)}/h` : ''}`)}`
          : tr(
            `No hay guías listados para ${name} por ahora.`,
            `No guides are listed for ${name} right now.`,
            `Não há guias listados para ${name} no momento.`
          );
      }
    },
    {
      name: 'hospedaje',
      keywords: ['hotel', 'hoteles', 'hospedaje', 'hospedajes', 'alojamiento', 'airbnb', 'stay', 'stays', 'accommodation', 'hostal', 'donde dormir', 'hotel', 'hoteis', 'onde dormir', 'hospedar', 'hospedagem', 'hospedagens', 'onde ficar'],
      handler: (d, ctx, en) => {
        const stays = ctx?.hospedajes || [];
        return stays.length
          ? `<strong>${tr('Hospedajes mostrados', 'Accommodation options shown', 'Hospedagens exibidas')}:</strong><br>${items(stays, h => `<strong>${clean(h.nombre)}</strong>${h.precio_noche ? ` · $${clean(h.precio_noche)} ${clean(h.moneda || 'USD')}${noche()}` : ''}`)}`
          : tr(
            'No hay hospedajes cargados en esta ficha.',
            'No accommodation options are loaded for this page.',
            'Não há hospedagens carregadas nesta página.'
          );
      }
    },
    {
      name: 'vuelos',
      keywords: ['vuelo', 'vuelos', 'aerolinea', 'aerolineas', 'avion', 'flight', 'flights', 'airline', 'airlines', 'boleto', 'tiquete', 'voo', 'voos', 'companhia aerea', 'aeroporto'],
      handler: (d, ctx, en) => {
        const airlines = ctx?.aerolineas || [];
        return airlines.length
          ? `<strong>${tr('Aerolíneas mostradas', 'Airlines shown', 'Companhias aéreas exibidas')}:</strong><br>${items(airlines, a => `<strong>${clean(a.nombre)}</strong>${a.precio_desde ? ` · ${tr('desde', 'from', 'a partir de')} $${clean(a.precio_desde)} ${clean(a.moneda || 'USD')}` : ''}`)}`
          : tr(
            'No hay aerolíneas cargadas en esta ficha.',
            'No airline options are loaded for this page.',
            'Não há companhias aéreas carregadas nesta página.'
          );
      }
    },
    {
      name: 'cultura',
      keywords: ['cultura', 'historia', 'tradicion', 'tradiciones', 'culture', 'history', 'costumbres', 'tradicao'],
      handler: (d, ctx, en, name) => {
        const culture = d.cultura;
        return culture
          ? `<strong>${tr(`Cultura de ${name}`, `Culture in ${name}`, `Cultura de ${name}`)}:</strong><br>${clean(culture.descripcion || '')}`
          : tr(
            'Esta ficha aún no tiene información cultural.',
            'This page has no culture information yet.',
            'Esta página ainda não possui informações culturais.'
          );
      }
    },
    {
      name: 'aventura',
      keywords: ['aventura', 'actividad', 'actividades', 'senderismo', 'excursion', 'adventure', 'activity', 'activities', 'hiking', 'trilha', 'trilhas'],
      handler: (d, ctx, en, name) => {
        const activities = d.aventura?.actividades || [];
        return activities.length
          ? `<strong>${tr(`Actividades en ${name}`, `Activities in ${name}`, `Atividades em ${name}`)}:</strong><br>${items(activities, a => `<strong>${clean(a.nombre)}</strong>${a.descripcion ? ` — ${clean(a.descripcion)}` : ''}`)}`
          : tr(
            'Esta ficha aún no tiene actividades cargadas.',
            'This page has no activity entries yet.',
            'Esta página ainda não possui atividades carregadas.'
          );
      }
    },
    {
      name: 'presupuesto',
      keywords: ['presupuesto', 'precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'budget', 'price', 'cost', 'money', 'dinero', 'orcamento', 'quanto custa', 'custo'],
      handler: (d, ctx, en) => {
        const stays = ctx?.hospedajes || [];
        const airlines = ctx?.aerolineas || [];
        const guides = ctx?.guias || [];
        const bits = [];
        if (stays.length) bits.push(`${tr('Hospedajes desde', 'Stays from', 'Hospedagens a partir de')} $${clean(Math.min(...stays.map(s => Number(s.precio_noche) || Infinity)))}`);
        if (airlines.length) bits.push(`${tr('Vuelos desde', 'Flights from', 'Voos a partir de')} $${clean(Math.min(...airlines.map(a => Number(a.precio_desde) || Infinity)))}`);
        if (guides.length) bits.push(`${tr('Guías desde', 'Guides from', 'Guias a partir de')} $${clean(Math.min(...guides.map(g => Number(g.price) || Infinity)))}/h`);
        return bits.length
          ? `<strong>${tr('Precios de referencia en KAVARI', 'Rough prices shown in KAVARI', 'Preços de referência na KAVARI')}:</strong><br>${bits.join('<br>')}`
          : tr(
            'Esta ficha aún no tiene precios cargados.',
            'There is no pricing loaded on this page yet.',
            'Esta página ainda não possui preços carregados.'
          );
      }
    },
    {
      name: 'practica',
      keywords: ['moneda', 'idioma local', 'enchufe', 'electricidad', 'sim', 'internet', 'conectividad', 'wifi', 'currency', 'plug', 'electricity', 'connectivity', 'moeda', 'tomada', 'conectividade'],
      handler: (d, ctx, en, name) => {
        const cards = d.practica?.info_cards || [];
        return cards.length
          ? `<strong>${tr(`Info práctica de ${name}`, `Practical info for ${name}`, `Informações práticas de ${name}`)}:</strong><br>${items(cards, c => clean(c.texto))}`
          : tr(
            'Esta ficha aún no tiene tarjetas de info práctica.',
            'This page has no practical info cards yet.',
            'Esta página ainda não possui cartões de informações práticas.'
          );
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
    const en = lang() === 'en';
    if (!d?.nombre) return window.generateGeneralResponse(q);
    const name = clean(window.paisNombre && d.code ? (window.paisNombre(d.code, d.nombre) || d.nombre) : d.nombre);
    const qNorm = normalize(q);

    const intent = bestIntent(qNorm);
    if (intent) return intent.handler(d, ctx, en, name);

    // Fallback: sugiere temas disponibles en vez de un mensaje genérico
    const topics = tr(
      ['lugares', 'gastronomía', 'cultura', 'actividades', 'guías', 'vuelos', 'hospedajes', 'presupuesto', 'info práctica'],
      ['places', 'food', 'culture', 'activities', 'guides', 'flights', 'stays', 'budget', 'practical info'],
      ['lugares', 'gastronomia', 'cultura', 'atividades', 'guias', 'voos', 'hospedagens', 'orçamento', 'informações práticas']
    );
    return tr(
      `Solo puedo responder con esta ficha de <strong>${name}</strong>. Prueba preguntando por: ${topics.join(', ')}.`,
      `I can only answer from the KAVARI page for <strong>${name}</strong>. Try asking about: ${topics.join(', ')}.`,
      `Só posso responder com esta página de <strong>${name}</strong>. Tente perguntar sobre: ${topics.join(', ')}.`,
      `Je ne peux répondre qu'avec la fiche de <strong>${name}</strong>. Essayez de demander : ${topics.join(', ')}.`
    );
  };

  /* ---------- intenciones generales (fuera de una ficha de destino) ---------- */
  const GENERAL_INTENTS = [
    {
      name: 'saludo',
      keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hello', 'hey', 'que tal', 'ola', 'oi', 'tudo bem'],
      handler: en => tr(
        '¡Hola! Soy Kari, el asistente de KAVARI. Pregúntame por destinos, guías, planes, tu cuenta, idioma, tema, contacto o cómo funciona el sitio.',
        'Hi! I\'m Kari, the KAVARI assistant. Ask me about destinations, guides, plans, your account, language, theme, contact or how the site works.',
        'Olá! Sou a Kari, a assistente da KAVARI. Pergunte-me sobre destinos, guias, planos, sua conta, idioma, tema, contato ou como o site funciona.'
      )
    },
    {
      name: 'gracias',
      keywords: ['gracias', 'genial', 'perfecto', 'excelente', 'thanks', 'thank you', 'great', 'awesome', 'obrigado', 'obrigada', 'valeu'],
      handler: en => tr(
        '¡De nada! ¿Algo más en lo que pueda ayudarte?',
        'You\'re welcome! Anything else I can help with?',
        'De nada! Mais alguma coisa em que possa ajudá-lo?'
      )
    },
    {
      name: 'identidad',
      keywords: ['quien eres', 'eres un bot', 'eres una ia', 'eres humano', 'who are you', 'are you a bot', 'are you ai', 'que eres', 'quem e voce', 'voce e um bot', 'voce e ia'],
      handler: en => tr(
        'Soy Kari, el asistente virtual de KAVARI. Respondo con la información publicada en este sitio: destinos, guías, planes y ayuda con tu cuenta.',
        'I\'m Kari, KAVARI\'s virtual assistant. I answer using the information published on this site — destinations, guides, plans and account help.',
        'Sou a Kari, a assistente virtual da KAVARI. Respondo com as informações publicadas neste site: destinos, guias, planos e ajuda com a sua conta.'
      )
    },
    {
      name: 'ayuda',
      keywords: ['ayuda', 'que puedes hacer', 'que sabes', 'capacidades', 'help', 'what can you do', 'en que me ayudas', 'ajuda', 'o que voce faz'],
      handler: en => tr(
        'Puedo ayudarte con: buscar destinos, guías turísticos, planes de viaje y precios, crear o gestionar tu cuenta, y ajustes del sitio como idioma o modo oscuro. Pregúntame lo que necesites sobre eso.',
        'I can help with: finding destinations, tourist guides, travel plans and pricing, creating or managing your account, and site settings like language or dark mode. Ask me anything about those.',
        'Posso ajudá-lo com: encontrar destinos, guias turísticos, planos de viagem e preços, criar ou gerenciar sua conta, e ajustes do site como idioma ou modo escuro. Pergunte-me o que precisar sobre isso.'
      )
    },
    {
      name: 'quees',
      keywords: ['que es kavari', 'como funciona kavari', 'para que sirve kavari', 'what is kavari', 'how does kavari work', 'o que e kavari', 'como funciona kavari', 'para que serve kavari'],
      handler: en => tr(
        'KAVARI es una plataforma de viajes: explora destinos por país, mira cultura, gastronomía, actividades e info práctica, encuentra guías locales certificados, compara vuelos y hospedajes, y gestiona todo desde tu cuenta.',
        'KAVARI is a travel platform: browse destinations by country, see culture, food, activities and practical info, find certified local guides, compare flights and stays, and manage everything from your account.',
        'A KAVARI é uma plataforma de viagens: explore destinos por país, veja cultura, gastronomia, atividades e informações práticas, encontre guias locais certificados, compare voos e hospedagens, e gerencie tudo pela sua conta.'
      )
    },
    {
      name: 'destinos',
      keywords: ['destino', 'destinos', 'pais', 'paises', 'buscar destino', 'a donde viajar', 'donde viajar', 'destination', 'destinations', 'country', 'countries', 'where to travel', 'onde viajar', 'para onde viajar'],
      handler: en => tr(
        'Abre <strong>Destinos</strong> en la navegación para explorar países. Cada ficha de país tiene lugares, gastronomía, cultura, actividades, guías, vuelos, hospedajes e info práctica.',
        'Open <strong>Destinations</strong> in the navigation to browse countries. Each country page has places, food, culture, activities, guides, flights, stays and practical info.',
        'Abra <strong>Destinos</strong> na navegação para explorar países. Cada página de país tem lugares, gastronomia, cultura, atividades, guias, voos, hospedagens e informações práticas.'
      )
    },
    {
      name: 'guias',
      keywords: ['guia', 'guias', 'tour', 'tours', 'guide', 'guides', 'guia turistico', 'tourist guide'],
      handler: en => tr(
        'La página <strong>Guías</strong> y cada ficha de destino muestran los guías locales certificados que KAVARI tiene listados, con sus especialidades y tarifas.',
        'The <strong>Guides</strong> page and every destination page show the certified local guides KAVARI has listed, with their specialties and rates.',
        'A página <strong>Guias</strong> e cada página de destino mostram os guias locais certificados listados pela KAVARI, com suas especialidades e tarifas.'
      )
    },
    {
      name: 'planes',
      keywords: ['plan', 'planes', 'membres', 'membership', 'precio del plan', 'suscripcion', 'pricing', 'subscription', 'tarifas del plan', 'plano', 'planos', 'assinatura', 'precos dos planos'],
      handler: en => tr(
        'Abre <strong>Planes</strong> en la navegación para comparar Viajero, Explorador y Guía profesional. Esta demo guarda tu elección en este dispositivo.',
        'Open <strong>Plans</strong> in the navigation to compare Traveler, Explorer and Professional Guide. This demo saves your choice on this device.',
        'Abra <strong>Planos</strong> na navegação para comparar Viajante, Explorador e Guia profissional. Esta demo salva sua escolha neste dispositivo.'
      )
    },
    {
      name: 'cuenta',
      keywords: ['cuenta', 'registr', 'login', 'ingresar', 'iniciar sesion', 'crear cuenta', 'join', 'account', 'sign up', 'log in', 'contrasena', 'password', 'conta', 'cadastro', 'cadastrar', 'entrar', 'senha'],
      handler: en => tr(
        'Usa <strong>Ingresar / Unirme</strong> en la navegación para entrar, registrarte o continuar con Google. Ya registrado, puedes editar tu información, preferencias de viaje y configuración desde tu perfil.',
        'Use <strong>Log in / Join</strong> in the navigation to sign in, register, or continue with Google. Once registered, you can edit your info, travel preferences and settings from your profile.',
        'Use <strong>Entrar / Cadastrar-se</strong> na navegação para entrar, se registrar ou continuar com o Google. Depois de registrado, você pode editar suas informações, preferências de viagem e configurações no seu perfil.'
      )
    },
    {
      name: 'idioma_tema',
      keywords: ['idioma', 'language', 'ingles', 'english', 'espanol', 'spanish', 'oscuro', 'tema', 'dark mode', 'modo oscuro', 'modo claro', 'portugues', 'modo escuro'],
      handler: en => tr(
        'Usa el menú de idiomas (ES/EN/PT/FR) y el botón de tema en la navegación para cambiar el idioma o activar el modo oscuro. Tu elección se guarda en este dispositivo.',
        'Use the language menu (ES/EN/PT/FR) and the theme button in the navigation to change language or turn on dark mode. Your choice is saved on this device.',
        'Use o menu de idiomas (ES/EN/PT/FR) e o botão de tema na navegação para mudar o idioma ou ativar o modo escuro. Sua escolha fica salva neste dispositivo.',
        'Utilisez le menu des langues (ES/EN/PT/FR) et le bouton de thème dans la navigation pour changer de langue ou activer le mode sombre. Votre choix est enregistré sur cet appareil.'
      )
    },
    {
      name: 'contacto',
      keywords: ['contacto', 'soporte', 'ayuda humana', 'hablar con alguien', 'contact', 'support', 'talk to someone', 'reclamo', 'queja', 'contato', 'suporte', 'falar com alguem'],
      handler: en => tr(
        'Para lo que no pueda resolver yo, abre <strong>Contacto</strong> en el pie de página para escribirle directo al equipo de KAVARI.',
        'For anything I can\'t solve, open <strong>Contact</strong> in the footer to reach the KAVARI team directly.',
        'Para o que eu não conseguir resolver, abra <strong>Contato</strong> no rodapé para falar diretamente com a equipe da KAVARI.'
      )
    },
    {
      name: 'privacidad',
      keywords: ['privacidad', 'datos personales', 'seguridad de mis datos', 'privacy', 'my data', 'data security', 'privacidade', 'dados pessoais'],
      handler: en => tr(
        'Los datos de tu cuenta se guardan de forma segura y solo se usan para personalizar tu experiencia en KAVARI. Revisa la Política de Privacidad enlazada en el registro para más detalles.',
        'Your account data is stored securely and only used to personalize your KAVARI experience. Check the Privacy Policy linked at registration for details.',
        'Os dados da sua conta são armazenados com segurança e usados apenas para personalizar sua experiência na KAVARI. Consulte a Política de Privacidade vinculada no cadastro para mais detalhes.'
      )
    },
    {
      name: 'presupuesto_general',
      keywords: ['presupuesto', 'precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'cuanto vale', 'budget', 'price', 'cost', 'how much does it cost', 'how much is', 'quanto custa', 'orcamento', 'preco'],
      handler: en => tr(
        'Los precios dependen del destino. Abre la ficha de un país y pregúntame ahí — te muestro los vuelos, hospedajes y tarifas de guías cargados en esa ficha.',
        'Prices depend on the destination. Open a country page and ask me there — I\'ll pull the flights, stays and guide rates loaded for that page.',
        'Os preços dependem do destino. Abra a página de um país e pergunte-me lá — mostro os voos, hospedagens e tarifas de guias carregados naquela página.'
      )
    },
    {
      name: 'clima_general',
      keywords: ['clima', 'temporada', 'epoca', 'weather', 'season', 'best time to visit', 'melhor epoca para visitar', 'temporada'],
      handler: en => tr(
        'El clima y las temporadas se muestran por destino. Abre la ficha de un país y pregúntame por sus temporadas ahí.',
        'Weather and seasons are shown per destination. Open a country page and ask me about its seasons there.',
        'O clima e as temporadas são exibidos por destino. Abra a página de um país e pergunte-me sobre as temporadas dele ali.'
      )
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
    const en = lang() === 'en';
    const qNorm = normalize(q);

    const intent = bestGeneralIntent(qNorm);
    if (intent) return intent.handler(en);

    const topics = tr(
      ['destinos', 'guías', 'planes', 'tu cuenta', 'idioma/tema', 'contacto'],
      ['destinations', 'guides', 'plans', 'your account', 'language/theme', 'contact'],
      ['destinos', 'guias', 'planos', 'sua conta', 'idioma/tema', 'contato']
    );
    return tr(
      `Respondo solo sobre KAVARI. Prueba preguntando por: ${topics.join(', ')}.`,
      `I answer only about KAVARI. Try asking about: ${topics.join(', ')}.`,
      `Respondo apenas sobre a KAVARI. Tente perguntar sobre: ${topics.join(', ')}.`,
      `Je ne réponds qu'à propos de KAVARI. Essayez de demander : ${topics.join(', ')}.`
    );
  };
})();
