/**
 * Datos de contacto de la tienda — EDITA AQUÍ.
 * (No los inventé: los que están entre corchetes hay que completarlos.)
 */
export const TIENDA = {
  nombre: 'Textiles Myriam',
  whatsapp: '', // ej. '573001234567' (con indicativo 57, sin + ni espacios)
  direccion: '[Dirección de la tienda]',
  ciudad: '[Ciudad]',
  horario: 'Lunes a sábado',
  instagram: '', // ej. 'textilesmyriam'
}

export const waLink = (msg = 'Hola Textiles Myriam, quiero información sobre ') =>
  TIENDA.whatsapp ? `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(msg)}` : '#visitanos'
