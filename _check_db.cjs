const mysql = require('mysql2');
require('dotenv').config({ path: 'backend/.env' });
const db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });

// Remove stale test booking #1 and free up Table 101
db.query('DELETE FROM bookings WHERE id = 1', (err) => {
  if (err) console.error('Delete booking err:', err);
  else console.log('Deleted stale booking #1');
  
  db.query('UPDATE tables SET booked = 0 WHERE id = 1', (err2) => {
    if (err2) console.error('Update table err:', err2);
    else console.log('Freed Table 101 (id=1)');
    
    // Clear ALL old notifications to start fresh
    db.query('DELETE FROM notifications', (err3) => {
      if (err3) console.error('Delete notifs err:', err3);
      else console.log('Cleared all old notifications');
      
      // Verify final state
      db.query('SELECT id, table_name, booked FROM tables ORDER BY id', (e, tables) => {
        console.log('\n=== FINAL TABLE STATE ===');
        tables.forEach(t => console.log(`  ${t.table_name}: ${t.booked ? 'BOOKED' : 'AVAILABLE'}`));
        
        db.query('SELECT id, user_id, table_id, name FROM bookings ORDER BY id', (e2, bookings) => {
          console.log('\n=== FINAL BOOKINGS ===');
          bookings.forEach(b => console.log(`  Booking #${b.id}: user=${b.user_id} table_id=${b.table_id} name=${b.name}`));
          db.end();
        });
      });
    });
  });
});
