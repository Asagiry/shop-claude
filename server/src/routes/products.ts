import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, min_price, max_price, size, sort, search } = req.query;
    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }
    if (min_price) {
      query += ` AND p.price >= $${paramIndex++}`;
      params.push(Number(min_price));
    }
    if (max_price) {
      query += ` AND p.price <= $${paramIndex++}`;
      params.push(Number(max_price));
    }
    if (size) {
      query += ` AND $${paramIndex++} = ANY(p.sizes)`;
      params.push(size);
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'name') query += ' ORDER BY p.name ASC';
    else if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
    else query += ' ORDER BY p.id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
