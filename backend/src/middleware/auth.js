const jwt = require('jsonwebtoken')

/**
 * Middleware — verifica JWT en Authorization: Bearer <token>
 * Adjunta req.user = { id, email, role }
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

/**
 * Middleware — verifica que el rol del usuario esté en allowedRoles.
 * Debe ir DESPUÉS de requireAuth.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Sin permisos' })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }
