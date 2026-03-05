import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// allowedRoles: array of roles that can access the route
// e.g. ['admin', 'employee']
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to the first public page
    return <Navigate to="/que-hacer" replace />
  }

  return children
}
