import { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  Upload, FileText, CheckCircle, XCircle, Download,
  RefreshCw, Table, AlertCircle,
} from 'lucide-react'

// ===================== HELPERS =====================
const isDate     = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))
const isEmail    = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const noSpace    = v => !/\s/.test(v)
const isTime     = v => /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(String(v ?? ''))
const isIntGte   = (v, n) => Number.isInteger(Number(v)) && Number(v) >= n
const isFloatGte = (v, n) => !isNaN(parseFloat(v)) && parseFloat(v) >= n
const inRange    = (v, lo, hi) => !isNaN(parseFloat(v)) && parseFloat(v) >= lo && parseFloat(v) <= hi

const VALID_ESTADOS = ['Completado', 'En Proceso', 'Pendiente', 'Cancelado']
const VALID_ROLES   = ['admin', 'employee', 'transportista', 'tester']
const VALID_DIAS    = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// ===================== SCHEMAS =====================
const SCHEMAS = {
  centros: {
    label: 'Centros de Acopio',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-200',
    columns: [
      'id','nombre','alias','horario','dias','materiales',
      'tetrapak','movil','dias_activo','lat','lng','direccion','telefono',
      'capacidad','viajes','toneladas','conductores','eficiencia','costos',
    ],
    validators: {
      id:          v => !isIntGte(v, 1)                        ? 'Entero positivo requerido'           : null,
      nombre:      v => !String(v ?? '').trim()                ? 'Requerido'                           : null,
      alias:       v => !String(v ?? '').trim()                ? 'Requerido'                           : null,
      horario:     v => !isTime(v)                             ? 'Formato: HH:MM - HH:MM'              : null,
      dias:        v => {
        if (!String(v ?? '').trim()) return 'Requerido'
        const bad = String(v).split(',').map(d => d.trim()).filter(d => !VALID_DIAS.includes(d))
        return bad.length ? `Días inválidos: ${bad.join(', ')}` : null
      },
      materiales:  v => !String(v ?? '').trim()                ? 'Requerido'                           : null,
      tetrapak:    v => !['true','false'].includes(String(v ?? '').toLowerCase()) ? 'Solo "true" o "false"' : null,
      movil:       v => !['true','false'].includes(String(v ?? '').toLowerCase()) ? 'Solo "true" o "false"' : null,
      dias_activo: v => !isIntGte(v, 0)                        ? 'Entero >= 0 (0 si no es móvil)'     : null,
      lat:         v => !inRange(v, -90, 90)                   ? 'Número entre -90 y 90'               : null,
      lng:         v => !inRange(v, -180, 180)                 ? 'Número entre -180 y 180'             : null,
      direccion:   v => !String(v ?? '').trim()                ? 'Requerido'                           : null,
      telefono:    v => !String(v ?? '').trim()                ? 'Requerido'                           : null,
      capacidad:   v => !isIntGte(v, 1)                        ? 'Entero > 0'                          : null,
      viajes:      v => !isIntGte(v, 0)                        ? 'Entero >= 0'                         : null,
      toneladas:   v => !isFloatGte(v, 0)                      ? 'Número >= 0'                         : null,
      conductores: v => !isIntGte(v, 0)                        ? 'Entero >= 0'                         : null,
      eficiencia:  v => !inRange(v, 0, 100)                    ? 'Número entre 0 y 100'                : null,
      costos:      v => !isFloatGte(v, 0)                      ? 'Número >= 0'                         : null,
    },
    clean: row => ({
      id: parseInt(row.id),
      nombre: row.nombre, alias: row.alias, horario: row.horario,
      dias:       row.dias.split(',').map(d => d.trim()),
      materiales: row.materiales.split(',').map(m => m.trim()),
      tetrapak: row.tetrapak === 'true',
      movil: row.movil === 'true',
      dias_activo: parseInt(row.dias_activo) || 0,
      lat: parseFloat(row.lat), lng: parseFloat(row.lng),
      direccion: row.direccion, telefono: row.telefono,
      capacidad: parseInt(row.capacidad),
      stats: {
        viajes:      parseInt(row.viajes),
        toneladas:   parseFloat(row.toneladas),
        conductores: parseInt(row.conductores),
        eficiencia:  parseFloat(row.eficiencia),
        costos:      parseFloat(row.costos),
      },
    }),
    templateCSV:
`id,nombre,alias,horario,dias,materiales,tetrapak,movil,dias_activo,lat,lng,direccion,telefono,capacidad,viajes,toneladas,conductores,eficiencia,costos
1,Centro Norte - San Nicolás,+ Tetrapak,8:00 - 17:00,"Lun,Mar,Mié,Jue,Vie","Vidrio,Plástico,Tetrapak,Poliestireno",true,false,0,25.7514,-100.2773,"Av. Universidad 1234, San Nicolás de los Garza",81 9999 0001,56,1,9.2,2,95,38
2,Centro Sur - Cumbres,+ Tetrapak,9:00 - 17:00,"Lun,Mié,Vie","Plástico,Cartón,Tetrapak,PET",true,false,0,25.7012,-100.3510,"Blvd. Cumbres 567, Monterrey",81 9999 0002,42,1,7.5,2,97,32
3,Punto Móvil Plaza,Móvil,10:00 - 14:00,"Sáb,Dom","Tetrapak,Plástico,PET",true,true,7,25.6800,-100.3100,"Plaza Principal, Monterrey",81 9999 0099,15,0,0,1,90,10`,
  },

  viajes: {
    label: 'Viajes',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-200',
    columns: ['id','fecha','conductor','ruta','toneladas','estado'],
    validators: {
      id:        v => !isIntGte(v, 1)                   ? 'Entero positivo requerido'           : null,
      fecha:     v => !isDate(v)                         ? 'Formato YYYY-MM-DD'                  : null,
      conductor: v => !String(v ?? '').trim()            ? 'Requerido'                           : null,
      ruta:      v => !String(v ?? '').trim()            ? 'Requerido'                           : null,
      toneladas: v => !isFloatGte(v, 0.01)               ? 'Número positivo'                     : null,
      estado:    v => !VALID_ESTADOS.includes(v)         ? `Opciones: ${VALID_ESTADOS.join(' | ')}` : null,
    },
    clean: row => ({
      id: parseInt(row.id), fecha: row.fecha,
      conductor: row.conductor, ruta: row.ruta,
      toneladas: parseFloat(row.toneladas), estado: row.estado,
    }),
    templateCSV:
`id,fecha,conductor,ruta,toneladas,estado
1,2023-01-15,Juan Pérez,Ruta Norte,12.3,Completado
2,2023-01-16,Ana García,Ruta Centro,8.2,En Proceso
3,2023-01-17,Carlos López,Ruta Sur,9.0,Pendiente`,
  },

  usuarios: {
    label: 'Usuarios',
    accentBg: 'bg-green-50',
    accentText: 'text-green-700',
    accentBorder: 'border-green-200',
    columns: ['id','username','password','role','name','email'],
    validators: {
      id:       v => !isIntGte(v, 1)              ? 'Entero positivo requerido'      : null,
      username: v => {
        if (!String(v ?? '').trim()) return 'Requerido'
        if (!noSpace(v))             return 'Sin espacios'
        return null
      },
      password: v => (!v || String(v).length < 6) ? 'Mínimo 6 caracteres'           : null,
      role:     v => !VALID_ROLES.includes(v)     ? `Opciones: ${VALID_ROLES.join(' | ')}` : null,
      name:     v => !String(v ?? '').trim()       ? 'Requerido'                     : null,
      email:    v => !isEmail(v)                   ? 'Email inválido'                : null,
    },
    clean: row => ({
      id: parseInt(row.id),
      username: row.username, password: row.password,
      role: row.role, name: row.name, email: row.email,
    }),
    templateCSV:
`id,username,password,role,name,email
1,admin,admin123,admin,Carlos Admin,admin@tetrapak.com
2,empleado,empleado123,employee,Ana García,ana@tetrapak.com
3,transportista,trans123,transportista,Juan Pérez,juan@tetrapak.com`,
  },
}

// ===================== COMPONENT =====================
export default function ImportModule({ onImport }) {
  const [entityType,      setEntityType]      = useState('centros')
  const [phase,           setPhase]           = useState('idle')      // idle | sheetSelect | preview | done
  const [fileInfo,        setFileInfo]        = useState(null)
  const [sheetNames,      setSheetNames]      = useState([])
  const [pendingWB,       setPendingWB]       = useState(null)
  const [headers,         setHeaders]         = useState([])
  const [editedRows,      setEditedRows]      = useState([])
  const [errorMap,        setErrorMap]        = useState({})           // { rowIdx: { col: errStr } }
  const [dragOver,        setDragOver]        = useState(false)
  const [batches,         setBatches]         = useState([])
  const fileInputRef = useRef(null)

  const schema = SCHEMAS[entityType]

  // ---- validation ----
  const validateAllRows = useCallback((rows, sKey) => {
    const s = SCHEMAS[sKey]
    const errs = {}
    rows.forEach((row, ri) => {
      s.columns.forEach(col => {
        const err = s.validators[col]?.(String(row[col] ?? ''))
        if (err) { errs[ri] = errs[ri] || {}; errs[ri][col] = err }
      })
    })
    return errs
  }, [])

  // ---- normalize raw rows to schema columns ----
  const normalizeRows = (rawRows, sKey) => {
    const cols = SCHEMAS[sKey].columns
    return rawRows.map(row => {
      const out = {}
      cols.forEach(c => { out[c] = String(row[c] ?? '') })
      return out
    })
  }

  // ---- commit parsed data ----
  const commitData = useCallback((rawRows, fileName, fileSize, sKey) => {
    const rows = normalizeRows(rawRows, sKey)
    setHeaders(SCHEMAS[sKey].columns)
    setEditedRows(rows)
    setErrorMap(validateAllRows(rows, sKey))
    setFileInfo({ name: fileName, size: fileSize })
    setPhase('preview')
  }, [validateAllRows])

  // ---- parse CSV ----
  const parseCSV = useCallback((file, sKey) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: r => commitData(r.data, file.name, file.size, sKey),
    })
  }, [commitData])

  // ---- parse Excel ----
  const parseExcel = useCallback((file, sKey) => {
    const reader = new FileReader()
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: 'array' })
      if (wb.SheetNames.length === 1) {
        commitData(
          XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { raw: false }),
          file.name, file.size, sKey
        )
      } else {
        setPendingWB({ wb, fileName: file.name, fileSize: file.size, sKey })
        setSheetNames(wb.SheetNames)
        setFileInfo({ name: file.name, size: file.size })
        setPhase('sheetSelect')
      }
    }
    reader.readAsArrayBuffer(file)
  }, [commitData])

  const handleFile = useCallback(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') parseCSV(file, entityType)
    else if (['xlsx', 'xls'].includes(ext)) parseExcel(file, entityType)
    else alert('Formato no soportado. Use .csv, .xlsx o .xls')
  }, [entityType, parseCSV, parseExcel])

  const confirmSheet = sheetName => {
    if (!pendingWB) return
    const { wb, fileName, fileSize, sKey } = pendingWB
    commitData(XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { raw: false }), fileName, fileSize, sKey)
    setPendingWB(null); setSheetNames([])
  }

  // ---- inline edit ----
  const handleCellEdit = useCallback((ri, col, value) => {
    setEditedRows(prev => {
      const next = [...prev]; next[ri] = { ...next[ri], [col]: value }; return next
    })
    const err = SCHEMAS[entityType].validators[col]?.(value) ?? null
    setErrorMap(prev => {
      const next = { ...prev }
      if (err) {
        next[ri] = { ...(next[ri] || {}), [col]: err }
      } else {
        if (next[ri]) {
          // eslint-disable-next-line no-unused-vars
          const { [col]: _removed, ...rest } = next[ri]
          if (Object.keys(rest).length) next[ri] = rest
          else delete next[ri]
        }
      }
      return next
    })
  }, [entityType])

  // ---- confirm import ----
  const handleImport = () => {
    if (Object.keys(errorMap).length > 0) return
    const cleaned = editedRows.map(schema.clean)
    onImport?.(entityType, cleaned)
    setBatches(prev => [{
      id: Date.now(), entity: schema.label, count: cleaned.length,
      fileName: fileInfo.name, date: new Date().toLocaleString('es-MX'),
    }, ...prev])
    setPhase('done')
  }

  // ---- reset ----
  const reset = () => {
    setPhase('idle'); setFileInfo(null); setHeaders([]); setEditedRows([])
    setErrorMap({}); setPendingWB(null); setSheetNames([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ---- template download ----
  const downloadTemplate = () => {
    const blob = new Blob([schema.templateCSV], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `plantilla_${entityType}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalErrors = Object.values(errorMap).reduce((s, e) => s + Object.keys(e).length, 0)
  const errorRows   = Object.keys(errorMap).length

  // ===================== RENDER =====================
  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Importar Datos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Carga archivos CSV o Excel para actualizar registros</p>
        </div>
        {phase !== 'idle' && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
          >
            <RefreshCw size={14} strokeWidth={2} /> Nueva importación
          </button>
        )}
      </div>

      {/* ── Entity selector ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tipo de datos</p>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(SCHEMAS).map(([key, s]) => {
            const active = entityType === key
            return (
              <button
                key={key}
                disabled={phase !== 'idle'}
                onClick={() => setEntityType(key)}
                className={`flex-1 min-w-0 py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? `${s.accentBorder} ${s.accentBg} ${s.accentText}`
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════════════ IDLE ══════════════ */}
      {phase === 'idle' && (
        <>
          {/* Drag & drop zone */}
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-2xl border-2 border-dashed p-14 shadow-sm text-center cursor-pointer select-none transition-all duration-200 ${
              dragOver ? 'border-primary bg-blue-50 scale-[1.01] shadow-md' : 'border-gray-200 hover:border-primary hover:bg-gray-50/80'
            }`}
          >
            <input
              ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={e => { const f = e.target.files[0]; if (f) handleFile(f) }}
            />
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors ${dragOver ? 'bg-primary' : 'bg-blue-50'}`}>
              <Upload size={30} strokeWidth={1.5} className={dragOver ? 'text-white' : 'text-primary'} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {dragOver ? 'Suelta para cargar' : 'Arrastra tu archivo aquí'}
            </h3>
            <p className="text-sm text-gray-500 mb-1">o haz clic para seleccionar desde tu equipo</p>
            <p className="text-xs text-gray-400">Formatos aceptados: CSV, XLSX, XLS</p>
          </div>

          {/* Template download */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700">Plantilla — {schema.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                Columnas: {schema.columns.join(', ')}
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-xl font-medium transition-all active:scale-95 shrink-0"
            >
              <Download size={14} strokeWidth={2} /> Descargar plantilla
            </button>
          </div>
        </>
      )}

      {/* ══════════════ SHEET SELECT (Excel multisheet) ══════════════ */}
      {phase === 'sheetSelect' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-4">
            <Table size={24} strokeWidth={1.5} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Selecciona la hoja a importar</h2>
          <p className="text-sm text-gray-400 mb-6">{fileInfo?.name} · {sheetNames.length} hojas detectadas</p>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            {sheetNames.map(name => (
              <button
                key={name}
                onClick={() => confirmSheet(name)}
                className="w-full py-3 px-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-blue-50 text-sm font-semibold text-gray-700 hover:text-primary transition-all active:scale-95"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ PREVIEW ══════════════ */}
      {phase === 'preview' && (
        <>
          {/* File info + error summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText size={18} strokeWidth={1.8} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{fileInfo?.name}</p>
                  <p className="text-xs text-gray-400">
                    {editedRows.length} filas · {schema.label}
                    {fileInfo?.size ? ` · ${(fileInfo.size / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
              </div>
              {totalErrors > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 shrink-0">
                  <XCircle size={14} className="text-red-500" strokeWidth={2} />
                  <span className="text-xs font-semibold text-red-600">
                    {totalErrors} error{totalErrors !== 1 ? 'es' : ''} en {errorRows} fila{errorRows !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 shrink-0">
                  <CheckCircle size={14} className="text-green-600" strokeWidth={2} />
                  <span className="text-xs font-semibold text-green-700">Sin errores · listo para importar</span>
                </div>
              )}
            </div>
          </div>

          {/* Error hint */}
          {totalErrors > 0 && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-amber-700 leading-relaxed">
                Las celdas con errores están resaltadas en rojo. Haz clic en cualquier celda para editarla — la validación es en tiempo real.
                El botón de importar se habilitará cuando no haya errores.
              </p>
            </div>
          )}

          {/* Editable preview table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Table size={14} strokeWidth={2} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Vista previa — primeras 5 filas</span>
              <span className="text-xs text-gray-400 ml-1">
                (edita cualquier celda directamente)
              </span>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="text-xs w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left text-gray-400 font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap w-8 border-b border-gray-100">#</th>
                    {headers.map(h => (
                      <th key={h} className="text-left text-gray-500 font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                    <th className="text-left text-gray-400 font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap border-b border-gray-100 w-20">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {editedRows.slice(0, 5).map((row, ri) => {
                    const rowErr    = errorMap[ri] || {}
                    const hasRowErr = Object.keys(rowErr).length > 0
                    return (
                      <tr key={ri} className={`border-b border-gray-50 ${hasRowErr ? 'bg-red-50/25' : ''}`}>
                        <td className="px-3 py-1.5 text-gray-400 font-mono text-center">{ri + 1}</td>
                        {headers.map(col => {
                          const err = rowErr[col]
                          return (
                            <td key={col} className="px-1 py-1">
                              <div className="relative group">
                                <input
                                  type="text"
                                  value={row[col] ?? ''}
                                  onChange={e => handleCellEdit(ri, col, e.target.value)}
                                  className={`w-full min-w-[72px] px-2 py-1.5 rounded-lg text-xs transition-all outline-none border focus:ring-2 ${
                                    err
                                      ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-100'
                                      : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-gray-50 focus:border-primary focus:bg-white focus:ring-primary/10'
                                  }`}
                                />
                                {/* Error tooltip */}
                                {err && (
                                  <div className="absolute bottom-full left-0 mb-1.5 z-30 hidden group-hover:block pointer-events-none">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl max-w-[220px] leading-snug">
                                      {err}
                                      <div className="absolute top-full left-3 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                        {/* Row status */}
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {hasRowErr
                            ? <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                <XCircle size={11} strokeWidth={2.5} /> Error
                              </span>
                            : <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                <CheckCircle size={11} strokeWidth={2.5} /> OK
                              </span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {editedRows.length > 5 && (
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                ... y {editedRows.length - 5} fila{editedRows.length - 5 !== 1 ? 's' : ''} más
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={reset}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={totalErrors > 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle size={15} strokeWidth={2} />
              Confirmar importación · {editedRows.length} registro{editedRows.length !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {/* ══════════════ DONE ══════════════ */}
      {phase === 'done' && (
        <div className="bg-white rounded-2xl border border-green-100 p-10 shadow-sm text-center anim-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-4">
            <CheckCircle size={32} strokeWidth={1.5} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">¡Importación exitosa!</h2>
          <p className="text-gray-500 text-sm mb-6">
            <strong>{batches[0]?.count}</strong> registros de <strong>{batches[0]?.entity}</strong> importados correctamente.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-white text-sm rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            Importar otro archivo
          </button>
        </div>
      )}

      {/* ══════════════ HISTORY ══════════════ */}
      {batches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Historial de importaciones (sesión actual)</h3>
            <span className="text-xs text-gray-400">{batches.length} importación{batches.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {batches.map(b => (
              <div key={b.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} strokeWidth={2} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.fileName}</p>
                  <p className="text-xs text-gray-400">{b.entity} · {b.count} registros · {b.date}</p>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
                  {b.count} importados
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
