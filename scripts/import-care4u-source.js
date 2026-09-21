import db from '../db.js';

const sourceUrl = 'https://care4u.pk/wp-json/wc/store/v1/products?per_page=100';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Source API returned ${response.status}`);
const products = await response.json();
const stripHtml = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const slugify = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
for (const statement of [
  `ALTER TABLE products ADD COLUMN source_url TEXT DEFAULT ''`,
  `ALTER TABLE products ADD COLUMN source_id INTEGER`,
  `ALTER TABLE products ADD COLUMN source_stock_status TEXT DEFAULT ''`,
  `ALTER TABLE products ADD COLUMN gallery_json TEXT DEFAULT '[]'`,
  `ALTER TABLE products ADD COLUMN tags_json TEXT DEFAULT '[]'`
]) { try { db.exec(statement); } catch {} }
const categoryMap = new Map();
const ensureCategory = category => { if (!category) return null; const existing = db.prepare('SELECT id FROM categories WHERE slug=?').get(category.slug); if (existing) return existing.id; return db.prepare('INSERT INTO categories (name,slug,description) VALUES (?,?,?)').run(stripHtml(category.name),category.slug,'Imported from the Care4U catalogue source.').lastInsertRowid; };
const ensureBrand = name => { if (!name) return null; const slug=slugify(name); const existing=db.prepare('SELECT id FROM brands WHERE slug=?').get(slug); if(existing) return existing.id; return db.prepare('INSERT INTO brands (name,slug,description) VALUES (?,?,?)').run(name,slug,'Imported from the Care4U catalogue source.').lastInsertRowid; };
for (const product of products) {
  const category = product.categories?.find(item => item.slug !== 'featured-products') || product.categories?.[0];
  const categoryId = category ? (categoryMap.get(category.slug) || ensureCategory(category)) : null;
  if (category) categoryMap.set(category.slug, categoryId);
  const brandName = product.brands?.[0]?.name || product.name.split(' ')[0];
  const brandId = ensureBrand(brandName);
  const sourcePrice = Number(product.prices?.price || 0);
  const price = sourcePrice ? Math.round(sourcePrice / 100) : null;
  const imageUrl = product.images?.[0]?.src || '';
  const gallery = JSON.stringify((product.images || []).map(image => image.src));
  const tags = JSON.stringify((product.tags || []).map(tag => tag.name));
  const slug = slugify(product.slug || product.name);
  const existing = db.prepare('SELECT id FROM products WHERE slug=?').get(slug);
  if (existing) {
    db.prepare(`UPDATE products SET name=?,brand_id=?,category_id=?,short_description=?,description=?,price=?,sale_price=?,image_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(product.name,brandId,categoryId,stripHtml(product.short_description),stripHtml(product.description),price,product.on_sale && product.prices?.sale_price ? Math.round(Number(product.prices.sale_price)/100) : null,imageUrl,existing.id);
  } else {
    db.prepare(`INSERT INTO products (name,brand_id,category_id,sku,slug,short_description,description,price,sale_price,stock_quantity,status,new_arrival,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(product.name,brandId,categoryId,`SRC-${product.id}`,slug,stripHtml(product.short_description),stripHtml(product.description),price,product.on_sale && product.prices?.sale_price ? Math.round(Number(product.prices.sale_price)/100) : null,0,'published',0,imageUrl);
  }
  db.prepare('UPDATE products SET source_url=?,source_id=?,source_stock_status=?,gallery_json=?,tags_json=? WHERE slug=?').run(product.permalink || '',product.id,product.is_in_stock ? 'in-stock' : 'out-of-stock',gallery,tags,slug);
}
console.log(`Imported ${products.length} public products from care4u.pk`);
