const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

async function slice2x2() {
    const imgPath = 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\ced9aeb7-5e63-4538-a921-5b43a7c7c0dd\\.user_uploaded\\media_1786371318888.jpg';
    const outputDir = path.join(__dirname, '../frontend/public/images/foods');
    
    try {
        const metadata = await sharp(imgPath).metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;
        
        const cellWidth = Math.floor(imgWidth / 2);
        const cellHeight = Math.floor(imgHeight / 2);
        
        console.log(`Image dimensions: ${imgWidth}x${imgHeight}. Cell size: ${cellWidth}x${cellHeight}`);

        const quadrants = [
            { name: 'samosa_chaat.jpg', x: 0, y: 0 },
            { name: 'chicken_tikka.jpg', x: cellWidth, y: 0 },
            { name: 'aloo_tikki.jpg', x: 0, y: cellHeight },
            { name: 'tandoori_gobi.jpg', x: cellWidth, y: cellHeight }
        ];

        let sqlContent = '-- Script to update your database with 4 high-res local images\n\nUSE hotel_booking;\n\nSET SQL_SAFE_UPDATES = 0;\n\n';

        for (const quad of quadrants) {
            const outputPath = path.join(outputDir, quad.name);
            
            await sharp(imgPath)
                .extract({ left: quad.x, top: quad.y, width: cellWidth, height: cellHeight })
                .toFile(outputPath);
            
            console.log(`Saved ${quad.name}`);
            
            // Generate food name from filename for SQL (e.g., 'samosa_chaat.jpg' -> 'Samosa Chaat')
            const dbName = quad.name.replace('.jpg', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            sqlContent += `UPDATE foods SET image = '/images/foods/${quad.name}' WHERE name = '${dbName}';\n`;
        }
        
        sqlContent += '\nSET SQL_SAFE_UPDATES = 1;\n';
        fs.writeFileSync(path.join(__dirname, 'update_images.sql'), sqlContent);
        
        console.log('Successfully sliced the 4 images and updated update_images.sql!');
    } catch (error) {
        console.error('Error:', error);
    }
}

slice2x2();
