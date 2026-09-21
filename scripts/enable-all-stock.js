import db from '../db.js';
const result=db.prepare("UPDATE products SET stock_quantity=10, status='published', updated_at=CURRENT_TIMESTAMP WHERE status != 'archived'").run();
console.log(`Enabled stock for ${result.changes} products. Products without prices still require pricing before checkout.`);
