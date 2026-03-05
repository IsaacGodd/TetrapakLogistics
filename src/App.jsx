import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapaTransportistas from './pages/MapaTransportistas'
import QueHacer from './pages/QueHacer'
import Historia from './pages/Historia'
import CentrosAcopio from './pages/CentrosAcopio'

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin' || user.role === 'employee') return <Navigate to="/dashboard" replace />
  return <Navigate to="/que-hacer" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={
        <ProtectedRoute allowedRoles={['admin','employee','transportista','invitado']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin','employee']}>
            <Dashboard />
          </ProtectedRoute>
        }/>
        <Route path="/mapa-transportistas" element={
          <ProtectedRoute allowedRoles={['admin','employee','transportista']}>
            <MapaTransportistas />
          </ProtectedRoute>
        }/>
        <Route path="/que-hacer" element={<QueHacer />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/centros-acopio" element={<CentrosAcopio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
