import { Globe2, Leaf, RefreshCw } from 'lucide-react'

const aliados = [
  {
    nombre: 'Tetra Pak',
    categoria: 'Innovación en Envasado',
    Icon: Globe2,
    color: '#3B82F6',
    bg: '#EFF6FF',
    blobColor: '#DBEAFE',
    descripcion: [
      'Tetra Pak es una empresa líder mundial en soluciones de envasado y procesamiento de alimentos. Trabajando en estrecha colaboración con nuestros clientes y proveedores, ofrecemos productos seguros, innovadores y respetuosos con el medio ambiente que cada día cubren las necesidades de cientos de millones de personas en más de 160 países.',
      'Con más de 25,000 empleados en todo el mundo, creemos en el liderazgo industrial responsable y en un enfoque sostenible del negocio. Nuestro lema, "PROTEGE LO BUENO™", refleja nuestra visión de hacer que los alimentos sean seguros y estén disponibles en todas partes.',
    ],
  },
  {
    nombre: 'SEDUSO',
    categoria: 'Desarrollo Sustentable',
    Icon: Leaf,
    color: '#10B981',
    bg: '#ECFDF5',
    blobColor: '#D1FAE5',
    descripcion: [
      'La Secretaría de Desarrollo Sustentable (SEDUSO) es el organismo encargado de formular y coordinar las políticas públicas en materia de desarrollo urbano, medio ambiente y recursos naturales. Su misión es promover un crecimiento ordenado y equilibrado que respete el entorno natural y mejore la calidad de vida de los ciudadanos.',
      'A través de programas de reciclaje, conservación de áreas verdes y regulación ambiental, SEDUSO trabaja para asegurar que el desarrollo económico no comprometa el bienestar de las generaciones futuras, fomentando una cultura de respeto y cuidado por nuestro planeta.',
    ],
  },
  {
    nombre: 'Ecolana',
    categoria: 'Reciclaje Inclusivo',
    Icon: RefreshCw,
    color: '#F97316',
    bg: '#FFF7ED',
    blobColor: '#FED7AA',
    descripcion: [
      'Ecolana es una plataforma innovadora dedicada a conectar a los consumidores con centros de acopio y reciclar. Su objetivo es facilitar el proceso de reciclaje para todos, haciendo que la información sea accesible y transparente. Ecolana ha creado una red extensa de puntos de reciclaje, permitiendo que miles de toneladas de residuos sean desviadas de los vertederos cada año.',
      'Además de su mapa de reciclaje, Ecolana ofrece consultoría a empresas para ayudarles a manejar sus residuos de manera responsable y cumplir con las normativas ambientales, promoviendo así la economía circular en México.',
    ],
  },
]

export default function Historia() {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Hero */}
        <div className="text-center pt-4 pb-6 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-100 shadow-md mb-5" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Nuestra Historia y Aliados</h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
            Uniendo esfuerzos para un futuro más sostenible a través de la innovación y la responsabilidad ambiental.
          </p>
        </div>

        {/* Aliados */}
        {aliados.map(({ nombre, categoria, Icon, color, bg, blobColor, descripcion }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative">
            {/* Blob decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-40 -translate-y-8 translate-x-8 pointer-events-none"
              style={{ background: blobColor }} />

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform duration-200 hover:scale-110"
                  style={{ background: `${color}18` }}>
                  <Icon size={22} strokeWidth={1.8} style={{ color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{nombre}</h2>
                  <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color }}>
                    {categoria}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                {descripcion.map((p, j) => (
                  <p key={j} className="text-sm text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>

            {/* Bottom accent bar */}
            <div className="h-1 opacity-30" style={{ background: color }} />
          </div>
        ))}

        {/* CTA bottom */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Juntos por un México más sostenible</h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            La unión entre Tetra Pak, SEDUSO y Ecolana crea un ecosistema de reciclaje eficiente, accesible y responsable para todos los ciudadanos.
          </p>
        </div>

      </div>
    </div>
  )
}
