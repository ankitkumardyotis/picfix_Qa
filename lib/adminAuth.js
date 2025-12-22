import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

/**
 * Middleware to check if user is authenticated and has admin role
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @returns {Object|null} - Returns user session if admin, null otherwise
 */
export async function requireAdmin(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    // Check if user is authenticated
    if (!session || !session.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        error: 'UNAUTHORIZED' 
      })
      return null
    }
    
    // Check if user has admin role (admin or super_admin)
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      res.status(403).json({ 
        message: 'Admin access required',
        error: 'FORBIDDEN' 
      })
      return null
    }
    
    return session
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'INTERNAL_ERROR' 
    })
    return null
  }
}

/**
 * Middleware to check if user is authenticated and has super admin role
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @returns {Object|null} - Returns user session if super admin, null otherwise
 */
export async function requireSuperAdmin(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    // Check if user is authenticated
    if (!session || !session.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        error: 'UNAUTHORIZED' 
      })
      return null
    }
    
    // Check if user has super admin role
    if (session.user.role !== 'super_admin') {
      res.status(403).json({ 
        message: 'Super admin access required',
        error: 'FORBIDDEN' 
      })
      return null
    }
    
    return session
  } catch (error) {
    console.error('Super admin auth error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'INTERNAL_ERROR' 
    })
    return null
  }
}

/**
 * Higher-order function to protect API routes with admin authentication
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Protected API route handler
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    const session = await requireAdmin(req, res)
    
    // If requireAdmin returned null, it already sent an error response
    if (!session) {
      return
    }
    
    // Add session to request object for use in handler
    req.session = session
    
    // Call the original handler
    return handler(req, res)
  }
}

/**
 * Higher-order function to protect API routes with super admin authentication
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Protected API route handler
 */
export function withSuperAdminAuth(handler) {
  return async (req, res) => {
    const session = await requireSuperAdmin(req, res)
    
    // If requireSuperAdmin returned null, it already sent an error response
    if (!session) {
      return
    }
    
    // Add session to request object for use in handler
    req.session = session
    
    // Call the original handler
    return handler(req, res)
  }
}

/**
 * Check if user is admin on client side
 * @param {Object} session - NextAuth session object
 * @returns {boolean} - True if user is admin or super_admin
 */
export function isAdmin(session) {
  return session?.user?.role === 'admin' || session?.user?.role === 'super_admin'
}

/**
 * Check if user is super admin on client side
 * @param {Object} session - NextAuth session object
 * @returns {boolean} - True if user is super_admin
 */
export function isSuperAdmin(session) {
  return session?.user?.role === 'super_admin'
}

/**
 * Check if user can manage other admins
 * @param {Object} session - NextAuth session object
 * @returns {boolean} - True if user is super_admin
 */
export function canManageAdmins(session) {
  return isSuperAdmin(session)
}
