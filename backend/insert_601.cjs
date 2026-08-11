const mysql = require('mysql2'); 
require('dotenv').config({ path: 'backend/.env' }); 
const db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }); 
db.query('SELECT id FROM branches LIMIT 1', (err, results) => { 
  if (err || results.length === 0) process.exit(1); 
  const branchId = results[0].id; 
  db.query('INSERT INTO tables (branch_id, table_name, table_type, chairs_list, booked, price) VALUES (?, "VIP Lounge (Table 601)", "8-pair", "[1, 2, 3, 4, 5, 6, 7, 8]", false, 300.00)', [branchId], (err, res) => { 
    if (err) console.error(err); 
    else console.log('Inserted Table 601'); 
    process.exit(0); 
  }); 
});
