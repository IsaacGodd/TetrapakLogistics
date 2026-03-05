import {
  Package, RefreshCw, Droplets, BarChart2, Sparkles, Leaf,
  FileText, Sofa, Hammer, PenLine, Container, Palette
} from 'lucide-react'

const pasos = [
  { num: 1, titulo: 'Recolección',    desc: 'Los envases Tetrapak se recolectan en centros de acopio designados donde se separan de otros materiales.',                    Icon: Package,   color: '#3B82F6', bg: '#2563EB' },
  { num: 2, titulo: 'Clasificación',  desc: 'Los envases se clasifican y se preparan para el proceso de separación de sus componentes principales.',                      Icon: RefreshCw, color: '#10B981', bg: '#059669' },
  { num: 3, titulo: 'Pulpado',        desc: 'Los envases se sumergen en agua para separar las fibras de papel del aluminio y plástico.',                                  Icon: Droplets,  color: '#F97316', bg: '#EA580C' },
  { num: 4, titulo: 'Separación',     desc: 'Las fibras de papel se recuperan y el polialuminio (plástico + aluminio) se procesa por separado.',                          Icon: BarChart2, color: '#A855F7', bg: '#9333EA' },
  { num: 5, titulo: 'Transformación', desc: 'Los materiales separados se procesan para crear nuevos productos sostenibles y útiles.',                                      Icon: Sparkles,  color: '#EC4899', bg: '#DB2777' },
  { num: 6, titulo: 'Productos Nuevos',desc: 'Se fabrican nuevos productos como papel, muebles, láminas para construcción y más.',                                        Icon: Leaf,      color: '#14B8A6', bg: '#0D9488' },
]

const productos = [
  { Icon: FileText,   titulo: 'Papel y Cartón',           desc: 'Las fibras de papel recuperadas se utilizan para fabricar papel higiénico, servilletas, cajas de cartón y otros productos de papel.',  color: '#3B82F6' },
  { Icon: Sofa,       titulo: 'Muebles y Tableros',        desc: 'El polialuminio se transforma en tableros aglomerados para fabricar muebles durables y ecológicos.',                                     color: '#8B5CF6' },
  { Icon: Hammer,     titulo: 'Material de Construcción', desc: 'Se crean láminas y tejas para techos, así como otros materiales usados en la industria de la construcción.',                              color: '#F97316' },
  { Icon: PenLine,    titulo: 'Artículos Escolares',      desc: 'Reglas, carpetas y otros útiles escolares se fabrican a partir del aluminio y plástico reciclado.',                                       color: '#10B981' },
  { Icon: Container,  titulo: 'Pallets y Estibas',        desc: 'Los pallets utilizados para transporte y almacenamiento se fabrican con el material reciclado.',                                          color: '#EC4899' },
  { Icon: Palette,    titulo: 'Artesanías',               desc: 'Diversos productos artesanales como bolsas, carteras y accesorios se crean aprovechando el material reciclado.',                          color: '#14B8A6' },
]

export default function QueHacer() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-gray-100 shadow-md mb-5">
            <Package size={28} strokeWidth={1.5} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¿Qué se hace con el <span className="text-primary">Tetrapak</span>?
          </h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            Descubre el increíble proceso de reciclaje del Tetrapak y cómo se transforma en productos útiles para nuestra vida diaria.
          </p>
        </div>

        {/* Proceso de Reciclaje */}
        <section>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Proceso de Reciclaje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pasos.map(({ num, titulo, desc, Icon, bg }) => (
              <div
                key={num}
                className="rounded-2xl p-6 text-white cursor-default hover:scale-[1.02] hover:shadow-xl transition-all duration-300 active:scale-[0.99]"
                style={{ background: `linear-gradient(135deg, ${bg}ee, ${bg}bb)` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Icon size={24} strokeWidth={1.5} className="text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{num}. {titulo}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Productos Derivados */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Productos Derivados del Tetrapak Reciclado</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              El reciclaje del Tetrapak permite crear una amplia variedad de productos útiles, contribuyendo a la economía circular.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productos.map(({ Icon, titulo, desc, color }, i) => (
                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-default group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: `${color}18` }}>
                    <Icon size={18} strokeWidth={1.8} style={{ color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">{titulo}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impacto Ambiental */}
        <section>
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 text-center"
              style={{ background: 'linear-gradient(90deg, #1D6ADE, #F97316)' }}>
              <h2 className="text-xl font-bold text-white">Impacto Ambiental</h2>
            </div>
            <div className="bg-white border border-gray-100 border-t-0 p-6">
              <p className="text-sm text-gray-600 text-center mb-6">
                Por cada tonelada de Tetrapak reciclado, salvamos árboles, ahorramos agua y reducimos emisiones de CO₂.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '1 Ton',     label: 'Tetrapak reciclado', color: '#1D6ADE' },
                  { value: '17 Árboles',label: 'Salvados',           color: '#10B981' },
                  { value: '27,000 L',  label: 'Agua ahorrada',      color: '#06B6D4' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-4 text-center text-white hover:scale-[1.02] transition-transform duration-200 cursor-default"
                    style={{ background: stat.color }}>
                    <div className="text-2xl font-bold leading-tight">{stat.value}</div>
                    <div className="text-xs opacity-80 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Tú Puedes Hacer la Diferencia!</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              Recuerda lavar y aplanar tus envases Tetrapak antes de llevarlos a un centro de acopio. Cada envase cuenta para construir un futuro más sostenible.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Lavar el envase',              color: '#10B981' },
                { label: 'Aplanarlo para ahorrar espacio',color: '#F59E0B' },
                { label: 'Llevarlo al centro de acopio',  color: '#3B82F6' },
              ].map(({ label, color }, i) => (
                <button key={i} className="flex items-center gap-2 px-5 py-2.5 text-white text-sm rounded-full font-medium hover:opacity-90 hover:scale-105 transition-all duration-200 active:scale-95 shadow-sm"
                  style={{ background: color }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
