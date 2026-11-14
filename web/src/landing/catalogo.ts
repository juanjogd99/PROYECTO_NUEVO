import fotoUniformes from '../assets/fotos/uniformes.jpg'
import fotoSastreria from '../assets/fotos/sastreria.jpg'
import fotoCortinas from '../assets/fotos/cortinas.jpg'
import fotoToallas from '../assets/fotos/toallas.jpg'
import fotoSatin from '../assets/fotos/satin.jpg'
import fotoConfeccion from '../assets/fotos/confeccion.jpg'

export interface Tela {
  nombre: string
  uso: string
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
    slug: 'colegio',
    nombre: 'Colegio y universidad',
    resumen: 'Gabardina, dril, lino flex, escocés y antifluido para uniformes.',
    intro: 'Todo lo que necesitas para el uniforme de diario, el de educación física y el de prácticas. Te ayudamos a encontrar el color de tu colegio y a calcular cuánta tela llevar según la talla.',
    foto: fotoUniformes,
    alt: 'Niños con uniforme de colegio',
    telas: [
      { nombre: 'Gabardina', uso: 'Pantalones, faldas y jardineras. Resistente, se arruga poco y aguanta las lavadas.' },
      { nombre: 'Dril', uso: 'Pantalones y uniformes de taller o de colegios técnicos. Grueso y muy durable.' },
      { nombre: 'Lino flex', uso: 'Camisas, blusas y uniformes de clima cálido. Fresco y liviano.' },
      { nombre: 'Escocés', uso: 'Faldas y jardineras de cuadros, en los colores de cada colegio.' },
      { nombre: 'Género', uso: 'Camisas y blusas blancas o de color para el uniforme de diario.' },
      { nombre: 'Paño', uso: 'Sacos y blazers de uniforme de gala.' },
      { nombre: 'Antifluido', uso: 'Universidad: uniformes de salud, enfermería, odontología y laboratorio. Repele líquidos.' },
    ],
    consejo: 'Trae la prenda de muestra o el nombre del colegio y te mostramos el tono más parecido.',
  },
  {
    slug: 'trajes',
    nombre: 'Trajes y sastrería',
    resumen: 'Paño, dacrón, vértigo y gabardina para saco y pantalón.',
    intro: 'Telas con buena caída para sastres, modistas y para quien se manda a hacer su traje: grados, matrimonios, oficina.',
    foto: fotoSastreria,
    alt: 'Sastre midiendo un saco',
    telas: [
      { nombre: 'Paño', uso: 'Sacos, abrigos y trajes formales. Abriga y luce elegante.' },
      { nombre: 'Dacrón', uso: 'Pantalones de vestir que caen bien y casi no se arrugan.' },
      { nombre: 'Vértigo', uso: 'Pantalones y trajes de oficina. Liviano y de buena caída.' },
      { nombre: 'Mónaco', uso: 'Trajes y pantalón de vestir de uso diario.' },
      { nombre: 'Gabardina', uso: 'Pantalones y sacos casuales.' },
      { nombre: 'Lino', uso: 'Trajes y camisas frescas para tierra caliente.' },
      { nombre: 'Satín para forro', uso: 'Forro interior de sacos, chaquetas y vestidos.' },
    ],
    consejo: 'Para un traje completo de adulto suelen necesitarse entre 3 y 3,5 m. Pregúntale a tu sastre la medida exacta.',
  },
  {
    slug: 'cortinas',
    nombre: 'Cortinas',
    resumen: 'Velos y telas para cortina, listas o a la medida.',
    intro: 'Tela por metro para que tú o tu modista la confeccionen, cortinas a la medida hechas por nosotros, o cortinas listas para colgar en medidas estándar.',
    foto: fotoCortinas,
    alt: 'Ventana con cortinas',
    pos: 'center 30%',
    telas: [
      { nombre: 'Velo liso', uso: 'Deja pasar la luz y da privacidad. Ideal debajo de una cortina más gruesa.' },
      { nombre: 'Velo bordado', uso: 'Velo con bordados para salas y comedores.' },
      { nombre: 'Velo de rayas y cuadros', uso: 'Velos con textura para darle estilo a la ventana.' },
      { nombre: 'Yakar', uso: 'Cortinas con cuerpo y textura; también para cojines.' },
      { nombre: 'Lino', uso: 'Cortinas de aspecto natural y fresco.' },
      { nombre: 'Toldillo', uso: 'Mosquiteros y cortinas livianas.' },
    ],
    consejo: '¿Prefieres cortinas listas para colgar? Mira la calculadora de medidas más abajo en la página principal.',
  },
  {
    slug: 'hogar',
    nombre: 'Toallas, sábanas y lencería',
    resumen: 'Toalla por metro, sábana, lencería y telas para mantel.',
    intro: 'Telas para el baño, la cama y la mesa. Toalla por metro para hacer tus propias toallas, batas o baberos, y telas para sábanas y manteles.',
    foto: fotoToallas,
    alt: 'Toallas dobladas',
    telas: [
      { nombre: 'Toalla por metro', uso: 'Toallas, batas, baberos y paños. Lisa, de rayas o estampada.' },
      { nombre: 'Sábana', uso: 'Juegos de sábanas y fundas a la medida de tu cama.' },
      { nombre: 'Lencería', uso: 'Lencería para el hogar: fundas, cubrelechos y forros.' },
      { nombre: 'Microfibra', uso: 'Paños de limpieza, toallas deportivas y forros suaves.' },
      { nombre: 'Lienzo', uso: 'Bolsas, delantales, manteles y manualidades.' },
      { nombre: 'Telas para mantel', uso: 'Manteles y caminos de mesa. También vendemos manteles listos.' },
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
      { nombre: 'Satín', uso: 'Decoración de eventos, forros, disfraces y vestidos. Muchos colores.' },
      { nombre: 'Organza', uso: 'Velos de decoración, moños, faldas y detalles transparentes.' },
      { nombre: 'Lame', uso: 'Tela metalizada para disfraces, danzas y decoración.' },
      { nombre: 'Lentejuela', uso: 'Vestidos de fiesta, trajes de baile y detalles que brillan.' },
      { nombre: 'Tul', uso: 'Faldas, velos y decoración. Liso, brillante o escarchado.' },
      { nombre: 'Seda', uso: 'Blusas, pañoletas y vestidos con caída suave.' },
    ],
  },
  {
    slug: 'confeccion',
    nombre: 'Confección y manualidades',
    resumen: 'Antifluido, muselina, franela, piel de conejo, lona y más.',
    intro: 'Para tus proyectos de costura y manualidades: peluches, tapabocas, bolsos, banderas, disfraces y la decoración de cada temporada.',
    foto: fotoConfeccion,
    alt: 'Mesa de modista con tela y herramientas',
    telas: [
      { nombre: 'Muselina', uso: 'Pañales, cobijas de bebé y patronaje de prueba.' },
      { nombre: 'Franela', uso: 'Pijamas y prendas abrigadas.' },
      { nombre: 'Piel de conejo y ovejero', uso: 'Peluches, cobijas, cojines y forros abrigados.' },
      { nombre: 'Lona', uso: 'Bolsos, tulas, carpas y forros resistentes.' },
      { nombre: 'Pana', uso: 'Chaquetas, pantalones y tapicería con textura.' },
      { nombre: 'Tela de bandera', uso: 'Banderas, pendones y decoración de fechas patrias.' },
      { nombre: 'Telas de Navidad', uso: 'Manteles, caminos, botas y decoración navideña.' },
    ],
  },
]

export const categoriaPorSlug = (slug: string) => CATEGORIAS.find((c) => c.slug === slug)
