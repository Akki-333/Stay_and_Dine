const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const foodNames = [
    'Paneer Tikka', 'Samosa Chaat', 'Chicken Tikka', 'Aloo Tikki', 'Tandoori Gobi', 'Hara Bhara Kebab', 'Mutton Seekh Kebab', 'Fish Amritsari',
    'Pani Puri', 'Chilli Paneer', 'Chicken 65', 'Onion Bhaji', 'Mushroom Tikka', 'Dahi Puri', 'Tandoori Prawns', 'Butter Chicken',
    'Paneer Butter Masala', 'Dal Makhani', 'Mutton Rogan Josh', 'Chicken Biryani', 'Mutton Biryani', 'Palak Paneer', 'Malai Kofta', 'Goan Fish Curry',
    'Chicken Chettinad', 'Kadai Paneer', 'Bhindi Masala', 'Chana Masala', 'Egg Curry', 'Vegetable Pulao', 'Gulab Jamun', 'Rasmalai',
    'Gajar Ka Halwa', 'Jalebi', 'Kulfi Falooda', 'Rasgulla', 'Mysore Pak', 'Rice Kheer', 'Shahi Tukda', 'Soan Papdi',
    'Peda', 'Kaju Katli', 'Rabri', 'Malpua', 'Kalakand', 'Mango Lassi', 'Masala Chai', 'Sweet Lassi',
    'Salted Lassi', 'Filter Coffee', 'Nimbu Pani', 'Jal Jeera', 'Thandai', 'Butter Milk (Chaas)', 'Badam Milk', 'Rooh Afza Milk',
    'Kokum Sherbet', 'Sugarcane Juice', 'Rose Lassi', 'Aam Panna'
];

async function sliceImage() {
    const imgPath = 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\ced9aeb7-5e63-4538-a921-5b43a7c7c0dd\\.user_uploaded\\media_1786363624363.jpg';
    const outputDir = path.join(__dirname, '../frontend/public/images/foods');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        console.log('Loading image...');
        const metadata = await sharp(imgPath).metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;
        
        const cols = 8;
        const rows = 10;
        
        const cellWidth = Math.floor(imgWidth / cols);
        const cellHeight = Math.floor(imgHeight / rows);
        
        console.log(`Image dimensions: ${imgWidth}x${imgHeight}. Cell size: ${cellWidth}x${cellHeight}`);

        let index = 0;
        let sqlContent = '-- Script to update your database with local sliced images\n\nUSE hotel_booking;\n\nSET SQL_SAFE_UPDATES = 0;\n\n';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < cols; col++) {
                if (index >= 60) break;
                
                const foodName = foodNames[index];
                const sanitizedName = foodName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '.jpg';
                
                const x = col * cellWidth;
                const y = row * cellHeight;
                
                const outputPath = path.join(outputDir, sanitizedName);
                
                await sharp(imgPath)
                    .extract({ left: x, top: y, width: cellWidth, height: cellHeight })
                    .toFile(outputPath);
                
                console.log(`Saved ${sanitizedName}`);
                
                sqlContent += `UPDATE foods SET image = '/images/foods/${sanitizedName}' WHERE name = '${foodName.replace(/'/g, "''")}';\n`;
                
                index++;
            }
        }
        
        sqlContent += '\nSET SQL_SAFE_UPDATES = 1;\n';
        fs.writeFileSync(path.join(__dirname, 'update_images.sql'), sqlContent);
        
        console.log('Successfully saved 60 unique images and updated update_images.sql!');
    } catch (error) {
        console.error('Error:', error);
    }
}

sliceImage();
