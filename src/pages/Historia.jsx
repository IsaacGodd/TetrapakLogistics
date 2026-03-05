import { Globe2, Leaf, RefreshCw, Users } from 'lucide-react'

const aliados = [
  {
    nombre: 'Tetra Pak',
    categoria: 'Innovación en Envasado',
    Icon: Globe2,
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    descripcion: [
      'Tetra Pak es una empresa líder mundial en soluciones de envasado y procesamiento de alimentos. Trabajando en estrecha colaboración con nuestros clientes y proveedores, ofrecemos productos seguros, innovadores y respetuosos con el medio ambiente que cada día cubren las necesidades de cientos de millones de personas en más de 160 países.',
      'Con más de 25,000 empleados en todo el mundo, creemos en el liderazgo industrial responsable y en un enfoque sostenible del negocio. Nuestro lema, "PROTEGE LO BUENO™", refleja nuestra visión de hacer que los alimentos sean seguros y estén disponibles en todas partes.',
    ],
    stats: [
      { value: '160+', label: 'países' },
      { value: '25K',  label: 'empleados' },
      { value: '70+',  label: 'años' },
    ],
  },
  {
    nombre: 'SEDUSO',
    categoria: 'Desarrollo Sustentable',
    Icon: Leaf,
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    descripcion: [
      'La Secretaría de Desarrollo Sustentable (SEDUSO) es el organismo encargado de formular y coordinar las políticas públicas en materia de desarrollo urbano, medio ambiente y recursos naturales. Su misión es promover un crecimiento ordenado y equilibrado que respete el entorno natural y mejore la calidad de vida de los ciudadanos.',
      'A través de programas de reciclaje, conservación de áreas verdes y regulación ambiental, SEDUSO trabaja para asegurar que el desarrollo económico no comprometa el bienestar de las generaciones futuras, fomentando una cultura de respeto y cuidado por nuestro planeta.',
    ],
    stats: [
      { value: '100+', label: 'programas' },
      { value: '50K',  label: 'familias' },
      { value: '30+',  label: 'municipios' },
    ],
  },
  {
    nombre: 'Ecolana',
    categoria: 'Reciclaje Inclusivo',
    Icon: RefreshCw,
    gradient: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
    descripcion: [
      'Ecolana es una plataforma innovadora dedicada a conectar a los consumidores con centros de acopio y reciclar. Su objetivo es facilitar el proceso de reciclaje para todos, haciendo que la información sea accesible y transparente. Ecolana ha creado una red extensa de puntos de reciclaje, permitiendo que miles de toneladas de residuos sean desviadas de los vertederos cada año.',
      'Además de su mapa de reciclaje, Ecolana ofrece consultoría a empresas para ayudarles a manejar sus residuos de manera responsable y cumplir con las normativas ambientales, promoviendo así la economía circular en México.',
    ],
    stats: [
      { value: '2K+',  label: 'puntos de reciclaje' },
      { value: '1M+',  label: 'usuarios' },
      { value: '500T', label: 'residuos desviados' },
    ],
  },
]

export default function Historia() {
  return (
    <div className="min-h-full bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center pt-4 pb-2 anim-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1D6ADE, #10B981)' }}>
            <Globe2 size={38} strokeWidth={1.4} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Nuestra <span style={{ color: '#1D6ADE' }}>Historia</span> y{' '}
            <span style={{ color: '#10B981' }}>Aliados</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Uniendo esfuerzos para un futuro más sostenible a través de la innovación y la responsabilidad ambiental.
          </p>
        </div>

        {/* Aliados */}
        {aliados.map(({ nombre, categoria, Icon, gradient, descripcion, stats }, i) => (
          <div
            key={i}
            className="rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 anim-fade-up"
            style={{ animationDelay: `${100 + i * 130}ms` }}
          >
            {/* Colored header */}
            <div className="relative px-8 pt-8 pb-14 text-white overflow-hidden" style={{ background: gradient }}>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20"
                style={{ background: 'rgba(255,255,255,0.6)' }} />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
                style={{ background: 'rgba(255,255,255,0.6)' }} />

              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.25)' }}>
                    <Icon size={30} strokeWidth={1.5} className="text-white" />
                  </div>
                  <div>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest opacity-80 bg-white/20 px-3 py-1 rounded-full mb-2">
                      {categoria}
                    </span>
                    <h2 className="text-2xl font-extrabold leading-tight">{nombre}</h2>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((s, j) => (
                    <div key={j} className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                      <div className="text-xl font-extrabold leading-tight">{s.value}</div>
                      <div className="text-xs opacity-75 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-8 py-7 space-y-3">
              {descripcion.map((p, j) => (
                <p key={j} className="text-sm text-gray-600 leading-relaxed">{p}</p>
              ))}
            </div>

            {/* Bottom accent bar */}
            <div className="h-1.5" style={{ background: gradient }} />
          </div>
        ))}

        {/* CTA */}
        <div
          className="rounded-3xl shadow-lg overflow-hidden anim-fade-up"
          style={{ animationDelay: '490ms' }}
        >
          <div className="px-8 py-10 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #1D6ADE 0%, #10B981 100%)' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 shadow-lg"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Users size={30} strokeWidth={1.5} className="text-white" />
            </div>
            <h3 className="text-2xl font-extrabold mb-3">Juntos por un México más sostenible</h3>
            <p className="text-sm text-white/85 leading-relaxed max-w-md mx-auto">
              La unión entre Tetra Pak, SEDUSO y Ecolana crea un ecosistema de reciclaje eficiente, accesible y responsable para todos los ciudadanos.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
