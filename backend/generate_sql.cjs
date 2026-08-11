const fs = require('fs');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Akkies#445',
    database: 'hotel_booking'
});

db.connect(err => {
    if (err) throw err;
    db.query('SELECT id, name FROM foods', (err, results) => {
        if (err) throw err;
        
        let sqlContent = '-- Paste your custom image URLs between the single quotes for each food item.\n';
        sqlContent += '-- Then run this script in MySQL Workbench to update your database!\n\n';
        sqlContent += 'USE hotel_booking;\n\n';
        
        results.forEach(food => {
            sqlContent += UPDATE foods SET image = 'PASTE_YOUR_IMAGE_URL_HERE' WHERE name = '';\n;
        });
        
        fs.writeFileSync('backend/update_images.sql', sqlContent);
        console.log('update_images.sql created!');
        process.exit(0);
    });
});
