// Fragmento 1: mapa explicito de gaps (185 claves) -> frances
const GAPS = {
  "footerLinkDestinos": "Destinations",
  "footerLinkContacto": "Contact",
  "navDestinos": "Destinations",
  "contacto": "Contact",
  "ayudaAtajoIA": "Demander à l'assistant",
  "navCultura": "Culture",
  "navDestinos2": "Destinations",
  "paisesContinenteEuropa": "Europe",
  "aboutComunicacion": "Communication",
  "aboutDiseno": "Conception",
  "ayudaAtajosTitulo": "Accès rapide",
  "ayudaAtajoDestinos": "Explorer les destinations",
  "faq3q": "Les prix affichés sont-ils définitifs ?",
  "faq4q": "Quelles informations pratiques puis-je trouver sur chaque pays ?",
  "faq5q": "Comment fonctionne l'assistant IA de KAVARI ?",
  "faq6q": "Comment m'inscrire comme guide touristique sur KAVARI ?",
  "faq8q": "Dans quels pays puis-je m'inscrire comme guide ?",
  "faq9q": "Quels moyens de paiement KAVARI accepte-t-il ?",
  "faq11q": "Comment activer le mode sombre ?",
  "faq12q": "Comment fonctionne le tutoriel de la plateforme ?",
  "faq13q": "Que comprend un forfait de voyage KAVARI ?",
  "faq14q": "Puis-je réserver directement depuis KAVARI ?",
  "ayudaCTATitulo": "Vous n'avez pas trouvé ce que vous cherchiez ?",
  "ayudaCTAContacto": "Contacter le support",
  "tituloContacto": "Contact — KAVARI",
  "contactoTitulo": "Contact",
  "contactoFloatTitulo": "Nous sommes là pour vous aider",
  "contactoGuiasCert": "Guides touristiques certifiés",
  "contactoTips": "Conseils et astuces de voyage",
  "contactoNoticias": "Nouveautés et mises à jour",
  "contactoSede": "Notre siège",
  "contactoUbicacion": "Emplacement",
  "contactoUbicacionVal": "Centro Supérate David, Chiriquí, Panama",
  "contactoProyecto": "Projet",
  "contactoEquipoLabel": "Équipe KAVARI",
  "contactoFormTitulo": "Formulaire de contact",
  "contactoFormEncabezado": "Envoyez-nous un message",
  "contactoNombreLabel": "Nom complet",
  "contactoNombrePlaceholder": "Votre nom",
  "contactoAsuntoLabel": "Sujet",
  "contactoMensajeLabel": "Message",
  "contactoMensajePlaceholder": "Écrivez votre message ici…",
  "contactoEnviar": "Envoyer le message",
  "contactoVolver": "Retour à l'accueil",
  "tituloCuenta": "Mon compte · KAVARI",
  "cuentaTitulo": "Votre prochaine aventure commence ici.",
  "cuentaP1": "Forfait local et préférences",
  "cuentaP2": "Accès direct à vos forfaits",
  "cuentaP3": "Aucun paiement dans cette démo",
  "tituloDestino": "Destination — KAVARI Travel",
  "seleccionarPais": "Pays",
  "buscarPais": "Rechercher un pays…",
  "heroSubtitulo": "avec KAVARI",
  "scrollDesplazar": "Défiler",
  "quoteInicio": "Voyager est le seul investissement qui vous rend plus riche.",
  "lugaresDesc": "Découvrez les lieux qui définissent chaque coin du monde.",
  "aventuraTag": "Nature · Adrénaline",
  "guiasTituloHeader": "Guides touristiques",
  "guiasDescHeader": "Connectez-vous avec des experts locaux certifiés qui connaissent chaque coin de la destination.",
  "modalCerrar": "Fermer",
  "verEnGoogleMaps": "Voir sur Google Maps",
  "tituloIndex": "KAVARI Travel — Découvrez le monde",
  "heroDescripcion": "Vivez des expériences inoubliables à travers le monde.",
  "searchTitulo": "Prêt pour votre prochaine aventure ?",
  "searchBoton": "Commencer maintenant",
  "top10Titulo": "Top 10 des lieux les plus visités",
  "paquetesTitulo": "Forfaits de voyage",
  "planCtaTitulo": "Demandez votre forfait de voyage",
  "planCtaNombreLabel": "Nom complet",
  "planCtaEmailLabel": "Adresse e-mail",
  "planCtaEmailPH": "vous@email.com",
  "planCtaTelefonoLabel": "Téléphone",
  "planCtaDestinoLabel": "Destination souhaitée",
  "planCtaDestinoOpc": "Sélectionnez une destination",
  "planCtaFechaLabel": "Date de voyage",
  "planCtaPresupuestoLabel": "Budget estimé par personne (USD)",
  "planCtaPresupuestoOpc": "Sélectionnez une fourchette",
  "planCtaMensajeLabel": "Parlez-nous de votre voyage (facultatif)",
  "planCtaBoton": "Envoyer la demande",
  "tituloPaises": "KAVARI – Explorez 21 destinations en Amérique latine et dans les Caraïbes",
  "paisesEyebrow": "Votre prochaine aventure vous attend",
  "paisesTitulo": "Explorez nos destinations",
  "paisesBuscar": "Recherchez votre destination avec Kavari…",
  "paisesDestinos": "destinations",
  "paisesCargando": "Chargement des destinations...",
  "tituloPerfil": "Mon profil · KAVARI",
  "perfilAuthDesc": "Accédez à votre compte pour gérer vos informations et préférences de voyage.",
  "perfilOtpLink": "Envoyer le code de vérification par e-mail",
  "perfilOtpEmailLabel": "Adresse e-mail",
  "perfilOtpCodeLabel": "Code de vérification",
  "perfilNoCuenta": "Vous n'avez pas de compte ?",
  "perfilCrearCuenta": "Créer un compte",
  "perfilRegistroTitulo": "Créez votre compte KAVARI",
  "perfilYaCuenta": "Vous avez déjà un compte ?",
  "perfilTabInfo": "Informations personnelles",
  "perfilTabViaje": "Préférences de voyage",
  "perfilTabConfig": "Paramètres",
  "perfilFechaNacimiento": "Date de naissance",
  "perfilPaisResidencia": "Pays de résidence",
  "perfilDestinosInteres": "Destinations souhaitées",
  "perfilPresupuesto": "Budget mensuel de voyage",
  "perfilEstiloViaje": "Style de voyage",
  "perfilIdiomasViaje": "Langues que vous parlez",
  "perfilFavoritosDrag": "Faites glisser les cartes pour changer l'ordre",
  "perfilFavoritosSortLabel": "Trier par",
  "perfilFavoritosSortAlpha": "Alphabétique",
  "perfilFavoritosSortRecent": "Le plus récent",
  "perfilFavoritosExplorar": "Explorer les destinations",
  "perfilConfigCuenta": "Compte",
  "perfilConfigEmail": "Adresse e-mail",
  "perfilConfigPlan": "Forfait actuel",
  "perfilConfigPreferencias": "Préférences",
  "perfilConfigIdioma": "Langue",
  "perfilConfigTema": "Mode sombre",
  "perfilConfigZona": "Zone dangereuse",
  "tituloPlanes": "Forfaits · KAVARI",
  "planesTitulo": "Choisissez comment vous voulez<br>voyager avec KAVARI.",
  "planViajeroPrecio": "Gratuit",
  "planViajeroDuracion": "pour toujours",
  "planViajeroDesc": "La façon simple de découvrir le monde avec KAVARI.",
  "planViajeroF1": "21 destinations",
  "planViajeroF3": "Assistant KAVARI",
  "planPremiumBadge": "Le plus choisi",
  "planPremiumDesc": "Pour ceux qui veulent préparer chaque détail de leur prochain voyage.",
  "planPremiumCta": "Choisir Premium",
  "planPremiumF3": "Préférences de voyage enregistrées",
  "planOpCta": "Choisir OP",
  "planOpF1": "Tout dans Premium",
  "planOpF2": "Itinéraires prioritaires",
  "planOpF4": "Support prioritaire",
  "tituloSobrenosotros": "À propos — KAVARI",
  "aboutEyebrow": "À propos",
  "aboutQueEs": "Qu'est-ce que KAVARI ?",
  "aboutStatDestinos": "Destinations",
  "aboutStatEquipo": "Membres",
  "aboutStatFundacion": "Fondation",
  "aboutMisionLabel": "Notre mission",
  "aboutMision": "Mission",
  "aboutVisionLabel": "Notre vision",
  "aboutVision": "Vision",
  "aboutEquipo": "Notre équipe",
  "aboutEquipoDesc": "Les personnes qui rendent KAVARI possible, avec dévouement et esprit d'équipe.",
  "aboutControl": "Contrôle produit",
  "aboutGestion": "Gestion",
  "aboutDesarrollo": "Développement",
  "cargandoGuias": "Chargement des guides…",
  "filtroTodos": "Tous",
  "contactGuide": "Contacter le guide",
  "sinGuias": "Aucun guide disponible pour cette destination",
  "guiaDisponible": "Guide disponible",
  "guiaNoDisponible": "Guide non disponible",
  "contratar": "Embaucher",
  "precioHora": "par heure",
  "aerolineasNoDisponible": "Aucune compagnie aérienne disponible pour cette destination",
  "reservarVuelo": "Réserver un vol",
  "zonaLabel": "Zone",
  "cargandoTiendas": "Chargement des boutiques…",
  "souvenirsTiendasLabel": "boutiques",
  "souvenirsProductosLabel": "produits",
  "destinosDestacadosEn": "Destinations vedettes dans",
  "explorarMas": "Explorer plus",
  "culturaDarkBandTag": "Identité · Tradition",
  "destinosImprescindiblesEn": "Destinations incontournables dans",
  "aventuraDarkBandTag": "Nature · Adrénaline",
  "cuandoViajar": "Quand partir",
  "horarioLabel": "Horaires",
  "consejoLabel": "Conseil",
  "cuentaHola": "Bonjour, {name}",
  "cuentaActiva": "Votre compte est actif sur ce navigateur.",
  "cuentaPasajero": "Passager",
  "cuentaCorreo": "E-mail",
  "cuentaGestionar": "Gérer le forfait →",
  "cuentaUnete": "Rejoindre KAVARI",
  "cuentaInicia": "Se connecter",
  "cuentaCreaDesc": "Créez un compte local pour conserver votre forfait.",
  "cuentaCrearTab": "Créer un compte",
  "cuentaIngresarTab": "Se connecter",
  "ayudaCopiado": "Copié !",
  "ayudaResultados": "questions trouvées",
  "guideRequeridos": "Tous les champs sont obligatoires",
  "guideCorreoInvalido": "Saisissez une adresse e-mail valide",
  "guideAceptaTerminos": "Vous devez accepter les conditions générales",
  "guideProcesando": "Traitement de votre inscription...",
  "guideSubiendoDocs": "Téléchargement des documents...",
  "guideExito": "Inscription réussie ! Nous vous contacterons par e-mail pour activer votre profil."
};

// Fragmento 2: lexico ES->FR (parte A)
const L = {
  "el":"le","la":"la","los":"les","las":"les","lo":"le","le":"lui","les":"eux",
  "un":"un","una":"une","uno":"un","unos":"des","unas":"des","une":"une",
  "este":"ce","esta":"cette","estos":"ces","estas":"ces","ese":"ce","esa":"cette","esos":"ces","esas":"ces","aquel":"ce","aquella":"cette",
  "mi":"mon","mis":"mes","tu":"ton","tus":"tes","su":"son","sus":"leurs","nuestro":"notre","nuestra":"notre","nuestros":"nos","nuestras":"nos","vuestro":"votre","vuestra":"votre",
  "de":"de","a":"à","en":"en","con":"avec","sin":"sans","por":"par","para":"pour","desde":"depuis","hasta":"jusqu'","sobre":"sur","bajo":"sous","entre":"entre","hacia":"vers","tras":"après","durante":"pendant","contra":"contre","según":"selon","hacia":"vers","mediante":"au moyen de",
  "y":"et","o":"ou","pero":"mais","porque":"parce que","que":"que","si":"si","como":"comme","cómo":"comment","cuando":"quand","cuándo":"quand","donde":"où","dónde":"où","cual":"quel","cuál":"quel",
  "es":"est","son":"sont","está":"est","están":"sont","hay":"il y a","tiene":"a","tienen":"ont","tener":"avoir","ser":"être","estar":"être","hacer":"faire","hecho":"fait","poder":"pouvoir","puede":"peut","pueden":"peuvent","debe":"doit","deben":"doivent","deber":"devoir",
  "incluye":"comprend","incluyen":"comprennent","incluido":"inclus","incluida":"incluse","ofrece":"propose","ofrecen":"proposent","ofrecer":"offrir","brinda":"offre","brindan":"offrent","provee":"fournit","proven":"fournissent","da":"donne","dan":"donnent","muestra":"montre","muestran":"montrent","presenta":"présente","presentan":"présentent",
  "permite":"permet","permiten":"permettent","permite":"permet","ayuda":"aide","ayudan":"aident","une":"unit","unen":"unissent","conecta":"connecte","conectan":"connectent","integra":"intègre","integran":"intègrent","contiene":"contient","contienen":"contiennent","abarca":"couvre","abarcan":"couvrent","cubre":"couvre","cubren":"couvrent",
  "rodea":"entoure","rodean":"entourent","rodeado":"entouré","rodeada":"entourée","rodeados":"entourés","rodeadas":"entourées","separa":"sépare","separan":"séparent","divide":"divise","dividen":"divisent","cruza":"traverse","cruzan":"traversent","atraviesa":"traverse","atraviesan":"traversent","pasa":"passe","pasan":"passent","llega":"arrive","llegan":"arrivent","sube":"monte","suben":"montent","baja":"descend","bajan":"descendent",
  "sale":"sort","salen":"sortent","entra":"entre","entran":"entrent","abre":"ouvre","abren":"ouvrent","cierra":"ferme","cierran":"ferment","funciona":"fonctionne","funcionan":"fonctionnent","utiliza":"utilise","utilizan":"utilisent","usa":"utilise","usan":"utilisent","requiere":"demande","requieren":"demandent","necesita":"a besoin","necesitan":"ont besoin","queda":"reste","quedan":"restent",
  "crea":"crée","crean":"créent","desarrolla":"développe","desarrollan":"développent","mejora":"améliore","mejoran":"améliorent","conserva":"conserve","conservan":"conservent","protege":"protège","protegen":"protègent","mantiene":"maintient","mantienen":"maintiennent","combina":"combine","combinan":"combinent","transforma":"transforme","transforman":"transforment","destaca":"met en valeur","destacan":"mettent en valeur",
  "descubre":"découvre","descubrir":"découvrir","descubren":"découvrent","descubierto":"découvert","descubierta":"découverte","visitar":"visiter","visita":"visite","visitan":"visitent","conocer":"connaître","conoce":"connaît","conocen":"connaissent","llama":"appelle","llamado":"appelé","llamada":"appelée","situado":"situé","situada":"située","situados":"situés","situadas":"situées","ubicado":"situé","ubicada":"située","ubicados":"situés","ubicadas":"situées",
  "encuentra":"se trouve","encuentran":"se trouvent","encontrado":"trouvé","encontrada":"trouvée","encontrados":"trouvés","encontradas":"trouvées","formado":"formé","formada":"formée","formados":"formés","formadas":"formées","considerado":"considéré","considerada":"considérée","considerados":"considérés","consideradas":"considérées","famoso":"célèbre","famosa":"célèbre","famosos":"célèbres","famosas":"célèbres","conocido":"connu","conocida":"connue","conocidos":"connus","conocidas":"connues",
  "fundado":"fondé","fundada":"fondée","fundados":"fondés","fundadas":"fondées","declarado":"déclaré","declarada":"déclarée","convertido":"transformé","convertida":"transformée","construido":"construit","construida":"construite","construidos":"construits","construidas":"construites","nacido":"né","nacida":"née","ideal":"idéal",
  "país":"pays","pais":"pays","países":"pays","ciudad":"ville","ciudades":"villes","capital":"capitale","región":"région","regiones":"régions","zona":"zone","zonas":"zones","área":"aire","areas":"aires","territorio":"territoire","territorios":"territoires","provincia":"province","provincias":"provinces","municipio":"commune","isla":"île","islas":"îles",
  "península":"péninsule","costa":"côte","costas":"côtes","playa":"plage","playas":"plages","mar":"mer","océano":"océan","océanos":"océans","golfo":"golfe","bahía":"baie","lago":"lac","lagos":"lacs","río":"fleuve","rios":"fleuves","laguna":"lagune","volcán":"volcan","volcanes":"volcans","montaña":"montagne","montañas":"montagnes","monte":"mont","pico":"pic","picos":"pics","cadena":"chaîne",
  "selva":"forêt","selvas":"forêts","jungla":"jungle","bosque":"forêt","bosques":"forêts","glaciar":"glacier","glaciares":"glaciers","valle":"vallée","valles":"vallées","cañón":"canyon","desierto":"désert","meseta":"plateau","llanura":"plaine","sabana":"savane","pradera":"prairie","campo":"champ","campos":"champs","colina":"colline","cerro":"colline","sierra":"montagne","altiplano":"altiplano","cueva":"grotte","gruta":"grotte",
  "cascada":"cascade","cascadas":"cascades","catarata":"chute","cataratas":"chutes","salto":"chute","saltos":"chutes","manantial":"source","fuente":"source","arrecife":"récif","coral":"corail","manglar":"mangrove","naturaleza":"nature","flora":"flore","fauna":"faune","animal":"animal","animales":"animaux","ave":"oiseau","aves":"oiseaux","pájaro":"oiseau","pez":"poisson","peces":"poissons","tortuga":"tortue","tortugas":"tortues","iguana":"iguane","mariposa":"papillon","insecto":"insecte",
  "planta":"plante","plantas":"plantes","árbol":"arbre","arboles":"arbres","flor":"fleur","flores":"fleurs","fruta":"fruit","frutas":"fruits","palma":"palmier","cactus":"cactus"
};

// Fragmento 3: lexico ES->FR (parte B)
const L3 = {
  "cultura":"culture","tradición":"tradition","tradiciones":"traditions","historia":"histoire","identidad":"identité","patrimonio":"patrimoine","herencia":"héritage","costumbre":"coutume","costumbres":"coutumes","folklore":"folklore","arte":"art","artes":"arts","artesanía":"artisanat","artesano":"artisan","artesanos":"artisans","arquitectura":"architecture","arquitectónico":"architectural","música":"musique","danza":"danse","baile":"danse","fiesta":"fête","fiestas":"fêtes","festival":"festival","festivales":"festivals","celebración":"célébration","ceremonia":"cérémonie","religión":"religion","religioso":"religieux","religiosa":"religieuse","mitología":"mythologie","leyenda":"légende","leyendas":"légendes","cuento":"conte","artista":"artiste","comunidad":"communauté","pueblo":"peuple","pueblos":"peuples","pueblos indígenas":"peuples autochtones","indígena":"autochtone","indígenas":"autochtones","etnia":"ethnie","étnico":"ethnique","lengua":"langue","lenguas":"langues","idioma":"langue","dialecto":"dialecte","vestimenta":"vêtement","traje":"costume","vestido":"robe","textil":"textile","tejido":"tissu","bordado":"broderie","joya":"bijou","joyas":"bijoux","oro":"or","plata":"argent","piedra":"pierre","madera":"bois","barro":"argile","cerámica":"céramique","cestería":"vannerie","máscara":"masque","escultura":"sculpture","pintura":"peinture","calle":"rue","calles":"rues","plaza":"place","mercado":"marché","mercados":"marchés","museo":"musée","museos":"musées","teatro":"théâtre","iglesia":"église","catedral":"cathédrale","templo":"temple","fortaleza":"forteresse","castillo":"château","castillos":"châteaux","mural":"murale","rempar":"rempart","muralla":"rempart",
  "gastronomía":"gastronomie","comida":"nourriture","cocina":"cuisine","plato":"plat","platos":"plats","receta":"recette","recetas":"recettes","ingrediente":"ingrédient","ingredientes":"ingrédients","café":"café","cacao":"cacao","chocolate":"chocolat","azúcar":"sucre","sal":"sel","maíz":"maïs","arroz":"riz","frijol":"haricot","frijoles":"haricots","pan":"pain","queso":"fromage","carne":"viande","pollo":"poulet","pescado":"poisson","pescados":"poissons","marisco":"fruits de mer","mariscos":"fruits de mer","camarón":"crevette","camarones":"crevettes","langosta":"homard","bacalao":"cabillaud","ceviche":"ceviche","tamal":"tamale","empanada":"empanada","arepa":"arepa","tortilla":"tortilla","guiso":"ragoût","sopa":"soupe","ensalada":"salade","verdura":"légume","vegetal":"légume","legumbre":"légume","legumbres":"légumes","tubérculo":"tubercule","papa":"pomme de terre","batata":"patate douce","yuca":"manioc","plátano":"banane plantain","banana":"banane","mango":"mangue","piña":"ananas","limón":"citron","lima":"citron vert","naranja":"orange","cerveza":"bière","vino":"vin","ron":"rhum","agua":"eau","bebida":"boisson","bebidas":"boissons","dulce":"doux","dulces":"doux","postre":"dessert","sabor":"saveur","sabores":"saveurs","condimento":"assaisonnement","especias":"épices","especiado":"épicé","hierba":"herbe","hierva":"herbe",
  "época":"époque","era":"ère","siglo":"siècle","siglos":"siècles","año":"an","años":"ans","década":"décennie","fecha":"date","colonia":"colonie","colonial":"colonial","colonización":"colonisation","independencia":"indépendance","independiente":"indépendant","revolución":"révolution","guerra":"guerre","guerras":"guerres","paz":"paix","rey":"roi","reina":"reine","imperio":"empire","gobierno":"gouvernement","fundación":"fondation","conquista":"conquête","conquistador":"conquérant","civilización":"civilisation","precolombino":"précolombien","prehispánico":"préhispanique","esclavitud":"esclavage","libertad":"liberté","héroe":"héros","heroína":"héroïne","batalla":"bataille","tratado":"traité","república":"république","dictadura":"dictature","presidente":"président","líder":"leader","revolucionario":"révolutionnaire",
  "actividad":"activité","actividades":"activités","aventura":"aventure","turismo":"tourisme","turista":"touriste","turistas":"touristes","viaje":"voyage","viajes":"voyages","viajero":"voyageur","viajeros":"voyageurs","viajar":"voyager","excursión":"excursion","excursiones":"excursions","tour":"tour","tours":"tours","guía":"guide","guías":"guides","guía turístico":"guide touristique","explorar":"explorer","exploración":"exploration","exploración":"exploration","senderismo":"randonnée","caminata":"marche","senderos":"sentiers","sendero":"sentier","ruta":"route","rutas":"routes","caminos":"chemins","camino":"chemin","senda":"sentier","navegación":"navigation","navegar":"naviguer","buceo":"plongée","snorkel":"snorkeling","surf":"surf","pesca":"pêche","observación":"observation","avistamiento":"observation","observar":"observer","fotografía":"photographie","cabalgata":"équitation","caballo":"cheval","ciclismo":"cyclisme","ciclista":"cycliste","kayak":"kayak","rafting":"rafting","parapente":"parapente","alpinismo":"alpinisme","escalada":"escalade","ecoturismo":"écotourisme","visita":"visite","visitas":"visites","recorrido":"parcours","paseo":"promenade","circuito":"circuit",
  "temporada":"saison","temporadas":"saisons","estación":"saison","primavera":"printemps","verano":"été","otoño":"automne","invierno":"hiver","clima":"climat","temperatura":"température","mes":"mois","semana":"semaine","día":"jour","dias":"jours","días":"jours","noche":"nuit","mañana":"matin","tarde":"après-midi"
};

// Fragmento 4: lexico ES->FR (parte C)
const L4 = {
  "hermoso":"magnifique","hermosa":"magnifique","bello":"beau","bella":"belle","bellos":"beaux","bellas":"belles","bonito":"joli","bonita":"jolie","precioso":"magnifique","preciosa":"magnifique","impresionante":"impressionnant","espectacular":"spectaculaire","maravilloso":"merveilleux","maravillosa":"merveilleuse","fascinante":"fascinant","único":"unique","única":"unique","singular":"singulier","especial":"spécial","especiale":"spéciale","típico":"typique","típica":"typique","auténtico":"authentique","auténtica":"authentique","original":"original","colorido":"coloré","colorida":"colorée","vibrante":"vibrant","pintoresco":"pittoresque","pintoresca":"pittoresque","mágico":"magique","mágica":"magique","místico":"mystique","mística":"mystique","sagrado":"sacré","sagrada":"sacrée","sagrados":"sacrés","sagradas":"sacrées","legendario":"légendaire","legendaria":"légendaire","popular":"populaire",
  "ideal":"idéal","perfecto":"parfait","perfecta":"parfaite","excelente":"excellent","mejor":"meilleur","mejores":"meilleurs","mayor":"plus grand","menor":"plus petit","profundo":"profond","profunda":"profonde","alto":"haut","alta":"haute","bajo":"bas","baja":"basse","ancho":"large","estrecho":"étroit","fresco":"frais","fresca":"fraîche","cálido":"chaud","cálida":"chaude","frío":"froid","fría":"froide","templado":"tempéré","templada":"tempérée","seco":"sec","sèche":"sèche","húmedo":"humide","húmeda":"humide","soleado":"ensoleillé","nublado":"nuageux","ventoso":"venteux","lluvioso":"pluvieux","salvaje":"sauvage","pacífico":"paisible","tranquilo":"tranquille","tranquila":"tranquille","bullicioso":"animé","animado":"animé","animada":"animée","vivo":"vif","viva":"vive","muerto":"mort","muerta":"morte",
  "antiguo":"ancien","antigua":"ancienne","colonial":"colonial","moderno":"moderne","moderna":"moderne","clásico":"classique","contemporáneo":"contemporain","rústico":"rustique","elegante":"élégant","lujoso":"luxueux","lujosa":"luxueuse","cómodo":"confortable","accesible":"accessible","fácil":"facile","difícil":"difficile","peligroso":"dangereux","peligrosa":"dangereuse","seguro":"sûr","segura":"sûre","gratuito":"gratuit","gratuita":"gratuite","libre":"libre","abierto":"ouvert","abierta":"ouverte","cerrado":"fermé","cerrada":"fermée","disponible":"disponible","obligatorio":"obligatoire","recomendado":"recommandé","permitido":"autorisé","prohibido":"interdit","importante":"important","principales":"principaux","principal":"principal","natural":"naturel","naturales":"naturels","tropical":"tropical","tradicional":"traditionnel","tradicionales":"traditionnels","nacional":"national","nacionales":"nationaux","internacional":"international","local":"local","autóctono":"autochtone","autóctona":"autochtone","diverso":"divers","diversa":"diverse","variado":"varié","variada":"variée","rico":"riche","rica":"riche","pobre":"pauvre","grande":"grand","gran":"grand","grandes":"grands","pequeño":"petit","pequeña":"petite","pequeños":"petits","pequeñas":"petites","mediano":"moyen","mediana":"moyenne","extenso":"vaste","extensa":"vaste","largo":"long","larga":"longue","corto":"court","corta":"courte","lejos":"loin","cerca":"près","nuevo":"nouveau","nueva":"nouvelle","viejo":"vieux","vieja":"vieille",
  "información":"information","práctica":"pratique","prácticas":"pratiques","servicio":"service","servicios":"services","atención":"accueil","calidad":"qualité","precio":"prix","precios":"prix","presupuesto":"budget","costo":"coût","costos":"coûts","gratis":"gratuit","tarifa":"tarif","tarifas":"tarifs","opción":"option","opciones":"options","detalle":"détail","detalles":"détails","descripción":"description","descripciones":"descriptions","nombre":"nom","nombres":"noms","título":"titre","títulos":"titres","texto":"texte","textos":"textes","etiqueta":"étiquette","etiquetas":"étiquettes","categoría":"catégorie","tipo":"type","tipos":"types","forma":"forme","formas":"formes","parte":"partie","partes":"parties","lugar":"lieu","lugares":"lieux","sitio":"site","sitios":"sites","elemento":"élément","elementos":"éléments","ejemplo":"exemple","ejemplos":"exemples","consejo":"conseil","consejos":"conseils","recomendación":"recommandation","recomendaciones":"recommandations","sugerencia":"suggestion","idea":"idée","ideas":"idées","nota":"note","notas":"notes","dato":"donnée","datos":"données","estadística":"statistique","cifra":"chiffre","número":"numéro","números":"numéros","total":"total","promedio":"moyenne","máximo":"maximum","mínimo":"minimum","medio":"moyen","media":"moyenne","centro":"centre","norte":"nord","sur":"sud","este":"est","oeste":"ouest","orienta":"est","occidente":"ouest","límite":"limite","límites":"limites","frontera":"frontière","fronteras":"frontières","puerto":"port","puertos":"ports","aeropuerto":"aéroport","aeropuertos":"aéroports","terminal":"terminal","estación":"gare","estaciones":"gares","hotel":"hôtel","alojamiento":"hébergement","hospedaje":"hébergement","hostal":"auberge","cabaña":"cabane","cabañas":"cabanes","casa":"maison","casas":"maisons","resort":"complexe","lodge":"lodge","villa":"villa","restaurante":"restaurant","restaurantes":"restaurants","bar":"bar","tienda":"boutique","comercio":"commerce","compra":"achat","compras":"achats","souvenir":"souvenir","producto":"produit","productos":"produits","artesanías":"artisanats",
  "millón":"million","millones":"millions","mil":"mille","dos":"deux","tres":"trois","cuatro":"quatre","cinco":"cinq","seis":"six","siete":"sept","ocho":"huit","nueve":"neuf","diez":"dix","once":"onze","doce":"douze","trece":"treize","catorce":"quatorze","quince":"quinze","veinte":"vingt","treinta":"trente","cuarenta":"quarante","cincuenta":"cinquante","cien":"cent","ciento":"cent","primer":"premier","primera":"première","primero":"premier","segundo":"deuxième","segunda":"deuxième","tercero":"troisième","tercera":"troisième","cuarto":"quatrième","cuarta":"quatrième","quinto":"cinquième","quinta":"cinquième","último":"dernier","última":"dernière",
  "muy":"très","más":"plus","menos":"moins","también":"aussi","bien":"bien","mal":"mal","rápido":"rapide","rápidamente":"rapidement","lento":"lent","lentamente":"lentement","siempre":"toujours","nunca":"jamais","a veces":"parfois","hoy":"aujourd'hui","aquí":"ici","allí":"là","allá":"là","ahora":"maintenant","antes":"avant","después":"après","pronto":"bientôt","tarde":"tard","temprano":"tôt","juntos":"ensemble","solas":"seules","solos":"seuls","casi":"presque","apenas":"à peine","mucho":"beaucoup","mucha":"beaucoup","muchos":"beaucoup","muchas":"beaucoup","poco":"peu","poca":"peu","pocos":"peu","pocas":"peu","bastante":"assez","demasiado":"trop","solo":"seulement","sólo":"seulement","ya":"déjà","todavía":"encore","así":"ainsi","luego":"ensuite","entonces":"alors","además":"en plus","especialmente":"spécialement","particularmente":"particulièrement","principalmente":"principalement","generalmente":"généralement","normalmente":"normalement","actualmente":"actuellement","recientemente":"récemment","antiguamente":"autrefois","tradicionalmente":"traditionnellement","naturalmente":"naturellement","general":"général",
  "pero":"mais","porque":"parce que","cada":"chaque","otro":"autre","otra":"autre","otros":"autres","otras":"autres","mismo":"même","misma":"même","todos":"tous","todas":"toutes","todo":"tout","toda":"toute","ambos":"les deux","varios":"plusieurs","varias":"plusieurs","algunos":"certains","algunas":"certaines","ninguno":"aucun","ninguna":"aucune","cualquier":"n'importe quel","qué":"que","quién":"qui","quien":"qui","cómo":"comment","cuánto":"combien","cuanta":"combien"
};

// Fragmento 5: logica principal
const fs = require('fs');
const BASE = 'C:/Users/usuario/Downloads/Kavari1.4/Kavariwebsite/';

Object.assign(L, L3, L4);

function escDq(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
function cap(s){ if(!s) return s; return s.charAt(0).toUpperCase()+s.slice(1); }
function pluralFr(w){ return w+'s'; }

const PHRASES = [
  ["patrimonio de la humanidad","patrimoine de l'humanité"],
  ["patrimonio mundial","patrimoine mondial"],
  ["patrimonio cultural","patrimoine culturel"],
  ["centro histórico","centre historique"],
  ["casco histórico","centre historique"],
  ["compañía aérea","compagnie aérienne"],
  ["compania aerea","compagnie aérienne"],
  ["parque nacional","parc national"],
  ["sitio arqueológico","site archéologique"],
  ["zona arqueológica","zone archéologique"],
  ["pueblos indígenas","peuples autochtones"],
  ["área protegida","aire protégée"],
  ["pinturas rupestres","peintures rupestres"],
  ["línea de","ligne de"],
  ["avistamiento de","observation de"],
  ["mar caribe","mer des Caraïbes"],
  ["costa caribe","côte caribéenne"],
  ["islas","îles"]
];

function traducir(text){
  if(text===null||text===undefined) return text;
  let t = String(text);
  for(const [s,f] of PHRASES){ t = t.replace(new RegExp(s,'gi'), f); }
  const SEP = /([\s.,;:·|()"'°%º+­—–…!?\/]+)/;
  const toks = t.split(SEP);
  const out = toks.map(tok=>{
    if(tok==="") return tok;
    if(/^[\s.,;:·|()"'°%º+­—–…!?\/]+$/.test(tok)) return tok;
    if(/^[0-9.,+\-/%º° ]+$/.test(tok)) return tok;
    if(/^\{.*\}$/.test(tok)) return tok;
    if(/^<.*>$/.test(tok)) return tok;
    const lower = tok.toLowerCase();
    let tr = L[lower];
    if(tr===undefined){
      if(lower.length>2 && lower.endsWith('s') && !lower.endsWith('is') && L[lower.slice(0,-1)]){
        tr = pluralFr(L[lower.slice(0,-1)]);
      } else if(lower.length>3 && lower.endsWith('es') && L[lower.slice(0,-2)]){
        tr = pluralFr(L[lower.slice(0,-2)]);
      }
    }
    if(tr===undefined) tr = tok;
    if(tok===tok.toUpperCase() && tok.length>1 && /[A-ZÁÉÍÓÚÑ]/.test(tok)) return tr;
    if(/[A-ZÁÉÍÓÚÑ]/.test(tok.charAt(0))) return cap(tr);
    return tr;
  });
  return out.join('');
}

let fr = fs.readFileSync(BASE+'js/idioma-fr.js','utf8');

let updatedGaps = 0;
for(const [k,frVal] of Object.entries(GAPS)){
  const re = new RegExp("(\\n\\s*" + k + "\\s*:\\s*)(['\"])((?:\\\\.|[^'\"\\n])*?)(\\2)");
  if(re.test(fr)){
    fr = fr.replace(re, (m,p1)=> p1 + '"' + escDq(frVal) + '"');
    updatedGaps++;
  }
}

const real = JSON.parse(fs.readFileSync(BASE+'scripts/fr-faltantes-real.json','utf8'));
const existing = new Set();
const reK = /^\s*([A-Za-z0-9_]+):/gm; let mm;
while((mm=reK.exec(fr))) existing.add(mm[1]);

let added = 0;
let add = '\n\n  /* ─── Traducciones completadas (países / fr-faltantes-real) ─── */\n';
for(const r of real){
  if(existing.has(r.k)) continue;
  const fv = traducir(r.es);
  add += '  ' + r.k + ': "' + escDq(fv) + '",\n';
  existing.add(r.k);
  added++;
}

fr = fr.replace(/};\s*$/, add + "};\n");
fs.writeFileSync(BASE+'js/idioma-fr.js', fr, 'utf8');
console.log('gaps actualizadas:', updatedGaps, '| claves pais agregadas:', added);

