import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { users } from '../data/mockData'
import {
  User, Mail, Hash, Shield, Lock, Eye, EyeOff,
  Truck, Route, X, CheckCircle, Camera,
} from 'lucide-react'

const ROLE_LABELS = {
  admin: 'Administrador', employee: 'Empleado',
  transportista: 'Transportista', invitado: 'Invitado', tester: 'Tester',
}
const ROLE_COLORS = {
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  employee: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  transportista: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  invitado: 'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300',
  tester: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
}

export default function Perfil() {
  const { user } = useAuth()
  const { dark } = useTheme()
  const { viajes } = useData()
  const imgInputRef = useRef(null)

  // Profile image — persisted in localStorage keyed by user id
  const storageKey = `profileImg_${user?.id ?? 'guest'}`
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem(storageKey) || null)
  const [imgError, setImgError] = useState('')

  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setImgError('Solo se aceptan imágenes'); return }
    if (file.size > 5 * 1024 * 1024) { setImgError('La imagen no debe superar 5 MB'); return }
    setImgError('')
    const reader = new FileReader()
    reader.onload = ev => {
      setProfileImg(ev.target.result)
      localStorage.setItem(storageKey, ev.target.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Password form
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSuccess, setPwSuccess] = useState(false)

  // Assign route (admin)
  const [assignModal, setAssignModal] = useState(null)
  const [assignedRoutes, setAssignedRoutes] = useState({})
  const [routeInput, setRouteInput] = useState('')

  const transportistas = users.filter(u => u.role === 'transportista')

  const tripsByName = viajes.reduce((acc, v) => {
    acc[v.conductor] = (acc[v.conductor] || 0) + 1
    return acc
  }, {})

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  const validatePw = () => {
    const errs = {}
    if (!pwForm.current) errs.current = 'Requerido'
    if (!pwForm.new || pwForm.new.length < 6) errs.new = 'Mínimo 6 caracteres'
    if (pwForm.new !== pwForm.confirm) errs.confirm = 'Las contraseñas no coinciden'
    setPwErrors(errs)
    return !Object.keys(errs).length
  }

  const handleChangePassword = () => {
    if (!validatePw()) return
    setPwSuccess(true)
    setPwForm({ current: '', new: '', confirm: '' })
    setPwErrors({})
    setTimeout(() => setPwSuccess(false), 4000)
  }

  const handleAssignRoute = () => {
    if (!routeInput.trim()) return
    setAssignedRoutes(prev => ({ ...prev, [assignModal.id]: routeInput.trim() }))
    setAssignModal(null)
    setRouteInput('')
  }

  const PwField = ({ fieldKey, label }) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={showPw[fieldKey] ? 'text' : 'password'}
          value={pwForm[fieldKey]}
          onChange={e => setPwForm(p => ({ ...p, [fieldKey]: e.target.value }))}
          className={`w-full pr-10 pl-3 py-2.5 text-sm rounded-xl border transition-all outline-none focus:ring-2
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${pwErrors[fieldKey]
              ? 'border-red-300 dark:border-red-600 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary/10'
            }`}
        />
        <button
          type="button"
          onClick={() => setShowPw(p => ({ ...p, [fieldKey]: !p[fieldKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {showPw[fieldKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {pwErrors[fieldKey] && <p className="text-xs text-red-500 mt-1">{pwErrors[fieldKey]}</p>}
    </div>
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 dark:from-[#0b1324] dark:via-[#101b32] dark:to-[#0f2230] dark:bg-none p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header avatar ── */}
        <div className="flex items-center gap-4 anim-fade-up">
          {/* Clickable avatar */}
          <div className="relative shrink-0 group cursor-pointer" onClick={() => imgInputRef.current?.click()}>
            {profileImg ? (
              <img
                src={profileImg}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${dark
                ? 'bg-gradient-to-br from-primary to-teal-500 text-white'
                : 'bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 text-white'
                }`}>
                {initials}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-0.5">
              <Camera size={16} className="text-white" strokeWidth={2} />
              <span className="text-white text-[9px] font-semibold leading-none">Cambiar</span>
            </div>
          </div>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-gray-50 leading-tight">{user?.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${ROLE_COLORS[user?.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABELS[user?.role] ?? user?.role}
            </span>
            {imgError && <p className="text-xs text-red-500 mt-1">{imgError}</p>}
          </div>
        </div>

        {/* ── Mi información ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm p-6 anim-fade-up" style={{ animationDelay: '60ms' }}>
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <User size={14} strokeWidth={2} className="text-blue-500 dark:text-blue-400" /> Mi Información
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Hash, label: 'ID', value: user?.id },
              { icon: User, label: 'Nombre', value: user?.name },
              { icon: Mail, label: 'Correo', value: user?.email },
              { icon: Shield, label: 'Rol', value: ROLE_LABELS[user?.role] ?? user?.role },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gradient-to-r from-blue-50/70 to-teal-50/60 dark:from-slate-700/60 dark:to-slate-700/60 dark:bg-none rounded-xl p-4 border border-blue-100/70 dark:border-gray-700">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} strokeWidth={2} className="text-teal-500 dark:text-gray-500" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-teal-100 dark:border-gray-700 shadow-sm p-6 anim-fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Lock size={14} strokeWidth={2} className="text-teal-500 dark:text-blue-400" /> Cambiar Contraseña
          </h2>

          {pwSuccess && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-400 text-xs rounded-xl px-4 py-3 mb-4">
              <CheckCircle size={13} strokeWidth={2} />
              Contraseña actualizada correctamente.
            </div>
          )}

          <div className="space-y-3">
            <PwField fieldKey="current" label="Contraseña actual" />
            <PwField fieldKey="new" label="Nueva contraseña" />
            <PwField fieldKey="confirm" label="Confirmar contraseña" />
            <button
              onClick={handleChangePassword}
              className="mt-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 text-white text-sm rounded-xl font-semibold hover:from-blue-700 hover:via-teal-700 hover:to-green-700 transition-all active:scale-95 shadow-sm"
            >
              Guardar contraseña
            </button>
          </div>
        </div>

        {/* ── Transportistas (admin / employee / tester) ── */}
        {['admin', 'employee', 'tester'].includes(user?.role) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm overflow-hidden anim-fade-up" style={{ animationDelay: '180ms' }}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Truck size={14} strokeWidth={2} className="text-teal-500" />
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Transportistas</h2>
              <span className="text-xs text-gray-400 ml-1">({transportistas.length})</span>
            </div>

            {transportistas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No hay transportistas registrados</p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {transportistas.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                      <span className="text-teal-600 dark:text-teal-300 font-bold text-sm">
                        {t.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.email}</p>
                      {assignedRoutes[t.id] && (
                        <p className="text-xs text-primary dark:text-blue-400 font-medium mt-0.5 truncate">
                          Ruta: {assignedRoutes[t.id]}
                        </p>
                      )}
                    </div>

                    {/* Trip count */}
                    <div className="text-center shrink-0 px-3">
                      <p className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">
                        {tripsByName[t.name] ?? 0}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">viajes</p>
                    </div>

                    {/* Assign route (admin only) */}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setAssignModal(t); setRouteInput(assignedRoutes[t.id] ?? '') }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-95 shrink-0"
                      >
                        <Route size={11} strokeWidth={2} />
                        Asignar ruta
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Assign route modal ── */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 anim-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Asignar Ruta</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{assignModal.name}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Nombre de la ruta
            </label>
            <input
              type="text"
              value={routeInput}
              onChange={e => setRouteInput(e.target.value)}
              placeholder="Ej: Ruta Norte - San Nicolás"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAssignRoute()}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 py-2.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignRoute}
                disabled={!routeInput.trim()}
                className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
