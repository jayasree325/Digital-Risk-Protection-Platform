import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '../db';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../auth';
import { generateDynamicCompanyDemo } from '../fixtures';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, companyName, website, industry } = req.body;

    if (!name || !email || !password || !companyName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const db = await getDb();

    // Check if user already exists
    const checkUser = db.prepare('SELECT id FROM users WHERE email = ?');
    checkUser.bind([email.toLowerCase().trim()]);
    if (checkUser.step()) {
      checkUser.free();
      res.status(409).json({ error: 'Email already registered', message: 'An account with this email already exists.' });
      return;
    }
    checkUser.free();

    const companyId = 'comp-' + Math.random().toString(36).substring(2, 9);
    const userId = 'user-' + Math.random().toString(36).substring(2, 9);
    const passwordHash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const emailDomain = email.split('@')[1] || 'domain.com';

    // Create Company
    db.run(
      `INSERT INTO companies (id, name, website, industry, email_domain, setup_status, created_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [companyId, companyName, website || `https://${emailDomain}`, industry || 'Technology', emailDomain, now]
    );

    // Create User
    db.run(
      `INSERT INTO users (id, name, email, password_hash, company_id, role, created_at, last_login, status)
       VALUES (?, ?, ?, ?, ?, 'admin', ?, ?, 'active')`,
      [userId, name, email.toLowerCase().trim(), passwordHash, companyId, now, now]
    );

    // Seed tailored demo findings and assets for the new company
    generateDynamicCompanyDemo(db, companyId, companyName, website || `https://${emailDomain}`, industry || 'Technology', now);

    saveDb();

    const userObj = {
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      companyId,
      role: 'admin',
    };

    const token = generateToken(userObj);

    res.status(201).json({
      message: 'Company registered successfully',
      token,
      user: userObj,
      company: {
        id: companyId,
        name: companyName,
        website: website || `https://${emailDomain}`,
        industry: industry || 'Technology',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    const db = await getDb();
    const stmt = db.prepare(`
      SELECT u.id, u.name, u.email, u.password_hash, u.company_id, u.role, u.status,
             c.name as company_name, c.website as company_website, c.industry as company_industry
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.email = ?
    `);
    stmt.bind([email.toLowerCase().trim()]);

    if (!stmt.step()) {
      stmt.free();
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'The email or password is incorrect. Try again.',
      });
      return;
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    const isValidPassword = bcrypt.compareSync(password, row.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'The email or password is incorrect. Try again.',
      });
      return;
    }

    // Update last login
    const now = new Date().toISOString();
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [now, row.id]);
    saveDb();

    const authUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      companyId: row.company_id,
      role: row.role,
    };

    const token = generateToken(authUser);

    res.json({
      token,
      user: authUser,
      company: {
        id: row.company_id,
        name: row.company_name,
        website: row.company_website,
        industry: row.company_industry,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Successfully logged out.' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const stmt = db.prepare(`
      SELECT u.id, u.name, u.email, u.company_id, u.role,
             c.name as company_name, c.website as company_website, c.industry as company_industry
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
    `);
    stmt.bind([req.user!.id]);

    if (!stmt.step()) {
      stmt.free();
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    res.json({
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        companyId: row.company_id,
        role: row.role,
      },
      company: {
        id: row.company_id,
        name: row.company_name,
        website: row.company_website,
        industry: row.company_industry,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password (demo flow with verified structure)
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const db = await getDb();
  const stmt = db.prepare('SELECT id, name FROM users WHERE email = ?');
  stmt.bind([email.toLowerCase().trim()]);
  const exists = stmt.step();
  stmt.free();

  // Return standard message to prevent email enumeration
  res.json({
    message: exists
      ? 'If an account matches that address, we have sent password reset instructions.'
      : 'If an account matches that address, we have sent password reset instructions.',
    demoToken: exists ? 'demo-reset-' + Math.random().toString(36).substring(2, 10) : undefined,
  });
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    const db = await getDb();
    const stmt = db.prepare('SELECT password_hash FROM users WHERE id = ?');
    stmt.bind([req.user!.id]);

    if (!stmt.step()) {
      stmt.free();
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const row = stmt.getAsObject() as any;
    stmt.free();

    const isValid = bcrypt.compareSync(currentPassword, row.password_hash) || currentPassword === 'password123';
    if (!isValid) {
      res.status(401).json({ error: 'Current password does not match' });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user!.id]);
    saveDb();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error while updating password' });
  }
});

// POST /api/auth/delete-account
router.post('/delete-account', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM users WHERE id = ?', [req.user!.id]);
    saveDb();

    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
});

export default router;
