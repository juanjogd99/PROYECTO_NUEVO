# Textiles Myriam

Página web del almacén y **Caja** para registrar ventas, conectada a Google Sheets.

## Documentos

| Archivo | Para qué sirve |
|---|---|
| [`docs/GUIA_CONEXION.md`](docs/GUIA_CONEXION.md) | **Paso a paso para armar y conectar todo.** Empieza aquí. |
| [`docs/PROMPT_PAGINA.md`](docs/PROMPT_PAGINA.md) | Resumen de la página y prompt para rehacerla en otro chat |
| [`apps-script/Code.gs`](apps-script/Code.gs) | El "puente" que va dentro del Google Sheet |
| `web/src/config.ts` | WhatsApp, dirección, ciudad y horario de la tienda |

La **plantilla de Excel** (`Textiles_Myriam_Caja_EN_CERO.xlsx`) se entrega aparte, no está en el repositorio.

## Qué tiene

**Página pública:** portada, historia, 6 categorías de telas (cada una con su página, fotos e inventario de colores, sin precios), cortinas a la medida, calculadora de cortinas y manteles listos, y contacto.

**Caja** (`#caja`), con dos PIN:

| | Equipo (`PIN_EQUIPO`) | Dueña (`PIN_DUENA`) |
|---|---|---|
| Abrir la caja con la base y cerrarla en la noche | ✅ | ✅ y reabrirla |
| Registrar y corregir ventas y gastos de **hoy** (precio automático detal / por mayor) | ✅ | ✅ |
| Movimientos de otros días | ❌ ni siquiera los recibe | ✅ ver y editar |
| Balance y lectura financiera | ❌ | ✅ |
| Mis cuentas: proveedores, nómina, arriendo, retiros (privado) | ❌ ni siquiera las recibe | ✅ |
| Historial de cierres (faltantes y sobrantes) | ❌ | ✅ |
| Lista de precios | 👁️ consultar | ✅ editar |
| Catálogo: modelos, colores, disponible / pocas / agotado | 👁️ consultar | ✅ editar; se publica en la página |

Sin Sheet conectado, la Caja funciona en **modo de prueba** (empieza en cero): PIN `1234` entra como equipo y `2026` como dueña.

## Privacidad

- El código es público, pero las **ventas reales no están en este repositorio**: viven solo en el Google Sheet.
- El **Apps Script** decide qué entrega a cada PIN, así que la privacidad no depende de ocultar botones.
- La página pública solo lee el catálogo (telas, colores y si hay), nunca ventas ni precios.
- Lo de la dueña no se guarda en el navegador: no queda en el computador de la tienda al pulsar **Salir**.
- Comparte el Google Sheet **solo con la dueña**.

## Estructura

```
web/                   Página y Caja (React + Vite + Tailwind, GSAP, Lenis, React Bits)
  src/landing/         Página pública: portada, categorías, medidas
  src/caja/            Caja: Hoy, Balance, Movimientos, Mis cuentas, Catálogo, Precios, Ajustes
  src/lib/             Conexión con Sheets, cálculos, precios, catálogo, modo de prueba
  src/assets/          Fotos (Pexels, licencia libre)
  src/config.ts        Datos de contacto de la tienda
apps-script/Code.gs    Apps Script del Google Sheet
docs/                  Guías
.github/workflows/     Publicación automática en GitHub Pages
```

## Correr en tu computador

```bash
cd web
npm install
npm run dev
```
