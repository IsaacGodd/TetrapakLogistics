import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { RecyclingProvider } from './context/RecyclingContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapaTransportistas from './pages/MapaTransportistas'
import QueHacer from './pages/QueHacer'
import Historia from './pages/Historia'
import CentrosAcopio from './pages/CentrosAcopio'
import ImportarDatos from './pages/ImportarDatos'
import Perfil from './pages/Perfil'
import Comunidad from './pages/Comunidad'

const ADMIN_ROLES = ['admin', 'employee', 'tester']
const TRANSPORT_ROLES = ['admin', 'employee', 'transportista', 'tester']
const ALL_ROLES = ['admin', 'employee', 'transportista', 'invitado', 'tester']

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-app-bg dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (['admin', 'employee', 'tester'].includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Navigate to="/que-hacer" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={
        <ProtectedRoute allowedRoles={ALL_ROLES}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/mapa-transportistas" element={
          <ProtectedRoute allowedRoles={TRANSPORT_ROLES}>
            <MapaTransportistas />
          </ProtectedRoute>
        } />
        <Route path="/que-hacer" element={<QueHacer />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/centros-acopio" element={<CentrosAcopio />} />
        <Route path="/importar" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <ImportarDatos />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/comunidad" element={<Comunidad />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <RecyclingProvider>
              <AppRoutes />
            </RecyclingProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
