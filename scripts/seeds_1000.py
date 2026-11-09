#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de semillas no canibalizantes (1,000 artículos nuevos de alto CPC +
547 URLs faltantes detectadas en Google Search Console) para ChefExperto.com.
"""

import csv
import json
import os
import re
import unicodedata
import urllib.parse

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text


def humanize_slug(slug: str, category_slug: str) -> str:
    rep = {
        "como": "Cómo",
        "cual": "Cuál",
        "que": "Qué",
        "donde": "Dónde",
        "por-que": "Por qué",
        "espana": "España",
        "mexico": "México",
        "peru": "Perú",
        "japon": "Japón",
        "libano": "Líbano",
        "turquia": "Turquía",
        "canada": "Canadá",
        "panama": "Panamá",
        "zurich": "Zúrich",
        "munich": "Múnich",
        "napoles": "Nápoles",
        "ginebra": "Ginebra",
        "medellin": "Medellín",
        "bogota": "Bogotá",
        "cancun": "Cancún",
        "sao-paulo": "São Paulo",
        "san-jose": "San José",
        "asuncion": "Asunción",
        "cordoba": "Córdoba",
        "airfryer": "Air Fryer",
        "freidora-de-aire": "Freidora de Aire",
        "olla-a-presion": "Olla a Presión",
        "olla-de-coccion-lenta": "Olla de Cocción Lenta",
        "sarten": "Sartén",
        "cucharon": "Cucharón",
        "azucar": "Azúcar",
        "limon": "Limón",
        "oregano": "Orégano",
        "curcuma": "Cúrcuma",
        "brocoli": "Brócoli",
        "atun": "Atún",
        "menu": "Menú",
        "menus": "Menús",
        "dias": "Días",
        "anos": "Años",
        "ninos": "Niños",
        "faciles": "Fáciles",
        "rapidas": "Rápidas",
        "rapidos": "Rápidos",
        "economicas": "Económicas",
        "economicos": "Económicos",
        "autentico": "Auténtico",
        "tipico": "Típico",
        "tipica": "Típica",
        "proteina": "Proteína",
        "proteinas": "Proteínas",
        "guia": "Guía",
        "tecnica": "Técnica",
        "tecnicas": "Técnicas",
    }
    s = slug
    s = re.sub(r"-(receta|opcion)-\d+-", "-", s)
    s = re.sub(r"-202[345]$", "-2026", s)
    for k, v in sorted(rep.items(), key=lambda x: -len(x[0])):
        s = re.sub(rf"\b{k}\b", v, s)
    words = s.split("-")
    small = {"de", "del", "la", "el", "los", "las", "en", "y", "o", "a", "con", "sin", "para", "por", "un", "una", "al"}
    out = []
    for i, w in enumerate(words):
        if i > 0 and w.lower() in small:
            out.append(w.lower())
        elif w[0:1].isupper():
            out.append(w)
        else:
            out.append(w.capitalize())
    title = " ".join(out)
    if len(title) < 42:
        title = f"{title}: Guía Práctica y Consejos de Chef"
    return title


def load_gsc_missing_seeds(existing_paths: set, cat_map: dict) -> list:
    """Extrae las URLs de artículos faltantes de los 4 CSV de Google Search Console."""
    missing = {}
    for i in [1, 2, 3, 4]:
        csv_path = f"/Users/charlie/Downloads/https___chefexperto.com_-Coverage-Drilldown-2026-11-09 ({i})/Tabla.csv"
        if not os.path.exists(csv_path):
            continue
        with open(csv_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                path = urllib.parse.urlparse(row["URL"]).path
                path_norm = path if path.endswith("/") else path + "/"
                if path_norm in existing_paths:
                    continue
                parts = [x for x in path_norm.split("/") if x]
                if len(parts) == 2 and parts[0] in cat_map:
                    cat_slug, post_slug = parts[0], parts[1]
                    missing[path_norm] = (cat_slug, post_slug)

    seeds = []
    for path_norm, (cat_slug, post_slug) in sorted(missing.items()):
        title = humanize_slug(post_slug, cat_slug)
        seeds.append({
            "slug": post_slug,
            "title": title,
            "category": cat_slug,
            "source": "gsc-restore",
        })
    return seeds


def generate_1000_high_cpc_seeds(existing_slugs: set) -> list:
    """Genera 1,000 semillas únicas en los 10 clústeres de alto CPC (Opción A)."""
    seeds = []
    used_slugs = set(existing_slugs)

    def add_seed(title: str, category: str, variant: str, topic: str, subtopic: str):
        s = slugify(title)
        if s in used_slugs:
            s = f"{s}-guia-experta"
        if s in used_slugs:
            return False
        used_slugs.add(s)
        seeds.append({
            "slug": s,
            "title": title,
            "category": category,
            "layoutVariant": variant,
            "topic": topic,
            "subtopic": subtopic,
            "source": "new-1000",
        })
        return True

    # CLÚSTER 1 (120): Conservación, Refrigeración y Congelación -> 'consejos'
    alimentos_conservacion = [
        ("arroz blanco cocido", "evitar esporas de Bacillus cereus y mantener el grano suelto"),
        ("pechuga de pollo cocida", "conservar la jugosidad sin que se reseque al recalentar"),
        ("carne molida cruda", "frenar la oxidación y el cambio de color en frío"),
        ("aguacate o palta abierta", "bloquear la enzima polifenol oxidasa y evitar que oscurezca"),
        ("caldo de pollo casero", "desgrasar en frío y almacenar en porciones herméticas"),
        ("salsa de tomate casera", "prevenir fermentación ácida y moho en el borde del frasco"),
        ("champiñones frescos laminados", "absorber la humedad con papel y evitar textura viscosa"),
        ("cilantro y perejil fresco", "mantener hojas verdes y turgentes hasta por 14 días"),
        ("pescado blanco fresco", "conservar en cama de hielo drenado sin olor a amoníaco"),
        ("salmón fresco y ahumado", "proteger los ácidos grasos omega-3 de la rancidez"),
        ("huevos cocidos duros", "conservar con o sin cáscara de forma inocua"),
        ("lentejas y garbanzos cocidos", "evitar que el almidón se agrie o pierda textura"),
        ("pasta cocida al dente", "guardar sin que se apelmace ni absorba demasiada salsa"),
        ("queso fresco y mozzarella", "cambiar el suero o salmuera para triplicar su frescura"),
        ("jamón serrano y embutidos loncheados", "evitar el secado de bordes y la sudoración grasa"),
        ("crema de verduras y purés", "prevenir la separación de fases (sinéresis) al descongelar"),
        ("masa de pizza y pan casero", "controlar la fermentación en bloque a 4 °C por 72 horas"),
        ("fresas, arándanos y frutos rojos", "desinfección suave con vinagre y secado centrífugo"),
        ("plátanos maduros pelados", "congelar en rodajas para repostería y batidos cremosos"),
        ("cebolla picada o media cebolla", "contener los compuestos azufrados volátiles en vidrio"),
        ("ajo pelado y picado", "por qué nunca conservar en aceite a temperatura ambiente"),
        ("jengibre fresco en raíz", "almacenar pelado o rallado sin que se fibrose"),
        ("leche materna o fórmulas lácteas", "estándar estricto de cadena de frío en balda central"),
        ("mariscos y camarones limpios", "protocolo de descongelación lenta sin pérdida de agua"),
        ("guacamole casero cremoso", "sello de agua fría o limón para cero oxidación superficial"),
        ("tortilla española con huevo", "seguridad microbiológica frente a Salmonella en verano"),
        ("mayonesa casera y alioli", "vida útil máxima y control de pH ácido con limón o vinagre"),
        ("estofado de res y guisos con papa", "por qué la papa cambia de textura al congelar y cómo evitarlo"),
        ("espinacas y acelgas lavadas", "técnica de capas absorbentes en envase ventilado"),
        ("zanahorias y apio en bastones", "inmersión en agua fría filtrada para máxima crocancia"),
        ("limones y limas cortados", "evitar el endurecimiento de la corteza en refrigeración"),
        ("mantequilla sin sal y clarificada (ghee)", "protección contra olores extraños del refrigerador"),
        ("calabacín y berenjena cortada", "escaldado previo antes de congelar para preservar firmeza"),
        ("brócoli y coliflor en floretes", "blanqueado técnico de 90 segundos antes del congelador"),
        ("tocino o panceta ahumada", "congelación individual en láminas con papel encerado"),
        ("carne asada o parrilla sobrante", "regeneración con caldo para que quede tierna como recién hecha"),
        ("pollo asado o rostizado entero", "desmenuzado en caliente vs. frío para máxima duración"),
        ("lasagna y canelones armados", "congelación en crudo vs. horneado previo"),
        ("croquetas caseras empanizadas", "cómo congelar en bandeja abierta para que no se abran al freír"),
        ("albahaca fresca para pesto", "por qué el frío directo quema sus hojas y cómo guardarla a 12 °C"),
    ]
    angulos_conservacion = [
        ("Cuánto dura {item} en el refrigerador y cómo {goal}", "semaforo-conservacion"),
        ("Cómo congelar y descongelar {item}: guía para {goal}", "semaforo-conservacion"),
        ("Errores al guardar {item} en la nevera: protocolo para {goal}", "semaforo-conservacion"),
    ]
    for item, goal in alimentos_conservacion:
        for tpl, var in angulos_conservacion:
            add_seed(tpl.format(item=item, goal=goal), "consejos", var, item, goal)

    # CLÚSTER 2 (120): Tablas Maestras Air Fryer, Olla a Presión y Sous-Vide -> 'tecnicas'
    cortes_equipos = [
        ("pechuga de pollo entera y en filetes", "190 °C", "14-18 min", "74 °C internos"),
        ("alitas de pollo extra crujientes sin aceite", "200 °C", "22 min", "82 °C internos"),
        ("muslos y contramuslos de pollo con piel", "195 °C", "24 min", "79 °C internos"),
        ("lomo de salmón con piel crujiente", "195 °C", "9-11 min", "58 °C internos"),
        ("filete de merluza, bacalao y tilapia", "185 °C", "10-12 min", "62 °C internos"),
        ("camarones o langostinos al ajillo", "190 °C", "6-8 min", "60 °C internos"),
        ("bife de chorizo y entrecot de res término medio", "200 °C", "10-12 min", "56 °C internos"),
        ("solomillo de cerdo jugoso en medallones", "190 °C", "15-17 min", "63 °C internos"),
        ("costillas de cerdo BBQ tiernas", "180 °C", "28-32 min", "88 °C internos"),
        ("chuletas de cerdo con hueso sin secarse", "195 °C", "12-14 min", "64 °C internos"),
        ("papas fritas caseras en bastones", "195 °C", "18-22 min", "remojo previo de 20 min"),
        ("papas gajo rústicas con piel y especias", "200 °C", "20 min", "doble cocción"),
        ("camote o batata en bastones crujientes", "185 °C", "16-18 min", "almidón de maíz"),
        ("brócoli, coliflor y espárragos tostados", "190 °C", "8-10 min", "crocancia al dente"),
        ("berenjenas, calabacín y pimientos asados", "195 °C", "12-14 min", "caramelización uniforme"),
        ("garbanzos crujientes especiados como snack", "190 °C", "15 min", "secado previo total"),
        ("huevo duro, mollet y pasado por agua sin agua", "135 °C", "9-12 min", "baño de hielo inmediato"),
        ("pechuga de pavo marinada en hierbas", "180 °C", "25-30 min", "72 °C con reposo"),
        ("albóndigas de carne mixta jugosas", "190 °C", "11-13 min", "71 °C internos"),
        ("empanadas y tequeños dorados sin freír", "190 °C", "9-11 min", "pincelado de huevo"),
        ("plátano macho maduro y tostones crujientes", "195 °C", "12-15 min", "doble prensado"),
        ("manzanas y peras asadas con canela", "175 °C", "14-16 min", "caramelizado natural"),
        ("pechuga de pollo empanizada estilo panko", "195 °C", "13-15 min", "rocío fino de aceite"),
        ("pulpo cocido para darle toque a la brasa", "200 °C", "7-9 min", "dorado exterior"),
        ("costilla de res (short ribs) de cocción lenta", "165 °C", "45 min", "colágeno fundido"),
        ("lentejas, frijoles negros y garbanzos sin remojo", "Alta presión", "25-35 min", "despresurización natural"),
        ("caldo de huesos (bone broth) rico en colágeno", "Alta presión", "90 min", "extracción gelatinosa"),
        ("carne mechada y falda de res para deshebrar", "Alta presión", "40 min", "hebras suaves"),
        ("lengua de res tierna y fácil de pelar", "Alta presión", "45 min", "pelado en caliente"),
        ("arroz blanco, integral, jazmín y basmati", "Alta presión", "4-22 min", "proporción 1:1 de agua"),
    ]
    angulos_equipos = [
        "Tabla de tiempos y temperatura para {item} en Freidora de Aire ({temp}, {time})",
        "Cómo cocinar {item} perfecto: control de {note} y jugosidad",
        "Guía maestra de cocción para {item}: Air Fryer vs. Olla a Presión vs. Horno",
        "Por qué {item} queda seco o crudo y cómo lograr el punto exacto ({temp})",
    ]
    for item, temp, time_str, note in cortes_equipos:
        for tpl in angulos_equipos:
            add_seed(
                tpl.format(item=item, temp=temp, time=time_str, note=note),
                "tecnicas",
                "matriz-tiempos-temperatura",
                item,
                f"{temp} · {time_str} · {note}",
            )

    # CLÚSTER 3 (110): Duelos y Comparativas de Utensilios y Electrodomésticos -> 'utensilios' / 'resenas'
    duelos_utensilios = [
        ("sartén de acero inoxidable 18/10 tricapa", "sartén de hierro fundido pre-curado", "utensilios"),
        ("sartén de acero al carbono (carbon steel)", "sartén antiadherente de cerámica libre de PFAS", "resenas"),
        ("olla de hierro fundido esmaltado (Cocotte)", "olla de acero inoxidable de fondo difusor", "utensilios"),
        ("freidora de aire de cesta simple", "horno freidora de aire con doble resistencia", "resenas"),
        ("olla a presión eléctrica programable", "olla a presión tradicional de válvula sobre estufa", "utensilios"),
        ("cuchillo de chef alemán (20 cm, 20°)", "cuchillo Santoku japonés (18 cm, 15°)", "utensilios"),
        ("cuchillo de acero inoxidable alto carbono", "cuchillo de acero Damasco VG-10", "resenas"),
        ("tabla de cortar de madera de acacia a testa", "tabla de cortar de polietileno de alta densidad (HDPE)", "utensilios"),
        ("tabla de cortar de bambú prensado", "tabla de cortar de titanio y acero antibacteriano", "resenas"),
        ("licuadora de alto rendimiento (1500W)", "procesador de alimentos multifunción", "utensilios"),
        ("batidora de inmersión de brazo metálico", "licuadora de vaso de vidrio borosilicato", "utensilios"),
        ("batidora planetaria de pedestal (amasadora)", "batidora eléctrica de mano de 5 velocidades", "resenas"),
        ("termómetro digital de lectura instantánea", "termómetro de sonda con cable para horno y ahumador", "utensilios"),
        ("báscula digital de precisión (0.1 g)", "tazas y cucharas medidoras estándar de acero", "utensilios"),
        ("piedra de afilar al agua grano 1000/6000", "afilador manual de rodillos y chaira de acero", "utensilios"),
        ("wok de acero al carbono de fondo plano", "wok de hierro fundido para cocina de inducción", "resenas"),
        ("molde para hornear de aluminio anodizado", "molde de silicona platino o vidrio templado", "utensilios"),
        ("piedra refractaria de cordierita para pizza", "acero de hornear (baking steel) de 6 mm", "resenas"),
        ("mandolina japonesa de corte milimétrico", "procesador con discos de corte en juliana", "utensilios"),
        ("prensa de hierro para smash burgers", "espátula acodada de acero inoxidable rígido", "utensilios"),
        ("olla de cocción lenta (Slow Cooker) cerámica", "robot de cocina multifunción con control térmico", "resenas"),
        ("envasadora al vacío doméstica de doble sellado", "recipientes herméticos de vidrio con válvula de vacío", "utensilios"),
        ("sartén grill acanalada de hierro fundido", "plancha lisa de hierro reversible para dos hornillas", "resenas"),
        ("mortero de piedra volcánica (molcajete) o mármol", "molinillo eléctrico de especias de cuchillas de acero", "utensilios"),
        ("tamiz de malla fina de acero inoxidable", "colador chino cónico para fondos y salsas", "utensilios"),
        ("bandeja de aluminio Media Hoja (Half Sheet Pan)", "bandeja antiadherente aluminizada para galletas", "utensilios"),
        ("espátula miserable de silicona monobloque", "cuchara de madera de olivo tratada con aceite mineral", "utensilios"),
        ("pinzas de cocina de acero con bloqueo de 30 cm", "pinzas de precisión de emplatado profesional", "utensilios"),
    ]
    angulos_duelos = [
        "{a} vs. {b}: comparativa técnica, durabilidad y cuál comprar",
        "Diferencias reales entre {a} y {b} según pruebas de cocina",
        "Cuándo usar {a} y cuándo elegir {b}: guía de equipamiento",
        "Mantenimiento, limpieza y vida útil: {a} frente a {b}",
    ]
    for a, b, cat in duelos_utensilios:
        for tpl in angulos_duelos:
            if len([x for x in seeds if x.get("category") in ("utensilios", "resenas")]) >= 110:
                break
            add_seed(tpl.format(a=a.capitalize(), b=b), cat, "duelo-comparativa", a, b)

    # CLÚSTER 4 (140): Nuevas Gastronomías del Mundo (0% Perú, 0% repetidos) -> 'internacional'
    platos_mundo = [
        ("Focaccia genovesa de alta hidratación (80%)", "Italia (Liguria)", "fermentación fría y salmuera de aceite de oliva"),
        ("Risotto alla Milanese con azafrán y tuétano", "Italia (Lombardía)", "mantecatura fuera del fuego con Parmigiano Reggiano"),
        ("Pasta Cacio e Pepe romana sin nata", "Italia (Roma)", "emulsión térmica de Pecorino Romano y agua de cocción"),
        ("Pasta alla Carbonara auténtica con guanciale", "Italia (Lacio)", "pasteurización de yemas a 62 °C sin cuajar el huevo"),
        ("Ossobuco a la milanesa con gremolata fresca", "Italia (Milán)", "estofado lento de jarrete de ternera en vino blanco"),
        ("Gnocchi de papa aireados que no se desarman", "Italia (Piamonte)", "papa harinosa horneada con mínimo amasado de gluten"),
        ("Ramen Tonkotsu de caldo cremoso de 12 horas", "Japón (Fukuoka)", "emulsión de colágeno de cerdo, tare y huevo ajitsuke"),
        ("Pollo Karaage japonés doblemente crujiente", "Japón (Tokio)", "marinado en jengibre, soya y rebozado en fécula de papa"),
        ("Okonomiyaki estilo Osaka a la plancha", "Japón (Osaka)", "col finamente cortada, caldo dashi y salsa okonomi"),
        ("Gyozas japonesas crujientes por abajo y jugosas", "Japón", "técnica de sellado en sartén y cocción al vapor con tapa"),
        ("Katsu Sando y Tonkatsu de lomo de cerdo", "Japón", "empanizado en panko fresco y fritura a 170 °C exactos"),
        ("Asado de tira y vacío a la parrilla argentina", "Argentina", "control de brasas de quebracho/carbón y salmuera criolla"),
        ("Empanadas salteñas y tucumanas cortadas a cuchillo", "Argentina (Norte)", "recado jugoso con grasa de pella y pimentón dulce"),
        ("Milanesa napolitana de nalga o peceto al horno", "Argentina (Buenos Aires)", "doble apanado firme sin que se despegue"),
        ("Locro criollo patrio espeso de maíz blanco y zapallo", "Argentina", "fondo untuoso de zapallo plomo y sofrito de pimentón"),
        ("Pad Thai tailandés tradicional en wok", "Tailandia (Bangkok)", "balance exacto de pasta de tamarindo, salsa de pescado y azúcar de palma"),
        ("Sopa Tom Kha Gai de pollo y leche de coco", "Tailandia", "infusión aromática de galanga, lemongrass y hojas de lima kaffir"),
        ("Curry verde tailandés (Gaeng Keow Wan) casero", "Tailandia", "apertura de pasta de curry en la crema superior de la leche de coco"),
        ("Boeuf Bourguignon clásico en vino tinto", "Francia (Borgoña)", "marinado de 24 horas y braseado lento con cebollitas perla"),
        ("Sopa de cebolla gratinada estilo bistró parisino", "Francia (París)", "caramelización profunda de cebollas por 45 minutos y caldo de res"),
        ("Quiche Lorraine de masa quebrada crujiente", "Francia (Lorena)", "horneado en blanco y appareil de nata y panceta ahumada"),
        ("Ratatouille provenzal confitado al horno (Confit Byaldi)", "Francia (Provenza)", "láminas finas sobre piperada de pimientos asados"),
        ("Pollo frito coreano (Yangnyeom Chicken) glaseado", "Corea del Sur (Seúl)", "doble fritura con fécula y glaseado picante de gochujang"),
        ("Bulgogi de res coreano marinado en pera asiática", "Corea del Sur", "enzimas naturales de la pera para ablandar cortes finos"),
        ("Kimchi tradicional de col napa fermentado en casa", "Corea del Sur", "salazón al 2.5% y pasta de arroz glutinoso con gochugaru"),
        ("Hummus libanés ultra sedoso como en Beirut", "Líbano", "cocción de garbanzos con bicarbonato y emulsión con tahini y hielo"),
        ("Tabbouleh libanés auténtico de perejil y trigo bulgur", "Líbano", "corte fino a cuchillo sin oxidar las hierbas y aliño de limón"),
        ("Kibbeh frito y horneado de carne y trigo burgol", "Líbano / Medio Oriente", "corteza fina crujiente y relleno especiado con piñones y baharat"),
        ("Pabellón criollo venezolano con carne mechada", "Venezuela", "sofrito de ají dulce, caraotas negras y tajadas doradas"),
        ("Cachapas venezolanas de maíz tierno con queso de mano", "Venezuela", "molienda de grano fresco sin exceso de harina"),
        ("Asado negro caraqueño de muchacho redondo", "Venezuela", "sellado lento en papelón (panela) y vino hasta lograr salsa oscura"),
        ("Sancocho dominicano de las 7 carnes", "República Dominicana", "espesado con auyama (calabaza) y víveres tropicales"),
        ("Mangú dominicano con los tres golpes y cebolla encurtida", "República Dominicana", "emulsión de plátano verde con agua fría y mantequilla"),
        ("Feijoada brasileña completa con farofa tostada", "Brasil (Río de Janeiro)", "desalado progresivo de carnes curadas y frijol negro cremoso"),
        ("Pão de queijo (pan de queso brasileño) con almidón de yuca", "Brasil (Minas Gerais)", "escaldado del polvilho azedo con leche y aceite hirviendo"),
    ]
    angulos_mundo = [
        ("Receta auténtica de {dish} ({origin}): técnica paso a paso", "receta-precision"),
        ("Secretos de chef para preparar {dish}: {secret}", "atlas-gastronomico"),
        ("Guía de ingredientes y errores comunes al hacer {dish} en casa", "atlas-gastronomico"),
        ("Historia, acompañamiento tradicional y conservación de {dish}", "atlas-gastronomico"),
    ]
    for dish, origin, secret in platos_mundo:
        for tpl, var in angulos_mundo:
            add_seed(tpl.format(dish=dish, origin=origin, secret=secret), "internacional", var, dish, f"{origin} · {secret}")

    # CLÚSTER 5 (100): Salsas Madre, Emulsiones, Adobos y Marinadas -> 'ingredientes' / 'tecnicas'
    salsas_marinadas = [
        ("Salsa Bechamel sin grumos", "proporción exacta de roux blanco (50 g mantequilla + 50 g harina por litro de leche)"),
        ("Salsa Velouté de ave y pescado", "roux rubio suave y fondo claro reducido con bouquet garni"),
        ("Salsa Española y Demi-Glace profesional", "roux oscuro tostado, mirepoix caramelizado y fondo de huesos"),
        ("Salsa Holandesa estable al baño maría", "emulsión de yemas a 60 °C y mantequilla clarificada tibia"),
        ("Salsa Bearnesa clásica para carnes", "reducción de vinagre de estragón, chalotas y mantequilla clarificada"),
        ("Chimichurri argentino de hierbas frescas", "hidratación previa del orégano y ají molido en salmuera tibia"),
        ("Pesto genovés verde brillante que no se oxida", "escaldado rápido o molienda en frío con piñones y Pecorino"),
        ("Salsa Tzatziki griega espesa y cremosa", "deshidratación del pepino rallado con sal para no aguar el yogur"),
        ("Salsa Teriyaki casera brillante sin maicena excesiva", "reducción partes iguales de soya, mirin, sake y azúcar"),
        ("Marinada enzimática para ablandar cortes de res duros", "uso controlado de piña, papaya, kiwi o suero de leche (buttermilk)"),
        ("Salmuera húmeda al 5% para pechuga de pollo y pavo", "ósmosis y retención de humedad durante el horneado"),
        ("Salmuera seca (Dry Brining) para carnes y aves con piel crujiente", "sal kosher 24 horas antes en rejilla refrigerada"),
        ("Adobo mexicano de tres chiles secos (guajillo, ancho y pasilla)", "tostado en comal sin quemar semillas e hidratación en caldo"),
        ("Vinagreta emulsionada estable que no se separa", "proporción 3:1 aceite/ácido con mostaza de Dijon como tensioactivo"),
        ("Salsa de pimienta verde y negra al coñac para medallones", "desglasado de sartén (fond) y reducción con crema espesa"),
        ("Salsa Pomodoro italiana de 25 minutos con tomates San Marzano", "equilibrio de acidez sin usar azúcar mediante zanahoria o cocción lenta"),
        ("Salsa Romesco catalana de almendras, avellanas y ñoras", "asado al rescoldo de tomates y ajos para textura rústica"),
        ("Alioli tradicional de mortero y versión en licuadora de brazo", "velocidad de hilo de aceite y temperatura igualada de ingredientes"),
        ("Glaseado de miel, mostaza antigua y ajo asado para cerdo", "caramelización en los últimos 8 minutos para no quemar azúcares"),
        ("Fondo oscuro de res y fondo claro de ave sin turbidez", "espumado en frío desde agua helada sin hervir a borbotones"),
        ("Mantequilla compuesta (Maître d'Hôtel) de hierbas y limón", "batido en punto pomada y cilindro en papel film para congelar"),
        ("Salsa de champiñones y vino blanco sin crema cortada", "reducción previa del alcohol antes de incorporar el lácteo"),
        ("Marinada mediterránea de yogur griego, limón y especias para pollo", "ácido láctico suave que tierniza la fibra sin volverla harinosa"),
        ("Salsa barbacoa (BBQ) ahumada casera baja en azúcar", "base de tomate, melaza, vinagre de manzana y pimentón ahumado"),
        ("Reducción de aceto balsámico y vino tinto para carnes rojas", "punto de napa (85 °C) que recubre el dorso de la cuchara"),
    ]
    angulos_salsas = [
        ("Cómo hacer {salsa} paso a paso: {tech}", "ingredientes"),
        ("Proporción maestra y errores que arruinan tu {salsa}", "tecnicas"),
        ("Con qué platos combinar {salsa} y cómo conservarla en frío", "ingredientes"),
        ("Ciencia culinaria de {salsa}: secretos para textura perfecta", "tecnicas"),
    ]
    for salsa, tech in salsas_marinadas:
        for tpl, cat in angulos_salsas:
            add_seed(tpl.format(salsa=salsa, tech=tech), cat, "receta-precision", salsa, tech)

    # CLÚSTER 6 (90): Clínica de Rescate Culinario ("Por qué falla y cómo salvarlo") -> 'tips'
    rescates = [
        ("una sopa, guiso o estofado que quedó demasiado salado", "dilución con caldo sin sal, almidón o equilibrio ácido-graso"),
        ("una mayonesa o salsa holandesa que se cortó", "re-emulsión gota a gota sobre una cucharada de agua tibia o yema nueva"),
        ("un bizcocho que sube en el horno pero se hunde en el centro", "exceso de impulsor químico, apertura prematura o falta de estructura proteica"),
        ("un arroz blanco que quedó apelmazado, pastoso o crudo por dentro", "evaporación en bandeja extendida o rescate al vapor con paño limpio"),
        ("una salsa de tomate o guiso demasiado ácido", "bicarbonato de sodio (pizca exacta de reacción neutralizante) y cocción larga"),
        ("un plato que quedó excesivamente picante con chile o ají", "caseína láctea, grasas emulsionadas y dulzor para disolver la capsaicina"),
        ("una crema para batir (nata) que se pasó y se convirtió en mantequilla", "incorporación de crema fría líquida a baja velocidad o uso en repostería"),
        ("un caramelo que se cristalizó y formó piedras de azúcar", "adición de ácido cítrico/limón y disolución térmica controlada"),
        ("un chocolate fundido que se engrosó o se quemó (seizing)", "adición de líquido hirviendo para transformar en ganache brillante"),
        ("una carne asada o pechuga que quedó seca y fibrosa", "loncheado fino contra la fibra e inmersión en jugo de cocción emulsionado"),
        ("una masa de pan o pizza que no levó y quedó densa", "activación térmica a 26 °C y verificación de viabilidad de la levadura"),
        ("unas claras de huevo que no montan a punto de nieve", "eliminación total de trazas de grasa y estabilización con cremor tártaro"),
        ("una salsa con maicena o harina que sabe a crudo o tiene grumos", "cocción mínima de 2 minutos post-hervor para gelatinizar el almidón"),
        ("unas papas fritas que quedan blandas y absorben demasiado aceite", "control de temperatura del aceite a 175 °C y doble fritura técnica"),
        ("una tortilla o frittata que se pega a la sartén al dar la vuelta", "efecto Leidenfrost en acero o temperatura de sartén antes de verter el huevo"),
        ("un pescado a la plancha cuya piel se rompe y se queda pegada", "secado exhaustivo de la piel y presión inicial con espátula"),
        ("unas legumbres (frijoles o garbanzos) que siguen duras tras horas de cocción", "efecto del agua dura con calcio y cuándo añadir la sal y el bicarbonato"),
        ("una crema de verduras que quedó demasiado líquida o aguada", "reducción por evaporación o espesado con puré de papa/anacardos"),
        ("un merengue que llora o suelta líquido (sinéresis) en el refrigerador", "disolución completa de los cristales de azúcar hasta 65 °C"),
        ("un guiso con sabor plano al que le falta profundidad (umami)", "capas de sabor con desglasado, glutamatos naturales y toque ácido final"),
        ("un rebozado o empanizado que se despega de la carne al freír", "secado de superficie, orden harina-huevo-pan y reposo de 15 min en frío"),
        ("una pasta que quedó sobrecocida y blanda", "choque térmico y salteado rápido en sartén amplia para evaporar humedad"),
        ("un ajo o cebolla que se quemó en el sofrito inicial", "por qué el ajo quemado amarga todo el guiso y cómo reiniciar la base"),
    ]
    angulos_rescate = [
        "Cómo arreglar {prob} en minutos ({sol})",
        "Por qué ocurre {prob}: explicación científica y cómo evitarlo",
        "Guía de rescate culinario para salvar {prob} sin tirar la comida",
        "3 trucos de chef profesional frente a {prob}",
    ]
    for prob, sol in rescates:
        for tpl in angulos_rescate:
            if len([x for x in seeds if x.get("category") == "tips"]) >= 90:
                break
            add_seed(tpl.format(prob=prob, sol=sol), "tips", "clinica-culinaria-rescate", prob, sol)

    # CLÚSTER 7 (90): Panadería Artesanal, Masas Madre y Repostería Técnica -> 'reposteria'
    panaderia = [
        ("Harina 00, 000, 0000 y harina de fuerza", "tabla de equivalencias por país y porcentaje de proteína (W)"),
        ("Masa madre natural desde cero en 7 días", "calendario de refrescos con harina integral y trigo blanco a 25 °C"),
        ("Porcentaje de panadero explicado paso a paso", "cómo escalar cualquier receta de pan por hidratación y sal"),
        ("Autólisis y plegados (Stretch and Fold) en panadería", "desarrollo de la red de gluten sin amasadora mecánica"),
        ("Masa de pizza napolitana de 48 horas de fermentación", "hidratación del 65%, bolas precisas y horneado a máxima temperatura"),
        ("Pan brioche francés de miga filante con mantequilla", "incorporación de grasa fría tras desarrollar el velo de gluten"),
        ("Croissants hojaldrados caseros de 27 capas", "pliegues simples, temperatura del empaste a 14 °C y fermentación"),
        ("Masa quebrada (Pâte Sablée y Brisée) que no se encoge", "método de arenado (sablage) y reposo en frío para relajar el gluten"),
        ("Masa Choux infalible para profiteroles, éclairs y churros", "secado de la panade en olla e incorporación gradual de huevo"),
        ("Cheesecake japonés esponjoso (Soufflé) sin grietas", "baño maría controlado y merengue en pico suave flexible"),
        ("Tarta de queso estilo La Viña (San Sebastián) cremosa en el centro", "horneado a 210 °C por 28 minutos y reposo de 6 horas"),
        ("Brownie de chocolate con costra brillante (fudgy) vs. abizcochado", "disolución del azúcar en mantequilla caliente y batido de huevos"),
        ("Macarons franceses con pie perfecto y sin huecos", "macaronage, secado de costra (croûtage) y merengue italiano a 118 °C"),
        ("Crema pastelera sedosa que no sabe a maicena ni hace costra", "hervor de 90 segundos y film plástico a piel (al contacto)"),
        ("Ganache de chocolate para cobertura, relleno y trufas", "proporciones exactas 1:1, 2:1 y 1:2 según porcentaje de cacao"),
        ("Templado (atemperado) de chocolate en casa sin mármol", "curva de cristalización Beta V (45 °C -> 27 °C -> 31 °C) por sembrado"),
        ("Pan de molde lactal tierno con método japonés Tangzhong", "roux de agua y harina a 65 °C que triplica la suavidad por días"),
        ("Glaseado espejo (Mirror Glaze) brillante para pastelería", "hidratación de gelatina en hojas o polvo y vertido a 33 °C exactos"),
        ("Galletas con chispas de chocolate gruesas por dentro y bordes crujientes", "mantequilla avellana (beurre noisette) y reposo de masa de 24 horas"),
        ("Bizcocho genovés sin polvo de hornear para brazos gitanos y tres leches", "batido de huevos y azúcar a punto letra (40 °C)"),
        ("Canelés de Burdeos caramelizados por fuera y natilla por dentro", "reposo de la masa líquida por 48 horas y choque térmico inicial"),
        ("Cinnamon Rolls (roles de canela) ultra suaves que no endurecen", "masa enriquecida y horneado justo hasta 88 °C internos"),
        ("Bagels neoyorquinos masticables hervidos antes de hornear", "baño de agua con malta o miel antes del horno"),
    ]
    angulos_pan = [
        "{item}: {detail}",
        "Guía maestra de {item} para resultados de pastelería profesional",
        "Errores frecuentes con {item} y cómo dominarlo en tu horno doméstico",
        "Temperaturas, tiempos y ciencia detrás de {item}",
    ]
    for item, detail in panaderia:
        for tpl in angulos_pan:
            if len([x for x in seeds if x.get("category") == "reposteria" and x.get("source") == "new-1000"]) >= 90:
                break
            add_seed(tpl.format(item=item, detail=detail), "reposteria", "receta-precision", item, detail)

    # CLÚSTER 8 (80): Guía Maestra de Cortes de Carnes, Aves, Pescados y Mariscos -> 'ingredientes'
    cortes_guia = [
        ("Cortes de carne de res para parrilla, plancha y guiso", "diferencia entre lomo fino, bife ancho, entraña, picaña y osobuco"),
        ("Cortes de cerdo explicados", "para qué usar bondiola, solomillo, panceta, carré, paleta y secreto"),
        ("Picaña (tapa de cuadril) perfecta", "cómo cortar a favor y en contra de la fibra para máxima ternura"),
        ("Entraña fina vs. entraña gruesa (arrachera)", "cómo retirar la membrana plateada (pleura) y sellar a fuego vivo"),
        ("Ojo de bife (Ribeye) vs. Bife de chorizo (New York Strip)", "marmoleo intramuscular, sabor y grosor ideal de 4 cm"),
        ("Cortes económicos de res para estofar y desmechar", "aguja, falda, pecho (brisket) y morcillo ricos en colágeno"),
        ("Pescados blancos vs. pescados azules", "tabla de porcentaje graso, espinas y mejor método de cocción"),
        ("Salmón salvaje vs. salmón de cultivo", "diferencias en color, firmeza, grasa y tiempo de cocción"),
        ("Camarones y langostinos por calibre (U10, 16/20, 31/40)", "qué significan los números por libra, cómo desvenar y cocinar"),
        ("Pulpo tierno en casa sin golpearlo", "congelación previa para romper fibras y cocción a 90 °C sin hervir fuerte"),
        ("Calamares y anillos de pota tiernos", "regla de los 2 minutos a fuego alto o más de 40 minutos estofados"),
        ("Almejas, mejillones y berberechos sin arena", "purgado en agua fría con 35 g de sal por litro antes de cocinar"),
        ("Despiece completo del pollo entero en casa", "aprovechamiento de pechugas, muslos, alitas, ostras (sot-l'y-laisse) y carcasa"),
        ("Hígado de res y de pollo suave sin sabor metálico", "remojo en leche por 30 minutos y sellado rosado sin sobrecocinar"),
        ("Cordero (pierna, paleta y chuletillas)", "cómo limpiar la grasa exterior para suavizar el aroma y lograr carne melosa"),
        ("Pechuga de pato (Magret) con piel crujiente y centro rosado", "cuadrícula en la grasa desde sartén fría hasta 56 °C internos"),
        ("Atún fresco en medallón (Tataki y a la plancha)", "sellado de 45 segundos por lado para evitar que quede seco como lata"),
        ("Bacalao salado tradicional", "calendario de desalado de 48 horas con cambios de agua fría en nevera"),
        ("Costillar de cerdo (St. Louis vs. Baby Back Ribs)", "retiro de membrana posterior y método 3-2-1 para que se desprenda del hueso"),
        ("Tuétano de res (caracú) asado al horno", "purgado en salmuera fría y horneado a 220 °C por 18 minutos"),
    ]
    angulos_cortes = [
        "{item}: {detail}",
        "Cómo elegir, limpiar y cocinar {item} sin que quede duro",
        "Tabla de temperaturas y tiempos para {item} según el punto de cocción",
        "Secretos de carnicero y chef sobre {item}",
    ]
    for item, detail in cortes_guia:
        for tpl in angulos_cortes:
            add_seed(tpl.format(item=item, detail=detail), "ingredientes", "matriz-tiempos-temperatura", item, detail)

    # CLÚSTER 9 (80): Batch Cooking, Tupper de Oficina y Presupuesto Inteligente -> 'cocina-para-oficina' / 'cocina-con-bajo-presupuesto'
    batch_temas = [
        ("Batch cooking de 2 horas el domingo", "cómo cocinar 5 bases versátiles para armar 15 almuerzos distintos", "cocina-para-oficina"),
        ("Almuerzos para llevar a la oficina que no necesitan microondas", "10 platos completos que saben deliciosos a temperatura ambiente", "cocina-para-oficina"),
        ("Comidas de tupper que no dan sueño después de almorzar", "combinación de proteínas magras, fibra y carbohidratos de absorción lenta", "cocina-para-oficina"),
        ("Cómo armar ensaladas en frasco de vidrio (Mason Jar) para 5 días", "orden exacto de capas de la vinagreta a las hojas verdes sin que se marchiten", "cocina-para-oficina"),
        ("Guisos y estofados que saben aún mejor al día siguiente en el tupper", "por qué el reposo nocturno potencia el sabor y cómo recalentarlos", "cocina-para-oficina"),
        ("Almuerzos de oficina sin olor fuerte para comedores compartidos", "alternativas ricas en proteína sin pescado recalentado ni crucíferas", "cocina-para-oficina"),
        ("Desayunos overnight (avena y chía) listos en el refrigerador", "5 combinaciones saciantes para mañanas con prisa antes del trabajo", "cocina-para-oficina"),
        ("Cómo recalentar arroz, pasta y carnes en el microondas de la oficina", "truco del cubo de hielo o papel húmedo para regenerar al vapor", "cocina-para-oficina"),
        ("Wraps, burritos y sándwiches para el trabajo que no se humedecen", "barrera lipídica de queso o aguacate para proteger el pan y la tortilla", "cocina-para-oficina"),
        ("Snacks saludables de cajón de oficina para evitar picar ultraprocesados", "frutos secos activados, edamames tostados y barritas caseras sin azúcar", "cocina-para-oficina"),
        ("Lista de compras inteligente de bajo presupuesto", "los 25 alimentos con mayor densidad nutricional y proteína por dólar", "cocina-con-bajo-presupuesto"),
        ("Cómo aprovechar un pollo entero en 4 comidas familiares distintas", "pechugas a la plancha, muslos guisados, ropa vieja y caldo concentrado", "cocina-con-bajo-presupuesto"),
        ("Cocina de aprovechamiento (Zero Waste) con tallos, hojas y cáscaras", "caldos de recortes limpios, pesto de hojas de zanahoria y crutones", "cocina-con-bajo-presupuesto"),
        ("Menú semanal económico basado en legumbres y cereales completos", "combinación de aminoácidos esenciales (lentejas + arroz, garbanzos + maíz)", "cocina-con-bajo-presupuesto"),
        ("Cómo sustituir cortes de carne caros por piezas económicas llenas de sabor", "técnicas de marinado y cocción lenta para multiplicar la ternura", "cocina-con-bajo-presupuesto"),
        ("Despensa cápsula económica de 20 ingredientes básicos", "cómo resolver desayunos, almuerzos y cenas todo el mes sin desperdicio", "cocina-con-bajo-presupuesto"),
        ("Comidas rendidoras en una sola olla (One-Pot Meals) para ahorrar gas y tiempo", "arroces caldosos, pastas integradas y cazuelas familiares", "cocina-con-bajo-presupuesto"),
        ("Cómo comprar en mercado mayorista y porcionar para congelar todo el mes", "etiquetado PEPS (primero en entrar, primero en salir) y ahorro del 35%", "cocina-con-bajo-presupuesto"),
        ("Proteínas económicas más allá de la carne: huevo, sardinas, atún y legumbres", "tabla comparativa de gramos de proteína por porción y recetas fáciles", "cocina-con-bajo-presupuesto"),
        ("Pan casero, tortillas y bases de pizza hechas en casa por centavos", "comparativa de costo frente a productos comerciales y cómo congelarlas", "cocina-con-bajo-presupuesto"),
    ]
    angulos_batch = [
        "{item}: {detail}",
        "Guía práctica de {item} paso a paso",
        "Planificación semanal y consejos de chef sobre {item}",
        "Errores que te hacen perder tiempo y dinero en {item}",
    ]
    for item, detail, cat in batch_temas:
        for tpl in angulos_batch:
            add_seed(tpl.format(item=item, detail=detail), cat, "semaforo-conservacion", item, detail)

    # CLÚSTER 10 (70+): Equivalencias de Medidas, Sustituciones y Nutrición Funcional -> 'saludable' / 'cocina-para-principiantes'
    equivalencias = [
        ("Tabla maestra de equivalencias en cocina", "de tazas y cucharadas a gramos y mililitros por ingrediente", "cocina-para-principiantes"),
        ("Conversión de temperaturas de horno", "tabla exacta de grados Celsius (°C), Fahrenheit (°F) y marcas de gas", "cocina-para-principiantes"),
        ("Cortes básicos de verduras en cocina profesional", "diferencia entre brunoise, juliana, mirepoix, chiffonade, bastón y vichy", "cocina-para-principiantes"),
        ("Cómo agarrar el cuchillo de chef (agarre de pellizco) y posición de garra", "técnica segura para picar rápido sin riesgo de cortes", "cocina-para-principiantes"),
        ("Diferencia entre hervir, escalfar (pochar), blanquear, estofar y brasear", "temperaturas del agua y cuándo aplicar cada método de cocción", "cocina-para-principiantes"),
        ("Qué significa Mise en Place y cómo organizar tu cocina antes de encender el fuego", "el método de los restaurantes con estrella Michelin adaptado a casa", "cocina-para-principiantes"),
        ("Cómo medir harinas, líquidos y grasas sólidas sin báscula digital", "por qué una taza de harina no pesa igual que una taza de agua", "cocina-para-principiantes"),
        ("Guía de aceites de cocina y su punto de humo", "cuándo usar aceite de oliva virgen extra, aguacate, girasol, coco o manteca", "saludable"),
        ("Cómo crear almidón resistente en arroz, papa y pasta", "por qué enfriar 24 horas a 4 °C reduce el pico de glucosa y alimenta la microbiota", "saludable"),
        ("Cómo sustituir el huevo en cocina y repostería según su función", "semillas de lino/chía, aquafaba, puré de manzana o bicarbonato", "saludable"),
        ("Sustitutos saludables de la crema de leche (nata) en salsas y sopas", "crema de anacardos, yogur griego temperado, leche evaporada y coliflor", "saludable"),
        ("Cómo reducir el sodio en tus comidas sin perder sabor", "uso estratégico de cítricos, especias tostadas, ajo asado y umami natural", "saludable"),
        ("Antinutrientes en legumbres, frutos secos y semillas (ácido fítico y lectinas)", "tiempos exactos de remojo, activación y cocción para máxima digestibilidad", "saludable"),
        ("Métodos de cocción que mejor conservan las vitaminas y antioxidantes", "vapor y salteado rápido frente a hervido prolongado en agua", "saludable"),
        ("Cómo reemplazar el azúcar refinado en recetas horneadas", "impacto en humedad y dorado de la estevia, eritritol, fruto del monje, miel y dátiles", "saludable"),
        ("Combinaciones de alimentos que multiplican la absorción de nutrientes", "hierro vegetal + vitamina C, cúrcuma + pimienta negra y licopeno + aceite de oliva", "saludable"),
        ("Harinas sin gluten para cocinar y hornear (almendra, avena, arroz, garbanzo y trigo sarraceno)", "cómo combinarlas con goma xantana o psyllium para lograr elasticidad", "saludable"),
        ("Caldo antiinflamatorio de cúrcuma, jengibre, ajo y verduras", "técnica de infusión suave para conservar compuestos bioactivos", "saludable"),
    ]
    angulos_equiv = [
        "{item}: {detail}",
        "Guía completa sobre {item} explicada paso a paso",
        "Tabla comparativa y consejos prácticos de {item}",
        "Todo lo que debes saber sobre {item} en la cocina diaria",
    ]
    for item, detail, cat in equivalencias:
        for tpl in angulos_equiv:
            if len(seeds) >= 1000:
                break
            add_seed(tpl.format(item=item, detail=detail), cat, "duelo-comparativa", item, detail)

    return seeds[:1000]
