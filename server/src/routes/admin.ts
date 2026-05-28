import { Router, Response } from 'express';
import pool from '../db/pool';
import { AuthRequest, authMiddleware, adminMiddleware } from '../middleware/auth';
import { logEvent } from '../utils/logger';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Products management
router.get('/products', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image_url, category_id, sizes, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    let finalImageUrl = image_url || '';

    // If image_url is an external URL, download it
    if (image_url && (image_url.startsWith('http://') || image_url.startsWith('https://'))) {
      try {
        const response = await fetch(image_url);
        if (response.ok) {
          const buffer = await response.buffer();
          const filename = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
          const uploadsDir = path.join(__dirname, '../../uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          fs.writeFileSync(path.join(uploadsDir, filename), buffer);
          finalImageUrl = `/uploads/${filename}`;
        }
      } catch {
        // Keep original URL if download fails
        finalImageUrl = image_url;
      }
    }

    const sizesArray = Array.isArray(sizes) ? `{${sizes.join(',')}}` : sizes || '{}';
    const result = await pool.query(
      'INSERT INTO products (name, description, price, image_url, category_id, sizes, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description || '', price, finalImageUrl, category_id || 1, sizesArray, stock || 0]
    );

    logEvent('PRODUCT_CREATED', `product_id=${result.rows[0].id} name=${name} price=${price}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image_url, category_id, sizes, stock } = req.body;
    const { id } = req.params;

    const oldProduct = await pool.query('SELECT price FROM products WHERE id = $1', [id]);
    if (oldProduct.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const sizesArray = Array.isArray(sizes) ? `{${sizes.join(',')}}` : sizes;
    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), image_url = COALESCE($4, image_url), category_id = COALESCE($5, category_id), sizes = COALESCE($6, sizes), stock = COALESCE($7, stock), updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, description, price, image_url, category_id, sizesArray, stock, id]
    );

    if (price && price !== oldProduct.rows[0].price) {
      logEvent('PRODUCT_PRICE_CHANGED', `product_id=${id} old_price=${oldProduct.rows[0].price} new_price=${price}`);
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    logEvent('PRODUCT_DELETED', `product_id=${id}`);
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders management
router.get('/orders', async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await pool.query('SELECT o.*, u.email as user_email, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
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

router.put('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    logEvent('ORDER_STATUS_CHANGED', `order_id=${req.params.id} new_status=${status}`);
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
