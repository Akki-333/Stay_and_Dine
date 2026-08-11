const mysql = require('mysql2');
require('dotenv').config({ path: 'backend/.env' });
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const alterQuery = `
ALTER TABLE notifications
ADD COLUMN user_id INT NULL AFTER id,
ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
`;

db.query(alterQuery, (err, results) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') {
    console.error('ALTER FAILED:', err.message);
  } else {
    console.log('ALTER SUCCESS or COLUMN ALREADY EXISTS');
  }
  process.exit(0);
});
