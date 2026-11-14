# Textiles Myriam: resumen del proyecto y prompt para rehacerlo

Este archivo tiene dos partes:

1. **Resumen**: qué se construyó y por qué.
2. **Prompt**: texto para pegar en un chat nuevo con Claude (Claude Code) para que construya la misma página desde cero.

> Atajo: el código completo ya existe en el repositorio `juanjogd99/PROYECTO_NUEVO` (rama `claude/zen-heisenberg-myvdpy`, PR #3). Si el chat nuevo tiene acceso a GitHub, basta con decirle: *"Clona juanjogd99/PROYECTO_NUEVO, lee README.md y PROMPT_TEXTILES_MYRIAM.md y continúa desde ahí"*. Usa el prompt de abajo solo si quieres empezar de cero.

---

## 1. Resumen

### El negocio
- **Textiles Myriam**: almacén de telas en Colombia con **más de 50 años**. Confiable, seguro, buena atención y mucha variedad.
- Vende telas por metro para **uniformes de colegios e instituciones** (gabardina, dril, lino flex, escocés, género, paño, antifluido), **trajes y sastrería** (paño, dacrón, vértigo, mónaco, lino, satín para forro), **cortinas** (solo **velo** y **yakar**; **no maneja blackout**), **hogar** (toalla por metro, sábana, lencería, microfibra, lienzo, telas para mantel), **fiesta** (satín, organza, lame, lentejuela, tul, seda) y **confección** (muselina, franela, piel de conejo, ovejero, lona, pana, bandera, Navidad).
- También vende **cortinas a la medida** (con abono y saldo) y **cortinas y manteles listos** en medidas estándar.
- **Los precios cambian según la cantidad**: detal, o por mayor desde N metros. Antes la dueña los calculaba de memoria; ahora lo hace la app.

### Lo que se construyó
**Página pública** (React + Vite + Tailwind, GSAP, Lenis, React Bits):
- Portada con foto de rollos de tela y el titular **"Todo empieza con una buena tela."**, con el antetítulo "Más de 50 años en el oficio".
- Historia: "Un almacén de confianza, atendido con paciencia", con tres pilares: Confianza, Variedad y Atención.
- Seis categorías de telas. Cada una abre su **propia página** (`#telas-instituciones`, `#telas-trajes`, etc.) con una foto de cada tela, su uso, el **estado de inventario** y los **colores por modelo**. **Sin precios.**
- Cortinas a la medida en 4 pasos.
- **Calculadora de medidas** para cortinas (velo, yakar o juego velo + yakar) y manteles (redonda, cuadrada, rectangular u ovalada), con dibujo a escala y mensaje de WhatsApp ya escrito.
- Secciones de cifras (+50 años, +20 familias de tela, 6 días a la semana) y "Visítanos".

**Caja** (`#caja`), con dos PIN:
- **Equipo**: abre la caja con la base, registra las ventas y gastos **de hoy**, cierra la caja en la noche, y consulta precios y catálogo.
- **Dueña**: todo lo anterior más Balance, todos los movimientos (con edición), **Mis cuentas** (privado), Caja diaria con historial, y edición de precios y catálogo.

**Datos**: Google Sheets mediante un **Apps Script** (Web App). El Apps Script decide qué recibe cada PIN.

### Lo aprendido de los datos de agosto 2026
- El Sheet original tenía pestañas Semana 1 a SEMANA 4 con columnas FECHA, PRODUCTO, VALOR, CANTIDAD, SUB-TOTAL, TOTAL DÍA, FORMA DE PAGO y ASESOR. Mezclaban ventas, gastos y cierres diarios.
- **El 31/08 tenía dos tablas una al lado de la otra** (columnas C:J y L:S): hay que leer ambas.
- Reglas de limpieza:
  - Una fila con producto + valor + cantidad es **Venta**.
  - "SALDO…" o "ABONO…" es **Abono / saldo de pedido**.
  - GASTO, transporte, almuerzo, flete, domicilio, vale o subtotal negativo es **Gasto operativo**.
  - Una compra de tela marcada GASTO es **Compra de mercancía**.
  - Forma de pago vacía = Efectivo. TR = Transferencia. TJ y TG = Tarjeta. QR.
  - Los totales del día y los cierres por forma de pago **no** son movimientos. Los gastos que solo aparecen en el cierre se agregan solo si no estaban ya anotados ese día.
- Resultado: **1.644 movimientos, $65.359.340 de ingresos y $2.730.666 de gastos registrados**, con 86 % en efectivo, 13 % de ventas sin producto y el sábado como mejor día.
- **Privacidad**: las ventas reales **nunca** van en el repositorio ni en la página pública. Solo viven en el Sheet. El repositorio es público.

---

## 2. Prompt para un chat nuevo

Copia todo lo que está dentro del bloque:

````text
Actúa como diseñador web y profesional en finanzas. Vas a construir para mí la página web y la caja de
"Textiles Myriam", un almacén de telas en Colombia con más de 50 años: confiable, seguro, con muy buena
atención y mucha variedad. Háblame en español y explícame paso a paso lo que tengo que hacer yo
(no soy programador).

## Stack y estilo
- React + Vite + TypeScript + Tailwind v4. GSAP (+ ScrollTrigger, useGSAP), Lenis (smooth scroll sincronizado
  con el ticker de GSAP) y componentes de React Bits (Threads, SplitText, ScrollReveal, Noise), descargados del
  registro oficial, nunca escritos de memoria. Si tienes las skills de GSAP, Lenis, React Bits y las de Emil
  Kowalski (animate, choreograph, emil-design-eng…), úsalas.
- Rutas por hash para hosting estático (GitHub Pages): "#caja", "#telas-<categoria>", y anclas de secciones.
- Identidad: fondo lino crudo #f4eee4, tinta #1d1a16, acento rojo rubia #b0442b, añil #2f3a63; tipografías
  Fraunces (títulos) y Manrope (texto). Animaciones con curvas ease-out fuertes, cortas en la interfaz,
  respetando prefers-reduced-motion. Debe verse muy bien en celular (inputs de 16px, safe areas, sin scroll horizontal).
- Fotos con licencia libre de Pexels (se pueden descargar desde images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg),
  optimizadas y servidas desde el proyecto. No inventes precios ni datos de contacto: deja WhatsApp, dirección
  y ciudad en un archivo de configuración para completarlos.

## Página pública
- Portada con foto de rollos de tela, antetítulo "Más de 50 años en el oficio", titular "Todo empieza con una
  buena tela.", subtítulo que mencione uniformes de colegio, trajes, cortinas, lencería y confección, y botones
  "Cotizar por WhatsApp" y "Ver telas".
- Historia breve: "Un almacén de confianza, atendido con paciencia" + pilares Confianza / Variedad / Atención.
- Telas en 6 categorías; cada tarjeta abre su propia página con foto de cada tela, para qué sirve, botón
  "Preguntar por esta tela" (WhatsApp) y el inventario (ver Catálogo). SIN PRECIOS en ninguna parte pública
  ("entre más metros, mejor precio").
  1. Colegios e instituciones: gabardina, dril, lino flex, escocés, género, paño, antifluido (salud/cocina).
  2. Trajes y sastrería: paño, dacrón, vértigo, mónaco, gabardina, lino, satín para forro.
  3. Cortinas: SOLO velo (liso, bordado, rayas/cuadros) y yakar. NO manejan blackout.
  4. Toallas, sábanas y lencería: toalla por metro, sábana, lencería, microfibra, lienzo, telas para mantel.
  5. Satín y telas de fiesta: satín, organza, lame, lentejuela, tul, seda.
  6. Confección y manualidades: muselina, franela, piel de conejo y ovejero, lona, pana, bandera, Navidad.
- Cortinas a la medida en 4 pasos (cuentas el espacio → cotizas y abonas → confeccionamos → recoges y pagas saldo).
- Calculadora "Cortinas y manteles listos para poner":
  - Cortinas: ancho de ventana y alto deseado; tipo velo / yakar / juego velo+yakar. Barra = ancho + 30 cm;
    tela ≈ 1,8 × barra; paños estándar de 1,40 / 1,50 / 1,80 m de ancho y 1,80 / 2,20 / 2,30 m de alto (en pares);
    si no cabe, "a la medida". Dibujo a escala y mensaje de WhatsApp con las medidas.
  - Manteles: forma redonda / cuadrada / rectangular / ovalada, medidas de la mesa y caída 20 / 25 / 30 cm.
    Estándares: Ø1,50–1,80–2,00–2,40–2,70; cuadrados 1,40–1,50–1,80–2,00; rectangulares 1,40×1,80, 1,50×2,00,
    1,50×2,50, 1,80×2,30, 1,50×3,00, 1,80×3,00 (compara lado largo con lado largo). Estima puestos.
- Cifras públicas solo de marca (+50 años, +20 familias de tela, 6 días a la semana). Nunca cifras de ventas.

## Caja (#caja) con dos PIN
- PIN del equipo y PIN de la dueña (distintos). El equipo ve: Hoy, Catálogo, Precios. La dueña ve: Balance,
  Caja diaria, Movimientos, Mis cuentas, Catálogo, Precios, Ajustes. En celular: barra inferior con 4 pestañas,
  botón "+" y menú "Más".
- Apertura y cierre de caja: en la mañana se abre con la base en efectivo y quién abre; sin abrir NO se puede
  facturar. El almuerzo no importa. En la noche se cierra: esperado = base + ventas en efectivo − gastos en
  efectivo; contador de billetes y monedas colombianas (100.000 a 50); dice si cuadra, sobra o falta; después
  del cierre no se factura más ese día. La dueña ve el historial (faltantes/sobrantes) y puede reabrir.
- Registrar movimiento: ingreso/egreso, categoría, producto (sugerencias), cantidad en metros, valor unitario
  que se llena SOLO desde la lista de precios (detal o por mayor según la cantidad, avisando cuántos metros
  faltan para el precio por mayor), forma de pago (Efectivo, Transferencia, Tarjeta, Nequi, QR), asesor, nota.
  "Guardar y otro" para el mostrador. El equipo solo registra/corrige lo de hoy.
- Balance (dueña): saldo neto, ingresos, egresos, ticket promedio; ingresos por día, promedio por día de la
  semana, ventas por familia de tela, formas de pago, egresos por categoría; y una "Lectura financiera"
  automática (egresos subregistrados, exceso de efectivo, ventas sin producto, mejor vs peor día, línea fuerte).
- Movimientos (dueña): tabla ordenable por cualquier columna, buscador, filtros, totales, exportar CSV, editar.
- Mis cuentas (privado, solo dueña): proveedores, nómina, arriendo, impuestos, retiros personales, ahorro.
  Muestra: neto de caja − costos aparte = utilidad estimada (y margen) − retiros + ingresos aparte = queda.
- Precios: calculadora + lista (producto, unidad, detal, por mayor desde, precio mayor). Solo la dueña edita.
- Catálogo: tela → modelos → colores (con muestra de color) y estado Disponible / Pocas unidades / Agotado.
  Solo la dueña edita; el equipo consulta; la página pública lo muestra en cada tela (sin precios).

## Datos: Google Sheets + Apps Script (Web App)
- Pestañas: MOVIMIENTOS (ID, FECHA, TIPO, CATEGORIA, CONCEPTO, CANTIDAD, VALOR_UNITARIO, TOTAL, FORMA_PAGO,
  ASESOR, NOTA, ORIGEN, ACTUALIZADO), PRIVADO (mismas columnas), PRECIOS, CATALOGO (CATEGORIA, TELA, MODELO,
  COLOR, HEX, ESTADO, NOTA), CAJAS (FECHA, ESTADO, BASE, ABRIO, APERTURA, VENTAS_EFECTIVO, GASTOS_EFECTIVO,
  ESPERADO, CONTADO, DIFERENCIA, CERRO, CIERRE, NOTA) y BALANCE con fórmulas (periodo Desde/Hasta en celdas
  amarillas, formas de pago, categorías, semanas, días de la semana, resultado del negocio con PRIVADO y
  cuadre de caja).
- El Apps Script es quien protege: el equipo solo recibe los movimientos de hoy, nunca PRIVADO, no puede
  facturar con la caja sin abrir o cerrada, no edita precios ni catálogo. La lectura pública (sin PIN) devuelve
  SOLO el catálogo. POST como text/plain (evita el preflight CORS). Usa LockService al escribir.
- La página guarda al instante (optimista), tiene cola sin conexión que se sube sola al volver internet, y
  refresca cada 30 s para traer lo editado directamente en el Sheet. Lo de la dueña nunca se guarda en el navegador.
- Sin Sheet conectado: "modo de prueba" que arranca EN CERO (sin ventas); precios y catálogo de ejemplo.
- Entrega también una plantilla de Excel (.xlsx) con todas las pestañas, menús desplegables y fórmulas,
  recalculada y sin errores, para subir a Google Drive. Y un README con los pasos para pegar el Apps Script,
  ejecutar "instalar", publicarlo como Aplicación web (Ejecutar como: Yo · Acceso: Cualquier persona) y
  pegar la URL /exec en Caja → Ajustes.

## Privacidad y publicación
- El repositorio es público: NO subas ventas reales. Esos datos viven solo en el Sheet.
- Publicación gratis en GitHub Pages con un workflow de GitHub Actions al hacer merge a main (variable
  VITE_SHEETS_URL opcional). Recuérdame activar Pages (Source: GitHub Actions) y dar permiso a main en
  Settings → Environments → github-pages.

## Cómo trabajar
- Antes de decir que algo funciona, compílalo, míralo en el navegador (escritorio y celular) y prueba el
  Apps Script con un simulador de Google Sheets (permisos de cada PIN, caja, catálogo).
- Muéstrame una vista previa compartible y explícame cada paso que me toque hacer a mí, con enlaces directos.
````

---

## 3. Pasos que te tocan a ti (para no olvidarlos)

1. Subir la plantilla (`Textiles_Myriam_Caja_EN_CERO.xlsx`) a Google Drive y guardarla como Hojas de cálculo de Google.
2. En esa hoja, ir a **Extensiones → Apps Script**, pegar `apps-script/Code.gs`, cambiar **PIN_EQUIPO** y **PIN_DUENA**, ejecutar `instalar` y luego **Implementar → Aplicación web**.
3. Pegar la URL `/exec` en **Caja → Ajustes**, o en la variable `VITE_SHEETS_URL` de GitHub.
4. GitHub: hacer el repositorio público, activar **Pages → GitHub Actions**, dar permiso a `main` en **Environments → github-pages** y hacer merge del PR.
5. Completar WhatsApp, dirección y ciudad en `web/src/config.ts`.
6. Compartir la hoja de Google **solo con la dueña**.
