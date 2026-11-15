import fotoUniformes from '../assets/fotos/uniformes.jpg'
import fotoSastreria from '../assets/fotos/sastreria.jpg'
import fotoCortinas from '../assets/fotos/cortinas.jpg'
import fotoToallas from '../assets/fotos/toallas.jpg'
import fotoSatin from '../assets/fotos/satin.jpg'
import fotoConfeccion from '../assets/fotos/confeccion.jpg'

// Foto de cada tela (Pexels, licencia libre). Las que no tienen foto fiel muestran una muestra de color.
const telas = import.meta.glob('../assets/telas/*.jpg', { eager: true, import: 'default' }) as Record<string, string>
const t = (archivo: string) => telas[`../assets/telas/${archivo}.jpg`]

export interface Tela {
  nombre: string
  uso: string
  foto?: string
  color?: string // muestra de color cuando no hay foto
}

export interface Categoria {
  slug: string
  nombre: string
  resumen: string // una línea para la tarjeta
  intro: string // párrafo de la página de la categoría
  foto: string
  alt: string
  pos?: string
  telas: Tela[]
  consejo?: string
}

/** Telas que el almacén vende (según sus registros de ventas), agrupadas por para qué se usan. Sin precios. */
export const CATEGORIAS: Categoria[] = [
  {
    slug: 'instituciones',
    nombre: 'Colegios e instituciones',
    resumen: 'Gabardina, dril, lino flex, escocés y antifluido para uniformes y dotación.',
    intro: 'Telas para uniformes de colegios, universidades, empresas, clínicas y entidades: el de diario, el de gala, el de dotación y el de prácticas. Te ayudamos a encontrar el color exacto y a calcular cuánta tela llevar.',
    foto: fotoUniformes,
    alt: 'Niños con uniforme de colegio',
    telas: [
      { nombre: 'Gabardina', uso: 'Pantalones, faldas y jardineras. Resistente, se arruga poco y aguanta las lavadas.', foto: t('gabardina') },
      { nombre: 'Dril', uso: 'Pantalones y uniformes de dotación, taller y colegios técnicos. Grueso y muy durable.', foto: t('dril') },
      { nombre: 'Lino flex', uso: 'Camisas, blusas y uniformes de clima cálido. Fresco y liviano.', foto: t('lino-flex') },
      { nombre: 'Escocés', uso: 'Faldas y jardineras de cuadros, en los colores de cada institución.', foto: t('escoces') },
      { nombre: 'Género', uso: 'Camisas y blusas blancas o de color para el uniforme de diario.', foto: t('genero') },
      { nombre: 'Paño', uso: 'Sacos y blazers de uniforme de gala o corporativo.', foto: t('pano-gris') },
      { nombre: 'Antifluido', uso: 'Uniformes de salud, enfermería, odontología, laboratorio y cocina. Repele líquidos.', foto: t('antifluido') },
    ],
    consejo: 'Trae la prenda de muestra o el nombre de la institución y te mostramos el tono más parecido. Atendemos pedidos por cantidad.',
  },
  {
    slug: 'trajes',
    nombre: 'Trajes y sastrería',
    resumen: 'Paño, dacrón, vértigo y gabardina para saco y pantalón.',
    intro: 'Telas con buena caída para sastres, modistas y para quien se manda a hacer su traje: grados, matrimonios, oficina.',
    foto: fotoSastreria,
    alt: 'Sastre midiendo un saco',
    telas: [
      { nombre: 'Paño', uso: 'Sacos, abrigos y trajes formales. Abriga y luce elegante.', foto: t('pano-oscuro') },
      { nombre: 'Dacrón', uso: 'Pantalones de vestir que caen bien y casi no se arrugan.', foto: t('pano-gris') },
      { nombre: 'Vértigo', uso: 'Pantalones y trajes de oficina. Liviano y de buena caída.', foto: t('vertigo') },
      { nombre: 'Mónaco', uso: 'Trajes y pantalón de vestir de uso diario.', color: '#3b3f4a' },
      { nombre: 'Gabardina', uso: 'Pantalones y sacos casuales.', foto: t('gabardina') },
      { nombre: 'Lino', uso: 'Trajes y camisas frescas para tierra caliente.', foto: t('lino') },
      { nombre: 'Satín para forro', uso: 'Forro interior de sacos, chaquetas y vestidos.', foto: t('satin-forro') },
    ],
    consejo: 'Para un traje completo de adulto suelen necesitarse entre 3 y 3,5 m. Pregúntale a tu sastre la medida exacta.',
  },
  {
    slug: 'cortinas',
    nombre: 'Cortinas',
    resumen: 'Velo y yakar por metro, o cortinas listas y a la medida.',
    intro: 'Manejamos cortinas en velo y en yakar: tela por metro para que tú o tu modista la confeccionen, cortinas a la medida hechas por nosotros, o cortinas listas para colgar en medidas estándar.',
    foto: fotoCortinas,
    alt: 'Ventana con cortinas',
    pos: 'center 30%',
    telas: [
      { nombre: 'Velo liso', uso: 'Liviano: deja pasar la luz y da privacidad. Se usa solo o detrás del yakar.', foto: t('velo-liso') },
      { nombre: 'Velo bordado', uso: 'Velo con bordados para salas y comedores.', foto: fotoCortinas },
      { nombre: 'Velo de rayas y cuadros', uso: 'Velos con textura para darle estilo a la ventana.', color: '#e9e2d6' },
      { nombre: 'Yakar', uso: 'Tela con cuerpo y textura: tapa más luz y viste la ventana. También para cojines.', foto: t('yakar') },
    ],
    consejo: '¿Prefieres cortinas listas para colgar? En la página principal hay una calculadora: escribes las medidas de tu ventana y te decimos qué tamaño te sirve.',
  },
  {
    slug: 'hogar',
    nombre: 'Toallas, sábanas y lencería',
    resumen: 'Toalla por metro, sábana, lencería y telas para mantel.',
    intro: 'Telas para el baño, la cama y la mesa. Toalla por metro para hacer tus propias toallas, batas o baberos, y telas para sábanas y manteles.',
    foto: fotoToallas,
    alt: 'Toallas dobladas',
    telas: [
      { nombre: 'Toalla por metro', uso: 'Toallas, batas, baberos y paños. Lisa, de rayas o estampada.', foto: t('toalla') },
      { nombre: 'Sábana', uso: 'Juegos de sábanas y fundas a la medida de tu cama.', foto: t('sabana') },
      { nombre: 'Lencería', uso: 'Lencería para el hogar: fundas, cubrelechos y forros.', foto: t('lenceria') },
      { nombre: 'Microfibra', uso: 'Paños de limpieza, toallas deportivas y forros suaves.', foto: t('microfibra') },
      { nombre: 'Lienzo', uso: 'Bolsas, delantales, manteles y manualidades.', color: '#d9cdb8' },
      { nombre: 'Telas para mantel', uso: 'Manteles y caminos de mesa. También vendemos manteles listos.', color: '#b9a37f' },
    ],
  },
  {
    slug: 'fiesta',
    nombre: 'Satín y telas de fiesta',
    resumen: 'Satín, organza, lame, lentejuela y tul para eventos.',
    intro: 'Brillo y color para quinceañeros, danzas, disfraces, decoración de eventos y vestidos de fiesta.',
    foto: fotoSatin,
    alt: 'Tela de satín azul',
    telas: [
      { nombre: 'Satín', uso: 'Decoración de eventos, forros, disfraces y vestidos. Muchos colores.', foto: fotoSatin },
      { nombre: 'Organza', uso: 'Velos de decoración, moños, faldas y detalles transparentes.', foto: t('organza') },
      { nombre: 'Lame', uso: 'Tela metalizada para disfraces, danzas y decoración.', foto: t('lame') },
      { nombre: 'Lentejuela', uso: 'Vestidos de fiesta, trajes de baile y detalles que brillan.', foto: t('lentejuela') },
      { nombre: 'Tul', uso: 'Faldas, velos y decoración. Liso, brillante o escarchado.', foto: t('tul') },
      { nombre: 'Seda', uso: 'Blusas, pañoletas y vestidos con caída suave.', foto: t('seda') },
    ],
  },
  {
    slug: 'confeccion',
    nombre: 'Confección y manualidades',
    resumen: 'Muselina, franela, piel de conejo, lona, pana y más.',
    intro: 'Para tus proyectos de costura y manualidades: peluches, bolsos, banderas, disfraces y la decoración de cada temporada.',
    foto: fotoConfeccion,
    alt: 'Mesa de modista con tela y herramientas',
    telas: [
      { nombre: 'Muselina', uso: 'Pañales, cobijas de bebé y patronaje de prueba.', foto: t('lino') },
      { nombre: 'Franela', uso: 'Pijamas y prendas abrigadas.', foto: t('franela') },
      { nombre: 'Piel de conejo y ovejero', uso: 'Peluches, cobijas, cojines y forros abrigados.', color: '#ece4d8' },
      { nombre: 'Lona', uso: 'Bolsos, tulas, carpas y forros resistentes.', foto: t('lona') },
      { nombre: 'Pana', uso: 'Chaquetas, pantalones y tapicería con textura.', foto: t('pana') },
      { nombre: 'Tela de bandera', uso: 'Banderas, pendones y decoración de fechas patrias.', color: '#c9a227' },
      { nombre: 'Telas de Navidad', uso: 'Manteles, caminos, botas y decoración navideña.', foto: t('navidad') },
    ],
  },
]

/** "colegio" era el nombre anterior de "instituciones": los enlaces viejos siguen funcionando. */
const ALIAS: Record<string, string> = { colegio: 'instituciones' }

export const categoriaPorSlug = (slug: string) => CATEGORIAS.find((c) => c.slug === (ALIAS[slug] ?? slug))
