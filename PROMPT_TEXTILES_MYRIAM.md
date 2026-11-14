# Textiles Myriam: resumen de la página y prompt para rehacerla

Solo la **página web pública**. La Caja, Google Sheets y el Apps Script quedan para después.
Todo se trabaja y se guarda **en tu computador**, sin publicar nada en internet.

---

## 1. Resumen de la página

**El negocio:** Textiles Myriam, un almacén de telas en Colombia con **más de 50 años**. Es confiable, seguro, con muy buena atención y mucha variedad. Vende telas por metro, cortinas a la medida y cortinas y manteles listos en medidas estándar. **No se publican precios**, porque cambian según la cantidad: "entre más metros, mejor precio".

**Secciones:**
1. **Portada:** foto de rollos de tela, antetítulo "Más de 50 años en el oficio" y el titular **"Todo empieza con una buena tela."** Tiene los botones "Cotizar por WhatsApp" y "Ver telas".
2. **Franja animada** con nombres de telas (gabardina, dril, paño, lino, toalla, satín, velo, yakar…).
3. **Nuestra historia:** "Un almacén de confianza, atendido con paciencia", con los pilares Confianza, Variedad y Atención.
4. **Frase:** "El uniforme del primer día de colegio, el traje del grado, las cortinas de la casa nueva…".
5. **Telas en 6 categorías.** Cada tarjeta abre su propia página, con una foto de cada tela, para qué sirve, sus colores y modelos con su estado (disponible, pocas unidades o agotado), y el botón "Preguntar por esta tela".
6. **Cortinas a la medida** en 4 pasos.
7. **Calculadora de cortinas y manteles listos para poner.**
8. **Cifras:** +50 años, +20 familias de tela, 6 días a la semana.
9. **Visítanos** y pie de página.

**Las 6 categorías:**

| Categoría | Telas |
|---|---|
| Colegios e instituciones | gabardina, dril, lino flex, escocés, género, paño, antifluido (salud y cocina) |
| Trajes y sastrería | paño, dacrón, vértigo, mónaco, gabardina, lino, satín para forro |
| Cortinas | **solo velo** (liso, bordado, rayas y cuadros) **y yakar**. **No manejan blackout** |
| Toallas, sábanas y lencería | toalla por metro, sábana, lencería, microfibra, lienzo, telas para mantel |
| Satín y telas de fiesta | satín, organza, lame, lentejuela, tul, seda |
| Confección y manualidades | muselina, franela, piel de conejo y ovejero, lona, pana, bandera, Navidad |

---

## 2. Prompt para un chat nuevo

Copia todo lo que está dentro del bloque y pégalo como primer mensaje en **Claude Code en tu computador** (la app de escritorio o la terminal), no en una sesión en la nube:

````text
Actúa como diseñador web profesional. Vas a construir la PÁGINA WEB PÚBLICA de "Textiles Myriam", un almacén
de telas en Colombia con más de 50 años: confiable, seguro, con muy buena atención y mucha variedad.
Háblame en español y explícame paso a paso lo que tengo que hacer yo (no soy programador).

IMPORTANTE:
- Todo debe quedar en MI COMPUTADOR, en una carpeta llamada "textiles-myriam". No publiques nada en
  internet ni uses servicios en la nube. Nada de Google Sheets, bases de datos ni conectores: eso lo
  pediré después.
- Al terminar, dime exactamente cómo abrir la página en mi computador. Además, genera una versión de un
  solo archivo (index.html) que pueda abrir con doble clic.

## Tecnología y estilo
- React + Vite + TypeScript + Tailwind v4. Animaciones con GSAP (+ ScrollTrigger y useGSAP), desplazamiento
  suave con Lenis (sincronizado con el ticker de GSAP) y, si puedes, componentes de React Bits (SplitText
  para el titular, ScrollReveal para la frase, Noise para textura, Threads de fondo en la sección oscura de
  cortinas). Si tienes las skills de GSAP, Lenis, React Bits y las de Emil Kowalski, úsalas.
- Rutas por hash: "#telas-instituciones", "#telas-trajes", etc., y anclas para las secciones.
- Identidad: fondo lino crudo #f4eee4, tinta #1d1a16, acento rojo rubia #b0442b, añil #2f3a63. Tipografías
  Fraunces (títulos, con itálicas en rojo para resaltar) y Manrope (texto). Estilo editorial, cálido y
  elegante. Animaciones con curvas ease-out fuertes, que respeten "reducir movimiento".
- Debe verse perfecto en celular: textos legibles, botones grandes, sin scroll horizontal.
- Fotos con licencia libre de Pexels, descargadas y optimizadas dentro del proyecto: rollos de tela
  (portada), manos cortando tela con metro (historia), niños con uniforme, sastre midiendo un saco,
  ventana con cortinas, toallas dobladas, satín azul, mesa de modista, bodega de rollos (visítanos). Y una
  foto de textura para cada tela; si no hay una foto fiel, usa una muestra de color con el texto
  "Pregunta por colores" en vez de una foto que confunda.
- No inventes datos de contacto: deja WhatsApp, dirección, ciudad y horario en un archivo config.ts para
  completarlos. Los botones de WhatsApp deben abrir el chat con un mensaje ya escrito.
- SIN PRECIOS en ninguna parte: cambian según la cantidad ("entre más metros, mejor precio").

## Secciones de la página
1. Barra fija: "Textiles Myriam" (Myriam en itálica) y enlaces Nosotros, Telas, Cortinas, Medidas, Visítanos.
   Transparente sobre la portada y con fondo al bajar.
2. Portada a pantalla completa con foto oscurecida. Antetítulo "Más de 50 años en el oficio". Titular
   animado palabra por palabra: "Todo empieza con una buena tela.". Subtítulo: "Telas para uniformes de
   colegio, trajes, cortinas, lencería y confección. Variedad, buen precio según la cantidad y una atención
   que te ayuda a calcular cuánto llevar." Botones "Cotizar por WhatsApp" y "Ver telas".
3. Franja animada continua con nombres de telas en itálica.
4. Nuestra historia (foto + texto): "Un almacén de confianza, atendido con paciencia." Texto: "Textiles Myriam
   lleva más de 50 años surtiendo a familias, modistas, sastres y colegios. Aquí encuentras variedad de telas,
   precios justos según la cantidad que lleves y alguien que te asesora metro a metro." Pilares: Confianza
   (más de 50 años y generaciones de clientes que vuelven), Variedad (telas para colegio, sastrería, hogar,
   fiesta y temporada), Atención (te ayudamos a escoger y a calcular cuánta llevar).
5. Frase que se revela al hacer scroll: "El uniforme del primer día de colegio, el traje del grado, las
   cortinas de la casa nueva. Hace más de medio siglo que cada metro se mide, se corta y se entrega a mano."
6. "Una tela para cada ocasión": 6 tarjetas con foto y "Ver telas →". Cada una abre su página de categoría:
   - Colegios e instituciones: gabardina, dril, lino flex, escocés, género, paño, antifluido (uniformes de
     colegios, universidades, empresas, clínicas; antifluido para salud y cocina).
   - Trajes y sastrería: paño, dacrón, vértigo, mónaco, gabardina, lino, satín para forro.
   - Cortinas: SOLO velo (liso, bordado, de rayas y cuadros) y yakar. NO manejan blackout.
   - Toallas, sábanas y lencería: toalla por metro, sábana, lencería, microfibra, lienzo, telas para mantel.
   - Satín y telas de fiesta: satín, organza, lame, lentejuela, tul, seda.
   - Confección y manualidades: muselina, franela, piel de conejo y ovejero, lona, pana, tela de bandera,
     telas de Navidad.
   Cada página de categoría tiene: título grande, introducción, foto, botón de WhatsApp, y una cuadrícula con
   cada tela (foto, para qué sirve, "Preguntar por esta tela"). Además, el inventario: cada tela tiene modelos
   y cada modelo tiene colores (con una muestra del color) y un estado: Disponible, Pocas unidades o Agotado
   (tachado). Ejemplo: Yakar → Damasco: Vino (disponible), Beige (pocas), Azul noche (agotado). Por ahora, que
   ese inventario se edite en un archivo de datos fácil de entender; después lo conectaré. Al final de la
   página: "Otras telas" con las demás categorías y un enlace "← Todas las telas" arriba.
7. Cortinas a la medida (sección oscura): "Cortinas hechas para tu ventana." con 4 pasos y una línea que se
   "cose" al hacer scroll: Nos cuentas el espacio → Cotizas y abonas → Confeccionamos → Recoges y pagas el saldo.
8. "Cortinas y manteles listos para poner" (calculadora con dos pestañas):
   - Cortinas: ancho de la ventana y alto deseado (en cm); tipo Velo, Yakar o Juego velo + yakar.
     Barra = ancho + 30 cm. Tela necesaria ≈ 1,8 × barra. Paños estándar de 1,40 / 1,50 / 1,80 m de ancho y
     1,80 / 2,20 / 2,30 m de alto, en pares. Recomienda, por ejemplo, "2 paños de 1,40 × 2,20 m". Si no cabe
     en un estándar, recomienda "a la medida". Dibuja la ventana y las cortinas a escala.
   - Manteles: forma redonda, cuadrada, rectangular u ovalada; medidas de la mesa; caída de 20, 25 o 30 cm.
     Medidas estándar: redondos Ø1,50 – 1,80 – 2,00 – 2,40 – 2,70 m; cuadrados 1,40 – 1,50 – 1,80 – 2,00 m;
     rectangulares 1,40×1,80, 1,50×2,00, 1,50×2,50, 1,80×2,30, 1,50×3,00, 1,80×3,00 m (compara lado largo con
     lado largo). Estima cuántos puestos. Dibujo a escala.
   - En ambas: botón "Pedir por WhatsApp con estas medidas" con el mensaje ya escrito, y una tabla
     desplegable con las medidas estándar de referencia.
9. Cifras animadas: +50 años, +20 familias de tela, 6 días a la semana.
10. "Ven a tocar las telas." con dirección, horario y WhatsApp sobre una foto de bodega. Pie de página con
    "© Textiles Myriam · Más de 50 años" y "Fotos: Pexels".

## Cómo trabajar
- Antes de decirme que está listo, compílala y revísala tú mismo en escritorio y en celular.
- Al final explícame: 1) cómo instalar lo necesario (Node.js) si no lo tengo, 2) cómo abrirla en mi computador
  (npm install y npm run dev, y la dirección http://localhost que debo abrir), 3) dónde está el archivo de un
  solo clic, 4) dónde cambio los datos de contacto, las telas y el inventario.
````

---

## 3. Cómo abrir la página en tu computador

**Opción rápida:** abre con doble clic el archivo `TextilesMyriam.html` que te envié. Se ve en tu navegador sin instalar nada. Para que salgan las tipografías se necesita internet; sin internet se ven otras letras, pero la página funciona igual.

**Opción completa,** para seguir editándola con Claude en tu computador:
1. Instala **Node.js** (versión LTS) desde nodejs.org.
2. Abre la carpeta del proyecto en la terminal y ejecuta `npm install` y luego `npm run dev`.
3. Abre en el navegador la dirección que aparece, por ejemplo `http://localhost:5173`.
