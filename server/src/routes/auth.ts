import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/pool';
import { AuthRequest, authMiddleware, generateToken } from '../middleware/auth';
import { logEvent } from '../utils/logger';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password, full_name } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role',
      [email, username, password_hash, full_name || username]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    logEvent('USER_REGISTERED', `email=${email}`);
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, username, password_hash, role, full_name, phone, address FROM users WHERE email = $1 OR username = $1',
      [login]
    );

    if (result.rows.length === 0) {
      logEvent('LOGIN_FAILED', `login=${login} reason=user_not_found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logEvent('LOGIN_FAILED', `login=${login} reason=wrong_password`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, username: user.username });
    logEvent('LOGIN_SUCCESS', `user_id=${user.id} email=${user.email}`);
    res.json({
      user: { id: user.id, email: user.email, username: user.username, role: user.role, full_name: user.full_name, phone: user.phone, address: user.address },
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, role, full_name, phone, address FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, phone, address } = req.body;
    const result = await pool.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), address = COALESCE($3, address) WHERE id = $4 RETURNING id, email, username, role, full_name, phone, address',
      [full_name, phone, address, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'If the email exists, a reset token has been generated' });
    }

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 3600000); // 1 hour
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userResult.rows[0].id, token, expires_at]
    );

    logEvent('PASSWORD_RESET_REQUESTED', `email=${email} token=${token}`);
    res.json({ message: 'If the email exists, a reset token has been generated', token });
  } catch {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ error: 'Token and new password are required' });

    const tokenResult = await pool.query(
      'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, tokenResult.rows[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);

    logEvent('PASSWORD_RESET_SUCCESS', `user_id=${tokenResult.rows[0].user_id}`);
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
