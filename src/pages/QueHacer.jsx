import {
  Package, RefreshCw, Droplets, BarChart2, Sparkles, Leaf,
  FileText, Sofa, Hammer, PenLine, Container, Palette, Recycle
} from 'lucide-react'

const pasos = [
  { num: 1, titulo: 'Recolección', desc: 'Los envases Tetrapak se recolectan en centros de acopio designados donde se separan de otros materiales.', Icon: Package, bg: '#2563EB' },
  { num: 2, titulo: 'Clasificación', desc: 'Los envases se clasifican y se preparan para el proceso de separación de sus componentes principales.', Icon: RefreshCw, bg: '#0D9488' },
  { num: 3, titulo: 'Pulpado', desc: 'Los envases se sumergen en agua para separar las fibras de papel del aluminio y plástico.', Icon: Droplets, bg: '#0891B2' },
  { num: 4, titulo: 'Separación', desc: 'Las fibras de papel se recuperan y el polialuminio (plástico + aluminio) se procesa por separado.', Icon: BarChart2, bg: '#1D4ED8' },
  { num: 5, titulo: 'Transformación', desc: 'Los materiales separados se procesan para crear nuevos productos sostenibles y útiles.', Icon: Sparkles, bg: '#2F8B62' },
  { num: 6, titulo: 'Productos Nuevos', desc: 'Se fabrican nuevos productos como papel, muebles, láminas para construcción y más.', Icon: Leaf, bg: '#69B34C' },
]

const productos = [
  { Icon: FileText, titulo: 'Papel y Cartón', desc: 'Las fibras de papel recuperadas se utilizan para fabricar papel higiénico, servilletas, cajas de cartón y otros productos de papel.', color: '#2563EB' },
  { Icon: Sofa, titulo: 'Muebles y Tableros', desc: 'El polialuminio se transforma en tableros aglomerados para fabricar muebles durables y ecológicos.', color: '#0D9488' },
  { Icon: Hammer, titulo: 'Material de Construcción', desc: 'Se crean láminas y tejas para techos, así como otros materiales usados en la industria de la construcción.', color: '#0891B2' },
  { Icon: PenLine, titulo: 'Artículos Escolares', desc: 'Reglas, carpetas y otros útiles escolares se fabrican a partir del aluminio y plástico reciclado.', color: '#2F8B62' },
  { Icon: Container, titulo: 'Pallets y Estibas', desc: 'Los pallets utilizados para transporte y almacenamiento se fabrican con el material reciclado.', color: '#1D4ED8' },
  { Icon: Palette, titulo: 'Artesanías', desc: 'Diversos productos artesanales como bolsas, carteras y accesorios se crean aprovechando el material reciclado.', color: '#69B34C' },
]

export default function QueHacer() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">

        {/* Hero */}
        <div className="text-center anim-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #1D6ADE 0%, #0D9488 62%, #69B34C 100%)' }}>
            <Recycle size={46} strokeWidth={1.3} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            ¿Qué se hace con el{' '}
            <span style={{ background: 'linear-gradient(90deg, #1D6ADE, #0D9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tetrapak
            </span>?
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-base">
            Descubre el increíble proceso de reciclaje del Tetrapak y cómo se transforma en productos útiles para nuestra vida diaria.
          </p>
        </div>

        {/* Proceso de Reciclaje */}
        <section>
          <div className="text-center mb-8 anim-fade-up" style={{ animationDelay: '60ms' }}>
            <h2 className="text-2xl font-extrabold text-gray-900">Proceso de Reciclaje</h2>
            <p className="text-gray-400 text-sm mt-1">Del envase usado al producto nuevo en 6 pasos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pasos.map(({ num, titulo, desc, Icon, bg }, idx) => (
              <div
                key={num}
                className="rounded-2xl p-7 text-white cursor-default hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 active:scale-[0.99] anim-scale-in"
                style={{
                  background: `linear-gradient(145deg, ${bg}f0, ${bg}bb)`,
                  animationDelay: `${120 + idx * 80}ms`,
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.22)' }}>
                    <Icon size={28} strokeWidth={1.5} className="text-white" />
                  </div>
                  <span className="text-white/50 font-extrabold text-4xl leading-none">0{num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{titulo}</h3>
                <p className="text-sm opacity-85 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Productos Derivados */}
        <section className="anim-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="text-center mb-7">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Productos Derivados del Tetrapak Reciclado</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                El reciclaje del Tetrapak permite crear una amplia variedad de productos útiles, contribuyendo a la economía circular.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productos.map(({ Icon, titulo, desc, color }, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200 cursor-default group anim-fade-up"
                  style={{ background: `${color}0d`, animationDelay: `${250 + i * 50}ms` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={22} strokeWidth={1.8} style={{ color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">{titulo}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impacto Ambiental */}
        <section className="anim-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <div className="px-8 py-5 text-center"
              style={{ background: 'linear-gradient(90deg, #1D6ADE 0%, #0D9488 55%, #69B34C 100%)' }}>
              <h2 className="text-2xl font-extrabold text-white">Impacto Ambiental</h2>
              <p className="text-white/75 text-sm mt-1">Por cada tonelada reciclada</p>
            </div>
            <div className="bg-white border border-gray-100 border-t-0 p-8">
              <p className="text-sm text-gray-600 text-center mb-7 max-w-md mx-auto">
                Por cada tonelada de Tetrapak reciclado, salvamos árboles, ahorramos agua y reducimos emisiones de CO₂.
              </p>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { value: '1 Ton', label: 'Tetrapak reciclado', color: '#1D6ADE' },
                  { value: '17 Árboles', label: 'Salvados', color: '#10B981' },
                  { value: '27,000 L', label: 'Agua ahorrada', color: '#0891B2' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 text-center text-white hover:scale-[1.04] transition-transform duration-200 cursor-default shadow-md anim-scale-in"
                    style={{ background: stat.color, animationDelay: `${350 + i * 80}ms` }}
                  >
                    <div className="text-3xl font-extrabold leading-tight">{stat.value}</div>
                    <div className="text-sm opacity-80 mt-2 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="anim-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="text-center py-12 px-8 rounded-3xl shadow-lg text-white"
            style={{ background: 'linear-gradient(135deg, #1D6ADE 0%, #0D9488 55%, #69B34C 100%)' }}>
            <h2 className="text-3xl font-extrabold mb-3">¡Tú Puedes Hacer la Diferencia!</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
              Recuerda lavar y aplanar tus envases Tetrapak antes de llevarlos a un centro de acopio. Cada envase cuenta para construir un futuro más sostenible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Lavar el envase', color: '#10B981' },
                { label: 'Aplanarlo para ahorrar espacio', color: '#0D9488' },
                { label: 'Llevarlo al centro de acopio', color: '#3B82F6' },
              ].map(({ label, color }, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 active:scale-95 shadow-md"
                  style={{ background: color }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="3" d="M5 13l4 4L19 7" />
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
