const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function upscaleImages() {
    const dir = path.join(__dirname, '../frontend/public/images/foods');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

    console.log(`Found ${files.length} images to upscale.`);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const tempPath = path.join(dir, 'temp_' + file);
        
        try {
            await sharp(filePath)
                .resize({
                    width: 600,
                    // calculate height automatically to preserve aspect ratio
                    kernel: sharp.kernel.lanczos3, // high quality resampling
                    fastShrinkOnLoad: false
                })
                .sharpen({ sigma: 1.5 }) // Apply some sharpening to make it look less blurry after upscale
                .toFile(tempPath);
                
            // Replace old file with upscaled file
            fs.renameSync(tempPath, filePath);
            console.log(`Upscaled ${file}`);
        } catch (err) {
            console.error(`Failed to upscale ${file}:`, err);
        }
    }
    console.log('All images upscaled successfully!');
}

upscaleImages();
