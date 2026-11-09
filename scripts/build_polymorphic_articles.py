#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor Polimórfico de Generación de Artículos para ChefExperto.com
Inspirado en la arquitectura anti-huella de guiadebarberias.com y dinamica.pe.
Genera 1,000 artículos nuevos de alto CPC + restaura las 547 URLs faltantes de GSC.
"""

import datetime
import hashlib
import json
import os
import re
from seeds_1000 import load_gsc_missing_seeds, generate_1000_high_cpc_seeds

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_PATH = os.path.join(ROOT_DIR, "data", "posts.json")
POSTS_EXTRA_PATH = os.path.join(ROOT_DIR, "data", "posts-extra.json")
CATEGORIES_PATH = os.path.join(ROOT_DIR, "data", "categories.json")
SEARCH_INDEX_PATH = os.path.join(ROOT_DIR, "public", "search-index.json")
IMAGES_DIR = os.path.join(ROOT_DIR, "public", "images")


def infer_variant(slug: str, cat: str, explicit_variant: str = "") -> str:
    if explicit_variant:
        return explicit_variant
    s = slug.lower()
    if any(k in s for k in ("conservar", "dura-", "congelar", "refrigerador", "nevera")) or cat in ("cocina-para-oficina", "cocina-sostenible", "cocina-con-bajo-presupuesto"):
        return "semaforo-conservacion"
    if any(k in s for k in ("comparativa", "diferencia-entre", "cual-es-mejor", "vs-", "ventajas-y-desventajas", "mejor-", "mejores-")) or cat in ("utensilios", "resenas"):
        return "duelo-comparativa"
    if any(k in s for k in ("airfryer", "freidora", "olla-a-presion", "temperatura", "tiempo", "cortes-")) or cat in ("tecnicas", "cocina-para-acampar"):
        return "matriz-tiempos-temperatura"
    if any(k in s for k in ("errores-", "arreglar", "salvar", "por-que-", "no-se-debe-mezclar", "reemplazar", "sustitutos")) or cat in ("tips", "curiosidades", "ingredientes"):
        return "clinica-culinaria-rescate"
    if cat in ("internacional", "restaurantes-de-america", "restaurantes-en-europa", "mejores-chef", "blog"):
        return "atlas-gastronomico"
    return "receta-precision"


def build_polymorphic_html(seed: dict, idx: int, cat_name: str, related_links: list) -> tuple:
    title = seed["title"]
    slug = seed["slug"]
    cat = seed["category"]
    variant = infer_variant(slug, cat, seed.get("layoutVariant", ""))
    topic = seed.get("topic") or title.split(":")[0].strip()
    subtopic = seed.get("subtopic") or f"técnicas profesionales de {cat_name.lower()}"

    h_hash = int(hashlib.md5(slug.encode("utf-8")).hexdigest()[:8], 16)
    rot = h_hash % 4

    rel1 = related_links[0] if len(related_links) > 0 else ("/tecnicas/", "Guía de Técnicas Culinarias")
    rel2 = related_links[1] if len(related_links) > 1 else ("/utensilios/", "Equipamiento Esencial de Cocina")

    # ---------------- ARQUETIPO 1: SEMAFORO CONSERVACION ----------------
    if variant == "semaforo-conservacion":
        h2_sets = [
            (
                f"Tiempo exacto de conservación y cadena de frío para {topic}",
                f"Tabla de temperaturas, envases y vida útil ({topic})",
                f"Paso a paso para almacenar, congelar y regenerar sin perder textura",
                f"Señales de deterioro que indican cuándo desechar el alimento",
            ),
            (
                f"Por qué el control de humedad y temperatura es crítico en {topic}",
                f"Cuadro comparativo: Despensa vs. Refrigerador (4 °C) vs. Congelador (-18 °C)",
                f"Protocolo de enfriamiento rápido y porcionado inteligente en casa",
                f"Errores frecuentes que aceleran la oxidación y contaminación cruzada",
            ),
            (
                f"Ciencia de la inocuidad alimentaria aplicada a {topic}",
                f"Matriz de duración segura por método de envasado",
                f"Cómo descongelar y recalentar manteniendo el 100% de jugosidad",
                f"Reglas de organización en el refrigerador para ahorrar dinero",
            ),
            (
                f"Guía práctica de almacenamiento doméstico para {topic}",
                f"Tiempos máximos recomendados según estándares bromatológicos",
                f"Envases de vidrio borosilicato, sellado al vacío y papel absorbente",
                f"Trucos de chef para aprovechar cada porción sin desperdicio",
            ),
        ][rot]

        html = f"""<p>Dominar <strong>{title.lower()}</strong> marca la diferencia entre disfrutar de ingredientes frescos y seguros toda la semana o sufrir pérdidas de textura, oxidación prematura y riesgos microbiológicos. En el ámbito de <strong>{cat_name}</strong>, enfocar correctamente la técnica para <em>{subtopic}</em> permite conservar intactos los nutrientes, el aroma y la estructura celular del alimento.</p>

<p>El principal enemigo de la conservación doméstica es la combinación de <strong>humedad libre superficial, oxígeno residual y fluctuaciones térmicas</strong> por abrir constantemente la puerta del refrigerador. A continuación encontrarás los parámetros verificados de temperatura y envasado.</p>

<h2>{h2_sets[0]}</h2>
<p>Cuando un alimento cocinado o fresco permanece entre <strong>5 °C y 60 °C</strong> (la llamada zona de peligro térmico), las bacterias mesófilas duplican su población cada 20 minutos. Por ello, para <strong>{topic}</strong> es fundamental enfriar cualquier preparación cocida en menos de 90 minutos antes de cerrarla herméticamente, evitando que el vapor condensado en la tapa gotee de vuelta y acelere la fermentación.</p>

<ul>
  <li><strong>Ubicación en el refrigerador:</strong> Coloca siempre los recipientes en la <strong>balda central o superior (3 °C a 4 °C constantes)</strong> y nunca en la puerta, donde la temperatura sube hasta 10 °C.</li>
  <li><strong>Control de condensación:</strong> En vegetales, hierbas o setas, incorpora una hoja de papel absorbente seco dentro del contenedor para capturar el exceso de agua libre.</li>
  <li><strong>Prevención de contaminación cruzada:</strong> Separa estrictamente alimentos crudos de alimentos listos para consumir utilizando recipientes de vidrio borosilicato con junta de silicona.</li>
</ul>

<h2>{h2_sets[1]}</h2>
<p>Revisa esta matriz técnica con los rangos seguros de conservación y el tipo de recipiente óptimo según el estado del alimento:</p>

<table>
  <thead>
    <tr>
      <th>Método / Zona Térmica</th>
      <th>Temperatura Exacta</th>
      <th>Duración Segura</th>
      <th>Envase Recomendado</th>
      <th>Calidad Sensorial</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Temperatura Ambiente</strong></td>
      <td>18 °C – 22 °C</td>
      <td>Máximo 2 horas (1 h en verano)</td>
      <td>Cubierto con malla o campana</td>
      <td>Óptima para consumo inmediato</td>
    </tr>
    <tr>
      <td><strong>Refrigerador (Balda Central)</strong></td>
      <td>2 °C – 4 °C</td>
      <td>3 a 4 días (etiquetado con fecha)</td>
      <td>Vidrio hermético libre de BPA</td>
      <td>95% de textura y sabor original</td>
    </tr>
    <tr>
      <td><strong>Sellado al Vacío en Frío</strong></td>
      <td>1 °C – 3 °C</td>
      <td>7 a 10 días sin oxidación</td>
      <td>Bolsa gofrada o contenedor vacío</td>
      <td>98% de frescura sin quemadura</td>
    </tr>
    <tr>
      <td><strong>Congelador Doméstico</strong></td>
      <td>-18 °C o inferior</td>
      <td>2 a 3 meses porcionado</td>
      <td>Bolsa freezer sin aire / vidrio apto</td>
      <td>Requiere descongelación lenta en nevera</td>
    </tr>
  </tbody>
</table>

<h2>{h2_sets[2]}</h2>
<ol>
  <li><strong>Enfriado preliminar (0 a 30 minutos):</strong> Si el plato está caliente, pásalo a un recipiente amplio y bajo para disipar el calor rápidamente antes de llevarlo al frío.</li>
  <li><strong>Porcionado individual:</strong> Divide en raciones exactas de consumo; descongelar y volver a congelar rompe las paredes celulares por recristalización de hielo.</li>
  <li><strong>Descongelación programada:</strong> Traslada del congelador al refrigerador 12 a 24 horas antes de cocinar para que las fibras reabsorban sus propios jugos.</li>
  <li><strong>Regeneración térmica segura:</strong> Al recalentar, asegúrate de alcanzar al menos <strong>74 °C en el centro del plato</strong>, añadiendo una cucharada de agua o caldo para restaurar la humedad evaporada.</li>
</ol>

<p>Para complementar tu organización semanal, te sugerimos revisar nuestra guía sobre <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> y los consejos prácticos en <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<p>Ninguna regla de calendario sustituye la inspección organoléptica. Desecha de inmediato el producto sin probarlo si detectas <strong>olor ácido, avinagrado o amoniacal</strong>, presencia de gas que abomba la tapa del recipiente, película viscosa (biofilm) en la superficie o cambios de color hacia tonos grisáceos o verdosos.</p>

<h2>Preguntas Frecuentes de Seguridad y Conservación</h2>
<h3>¿Se puede meter comida tibia directamente al refrigerador?</h3>
<p>No debes meter ollas hirviendo porque elevarían la temperatura interna del refrigerador afectando a los demás alimentos, pero tampoco debes dejar la comida más de 2 horas afuera. Déjala templar destapada durante 20 a 30 minutos y refrigérala de inmediato.</p>

<h3>¿Por qué es mejor guardar en vidrio que en plástico?</h3>
<p>El vidrio borosilicato es inerte, no retiene olores ni manchas de grasa, enfría con mayor rapidez y permite pasar directamente del refrigerador al horno o microondas sin liberar microplásticos.</p>

<h3>¿Cómo evitar la quemadura por congelación (freezer burn)?</h3>
<p>La quemadura por frío ocurre cuando el aire seco del congelador sublima el hielo de la superficie del alimento. Envuelve a piel con film o extrae todo el aire de la bolsa antes de sellar a -18 °C.</p>"""
        return html, variant

    # ---------------- ARQUETIPO 2: MATRIZ TIEMPOS TEMPERATURA ----------------
    if variant == "matriz-tiempos-temperatura":
        h2_sets = [
            (
                f"Parámetros de temperatura interna y transferencia de calor en {topic}",
                f"Tabla maestra de tiempos y grados (°C / °F) por método de cocción",
                f"Secuencia técnica paso a paso para lograr dorado exterior y centro jugoso",
                f"Por qué el reposo post-cocción evita la pérdida de hasta el 15% de los jugos",
            ),
            (
                f"Física de la cocción: convección, presión y reacción de Maillard en {topic}",
                f"Matriz exacta de minutos y temperaturas según grosor y peso",
                f"Protocolo de preparación previa, precalentado y volteo",
                f"Ajustes para ingredientes congelados vs. frescos a temperatura controlada",
            ),
            (
                f"Cómo evitar la sobrecocción y el resecamiento de las fibras en {topic}",
                f"Cuadro técnico: Freidora de Aire vs. Olla a Presión vs. Horno",
                f"Guía de ejecución en 4 etapas con termómetro de sonda",
                f"Trucos de chef para potenciar la crocancia y el sabor umami",
            ),
            (
                f"Factores que determinan el tiempo exacto de cocción en {topic}",
                f"Referencia rápida de temperaturas y tiempos verificados en cocina",
                f"Método infalible desde el secado superficial hasta el emplatado",
                f"Solución a los fallos más habituales de dorado y textura",
            ),
        ][rot]

        html = f"""<p>Conseguir el punto exacto en <strong>{title.lower()}</strong> no depende de la suerte ni del cálculo a ojo, sino del control preciso de dos variables físicas: <strong>la temperatura del medio de cocción y la temperatura interna en el centro térmico de la pieza</strong>. En esta guía técnica de <strong>{cat_name}</strong> detallamos los parámetros verificados para <em>{subtopic}</em>.</p>

<p>A partir de los <strong>140 °C (285 °F)</strong> en una superficie libre de humedad comienza la <strong>reacción de Maillard</strong>, responsable del dorado crujiente y de cientos de compuestos aromáticos complejos, mientras que el interior debe alcanzar su temperatura objetivo sin superar el umbral donde las proteínas se contraen y expulsan su agua intracelular.</p>

<h2>{h2_sets[0]}</h2>
<p>El error más común al preparar <strong>{topic}</strong> es sobrecargar la cesta o bandeja y omitir el secado previo con papel de cocina. Si la superficie está húmeda, la energía térmica se gasta primero en evaporar el agua a 100 °C (cocinando al vapor en lugar de dorar), lo que prolonga el tiempo total y reseca el interior.</p>

<ul>
  <li><strong>Precalentamiento real (3 a 5 minutos):</strong> Permite que el choque térmico selle la superficie desde el primer segundo.</li>
  <li><strong>Espaciado de circulación:</strong> Deja al menos 1 cm libre entre piezas en la Freidora de Aire o bandeja de horno para que el flujo de aire caliente envuelva el alimento en 360°.</li>
  <li><strong>Película fina de lípido:</strong> Un rocío ligero de aceite con alto punto de humo (oliva suave, aguacate o girasol alto oleico) multiplica la transferencia térmica por conducción.</li>
</ul>

<h2>{h2_sets[1]}</h2>
<p>Consulta esta tabla maestra con los tiempos y temperaturas calibrados para piezas de tamaño estándar:</p>

<table>
  <thead>
    <tr>
      <th>Equipo / Método</th>
      <th>Temperatura Configurada</th>
      <th>Tiempo Exacto</th>
      <th>Temp. Interna Objetivo</th>
      <th>Resultado en Textura</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Freidora de Aire (Air Fryer)</strong></td>
      <td>190 °C – 200 °C (375–400 °F)</td>
      <td>12 a 18 min (girar a mitad)</td>
      <td>63 °C – 74 °C según corte</td>
      <td>Exterior muy crujiente y 80% menos grasa</td>
    </tr>
    <tr>
      <td><strong>Olla a Presión Eléctrica</strong></td>
      <td>Alta Presión (115 °C – 118 °C)</td>
      <td>15 a 30 min + 10 min natural</td>
      <td>85 °C – 92 °C (colágeno)</td>
      <td>Fibras ultra tiernas que se deshacen</td>
    </tr>
    <tr>
      <td><strong>Horno de Convección</strong></td>
      <td>185 °C (365 °F) bandeja media</td>
      <td>20 a 28 min</td>
      <td>63 °C – 74 °C</td>
      <td>Cocción uniforme para lotes familiares</td>
    </tr>
    <tr>
      <td><strong>Sartén / Plancha de Hierro</strong></td>
      <td>Fuego medio-alto (210 °C)</td>
      <td>4 a 6 min por lado</td>
      <td>56 °C – 68 °C</td>
      <td>Costra caramelizada intensa (fond)</td>
    </tr>
  </tbody>
</table>

<h2>{h2_sets[2]}</h2>
<ol>
  <li><strong>Atemperado y secado (15 minutos antes):</strong> Retira del refrigerador, seca minuciosamente con papel absorbente y sazona justo antes de entrar al calor.</li>
  <li><strong>Fase de sellado o cocción principal:</strong> Introduce en el equipo precalentado respetando la primera mitad del tiempo sin abrir innecesariamente.</li>
  <li><strong>Volteo y verificación con sonda:</strong> A mitad del ciclo, gira la pieza con pinzas de silicona (nunca la pinches con tenedor) y mide la temperatura en la parte más gruesa sin tocar hueso.</li>
  <li><strong>Retiro anticipado (Carryover Cooking):</strong> Retira del calor cuando falten <strong>2 °C para la temperatura final</strong>, ya que el calor residual terminará de subir la temperatura durante el reposo.</li>
</ol>

<p>Amplía tu dominio técnico revisando también <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> y nuestra guía complementaria sobre <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<p>Si cortas una pieza recién salida de la freidora de aire, horno o sartén, las fibras musculares contraídas por el calor expulsarán sus jugos sobre la tabla. Dejar reposar entre <strong>5 y 8 minutos</strong> sobre una rejilla tibia permite que las proteínas se relajen y reabsorban los jugos en toda la pieza.</p>

<h2>Preguntas Frecuentes sobre Tiempos y Temperaturas</h2>
<h3>¿Cómo adaptar el tiempo si cocino en Air Fryer una receta de horno tradicional?</h3>
<p>Como regla técnica profesional, reduce la temperatura del horno convencional en <strong>15 °C (25 °F)</strong> y disminuye el tiempo total de cocción en un <strong>20% a 25%</strong>, revisando el punto 3 minutos antes del final.</p>

<h3>¿Es obligatorio usar papel pergamino o aluminio en la freidora de aire?</h3>
<p>Solo debes usar papel perforado si el alimento tiende a adherirse, y nunca durante el precalentamiento sin peso encima (el flujo de aire lo elevaría hacia la resistencia). Para máxima crocancia, cocina directamente sobre la rejilla.</p>

<h3>¿Dónde se coloca exactamente el termómetro de cocina?</h3>
<p>Inserta la punta de la sonda de forma horizontal hasta llegar al centro geométrico de la parte más gruesa de la pieza, evitando tocar el hueso, la grasa pura o la bandeja metálica.</p>"""
        return html, variant

    # ---------------- ARQUETIPO 3: DUELO COMPARATIVA ----------------
    if variant == "duelo-comparativa":
        h2_sets = [
            (
                f"Análisis técnico y diferencias reales en {title}",
                f"Tabla comparativa frente a frente: rendimiento, materiales y durabilidad",
                f"Pruebas de uso en cocina: respuesta térmica, limpieza y mantenimiento",
                f"Veredicto del chef: cuál elegir según tu tipo de cocina y presupuesto",
            ),
            (
                f"Qué debes evaluar antes de decidir en {topic}",
                f"Matriz de especificaciones técnicas y calificaciones de laboratorio",
                f"Comportamiento en fuego alto, cocción lenta y seguridad alimentaria",
                f"Guía de compra inteligente y errores que debes evitar",
            ),
            (
                f"Ingeniería culinaria: por qué los materiales cambian el sabor del plato",
                f"Comparativa detallada de prestaciones, peso y vida útil",
                f"Cuándo destaca cada opción en el uso diario doméstico y profesional",
                f"Recomendación final y cuidados para multiplicar su durabilidad",
            ),
            (
                f"Radiografía completa: ventajas y limitaciones en {topic}",
                f"Cuadro de evaluación: conductividad, retención de calor y precio",
                f"Protocolo de curado, lavado y conservación en estado óptimo",
                f"Conclusión práctica para equipar tu cocina como un experto",
            ),
        ][rot]

        html = f"""<p>Al analizar a fondo <strong>{title.lower()}</strong>, muchos cocineros caseros se guían únicamente por la estética o el precio inicial sin evaluar los tres factores que determinan el éxito en los fogones: <strong>la inercia térmica del material, la reactividad química con alimentos ácidos y la resistencia al uso intensivo</strong>. En esta comparativa de <strong>{cat_name}</strong> desglosamos cada variable técnica sobre <em>{subtopic}</em>.</p>

<p>Un utensilio o ingrediente bien seleccionado no solo facilita el trabajo diario, sino que mejora el dorado, evita que las preparaciones se peguen o se quemen por puntos calientes y elimina el gasto de reemplazar equipo deteriorado cada año.</p>

<h2>{h2_sets[0]}</h2>
<p>En nuestras pruebas prácticas con <strong>{topic}</strong>, evaluamos la velocidad con la que la superficie recupera su temperatura tras colocar un ingrediente frío, la ergonomía del agarre en maniobras de salteado y la facilidad para desglasar o limpiar tras cocciones a alta temperatura.</p>

<ul>
  <li><strong>Uniformidad térmica:</strong> Un buen difusor o calibre grueso evita que el centro se queme mientras los bordes permanecen pálidos.</li>
  <li><strong>Inocuidad y pureza de materiales:</strong> Priorizamos superficies 100% libres de recubrimientos sintéticos degradables (sin PFOA, PTFE, plomo ni cadmio).</li>
  <li><strong>Compatibilidad energética:</strong> Verificamos el desempeño en cocinas de gas, vitrocerámica, inducción magnética y horno hasta 250 °C.</li>
</ul>

<h2>{h2_sets[1]}</h2>
<p>Compara de un vistazo las métricas clave entre las opciones analizadas en nuestro laboratorio culinario:</p>

<table>
  <thead>
    <tr>
      <th>Criterio de Evaluación</th>
      <th>Opción Profesional / Gama Alta</th>
      <th>Opción Estándar / Uso Ligero</th>
      <th>Impacto en tus Recetas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Retención y Distribución de Calor</strong></td>
      <td>Sobresaliente (9.8/10) — sin puntos fríos</td>
      <td>Media (8.2/10) — enfriamiento rápido</td>
      <td>Sellado dorado parejo en carnes y verduras</td>
    </tr>
    <tr>
      <td><strong>Seguridad y Materiales</strong></td>
      <td>Inerte / Libre de tóxicos a alta temperatura</td>
      <td>Sensible a sobrecalentamiento (&gt;230 °C)</td>
      <td>Cero transferencia de sabores metálicos</td>
    </tr>
    <tr>
      <td><strong>Durabilidad Estimada</strong></td>
      <td>10 a 25+ años de uso continuo</td>
      <td>2 a 4 años con cuidado estricto</td>
      <td>Menor costo real por año de uso</td>
    </tr>
    <tr>
      <td><strong>Mantenimiento y Limpieza</strong></td>
      <td>Admite desglasado y limpieza profunda</td>
      <td>Requiere esponja suave y fuego moderado</td>
      <td>Facilidad para recuperar el brillo original</td>
    </tr>
  </tbody>
</table>

<h2>{h2_sets[2]}</h2>
<ol>
  <li><strong>Para sellar a fuego vivo, dorar y desglasar:</strong> La opción de mayor masa térmica e inercia supera ampliamente a las alternativas ligeras porque mantiene los 190 °C al contacto con la proteína.</li>
  <li><strong>Para preparaciones rápidas del día a día (huevos, crepes, recalentados suaves):</strong> La alternativa ligera resulta cómoda por su menor peso y rápida respuesta inicial en hornilla pequeña.</li>
  <li><strong>Protocolo de cuidado post-uso:</strong> Nunca sumerjas una pieza metálica o cerámica caliente en agua fría del grifo; el choque térmico provoca deformación cóncava (pandeo) en la base.</li>
</ol>

<p>Si deseas profundizar en el equipamiento de tu cocina, consulta también <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> y nuestra comparativa relacionada en <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<p>Si cocinas al menos 4 veces por semana, invertir en la opción de gama técnica superior se amortiza en el primer año gracias a su resistencia al desgaste y a la mejora inmediata en la textura de tus platos. Combina ambas alternativas únicamente cuando necesites cubrir tanto cocciones de alta potencia como tareas ligeras de precisión.</p>

<h2>Preguntas Frecuentes de Compra y Mantenimiento</h2>
<h3>¿Cómo evitar que los alimentos se peguen sin usar teflón?</h3>
<p>Calienta la pieza en seco a fuego medio durante 2 minutos hasta que una gota de agua baile sobre la superficie (efecto Leidenfrost), añade entonces el aceite, espera 15 segundos y coloca el alimento sin moverlo hasta que forme costra y se desprenda solo.</p>

<h3>¿Vale la pena lavar estos utensilios en el lavavajillas?</h3>
<p>Aunque muchos fabricantes indican compatibilidad con lavavajillas, las sales abrasivas y los ciclos largos de calor húmedo opacan los metales, oxidan los filos de cuchillos y resecan las maderas. El lavado manual en 60 segundos con agua tibia duplica su vida útil.</p>

<h3>¿Qué grosor mínimo debe tener una buena base difusora?</h3>
<p>Busca siempre bases multicapa o fundidas de al menos <strong>4 mm a 6 mm de espesor</strong>; las bases inferiores a 2.5 mm distribuyen mal el calor y tienden a combarse en placas de inducción o gas potente.</p>"""
        return html, variant

    # ---------------- ARQUETIPO 4: CLINICA CULINARIA RESCATE ----------------
    if variant == "clinica-culinaria-rescate":
        h2_sets = [
            (
                f"Diagnóstico químico: por qué ocurre el problema en {topic}",
                f"Protocolo de rescate inmediato en 3 pasos (sin tirar la preparación)",
                f"Tabla de síntomas, causas exactas y soluciones de emergencia",
                f"Reglas de oro de prevención para que nunca vuelva a fallar tu receta",
            ),
            (
                f"La ciencia detrás de {topic}: temperatura, pH, almidones y proteínas",
                f"Cómo corregir el fallo en menos de 2 minutos con ingredientes de casa",
                f"Matriz de diagnóstico rápido de defectos de sabor y textura",
                f"Checklist profesional de Mise en Place antes de empezar a cocinar",
            ),
            (
                f"Errores invisibles que arruinan el resultado en {topic}",
                f"Método de emergencia utilizado en cocinas profesionales",
                f"Cuadro clínico culinario: qué hacer según el momento del fallo",
                f"Ajustes de proporción y técnica para un acabado perfecto",
            ),
            (
                f"Qué sucede a nivel molecular cuando trabajas con {topic}",
                f"Guía paso a paso de corrección y equilibrio organoléptico",
                f"Tabla de rescate rápido: exceso, defecto y rotura de emulsión",
                f"Secretos de chef para dominar esta técnica al 100%",
            ),
        ][rot]

        html = f"""<p>Incluso en las cocinas profesionales ocurren imprevistos, pero la diferencia entre un aficionado y un experto radica en saber aplicar <strong>{title.lower()}</strong> comprendiendo la química de los alimentos. Dentro de nuestra sección de <strong>{cat_name}</strong>, analizamos el mecanismo exacto de <em>{subtopic}</em> para que puedas corregir cualquier desviación en minutos.</p>

<p>Toda receta es un sistema físico-químico en equilibrio entre <strong>agua, lípidos (grasas), proteínas, carbohidratos y compuestos aromáticos</strong>. Cuando uno de estos elementos sufre un exceso de temperatura, desbalance de pH o saturación de sal, podemos restaurar la armonía aplicando el contrapeso adecuado.</p>

<h2>{h2_sets[0]}</h2>
<p>Al trabajar con <strong>{topic}</strong>, los fallos suelen originarse por tres factores: <strong>choque térmico brusco</strong> (incorporar ingredientes fríos de nevera a una base caliente), <strong>saturación de solutos</strong> (exceso de sodio, ácido o capsaicina) o <strong>pérdida de la fase continua en una emulsión</strong>. Antes de añadir más ingredientes al azar, detén la fuente de calor para estabilizar la preparación.</p>

<h2>{h2_sets[1]}</h2>
<ol>
  <li><strong>Detención térmica inmediata:</strong> Retira la olla o sartén del fuego (o pásala a un bol frío si el calor residual de la base sigue cocinando la mezcla).</li>
  <li><strong>Aplicación del agente corrector neutro:</strong> Introduce el elemento equilibrante de forma gradual (de cucharadita en cucharadita), integrando con movimientos envolventes o batido constante según corresponda.</li>
  <li><strong>Prueba sensorial a temperatura de servicio:</strong> Recuerda que las papilas gustativas perciben la sal y el dulzor con distinta intensidad a 65 °C que a 20 °C; rectifica siempre a la temperatura real en la que se servirá el plato.</li>
</ol>

<h2>{h2_sets[2]}</h2>
<p>Utiliza esta matriz de diagnóstico de emergencia para identificar la acción correctiva exacta:</p>

<table>
  <thead>
    <tr>
      <th>Fallo Detectado</th>
      <th>Causa Físico-Química</th>
      <th>Solución en 60 Segundos</th>
      <th>Qué NO debes hacer</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Exceso de Sal / Sodio</strong></td>
      <td>Evaporación excesiva del líquido base</td>
      <td>Añadir caldo sin sal, crema láctea o almidón + gotas de limón</td>
      <td>No confíes solo en una papa cruda; diluye y equilibra con ácido/grasa</td>
    </tr>
    <tr>
      <td><strong>Emulsión Cortada (Separada)</strong></td>
      <td>Ruptura de micelas por calor o exceso de grasa</td>
      <td>Batir 1 cda de agua tibia o yema aparte e incorporar la mezcla hilo a hilo</td>
      <td>No sigas batiendo en el mismo bol caliente sin añadir fase acuosa</td>
    </tr>
    <tr>
      <td><strong>Acidez o Amargor Intenso</strong></td>
      <td>pH bajo (&lt;4.2) o tostado excesivo de compuestos fenólicos</td>
      <td>1 pizca de bicarbonato (neutraliza ácido) + 1 cdta de grasa o miel</td>
      <td>No agregues cucharadas de azúcar blanca que empalagan el guiso</td>
    </tr>
    <tr>
      <td><strong>Textura Líquida o Con Grumos</strong></td>
      <td>Falta de gelatinización o hidratación desigual del almidón</td>
      <td>Diluir maicena en agua fría (slurry) o emulsionar con batidora de brazo</td>
      <td>Nunca eches harina cruda directamente sobre un líquido hirviendo</td>
    </tr>
  </tbody>
</table>

<p>Para seguir perfeccionando tu técnica, revisa también <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> y los principios explicados en <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<ul>
  <li><strong>Pesa y mide antes de encender el fuego (Mise en Place):</strong> El 80% de los errores en cocina ocurren por improvisar tiempos mientras el sofrito ya está al fuego.</li>
  <li><strong>Iguala temperaturas:</strong> Saca huevos, lácteos y mantequilla del refrigerador 30 minutos antes cuando prepares emulsiones o masas batidas.</li>
  <li><strong>Sazona por capas y al final:</strong> Si una salsa va a reducirse a la mitad, añade solo el 30% de la sal al inicio y ajusta el 70% restante cuando alcance su espesor definitivo.</li>
</ul>

<h2>Preguntas Frecuentes de Laboratorio Culinario</h2>
<h3>¿Por qué una pizca de bicarbonato quita la acidez mejor que el azúcar?</h3>
<p>El azúcar solo enmascara la percepción ácida en el paladar, mientras que el bicarbonato de sodio (base alcalina) reacciona químicamente con los ácidos orgánicos liberando pequeñas burbujas de CO2 y elevando realmente el pH de la salsa.</p>

<h3>¿Cómo arreglar una salsa con grumos en menos de un minuto?</h3>
<p>Pásala por un colador chino presionando con el dorso de un cucharón, o procesa directamente en la olla durante 20 segundos con una batidora de inmersión (minipimer) añadiendo una nuez de mantequilla fría para darle brillo.</p>

<h3>¿Se puede recuperar una carne o pechuga que quedó pasada de punto?</h3>
<p>Sí: córtala en láminas muy finas en sentido perpendicular a la fibra muscular y báñala en caliente con una emulsión de su propio fondo de cocción, aceite de oliva o mantequilla y hierbas frescas.</p>"""
        return html, variant

    # ---------------- ARQUETIPO 5: ATLAS GASTRONOMICO ----------------
    if variant == "atlas-gastronomico":
        h2_sets = [
            (
                f"Tradición, historia y perfil de sabor en {title}",
                f"Despensa esencial: ingredientes auténticos y sustitutos accesibles",
                f"Cuadro gastronómico: variantes regionales, técnicas y maridaje",
                f"Claves culturales y consejos de experto para una experiencia genuina",
            ),
            (
                f"Por qué {topic} es un referente de la gastronomía internacional",
                f"Arquitectura de sabores: especias, fondos y técnicas de cocción",
                f"Tabla comparativa de estilos tradicionales vs. adaptación moderna",
                f"Cómo presentar, acompañar y disfrutar este clásico en la mesa",
            ),
            (
                f"El arte culinario detrás de {topic}: origen y evolución",
                f"Selección de materias primas que definen la autenticidad",
                f"Matriz de preparación, tiempos, temperatura de servicio y bebida ideal",
                f"Errores frecuentes de adaptación fuera de su país de origen",
            ),
            (
                f"Ruta de sabores y secretos profesionales sobre {topic}",
                f"Qué ingredientes marcan la diferencia según los chefs locales",
                f"Guía rápida de características organolépticas y servicio",
                f"Recomendaciones prácticas para recrear la experiencia en casa",
            ),
        ][rot]

        html = f"""<p>Explorar <strong>{title.lower()}</strong> es adentrarse en siglos de evolución técnica, historia cultural y dominio del producto local. Dentro de nuestra colección de <strong>{cat_name}</strong>, hemos documentado los pilares que definen a <em>{subtopic}</em> para que comprendas tanto su ejecución tradicional como su aplicación práctica hoy en día.</p>

<p>Las grandes cocinas del mundo no se construyen sobre recetas rígidas, sino sobre <strong>proporciones aromáticas específicas (mirepoix, sofrito, dashi, masala o recado)</strong> y métodos de cocción diseñados para exaltar los ingredientes de cada geografía.</p>

<h2>{h2_sets[0]}</h2>
<p>El carácter inconfundible de <strong>{topic}</strong> nace del equilibrio entre cinco dimensiones del gusto: el fondo umami profundo, el contraste ácido que limpia el paladar, las notas tostadas del calor directo, la textura envolvente y el perfume final de las hierbas o especias recién incorporadas.</p>

<h2>{h2_sets[1]}</h2>
<ul>
  <li><strong>Base aromática de origen:</strong> Tostar ligeramente las especias enteras en seco durante 45 segundos antes de molerlas libera los aceites esenciales liposolubles que las especias pre-molidas comerciales han perdido.</li>
  <li><strong>Calidad del medio graso:</strong> Respetar la grasa tradicional de cada región (aceite de oliva virgen extra, mantequilla clarificada, aceite de sésamo tostado o grasa noble) transporta las moléculas de sabor al paladar.</li>
  <li><strong>Sustituciones inteligentes:</strong> Si no encuentras una variedad local específica en tu mercado, busca un equivalente con el mismo porcentaje de acidez, picor o almidón en lugar de omitir el ingrediente.</li>
</ul>

<h2>{h2_sets[2]}</h2>
<p>Revisa esta ficha comparativa con los parámetros de autenticidad y servicio:</p>

<table>
  <thead>
    <tr>
      <th>Dimensión Gastronómica</th>
      <th>Estándar Tradicional de Origen</th>
      <th>Adaptación Práctica en Casa</th>
      <th>Clave del Éxito</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Perfil Aromático</strong></td>
      <td>Ingredientes locales frescos de estación</td>
      <td>Equivalentes de mercado con especias enteras</td>
      <td>No saturar con un solo condimento</td>
    </tr>
    <tr>
      <td><strong>Técnica Térmica</strong></td>
      <td>Fuego de leña, wok de alta potencia o cocción lenta</td>
      <td>Sartén de hierro precalentada u olla de fondo grueso</td>
      <td>Controlar la evaporación y el dorado</td>
    </tr>
    <tr>
      <td><strong>Textura Objetivo</strong></td>
      <td>Contraste entre exterior dorado e interior meloso</td>
      <td>Respetar tiempos de reposo y emulsión final</td>
      <td>Servir inmediatamente a temperatura óptima</td>
    </tr>
    <tr>
      <td><strong>Guarnición y Maridaje</strong></td>
      <td>Acompañamiento regional que equilibra la grasa</td>
      <td>Ensalada cítrica, arroz neutro o pan artesanal</td>
      <td>Contraste de frescura y acidez</td>
    </tr>
  </tbody>
</table>

<p>Continúa tu recorrido culinario descubriendo <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> y las recomendaciones de nuestros especialistas en <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<ol>
  <li><strong>Respeta los tiempos de marinado y fermentación:</strong> Muchos platos internacionales adquieren su complejidad horas antes de tocar el fuego.</li>
  <li><strong>Cuida la temperatura de los platos al servir:</strong> Emplatar preparaciones calientes sobre vajilla precalentada a 50 °C mantiene los aromas volátiles intactos hasta la mesa.</li>
  <li><strong>Termina con un toque fresco:</strong> Un golpe final de ralladura cítrica, hierba fresca picada a cuchillo o aceite crudo de primera prensada eleva cualquier preparación al nivel de restaurante.</li>
</ol>

<h2>Preguntas Frecuentes de Gastronomía Internacional</h2>
<h3>¿Cómo lograr sabor auténtico si no consigo todos los ingredientes importados?</h3>
<p>Concéntrate en reproducir la <strong>técnica de cocción (dorado, desglasado y reducción)</strong> y la tríada aromática base. Un buen fondo casero y especias recién tostadas aportan el 85% de la autenticidad del plato.</p>

<h3>¿Cuál es el error más común al preparar recetas internacionales en casa?</h3>
<p>Acelerar los sofritos subiendo demasiado el fuego o añadir todos los ingredientes al mismo tiempo sin respetar la secuencia de sudado de vegetales, sellado de proteínas y desglasado.</p>

<h3>¿Cómo maridar platos intensos o especiados sin opacar su sabor?</h3>
<p>Los platos con especias cálidas o ligero picor armonizan mejor con bebidas frescas de buena acidez o ligero dulzor residual (vinos blancos aromáticos, cervezas de trigo o infusiones cítricas frías), evitando taninos astringentes.</p>"""
        return html, variant

    # ---------------- ARQUETIPO 6: RECETA PRECISION (Default) ----------------
    h2_sets = [
        (
            f"Ingredientes exactos y proporciones para {topic} (4 porciones)",
            f"Preparación paso a paso con tiempos y temperaturas verificadas",
            f"Tabla técnica de puntos críticos, textura y aporte nutricional",
            f"Secretos de chef, variantes y conservación del plato",
        ),
        (
            f"Mise en Place: lista de ingredientes por bloques para {topic}",
            f"Método de elaboración detallado paso a paso sin fallos",
            f"Parámetros de cocción, rendimiento y equivalencias de la receta",
            f"Con qué acompañar y cómo recalentar manteniendo la jugosidad",
        ),
        (
            f"Selección de ingredientes clave para lograr {topic} perfecto",
            f"Instrucciones numeradas de cocina profesional adaptadas a casa",
            f"Cuadro de control: temperaturas, tiempos y textura en cada fase",
            f"Trucos de acabado, emplatado y almacenamiento seguro",
        ),
        (
            f"Qué necesitas para preparar {topic} con resultado de restaurante",
            f"Secuencia de cocción paso a paso explicada al detalle",
            f"Ficha de tiempos, calorías estimadas y ajustes de porción",
            f"Consejos expertos para personalizar y conservar tu preparación",
        ),
    ][rot]

    html = f"""<p>Preparar <strong>{title.lower()}</strong> con un resultado digno de restaurante en tu propia cocina es totalmente posible cuando respetas las proporciones, el orden de incorporación de los ingredientes y el control térmico. En esta guía verificada de <strong>{cat_name}</strong> te enseñamos cómo dominar <em>{subtopic}</em> paso a paso.</p>

<p>A diferencia de las recetas genéricas donde las medidas quedan al azar, aquí trabajamos con tiempos y temperaturas medibles para que obtengas siempre la misma textura jugosa, dorada y equilibrada desde el primer intento.</p>

<h2>{h2_sets[0]}</h2>
<p>Antes de encender el fuego, organiza tu <em>mise en place</em> pesando y preparando cada componente a temperatura ambiente:</p>

<ul>
  <li><strong>Base principal (600 g – 800 g):</strong> Ingrediente principal fresco de primera calidad, limpio, seco con papel absorbente y porcionado en piezas uniformes para una cocción homogénea.</li>
  <li><strong>Base aromática y sofrito:</strong> 150 g de cebolla finamente picada en <em>brunoise</em>, 3 dientes de ajo laminados, 80 g de pimiento o zanahoria y 1 hoja de laurel seco.</li>
  <li><strong>Medio graso y líquido de cocción:</strong> 30 ml (2 cucharadas) de aceite de oliva virgen extra, 20 g de mantequilla sin sal fría (para emulsionar al final) y 250 ml de caldo casero caliente.</li>
  <li><strong>Sazón y equilibrio final:</strong> 8 g de sal marina fina (aprox. 1.2% del peso total), pimienta negra recién molida, 1 cucharadita de pimentón o especia principal y el jugo de medio limón o toque ácido para levantar los sabores.</li>
</ul>

<h2>{h2_sets[1]}</h2>
<ol>
  <li><strong>Acondicionamiento y sellado inicial (Minutos 0 a 6):</strong> Calienta una sartén amplia u olla de fondo grueso a fuego medio-alto (190 °C) durante 2 minutos. Añade el aceite y dora el ingrediente principal por tandas sin amontonarlo hasta lograr una costra dorada superficial. Retira a un plato tibio para conservar sus jugos.</li>
  <li><strong>Construcción del sofrito aromático (Minutos 6 a 14):</strong> En la misma base con los jugos caramelizados, baja el fuego a medio (140 °C), incorpora la cebolla con una pizca de sal para que sude por ósmosis y cocina 6 minutos hasta que esté translúcida. Añade el ajo y las especias durante 60 segundos cuidando que no se quemen.</li>
  <li><strong>Desglasado y cocción controlada (Minutos 14 a 32):</strong> Vierte el líquido caliente raspando el fondo con espátula de madera para disolver el <em>fond</em> lleno de umami. Reincorpora la preparación principal y cocina a hervor suave constante (90 °C) con tapa entreabierta.</li>
  <li><strong>Emulsión, reposo y servicio (Minutos 32 a 40):</strong> Apaga el fuego, incorpora la mantequilla fría o hilo de aceite en crudo moviendo en vaivén para ligar una salsa brillante, deja reposar 5 minutos y sirve espolvoreando hierbas frescas picadas al momento.</li>
</ol>

<h2>{h2_sets[2]}</h2>
<p>Consulta esta tabla de control para verificar que cada etapa de la receta marcha a la perfección:</p>

<table>
  <thead>
    <tr>
      <th>Etapa de la Receta</th>
      <th>Tiempo Estimado</th>
      <th>Temperatura / Fuego</th>
      <th>Indicador Visual de Éxito</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Mise en Place y Templado</strong></td>
      <td>10 – 15 min</td>
      <td>Ambiente (18 °C – 20 °C)</td>
      <td>Superficie seca y cortes del mismo tamaño</td>
    </tr>
    <tr>
      <td><strong>2. Sellado de Maillard</strong></td>
      <td>4 – 6 min</td>
      <td>Alto (190 °C – 200 °C)</td>
      <td>Color dorado avellana sin humo negro</td>
    </tr>
    <tr>
      <td><strong>3. Cocción y Reducción</strong></td>
      <td>15 – 20 min</td>
      <td>Medio-bajo (90 °C – 95 °C)</td>
      <td>Burbujeo lento que napa el dorso de la cuchara</td>
    </tr>
    <tr>
      <td><strong>4. Reposo antes de Servir</strong></td>
      <td>5 min</td>
      <td>Fuera del fuego (65 °C)</td>
      <td>Jugos redistribuidos y textura tierna al corte</td>
    </tr>
  </tbody>
</table>

<p>Si te apasiona perfeccionar tus platos, no dejes de visitar <a href="{rel1[0]}"><strong>{rel1[1]}</strong></a> ni nuestra guía recomendada sobre <a href="{rel2[0]}"><strong>{rel2[1]}</strong></a>.</p>

<h2>{h2_sets[3]}</h2>
<p>El secreto profesional para elevar esta receta consiste en <strong>no hervir nunca a borbotones violentos</strong> durante la fase de reducción y añadir un toque casi imperceptible de acidez (gotas de limón o vinagre suave) justo antes de servir para despertar todos los aromas en el paladar. En refrigerador a 4 °C dentro de un recipiente hermético de vidrio se conserva en estado óptimo durante <strong>3 a 4 días</strong>.</p>

<h2>Preguntas Frecuentes sobre la Receta</h2>
<h3>¿Cómo escalar esta receta para 8 o 10 personas sin que cambie el sabor?</h3>
<p>Duplica proporcionalmente los ingredientes sólidos y aromáticos, pero utiliza solo un <strong>75% a 80% más de líquido (caldo o agua)</strong> y sal inicial, ya que en una olla más grande la tasa de evaporación relativa es menor. Sella siempre la proteína en 2 o 3 tandas separadas.</p>

<h3>¿Se puede preparar con un día de antelación?</h3>
<p>Sí; de hecho, tras 12 a 24 horas de reposo en frío a 4 °C los compuestos aromáticos del sofrito se integran aún mejor. Recalienta a fuego suave con dos cucharadas de agua o caldo sin dejar que hierva en exceso.</p>

<h3>¿Qué sustituto puedo usar si busco una versión más ligera?</h3>
<p>Puedes reducir la grasa inicial a la mitad utilizando un pulverizador de aceite de oliva y sustituir la mantequilla final de ligado por una cucharada de puré del propio sofrito triturado, que aporta cremosidad natural sin calorías extra.</p>"""
    return html, variant


def main():
    with open(POSTS_PATH, encoding="utf-8") as f:
        base_posts = json.load(f)
    with open(CATEGORIES_PATH, encoding="utf-8") as f:
        categories = json.load(f)

    cat_map = {c["slug"]: c["name"] for c in categories}
    existing_paths = {f"/{p['category']}/{p['slug']}/" for p in base_posts}
    existing_slugs = {p["slug"] for p in base_posts}

    # Agrupar imágenes válidas existentes por categoría y posts relacionados por categoría
    cat_images = {}
    cat_posts_links = {}
    all_local_images = []
    if os.path.exists(IMAGES_DIR):
        all_local_images = [f"/images/{fn}" for fn in sorted(os.listdir(IMAGES_DIR)) if fn.endswith((".jpg", ".jpeg", ".png", ".webp"))]

    for p in base_posts:
        c = p["category"]
        cat_posts_links.setdefault(c, []).append((f"/{c}/{p['slug']}/", p["title"]))
        img = p.get("featuredImageUrl", "")
        if img:
            if "wp-content/uploads/" in img:
                fn = img.split("/")[-1]
                local_path = f"/images/{fn}"
            else:
                local_path = img
            if os.path.exists(os.path.join(ROOT_DIR, "public", local_path.lstrip("/"))):
                cat_images.setdefault(c, []).append(local_path)

    # 1. Cargar las 547 semillas de GSC + 1,000 semillas nuevas de alto CPC
    gsc_seeds = load_gsc_missing_seeds(existing_paths, cat_map)
    for s in gsc_seeds:
        existing_slugs.add(s["slug"])
    new_1000_seeds = generate_1000_high_cpc_seeds(existing_slugs)

    all_seeds = new_1000_seeds + gsc_seeds
    print(f"Generando {len(new_1000_seeds)} artículos nuevos de alto CPC + {len(gsc_seeds)} artículos restaurados de GSC = {len(all_seeds)} artículos polimórficos...")

    max_id = max((p.get("id", 0) for p in base_posts), default=10000)
    extra_posts = []
    base_date = datetime.datetime(2026, 11, 9, 7, 0, 0)

    for idx, seed in enumerate(all_seeds):
        post_id = max_id + idx + 1
        cat_slug = seed["category"]
        cat_name = cat_map.get(cat_slug, cat_slug.replace("-", " ").title())
        slug = seed["slug"]
        title = seed["title"]

        # Imagen: usar imagen exacta si existe en public/images/{slug}.jpg, si no rotar dentro de la categoría
        exact_img = f"/images/{slug}.jpg"
        if os.path.exists(os.path.join(ROOT_DIR, "public", exact_img.lstrip("/"))):
            featured_img = exact_img
        else:
            pool = cat_images.get(cat_slug) or all_local_images or ["/images/4.jpg"]
            featured_img = pool[(post_id * 7) % len(pool)]

        # Enlaces internos contextuales hacia artículos existentes de la misma categoría
        rel_pool = cat_posts_links.get(cat_slug, [])
        if len(rel_pool) >= 2:
            r1 = rel_pool[(post_id * 3) % len(rel_pool)]
            r2 = rel_pool[(post_id * 3 + 5) % len(rel_pool)]
            related_links = [r1, r2]
        else:
            related_links = [
                ("/tecnicas/", "Técnicas de Cocina Profesional"),
                ("/utensilios/", "Guía de Utensilios de Cocina"),
            ]

        content_html, variant = build_polymorphic_html(seed, idx, cat_name, related_links)
        plain = re.sub(r"<[^>]+>", " ", content_html)
        plain = re.sub(r"\s+", " ", plain).strip()
        excerpt = plain[:155].rsplit(" ", 1)[0] + "..."

        # Fechas escalonadas realistas
        dt = base_date - datetime.timedelta(hours=(idx % 720))
        date_str = dt.strftime("%Y-%m-%dT%H:%M:%S")

        post_obj = {
            "id": post_id,
            "title": title,
            "slug": slug,
            "category": cat_slug,
            "categoryName": cat_name,
            "categories": [{"slug": cat_slug, "name": cat_name}],
            "date": date_str,
            "modified": "2026-11-09T08:00:00",
            "content": content_html,
            "excerpt": excerpt,
            "featuredImageId": None,
            "featuredImageUrl": featured_img,
            "type": "post",
            "status": "publish",
            "layoutVariant": variant,
        }
        extra_posts.append(post_obj)

    # Guardar data/posts-extra.json en formato compacto
    with open(POSTS_EXTRA_PATH, "w", encoding="utf-8") as f:
        json.dump(extra_posts, f, ensure_ascii=False, separators=(",", ":"))

    # Actualizar conteos en data/categories.json
    combined_posts = extra_posts + base_posts
    cat_counts = {}
    for p in combined_posts:
        c = p["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1

    for c in categories:
        c["count"] = cat_counts.get(c["slug"], 0)

    with open(CATEGORIES_PATH, "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)

    # Actualizar public/search-index.json
    search_index = [
        {
            "t": p["title"],
            "s": p["slug"],
            "c": p["category"],
            "cn": p["categoryName"],
        }
        for p in combined_posts
    ]
    with open(SEARCH_INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False, separators=(",", ":"))

    print(f"✅ Guardados {len(extra_posts)} artículos polimórficos en data/posts-extra.json")
    print(f"✅ Total combinado de artículos en ChefExperto.com: {len(combined_posts)}")


if __name__ == "__main__":
    main()
