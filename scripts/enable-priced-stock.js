import db from '../db.js';
const result=db.prepare("UPDATE products SET stock_quantity=10, status='published', updated_at=CURRENT_TIMESTAMP WHERE price IS NOT NULL AND price > 0 AND status != 'archived'").run();
console.log(`Enabled ${result.changes} priced products with initial stock quantity 10.`);
