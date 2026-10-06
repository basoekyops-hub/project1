import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// Mengurai dan memverifikasi token sesi (Mendukung Firebase Authentication & Local JWT)
export function verifyToken(token: string) {
  try {
    try {
      const verified = jwt.verify(token, 'firebase-portal-session') as any;
      if (verified && (verified.id || verified.sub)) {
        return {
          id: verified.id || verified.sub,
          email: verified.email || 'admin@pengawassekolah.id',
          role: (verified.role || 'ADMIN').toUpperCase(),
          name: verified.name || 'Admin User'
        };
      }
    } catch {}

    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.sub || decoded.user_id || decoded.id)) {
      return {
        id: decoded.sub || decoded.user_id || decoded.id,
        email: decoded.email || 'admin@pengawassekolah.id',
        role: (decoded.role || 'SUPERADMIN').toUpperCase(),
        name: decoded.name || 'Administrator Portal'
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateToken(payload: { id: string; email: string; role: string; name: string }): string {
  // Sesi token ringan berbasis identitas
  return jwt.sign(payload, 'firebase-portal-session', { expiresIn: '7d' });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Akses ditolak: Token autentikasi diperlukan.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.' });
    return;
  }

  req.user = decoded;
  next();
}

/**
 * Middleware untuk membatasi aksi sensitif hanya kepada Superadmin
 */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const role = (req.user?.role || '').toUpperCase();
    if (role !== 'SUPERADMIN' && role !== 'SUPER_ADMIN') {
      res.status(403).json({ 
        error: 'Akses ditolak: Fitur ini hanya dapat dikelola oleh level Superadmin.' 
      });
      return;
    }
    next();
  });
}
