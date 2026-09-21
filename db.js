import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const file = path.resolve(process.env.DATABASE_FILE || './data/care4u.db');
fs.mkdirSync(path.dirname(file), { recursive: true });
const native = new DatabaseSync(file);
const db = {
  exec: sql => native.exec(sql),
  prepare: sql => {
    const statement = native.prepare(sql);
    return { run: (...args) => statement.run(...args), get: (...args) => statement.get(...args), all: (...args) => statement.all(...args) };
  },
  transaction: callback => (...args) => { native.exec('BEGIN'); try { const result = callback(...args); native.exec('COMMIT'); return result; } catch (error) { native.exec('ROLLBACK'); throw error; } }
};
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS brands (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, parent_id INTEGER REFERENCES categories(id), description TEXT DEFAULT '', featured INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, brand_id INTEGER REFERENCES brands(id), category_id INTEGER REFERENCES categories(id), sku TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, short_description TEXT DEFAULT '', description TEXT DEFAULT '', ingredients TEXT DEFAULT '', benefits TEXT DEFAULT '', usage TEXT DEFAULT '', warnings TEXT DEFAULT '', price INTEGER, sale_price INTEGER, stock_quantity INTEGER NOT NULL DEFAULT 0, low_stock_threshold INTEGER NOT NULL DEFAULT 5, status TEXT NOT NULL DEFAULT 'draft', featured INTEGER NOT NULL DEFAULT 0, best_seller INTEGER NOT NULL DEFAULT 0, new_arrival INTEGER NOT NULL DEFAULT 1, image_url TEXT DEFAULT '', seo_title TEXT DEFAULT '', seo_description TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT DEFAULT '', address TEXT NOT NULL, city TEXT NOT NULL, province TEXT DEFAULT '', postal_code TEXT DEFAULT '', notes TEXT DEFAULT '', subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL DEFAULT 0, discount INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new', payment_method TEXT NOT NULL DEFAULT 'cod', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL REFERENCES products(id), product_name TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1, expires_at TEXT);
`);
const seed = db.transaction(() => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@care4u.pk';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-before-deploying';
  db.prepare('INSERT OR IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)').run('Care4U Admin', adminEmail, bcrypt.hashSync(adminPassword, 12), 'admin');
  for (const name of ['Bioworth', 'Elixicare', 'Kaiwan Pharma']) db.prepare('INSERT OR IGNORE INTO brands (name,slug) VALUES (?,?)').run(name, name.toLowerCase().replaceAll(' ', '-'));
  for (const name of ['Health', 'Skincare', 'Haircare', 'Wellness', 'Personal Care']) db.prepare('INSERT OR IGNORE INTO categories (name,slug,featured) VALUES (?,?,?)').run(name, name.toLowerCase().replaceAll(' ', '-'), ['Health','Skincare','Haircare'].includes(name) ? 1 : 0);
  const items = [['Reju Max Cream','Bioworth','Skincare','CARE-BIO-001'],['UV DOT SC Gel','Bioworth','Skincare','CARE-BIO-002'],['Amazing Brighten & Hydrate Pack','Elixicare','Skincare','CARE-ELI-001'],['Nuehair Keratin Shampoo','Kaiwan Pharma','Haircare','CARE-KAI-001']];
  for (const [name,brand,category,sku] of items) {
    const brandId = db.prepare('SELECT id FROM brands WHERE name=?').get(brand).id;
    const categoryId = db.prepare('SELECT id FROM categories WHERE name=?').get(category).id;
    db.prepare('INSERT OR IGNORE INTO products (name,brand_id,category_id,sku,slug,status,short_description) VALUES (?,?,?,?,?,?,?)').run(name,brandId,categoryId,sku,name.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-').replace(/-$/,''),'draft','Verified product information will be added through the admin panel.');
  }
});
seed();
export default db;
