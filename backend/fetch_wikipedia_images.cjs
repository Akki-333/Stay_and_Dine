const fs = require('fs');
const path = require('path');
const https = require('https');

const foodNames = [
    'Paneer Tikka', 'Samosa Chaat', 'Chicken Tikka', 'Aloo Tikki', 'Tandoori Gobi', 'Hara Bhara Kebab', 'Mutton Seekh Kebab', 'Fish Amritsari',
    'Pani Puri', 'Chilli Paneer', 'Chicken 65', 'Onion Bhaji', 'Mushroom Tikka', 'Dahi Puri', 'Tandoori Prawns', 'Butter Chicken',
    'Paneer Butter Masala', 'Dal Makhani', 'Mutton Rogan Josh', 'Chicken Biryani', 'Mutton Biryani', 'Palak Paneer', 'Malai Kofta', 'Goan Fish Curry',
    'Chicken Chettinad', 'Kadai Paneer', 'Bhindi Masala', 'Chana Masala', 'Egg Curry', 'Vegetable Pulao', 'Gulab Jamun', 'Rasmalai',
    'Gajar Ka Halwa', 'Jalebi', 'Kulfi Falooda', 'Rasgulla', 'Mysore Pak', 'Rice Kheer', 'Shahi Tukda', 'Soan Papdi',
    'Peda', 'Kaju Katli', 'Rabri', 'Malpua', 'Kalakand', 'Mango Lassi', 'Masala Chai', 'Sweet Lassi',
    'Salted Lassi', 'Filter Coffee', 'Nimbu Pani', 'Jal Jeera', 'Thandai', 'Butter Milk', 'Badam Milk', 'Rooh Afza',
    'Kokum Sherbet', 'Sugarcane Juice', 'Rose Lassi', 'Aam Panna'
];

const outputDir = path.join(__dirname, '../frontend/public/images/foods');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'StayAndDineApp/1.0 (contact@example.com)' }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, { headers: { 'User-Agent': 'StayAndDineApp/1.0' } }, function (response) {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', function () {
                file.close(resolve);
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function run() {
    let sqlContent = '-- Script to update your database with local high-res images\n\nUSE hotel_booking;\n\nSET SQL_SAFE_UPDATES = 0;\n\n';

    for (let i = 0; i < foodNames.length; i++) {
        let foodName = foodNames[i];
        let queryName = foodName.replace(/ /g, '_');
        const sanitizedName = foodName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '.jpg';
        const outputPath = path.join(outputDir, sanitizedName);

        try {
            // Search wikipedia for the image
            const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=800&titles=${encodeURIComponent(queryName)}`;
            const data = await fetchJson(url);
            
            let imageUrl = null;
            if (data && data.query && data.query.pages) {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== '-1' && pages[pageId].thumbnail) {
                    imageUrl = pages[pageId].thumbnail.source;
                }
            }

            // Fallback to a general search if title match fails
            if (!imageUrl) {
                const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&generator=search&gsrsearch=${encodeURIComponent(foodName)}&gsrlimit=1&pithumbsize=800`;
                const searchData = await fetchJson(searchUrl);
                if (searchData && searchData.query && searchData.query.pages) {
                    const pages = searchData.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId] && pages[pageId].thumbnail) {
                        imageUrl = pages[pageId].thumbnail.source;
                    }
                }
            }

            if (imageUrl) {
                console.log(`[${i+1}/60] Downloading ${foodName} from Wikipedia...`);
                await downloadImage(imageUrl, outputPath);
            } else {
                console.log(`[${i+1}/60] Could not find image for ${foodName}, skipping download (will keep existing blurry image for now).`);
            }
            
            sqlContent += `UPDATE foods SET image = '/images/foods/${sanitizedName}' WHERE name = '${foodName.replace(/'/g, "''")}';\n`;
            
        } catch (e) {
            console.error(`Error on ${foodName}:`, e.message);
        }
        
        // Wait 200ms to be nice to Wikipedia API
        await new Promise(r => setTimeout(r, 200));
    }

    sqlContent += '\nSET SQL_SAFE_UPDATES = 1;\n';
    fs.writeFileSync(path.join(__dirname, 'update_images.sql'), sqlContent);
    console.log('Finished fetching Wikipedia images and updated update_images.sql!');
}

run();
