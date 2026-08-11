const mysql = require('mysql2');
require('dotenv').config({ path: 'backend/.env' });
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
const alterQuery = `
ALTER TABLE bookings
ADD COLUMN food_status ENUM('without_food', 'with_food') DEFAULT 'without_food',
ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
`;
db.query(alterQuery, (err, results) => {
  if (err) console.error('ALTER FAILED:', err);
  else console.log('ALTER SUCCESS', results);
  process.exit(0);
});
