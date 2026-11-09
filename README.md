# Textiles Myriam

Página web + caja conectada a Google Sheets.

- **Página de presentación** (`/`): la tienda, la colección con precios reales de referencia, cortinas a la medida, contacto.
- **Caja** (`/#caja`): entrar con PIN, registrar ingresos y egresos, ver el **balance** y ordenar/filtrar todos los movimientos. Cada cambio se guarda al instante en el Google Sheet, y lo que se edite directamente en el Sheet aparece en la Caja en menos de 30 segundos.

Sin conectar el Sheet, la Caja funciona en **modo demostración** (PIN `1234`) con **datos de ejemplo inventados**.

**Privacidad:** el código es público, pero las ventas reales **no están en este repositorio**: viven solo en el Google Sheet y la página las pide con el PIN.

## Estructura

```
web/                 Página y Caja (React + Vite + Tailwind, GSAP, Lenis, React Bits)
  src/landing/       Página de presentación
  src/caja/          Caja: Balance, Movimientos, formulario, Ajustes
  src/lib/           Datos: conexión con Sheets, cálculos del balance
  src/config.ts      ← WhatsApp, dirección y horario de la tienda
apps-script/Code.gs  El "puente" que va dentro del Google Sheet
```

## 1 · Conectar el Google Sheet (una sola vez, ~5 min)

> Usa la plantilla **Textiles_Myriam_Caja.xlsx** (se entrega aparte, no está en el repositorio porque tiene las ventas reales). Trae MOVIMIENTOS con agosto cargado, BALANCE con fórmulas y menús desplegables. Súbela a Drive y guárdala como Hoja de cálculo de Google.

1. Abre el Sheet **VENTAS AGOSTO** → **Extensiones → Apps Script**.
2. Pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs). **Cambia el PIN** (línea 15). Guarda.
3. Elige la función **`instalar`** → **Ejecutar** → acepta los permisos.
   Se crean dos pestañas nuevas: **MOVIMIENTOS** (los datos) y **BALANCE** (fórmulas que se actualizan solas). Las pestañas Semana 1…4 no se tocan.
4. **Implementar → Nueva implementación →** tipo **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copia la URL que termina en `/exec`.
6. En la página: **Caja → Ajustes →** pega la URL → **Conectar**.

> Si cambias el código del Apps Script, usa **Implementar → Administrar implementaciones → Editar → Nueva versión** para que la URL siga siendo la misma.

Para que todos los equipos queden conectados sin pegar la URL en cada uno, ponla en `web/.env`:

```
VITE_SHEETS_URL=https://script.google.com/macros/s/XXXX/exec
```

## 2 · Datos de la tienda

Edita `web/src/config.ts`: número de WhatsApp (formato `573001234567`), dirección, ciudad y horario. Están vacíos a propósito para no inventar datos.

## 3 · Correr en tu computador

```bash
cd web
npm install
npm run dev
```

## 4 · Publicar gratis en GitHub Pages

El flujo `.github/workflows/deploy.yml` publica la página cada vez que se sube algo a `main`.
En GitHub: **Settings → Pages → Source: GitHub Actions**. Si usas `VITE_SHEETS_URL`, agrégala en **Settings → Secrets and variables → Actions → Variables**.

## Cómo se limpiaron los datos de agosto

Las pestañas semanales mezclaban ventas, gastos y cierres diarios. Reglas aplicadas:

| En la hoja | En la Caja |
|---|---|
| Fila con producto, valor y cantidad | **Ingreso · Venta** |
| "SALDO…" / "ABONO…" | **Ingreso · Abono / saldo de pedido** (cortinas por encargo) |
| GASTO(S), transporte, almuerzo, flete, domicilio, vales, subtotal negativo | **Egreso · Gasto operativo** |
| Compras de tela marcadas GASTO (reata, satín por mayor, "compra tendencias") | **Egreso · Compra de mercancía** |
| Forma de pago vacía | Efectivo (así se llenaba la hoja) · TR→Transferencia · TJ/TG→Tarjeta · QR |
| Totales del día y cierres por forma de pago | No se cuentan como movimiento (evita doble conteo) |

Resultado: 1.557 movimientos del 3 al 31 de agosto, cargados en la plantilla. La pestaña "Hoja 1" (semana del 27 de julio, otro formato) no se incluyó.

## Seguridad

El PIN protege la lectura y escritura del Sheet desde la web. Es adecuado para un equipo pequeño; no es un sistema bancario. Cambia el PIN cuando alguien deje el equipo (en `Code.gs` → guardar → nueva versión de la implementación).
