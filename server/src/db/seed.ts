import pool from './pool';
import bcrypt from 'bcryptjs';

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM password_reset_tokens');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');

    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE categories_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE orders_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE order_items_id_seq RESTART WITH 1");

    const categories = [
      { name: 'T-Shirts', slug: 'tshirts' },
      { name: 'Posters', slug: 'posters' },
      { name: 'Hoodies', slug: 'hoodies' },
    ];

    for (const cat of categories) {
      await client.query('INSERT INTO categories (name, slug) VALUES ($1, $2)', [cat.name, cat.slug]);
    }

    const products = [
      { name: 'Vibe Miner Classic Tee', description: 'The original Vibe Miner t-shirt featuring the iconic pixel pickaxe design. Made from 100% organic cotton for maximum comfort during your gaming sessions.', price: 29.99, image_url: '/assets/tshirt_vibe_miner.png', category_id: 1, sizes: '{S,M,L,XL}', stock: 50 },
      { name: 'Pixel Heart Retro Tee', description: 'Show your love for retro gaming with this pixel heart design. Perfect for indie game enthusiasts who appreciate classic aesthetics.', price: 24.99, image_url: '/assets/tshirt_pixel_heart.png', category_id: 1, sizes: '{S,M,L,XL,XXL}', stock: 35 },
      { name: 'Synthwave Sunset Tee', description: 'A stunning synthwave-inspired design with neon gradients and retro grid. Transport yourself to the digital sunset of your favorite indie worlds.', price: 27.99, image_url: '/assets/tshirt_synthwave.png', category_id: 1, sizes: '{S,M,L,XL}', stock: 40 },
      { name: 'Game Over Glitch Tee', description: 'Embrace the glitch aesthetic with this Game Over screen design. Features distorted pixels and VHS-style artifacts.', price: 26.99, image_url: '/assets/tshirt_game_over.png', category_id: 1, sizes: '{M,L,XL}', stock: 30 },
      { name: 'Cyber Cat Neon Tee', description: 'A cyberpunk-inspired cat with glowing neon outlines. For gamers who love both cats and futuristic indie aesthetics.', price: 28.99, image_url: '/assets/tshirt_cyber_cat.png', category_id: 1, sizes: '{S,M,L,XL,XXL}', stock: 45 },
      { name: 'Loading Bar Patience Tee', description: 'The eternal loading bar that every gamer knows too well. A humorous take on waiting for your favorite indie game to load.', price: 22.99, image_url: '/assets/tshirt_loading_bar.png', category_id: 1, sizes: '{S,M,L,XL}', stock: 55 },
      { name: 'Retro Gamepad Tee', description: 'A beautifully detailed retro gamepad illustration. Celebrate the controllers that started it all in the indie gaming revolution.', price: 25.99, image_url: '/assets/tshirt_retro_gamepad.png', category_id: 1, sizes: '{S,M,L,XL}', stock: 38 },
      { name: 'Glitch Skull Digital Tee', description: 'A haunting digital skull made of corrupted data and glitch artifacts. Perfect for fans of dark indie horror games.', price: 31.99, image_url: '/assets/tshirt_glitch_skull.png', category_id: 1, sizes: '{M,L,XL,XXL}', stock: 25 },
      { name: 'Space Invader Tribute Tee', description: 'A modern tribute to the classic space invader. Reimagined with vibrant colors and indie game aesthetics.', price: 23.99, image_url: '/assets/tshirt_space_invader.png', category_id: 1, sizes: '{S,M,L,XL}', stock: 42 },
      { name: 'D20 Dice Gamer Tee', description: 'Roll for initiative! This D20 dice design combines tabletop gaming with indie game culture in a stunning geometric pattern.', price: 26.99, image_url: '/assets/tshirt_d20_dice.png', category_id: 1, sizes: '{S,M,L,XL,XXL}', stock: 33 },
      { name: 'Vibe Miner World Poster', description: 'A high-quality poster featuring the vast world of Vibe Miner. Printed on premium matte paper, perfect for your gaming room.', price: 19.99, image_url: '/assets/tshirt_vibe_miner.png', category_id: 2, sizes: '{A3,A2}', stock: 60 },
      { name: 'Indie Games Collage Poster', description: 'A beautiful collage of iconic indie game moments. Features pixel art landscapes from multiple beloved indie titles.', price: 17.99, image_url: '/assets/tshirt_pixel_heart.png', category_id: 2, sizes: '{A3,A2,A1}', stock: 40 },
      { name: 'Neon Gaming Setup Poster', description: 'Stunning neon-lit gaming setup poster with cyberpunk vibes. The perfect wall art for any gamer den.', price: 21.99, image_url: '/assets/tshirt_synthwave.png', category_id: 2, sizes: '{A3,A2}', stock: 35 },
      { name: 'Vibe Miner Deluxe Hoodie', description: 'Stay warm while mining vibes. Premium heavyweight hoodie with the Vibe Miner logo embroidered on the chest.', price: 54.99, image_url: '/assets/tshirt_cyber_cat.png', category_id: 3, sizes: '{S,M,L,XL}', stock: 20 },
      { name: 'Pixel Art Developer Hoodie', description: 'A cozy hoodie for indie game developers and pixel art enthusiasts. Features subtle code patterns in the fabric.', price: 49.99, image_url: '/assets/tshirt_retro_gamepad.png', category_id: 3, sizes: '{M,L,XL,XXL}', stock: 15 },
    ];

    for (const p of products) {
      await client.query(
        'INSERT INTO products (name, description, price, image_url, category_id, sizes, stock) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [p.name, p.description, p.price, p.image_url, p.category_id, p.sizes, p.stock]
      );
    }

    // Create users
    const adminHash = await bcrypt.hash('admin', 10);
    const userHash = await bcrypt.hash('password123', 10);

    await client.query(
      "INSERT INTO users (email, username, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)",
      ['admin@shop.com', 'admin', adminHash, 'Admin User', 'admin']
    );
    await client.query(
      "INSERT INTO users (email, username, password_hash, full_name, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      ['john@example.com', 'john_gamer', userHash, 'John Smith', '+1-555-0101', '123 Pixel Street, Gamerville', 'customer']
    );
    await client.query(
      "INSERT INTO users (email, username, password_hash, full_name, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      ['jane@example.com', 'jane_indie', userHash, 'Jane Doe', '+1-555-0202', '456 Voxel Avenue, Indie Town', 'customer']
    );

    // Create mock orders
    const orderData = [
      { user_id: 2, status: 'delivered', total: 79.97, full_name: 'John Smith', address: '123 Pixel Street', phone: '+1-555-0101', payment_method: 'card' },
      { user_id: 2, status: 'delivered', total: 54.99, full_name: 'John Smith', address: '123 Pixel Street', phone: '+1-555-0101', payment_method: 'card' },
      { user_id: 3, status: 'shipped', total: 47.98, full_name: 'Jane Doe', address: '456 Voxel Avenue', phone: '+1-555-0202', payment_method: 'cash' },
      { user_id: 3, status: 'confirmed', total: 29.99, full_name: 'Jane Doe', address: '456 Voxel Avenue', phone: '+1-555-0202', payment_method: 'card' },
      { user_id: 2, status: 'delivered', total: 52.98, full_name: 'John Smith', address: '123 Pixel Street', phone: '+1-555-0101', payment_method: 'card' },
    ];

    for (const o of orderData) {
      const res = await client.query(
        "INSERT INTO orders (user_id, status, total, full_name, address, phone, payment_method, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - interval '1 day' * (random() * 30)::int) RETURNING id",
        [o.user_id, o.status, o.total, o.full_name, o.address, o.phone, o.payment_method]
      );
      const orderId = res.rows[0].id;

      // Add some order items
      await client.query(
        "INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)",
        [orderId, 1, 'Vibe Miner Classic Tee', 'M', 1, 29.99]
      );
      if (o.total > 40) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)",
          [orderId, 3, 'Synthwave Sunset Tee', 'L', 1, 27.99]
        );
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
