import type { Precio, Variante } from './types'

/**
 * Datos de EJEMPLO para el modo de prueba (sin Sheet conectado): solo precios y catálogo.
 * El modo de prueba arranca sin ventas. Las ventas reales viven solo en el Google Sheet.
 */

export const demoPrecios: Precio[] = [
  { producto: 'Gabardina', unidad: 'metro', precio: 16000, mayorDesde: 10, precioMayor: 14000 },
  { producto: 'Dril', unidad: 'metro', precio: 14000, mayorDesde: 10, precioMayor: 12500 },
  { producto: 'Paño', unidad: 'metro', precio: 28000, mayorDesde: 5, precioMayor: 25000 },
  { producto: 'Dacrón', unidad: 'metro', precio: 26000, mayorDesde: 5, precioMayor: 23500 },
  { producto: 'Toalla', unidad: 'metro', precio: 12500, mayorDesde: 5, precioMayor: 11000 },
  { producto: 'Satín', unidad: 'metro', precio: 4500, mayorDesde: 20, precioMayor: 3800 },
  { producto: 'Lencería', unidad: 'metro', precio: 8500, mayorDesde: 10, precioMayor: 7500 },
  { producto: 'Lino', unidad: 'metro', precio: 8000, mayorDesde: 10, precioMayor: 7000 },
  { producto: 'Velo bordado', unidad: 'metro', precio: 17000, mayorDesde: 10, precioMayor: 15000 },
  { producto: 'Yakar', unidad: 'metro', precio: 15000, mayorDesde: 5, precioMayor: 13500 },
  { producto: 'Piel de conejo', unidad: 'metro', precio: 15500, mayorDesde: 5, precioMayor: 14000 },
  { producto: 'Antifluido', unidad: 'metro', precio: 12000, mayorDesde: 10, precioMayor: 10500 },
  { producto: 'Muselina', unidad: 'metro', precio: 7500, mayorDesde: 10, precioMayor: 6500 },
  { producto: 'Organza', unidad: 'metro', precio: 14000, mayorDesde: 10, precioMayor: 12000 },
  { producto: 'Mantel', unidad: 'unidad', precio: 38000, mayorDesde: 0, precioMayor: 0 },
  { producto: 'Cortina', unidad: 'unidad', precio: 60000, mayorDesde: 0, precioMayor: 0 },
]

/** Catálogo de EJEMPLO: modelos y colores con su estado de inventario. */
export const demoCatalogo: Variante[] = (
  [
    ['instituciones', 'Gabardina', 'Tempo', [['Azul oscuro', '#1f2a44', 'disponible'], ['Gris', '#7b7f86', 'disponible'], ['Beige', '#cdb894', 'pocas'], ['Verde', '#2f4a3a', 'disponible'], ['Negro', '#1c1c1c', 'agotado']]],
    ['instituciones', 'Dril', 'Industrial', [['Caqui', '#a89270', 'disponible'], ['Azul', '#2b3d63', 'disponible'], ['Gris', '#6e7277', 'pocas']]],
    ['instituciones', 'Lino flex', 'Liso', [['Blanco', '#f4f2ec', 'disponible'], ['Azul cielo', '#a9c6e3', 'disponible'], ['Rosado', '#e9bfc8', 'agotado']]],
    ['instituciones', 'Escocés', 'Cuadro mediano', [['Rojo y azul', '#9b2d30', 'disponible'], ['Verde y azul', '#2f5a4a', 'pocas']]],
    ['instituciones', 'Escocés', 'Cuadro pequeño', [['Gris y vino', '#6b4048', 'disponible']]],
    ['instituciones', 'Antifluido', 'Liso', [['Azul turquesa', '#2a8c93', 'disponible'], ['Blanco', '#f6f6f2', 'disponible'], ['Vino', '#6d1f2a', 'pocas'], ['Verde quirúrgico', '#4f8f77', 'disponible']]],
    ['trajes', 'Paño', 'Liso', [['Negro', '#1c1c1c', 'disponible'], ['Gris oxford', '#4a4c51', 'disponible'], ['Azul marino', '#1d2740', 'pocas']]],
    ['trajes', 'Paño', 'Rayas finas', [['Gris', '#5b5e63', 'agotado'], ['Azul', '#25304d', 'disponible']]],
    ['trajes', 'Vértigo', 'Liso', [['Negro', '#1c1c1c', 'disponible'], ['Azul', '#27365a', 'disponible'], ['Café', '#5a4332', 'pocas']]],
    ['cortinas', 'Yakar', 'Damasco', [['Vino', '#6d1f2a', 'disponible'], ['Beige', '#d8c7a6', 'pocas'], ['Azul noche', '#1f2a44', 'agotado'], ['Dorado', '#b8954e', 'disponible']]],
    ['cortinas', 'Yakar', 'Rombos', [['Gris', '#8a8d91', 'disponible'], ['Verde oliva', '#5d6b3a', 'disponible'], ['Terracota', '#a9553a', 'agotado']]],
    ['cortinas', 'Yakar', 'Liso texturizado', [['Crudo', '#e6dccb', 'disponible'], ['Café', '#6a4e3a', 'pocas']]],
    ['cortinas', 'Velo liso', 'Liso', [['Blanco', '#f7f6f2', 'disponible'], ['Hueso', '#ede4d3', 'disponible'], ['Gris perla', '#c9c9c6', 'pocas']]],
    ['cortinas', 'Velo bordado', 'Flores', [['Blanco', '#f7f6f2', 'disponible'], ['Beige', '#e3d6bd', 'agotado']]],
    ['cortinas', 'Velo bordado', 'Hojas', [['Blanco', '#f7f6f2', 'pocas']]],
    ['hogar', 'Toalla por metro', 'Lisa', [['Blanco', '#f7f6f2', 'disponible'], ['Azul', '#3d5a8a', 'disponible'], ['Fucsia', '#c2386f', 'pocas']]],
    ['hogar', 'Toalla por metro', 'Rayas', [['Multicolor', '#d08a3a', 'disponible']]],
    ['fiesta', 'Satín', 'Liso', [['Blanco', '#f3efe8', 'disponible'], ['Dorado', '#c9a24b', 'disponible'], ['Rojo', '#b1252c', 'disponible'], ['Azul rey', '#24439a', 'pocas'], ['Fucsia', '#c2386f', 'agotado']]],
    ['fiesta', 'Lentejuela', 'Clásica', [['Dorado', '#c9a24b', 'disponible'], ['Plateado', '#c0c2c4', 'pocas']]],
  ] as [string, string, string, [string, string, Variante['estado']][]][]
).flatMap(([categoria, tela, modelo, colores]) => colores.map(([color, hex, estado]) => ({ categoria, tela, modelo, color, hex, estado, nota: '' })))
