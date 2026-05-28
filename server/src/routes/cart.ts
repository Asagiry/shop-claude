import { Router, Response } from 'express';
import pool from '../db/pool';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT ci.*, p.name, p.price, p.image_url, p.stock, p.sizes FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1 ORDER BY ci.created_at',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, size, quantity } = req.body;
    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3',
      [req.user!.id, product_id, size || null]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
        [quantity || 1, existing.rows[0].id]
      );
      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user!.id, product_id, size || null, quantity || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
      return res.json({ message: 'Item removed' });
    }
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.id, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ message: 'Item removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array required' });

    for (const item of items) {
      const existing = await pool.query(
        'SELECT id FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3',
        [req.user!.id, item.product_id, item.size || null]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4)',
          [req.user!.id, item.product_id, item.size || null, item.quantity || 1]
        );
      }
    }

    const result = await pool.query(
      'SELECT ci.*, p.name, p.price, p.image_url, p.stock, p.sizes FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

export default router;
