import { Router, Response } from 'express';
import pool from '../db/pool';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { logEvent } from '../utils/logger';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { items, full_name, address, phone, payment_method } = req.body;
    if (!items || !items.length || !full_name || !address || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    let total = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const productRes = await client.query('SELECT id, name, price, stock, sizes FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
      if (productRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }

      const product = productRes.rows[0];
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
      total += product.price * item.quantity;
      validatedItems.push({ ...item, price: product.price, product_name: product.name });
    }

    const orderRes = await client.query(
      'INSERT INTO orders (user_id, status, total, full_name, address, phone, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user!.id, 'new', total, full_name, address, phone, payment_method || 'card']
    );

    const order = orderRes.rows[0];

    for (const item of validatedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)',
        [order.id, item.product_id, item.product_name, item.size || null, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    logEvent('CHECKOUT_SUCCESS', `order_id=${order.id} user_id=${req.user!.id} total=${total}`);
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    client.release();
  }
});

router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );

    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        return { ...order, items: items.rows };
      })
    );

    res.json(ordersWithItems);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
