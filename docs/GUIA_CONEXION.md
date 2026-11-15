# Guía para armar y conectar Textiles Myriam

Hazlo en este orden. Marca cada paso cuando lo termines. Cada fase se puede probar antes de seguir.

---

## Fase 1 · La hoja de Google (10 min)

- [ ] **1.1** Descarga la plantilla **`Textiles_Myriam_Caja_EN_CERO.xlsx`**, la que viene sin ventas.
- [ ] **1.2** Súbela a **Google Drive**. Luego: clic derecho → **Abrir con → Hojas de cálculo de Google** → **Archivo → Guardar como Hojas de cálculo de Google**.
- [ ] **1.3** Ponle de nombre **Textiles Myriam · Caja**.
- [ ] **1.4** Revisa que tenga las pestañas: INSTRUCCIONES, MOVIMIENTOS, PRIVADO, PRECIOS, CATALOGO, CAJAS, BALANCE y LISTAS.
- [ ] **1.5** Compártela **solo con la dueña**. El equipo nunca entra a la hoja: entra por la página.

## Fase 2 · El Apps Script (10 min)

Es el "puente" entre la página y la hoja. También decide qué puede ver cada PIN.

- [ ] **2.1** En la hoja: **Extensiones → Apps Script**.
- [ ] **2.2** Borra lo que haya y pega el contenido de [`apps-script/Code.gs`](https://github.com/juanjogd99/PROYECTO_NUEVO/blob/claude/zen-heisenberg-myvdpy/apps-script/Code.gs). Para copiarlo, usa el botón **Copy raw file** de GitHub.
- [ ] **2.3** Cambia los dos PIN, al principio del código. Deben ser distintos y no los compartas en grupos:
  ```js
  const PIN_EQUIPO = '1234'; // clave de la caja
  const PIN_DUENA = '2026';  // clave privada de la dueña
  ```
- [ ] **2.4** Guarda con el disquete o con Ctrl + S.
- [ ] **2.5** Arriba elige la función **`instalar`** y pulsa **▶ Ejecutar**. Acepta los permisos: **Revisar permisos → tu cuenta → Configuración avanzada → Ir a… → Permitir**. Si Google dice "no verificada", es normal: el programa es tuyo.
- [ ] **2.6** Publícalo: **Implementar → Nueva implementación** → ⚙️ **Aplicación web**.
  - Ejecutar como: **Yo**
  - Quién tiene acceso: **Cualquier persona**. Sin PIN no entrega nada, salvo el catálogo público.
- [ ] **2.7** Copia la **URL que termina en `/exec`** y guárdala en una nota.

> Si más adelante cambias el código: **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar**. Así la URL sigue siendo la misma.

**Prueba rápida:** abre en el navegador la URL `/exec` agregándole `?action=catalogo` al final. Debe mostrar `{"ok":true,"catalogo":[]}`.

## Fase 3 · Conectar la página (5 min)

- [ ] **3.1** Entra a la página → **Caja · equipo** → PIN de la **dueña**.
- [ ] **3.2** Ve a **Ajustes** (en el celular: **Más → Ajustes**), pega la URL `/exec` y pulsa **Conectar**.
- [ ] **3.3** Arriba debe decir **"Sincronizado con Sheets"**.

> En la vista previa de Claude la conexión puede fallar, porque esa vista no puede conectarse a otros sitios. Funciona en la página publicada (Fase 5) o en tu computador.

## Fase 4 · Cargar la información de la tienda (30 min)

Todo se hace desde la **Caja con el PIN de la dueña**:

- [ ] **4.1** **Precios:** revisa los 31 precios de referencia. Llena "por mayor desde" y "precio mayor" donde aplique, agrega las telas que falten y pulsa **Guardar lista**.
- [ ] **4.2** **Catálogo:** para cada tela, agrega sus modelos y colores y márcalos como Disponible, Pocas o Agotado. Pulsa **Guardar catálogo**. Esto es lo que verán los clientes en la página.
- [ ] **4.3** Datos de contacto: pásame **WhatsApp, dirección, ciudad y horario** y los pongo en `web/src/config.ts`.

## Fase 5 · Publicar la página en internet (10 min)

- [ ] **5.1** El repositorio debe ser **público**: **Settings → General → Danger Zone → Change visibility**.
- [ ] **5.2** **Settings → Pages → Source: GitHub Actions**.
- [ ] **5.3** **Settings → Environments → github-pages → Deployment branches**: elige **No restriction** o agrega `main`.
- [ ] **5.4** **Settings → Secrets and variables → Actions → Variables → New repository variable**: nombre `VITE_SHEETS_URL`, valor la URL `/exec`. Así todos los equipos quedan conectados solos.
- [ ] **5.5** Haz merge del PR #3 (o del más reciente).
- [ ] **5.6** Espera el ✅ en la pestaña **Actions** y abre **https://juanjogd99.github.io/PROYECTO_NUEVO/**.

## Fase 6 · Primer día de uso

- [ ] **6.1** En la mañana, la cajera entra con el **PIN del equipo** y pulsa **Abrir caja** con la base.
- [ ] **6.2** Registra las ventas con el botón **+**. El precio sale solo según la cantidad.
- [ ] **6.3** En la noche, pulsa **Cerrar caja** y cuenta los billetes. La app dice si cuadra, sobra o falta.
- [ ] **6.4** La dueña revisa **Caja diaria**, **Balance** y **Mis cuentas**. En la hoja de Google se ve todo en las pestañas MOVIMIENTOS, CAJAS y BALANCE.

---

## Si algo falla

| Mensaje | Qué hacer |
|---|---|
| "PIN incorrecto" | Revisa los PIN en `Code.gs`. Si los cambiaste, publica una **nueva versión** (paso 2.6). |
| "Falta la pestaña …: ejecuta la función instalar()" | Ejecuta **instalar** otra vez (paso 2.5). |
| "El Sheet no respondió con datos válidos" | La URL no es la de `/exec`, o el acceso no quedó en **Cualquier persona**. |
| "Primero hay que abrir la caja de hoy" | Abre la caja en la pestaña **Hoy** (equipo) o **Caja diaria** (dueña). |
| "Sin conexión · se subirá luego" | Normal sin internet: lo registrado se sube solo cuando vuelva la conexión. |
| La página publicada da 404 | Revisa los pasos 5.2 y 5.3 y vuelve a correr la publicación en **Actions → Re-run jobs**. |
